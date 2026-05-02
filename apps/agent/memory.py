"""
ARIA Memory System
─────────────────────────────────────────────────────────────────────────────
Three-layer memory:
  1. Semantic  — ChromaDB vector store of all cards (finds by meaning)
  2. Episodic  — Recent conversations from PostgreSQL
  3. Personal  — Facts about the user extracted from conversations

ChromaDB uses sentence-transformers (all-MiniLM-L6-v2, ~90MB, free, local).
No OpenAI embeddings needed — everything runs offline.
"""
from __future__ import annotations
import logging
import re
import json
from typing import Optional

from django.conf import settings as django_settings

logger = logging.getLogger(__name__)

# ── ChromaDB helpers ──────────────────────────────────────────────────────────

def get_chroma_client():
    """Lazy-import ChromaDB to avoid startup errors if not installed."""
    try:
        import chromadb
        path = str(getattr(django_settings, 'CHROMA_PATH', '/app/chroma_db'))
        return chromadb.PersistentClient(path=path)
    except ImportError:
        logger.warning("chromadb not installed — semantic search disabled. Run: pip install chromadb")
        return None
    except Exception as e:
        logger.error(f"ChromaDB init error: {e}")
        return None


def _get_embedding_function():
    """
    Local sentence-transformers embedding — free, no API key.
    Model: all-MiniLM-L6-v2 (~90MB download on first use).
    """
    try:
        from chromadb.utils import embedding_functions
        return embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name='all-MiniLM-L6-v2'
        )
    except ImportError:
        logger.warning("sentence-transformers not installed — embeddings disabled. Run: pip install sentence-transformers")
        return None
    except Exception as e:
        logger.error(f"Embedding function error: {e}")
        return None


def get_or_create_collection(user_id: str):
    """Get or create a per-user ChromaDB collection."""
    client = get_chroma_client()
    if not client:
        return None
    ef = _get_embedding_function()
    if not ef:
        return None
    try:
        return client.get_or_create_collection(
            name=f'user_{user_id}_cards',
            embedding_function=ef,
            metadata={'hnsw:space': 'cosine'},
        )
    except Exception as e:
        logger.error(f"Collection error for user {user_id}: {e}")
        return None


def index_card(card) -> bool:
    """
    Add or update a card in the vector store.
    Called automatically via Django signal when a card is saved.
    Returns True on success.
    """
    collection = get_or_create_collection(str(card.user_id))
    if not collection:
        return False

    # Build rich searchable text from all card fields
    text_parts = [card.title]
    if card.description:
        text_parts.append(card.description)
    if card.body:
        text_parts.append(card.body[:2000])
    if card.transcript:
        text_parts.append(card.transcript[:2000])
    if card.url:
        text_parts.append(card.url)
    if card.metadata.get('readme_preview'):
        text_parts.append(card.metadata['readme_preview'][:500])
    if card.metadata.get('channel'):
        text_parts.append(card.metadata['channel'])

    text = ' '.join(filter(None, text_parts))

    try:
        tags_str = ','.join(card.tags.names()) if hasattr(card, 'tags') else ''
    except Exception:
        tags_str = ''

    try:
        collection.upsert(
            ids=[str(card.id)],
            documents=[text],
            metadatas=[{
                'type': card.type,
                'title': card.title,
                'url': card.url or '',
                'collection': str(card.collection_id) if card.collection_id else '',
                'created_at': card.created_at.isoformat(),
                'tags': tags_str,
            }],
        )
        return True
    except Exception as e:
        logger.error(f"Failed to index card {card.id}: {e}")
        return False


def remove_card_from_index(card_id: str, user_id: str) -> bool:
    """Remove a card from the vector store (called on delete)."""
    collection = get_or_create_collection(user_id)
    if not collection:
        return False
    try:
        collection.delete(ids=[card_id])
        return True
    except Exception as e:
        logger.error(f"Failed to remove card {card_id} from index: {e}")
        return False


