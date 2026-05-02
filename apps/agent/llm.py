"""
LLM Provider Abstraction
─────────────────────────────────────────────────────────────────────────────
Supports Ollama (free/local), OpenAI, Anthropic Claude, Google Gemini.
Switch providers without changing any agent code — just update AgentSettings.
"""
from __future__ import annotations
from typing import Generator
import httpx
import json
import logging

logger = logging.getLogger(__name__)


class LLMProvider:
    """Base class. All providers implement complete() and stream()."""

    def complete(self, messages: list[dict], tools: list[dict] | None = None) -> dict:
        """
        Synchronous completion.
        Returns: {content: str, tool_calls: list, tokens: int}
        """
        raise NotImplementedError

    def stream(self, messages: list[dict]) -> Generator[str, None, None]:
        """Streaming completion — yields text chunks."""
        raise NotImplementedError

    def is_available(self) -> tuple[bool, str]:
        """Check if provider is reachable. Returns (ok, message)."""
        return True, "OK"


class OllamaProvider(LLMProvider):
    """
    FREE local LLM via Ollama.

    Recommended models (pick based on your PC's RAM):
      llama3.2        (3B)  — fast, good for simple tasks, ~2GB RAM  ← START HERE
      llama3.1:8b     (8B)  — better reasoning, ~5GB RAM
      mistral         (7B)  — excellent quality, ~5GB RAM
      phi3.5          (3.8B)— Microsoft's model, very fast
      qwen2.5:7b      (7B)  — great multilingual (good for Malayalam)

    Install: curl -fsSL https://ollama.com/install.sh | sh
    Pull:    ollama pull llama3.2
    """

    def __init__(self, base_url: str, model: str):
        self.base_url = base_url.rstrip('/')
        self.model = model

    def complete(self, messages: list[dict], tools: list[dict] | None = None) -> dict:
        payload: dict = {
            'model': self.model,
            'messages': messages,
            'stream': False,
            'options': {
                'temperature': 0.7,
                'num_ctx': 4096,
            },
        }
        if tools:
            payload['tools'] = tools

        try:
            response = httpx.post(
                f'{self.base_url}/api/chat',
                json=payload,
                timeout=120.0,  # local models can be slow on first run
            )
            response.raise_for_status()
            data = response.json()
            msg = data.get('message', {})
            return {
                'content': msg.get('content', ''),
                'tool_calls': msg.get('tool_calls', []),
                'tokens': data.get('eval_count', 0),
            }
        except httpx.ConnectError:
            raise ConnectionError(
                f"Cannot connect to Ollama at {self.base_url}. "
                "Is Ollama running? Run: ollama serve"
            )
        except httpx.TimeoutException:
            raise TimeoutError(
                f"Ollama timed out. The model '{self.model}' may be loading. "
                "Try again in a moment."
            )

    def stream(self, messages: list[dict]) -> Generator[str, None, None]:
        with httpx.stream(
            'POST',
            f'{self.base_url}/api/chat',
            json={'model': self.model, 'messages': messages, 'stream': True},
            timeout=120.0,
        ) as response:
            for line in response.iter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        if not data.get('done'):
                            yield data.get('message', {}).get('content', '')
                    except json.JSONDecodeError:
                        continue

    def is_available(self) -> tuple[bool, str]:
        try:
            response = httpx.get(f'{self.base_url}/api/tags', timeout=5.0)
            if response.status_code == 200:
                models = [m['name'] for m in response.json().get('models', [])]
                if any(self.model in m for m in models):
                    return True, f"Connected · {self.model} loaded"
                return False, f"Ollama running but '{self.model}' not found. Run: ollama pull {self.model}"
            return False, f"Ollama returned {response.status_code}"
        except Exception as e:
            return False, f"Cannot reach Ollama: {str(e)}"


class OpenAIProvider(LLMProvider):
    """
    OpenAI API.
    gpt-4o-mini: $0.15/1M input tokens — very cheap for personal use
    gpt-4o:      $2.50/1M — use for complex reasoning tasks
    """

    def __init__(self, api_key: str, model: str = 'gpt-4o-mini'):
        self.api_key = api_key
        self.model = model

    def complete(self, messages: list[dict], tools: list[dict] | None = None) -> dict:
        try:
            import openai
        except ImportError:
            raise ImportError("Run: pip install openai")

        client = openai.OpenAI(api_key=self.api_key)
        kwargs: dict = {
            'model': self.model,
            'messages': messages,
            'temperature': 0.7,
        }
        if tools:
            kwargs['tools'] = [{'type': 'function', 'function': t} for t in tools]
            kwargs['tool_choice'] = 'auto'

        response = client.chat.completions.create(**kwargs)
        msg = response.choices[0].message

        tool_calls = []
        for tc in (msg.tool_calls or []):
            try:
                args = json.loads(tc.function.arguments)
            except json.JSONDecodeError:
                args = {}
            tool_calls.append({
                'id': tc.id,
                'name': tc.function.name,
                'arguments': args,
            })

        return {
            'content': msg.content or '',
            'tool_calls': tool_calls,
            'tokens': response.usage.total_tokens,
        }

    def stream(self, messages: list[dict]) -> Generator[str, None, None]:
        import openai
        client = openai.OpenAI(api_key=self.api_key)
        with client.chat.completions.stream(model=self.model, messages=messages) as stream:
            for chunk in stream.text_stream:
                yield chunk

    def is_available(self) -> tuple[bool, str]:
        try:
            import openai
            client = openai.OpenAI(api_key=self.api_key)
            client.models.list()
            return True, f"Connected · {self.model}"
        except Exception as e:
            return False, str(e)


