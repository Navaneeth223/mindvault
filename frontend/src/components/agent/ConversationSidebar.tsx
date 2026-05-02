/**
 * Conversation Sidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Left panel showing conversation history and memory stats.
 */
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, MessageSquare, Brain } from 'lucide-react'
import { agentApi, Conversation } from '@/api/agent'
import { useAgentStore } from '@/store/agentStore'
import { cn } from '@/utils/cn'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

interface ConversationSidebarProps {
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onViewMemory: () => void
}

export default function ConversationSidebar({
  onSelectConversation,
  onNewConversation,
  onViewMemory,
}: ConversationSidebarProps) {
  const { conversationId } = useAgentStore()
  const queryClient = useQueryClient()

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['agent-conversations'],
    queryFn: agentApi.listConversations,
    staleTime: 30_000,
  })

  const { data: status } = useQuery({
    queryKey: ['agent-status'],
    queryFn: agentApi.getStatus,
    staleTime: 60_000,
  })

  const deleteMutation = useMutation({
    mutationFn: agentApi.deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-conversations'] })
      toast.success('Conversation deleted')
    },
  })

  // Group conversations by date
  const today = new Date()
  const todayStr = today.toDateString()
  const yesterdayStr = new Date(today.getTime() - 86400000).toDateString()

  const grouped = conversations.reduce(
    (acc, conv) => {
      const dateStr = new Date(conv.updated_at).toDateString()
      const key =
        dateStr === todayStr ? 'Today' :
        dateStr === yesterdayStr ? 'Yesterday' : 'Earlier'
      if (!acc[key]) acc[key] = []
      acc[key].push(conv)
      return acc
    },
    {} as Record<string, Conversation[]>
  )

  return (
    <div className="h-full flex flex-col bg-dark-surface/50 border-r border-dark-border">
      {/* Header */}
      <div className="p-4 border-b border-dark-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-semibold text-dark-text-primary">ARIA</h2>
          <button
            onClick={onNewConversation}
            className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors"
            title="New conversation"
          >
            <Plus className="w-4 h-4 text-dark-text-muted" />
          </button>
        </div>

        {/* Status indicator */}
        {status && (
          <div className="flex items-center gap-2 px-2 py-1.5 bg-dark-elevated rounded-lg">
            <div
              className={cn(
                'w-2 h-2 rounded-full flex-shrink-0',
                status.llm_available ? 'bg-accent-cyan' : 'bg-accent-red'
              )}
            />
            <span className="text-xs text-dark-text-muted truncate">
              {status.llm_available
                ? `${status.llm_model}`
                : 'Not connected'}
            </span>
          </div>
        )}
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto scrollbar-custom p-2 space-y-4">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-dark-elevated rounded-xl animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <MessageSquare className="w-8 h-8 text-dark-text-muted mb-2" />
            <p className="text-xs text-dark-text-muted">No conversations yet</p>
            <p className="text-xs text-dark-text-muted mt-1">Start chatting with ARIA</p>
          </div>
        ) : (
          Object.entries(grouped).map(([group, convs]) => (
            <div key={group}>
              <p className="px-2 py-1 text-xs font-semibold text-dark-text-muted uppercase tracking-wider">
                {group}
              </p>
              <div className="space-y-0.5">
                {convs.map((conv) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      'group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all',
                      conversationId === conv.id
                        ? 'bg-dark-elevated border border-accent-cyan/20 text-dark-text-primary'
                        : 'hover:bg-dark-hover text-dark-text-secondary hover:text-dark-text-primary'
                    )}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-dark-text-muted" />
                    <span className="flex-1 text-sm truncate">
                      {conv.title || 'New conversation'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMutation.mutate(conv.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent-red/10 transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-accent-red" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Memory footer */}
      <div className="p-3 border-t border-dark-border flex-shrink-0">
        <button
          onClick={onViewMemory}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-dark-hover transition-colors text-left"
        >
          <Brain className="w-4 h-4 text-accent-cyan flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-dark-text-primary">Memory</p>
            {status && (
              <p className="text-xs text-dark-text-muted">
                {status.facts_count} facts · {status.indexed_cards} cards indexed
              </p>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}