def semantic_search(
    user_id: str,
    query: str,
    n_results: int = 5,
    filter_type: Optional[str] = None,
    min_relevance: float = 0.25,
) -> list[dict]:
    """
    Find cards semantically similar to query.
    Returns list of {id, text, metadata, relevance} sorted by relevance.
    """
    collection = get_or_create_collection(user_id)
    if not collection:
        return []

    count = collection.count()
    if count == 0:
        return []

    where = {'type': filter_type} if filter_type else None

    try:
        results = collection.query(
            query_texts=[query],
            n_results=min(n_results, count),
            where=where,
            include=['documents', 'metadatas', 'distances'],
        )
    except Exception as e:
        logger.error(f"Semantic search error: {e}")
        return []

    if not results['ids'][0]:
        return []

    items = []
    for id_, doc, meta, dist in zip(
        results['ids'][0],
        results['documents'][0],
        results['metadatas'][0],
        results['distances'][0],
    ):
        relevance = 1.0 - dist  # cosine distance → similarity
        if relevance >= min_relevance:
            items.append({
                'id': id_,
                'text': doc,
                'metadata': meta,
                'relevance': relevance,
            })

    return sorted(items, key=lambda x: x['relevance'], reverse=True)


def get_collection_count(user_id: str) -> int:
    """Return number of indexed cards for a user."""
    collection = get_or_create_collection(user_id)
    if not collection:
        return 0
    try:
        return collection.count()
    except Exception:
        return 0


# ── Episodic memory (PostgreSQL) ──────────────────────────────────────────────

def get_recent_conversation_context(user, max_messages: int = 10) -> list[dict]:
    """
    Get last N messages across recent conversations.
    Used to give ARIA context about what was discussed recently.
    """
    from .models import Message
    messages = (
        Message.objects
        .filter(conversation__user=user, role__in=['user', 'assistant'])
        .order_by('-created_at')[:max_messages]
    )
    return [
        {'role': m.role, 'content': m.content}
        for m in reversed(list(messages))
    ]


# ── Personal facts (PostgreSQL) ───────────────────────────────────────────────

def get_personal_facts(user, category: Optional[str] = None) -> list[str]:
    """Get facts ARIA knows about the user, sorted by confidence."""
    from .models import PersonalFact
    qs = PersonalFact.objects.filter(user=user, is_active=True)
    if category:
        qs = qs.filter(category=category)
    return [f.fact for f in qs.order_by('-confidence', '-created_at')]


def extract_and_save_facts(user, conversation_text: str, llm_provider) -> int:
    """
    After each conversation, ask the LLM to extract personal facts.
    Returns number of new facts saved.

    Examples of extracted facts:
      "User is learning Django REST Framework"
      "User wants to become a professional developer"
      "User is from Kerala, India"
      "User's goal is financial independence"
    """
    from .models import PersonalFact

    try:
        response = llm_provider.complete([
            {
                'role': 'system',
                'content': (
                    'Extract personal facts about the user from this conversation. '
                    'Return a JSON array of objects: '
                    '[{"category": "goal|skill|preference|context|achievement|habit", "fact": "..."}]\n'
                    'Rules:\n'
                    '- Only extract clear, lasting facts (not temporary states)\n'
                    '- Facts should be specific and useful for future conversations\n'
                    '- Return [] if nothing significant\n'
                    'Examples:\n'
                    '{"category":"goal","fact":"User wants to become a professional developer"}\n'
                    '{"category":"skill","fact":"User knows Qt and Android development"}\n'
                    '{"category":"context","fact":"User is from Kerala, India"}\n'
                    '{"category":"habit","fact":"User studies for 2 hours every morning"}'
                ),
            },
            {'role': 'user', 'content': f'Conversation:\n{conversation_text}'},
        ])

        match = re.search(r'\[.*?\]', response['content'], re.DOTALL)
        if not match:
            return 0

        facts = json.loads(match.group())
        saved = 0
        for f in facts:
            fact_text = f.get('fact', '').strip()
            category = f.get('category', 'context')
            if fact_text and len(fact_text) > 10:
                _, created = PersonalFact.objects.get_or_create(
                    user=user,
                    fact=fact_text,
                    defaults={
                        'category': category,
                        'source': 'Extracted from conversation',
                    },
                )
                if created:
                    saved += 1
        return saved

    except Exception as e:
        # Fact extraction is best-effort — never crash the agent on this
        logger.warning(f"Fact extraction failed: {e}")
        return 0