class ClaudeProvider(LLMProvider):
    """
    Anthropic Claude API.
    claude-3-5-haiku: fastest + cheapest Claude, great for agents
    claude-3-5-sonnet: best balance of quality + speed
    """

    def __init__(self, api_key: str, model: str = 'claude-3-5-haiku-20241022'):
        self.api_key = api_key
        self.model = model

    def complete(self, messages: list[dict], tools: list[dict] | None = None) -> dict:
        try:
            import anthropic
        except ImportError:
            raise ImportError("Run: pip install anthropic")

        client = anthropic.Anthropic(api_key=self.api_key)

        # Claude separates system prompt from messages
        system = next((m['content'] for m in messages if m['role'] == 'system'), '')
        user_msgs = [m for m in messages if m['role'] != 'system']

        kwargs: dict = {
            'model': self.model,
            'max_tokens': 2048,
            'system': system,
            'messages': user_msgs,
        }
        if tools:
            kwargs['tools'] = [
                {
                    'name': t['name'],
                    'description': t['description'],
                    'input_schema': t['parameters'],
                }
                for t in tools
            ]

        response = client.messages.create(**kwargs)

        tool_calls = []
        text_content = ''
        for block in response.content:
            if block.type == 'text':
                text_content = block.text
            elif block.type == 'tool_use':
                tool_calls.append({'id': block.id, 'name': block.name, 'arguments': block.input})

        return {
            'content': text_content,
            'tool_calls': tool_calls,
            'tokens': response.usage.input_tokens + response.usage.output_tokens,
        }

    def stream(self, messages: list[dict]) -> Generator[str, None, None]:
        import anthropic
        client = anthropic.Anthropic(api_key=self.api_key)
        system = next((m['content'] for m in messages if m['role'] == 'system'), '')
        user_msgs = [m for m in messages if m['role'] != 'system']
        with client.messages.stream(
            model=self.model, max_tokens=2048,
            system=system, messages=user_msgs,
        ) as stream:
            for text in stream.text_stream:
                yield text

    def is_available(self) -> tuple[bool, str]:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=self.api_key)
            client.models.list()
            return True, f"Connected · {self.model}"
        except Exception as e:
            return False, str(e)


class GeminiProvider(LLMProvider):
    """Google Gemini API."""

    def __init__(self, api_key: str, model: str = 'gemini-1.5-flash'):
        self.api_key = api_key
        self.model = model

    def complete(self, messages: list[dict], tools: list[dict] | None = None) -> dict:
        try:
            import google.generativeai as genai
        except ImportError:
            raise ImportError("Run: pip install google-generativeai")

        genai.configure(api_key=self.api_key)
        model = genai.GenerativeModel(self.model)

        # Convert messages to Gemini format
        history = []
        system_text = ''
        for m in messages:
            if m['role'] == 'system':
                system_text = m['content']
            elif m['role'] == 'user':
                history.append({'role': 'user', 'parts': [m['content']]})
            elif m['role'] == 'assistant':
                history.append({'role': 'model', 'parts': [m['content']]})

        chat = model.start_chat(history=history[:-1] if history else [])
        last_msg = history[-1]['parts'][0] if history else ''
        response = chat.send_message(last_msg)

        return {
            'content': response.text,
            'tool_calls': [],
            'tokens': 0,
        }

    def stream(self, messages: list[dict]) -> Generator[str, None, None]:
        import google.generativeai as genai
        genai.configure(api_key=self.api_key)
        model = genai.GenerativeModel(self.model)
        last_user = next(
            (m['content'] for m in reversed(messages) if m['role'] == 'user'), ''
        )
        for chunk in model.generate_content(last_user, stream=True):
            yield chunk.text

    def is_available(self) -> tuple[bool, str]:
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            genai.list_models()
            return True, f"Connected · {self.model}"
        except Exception as e:
            return False, str(e)


def get_llm_provider(settings) -> LLMProvider:
    """
    Factory — returns the correct LLM provider from user's AgentSettings.
    Falls back to a helpful error message if provider is misconfigured.
    """
    if settings.llm_provider == 'ollama':
        return OllamaProvider(settings.ollama_url, settings.llm_model or 'llama3.2')
    elif settings.llm_provider == 'openai':
        if not settings.api_key:
            raise ValueError("OpenAI API key not configured. Go to ARIA Settings.")
        return OpenAIProvider(settings.api_key, settings.llm_model or 'gpt-4o-mini')
    elif settings.llm_provider == 'claude':
        if not settings.api_key:
            raise ValueError("Claude API key not configured. Go to ARIA Settings.")
        return ClaudeProvider(settings.api_key, settings.llm_model or 'claude-3-5-haiku-20241022')
    elif settings.llm_provider == 'gemini':
        if not settings.api_key:
            raise ValueError("Gemini API key not configured. Go to ARIA Settings.")
        return GeminiProvider(settings.api_key, settings.llm_model or 'gemini-1.5-flash')
    else:
        raise ValueError(f"Unknown LLM provider: {settings.llm_provider}")
