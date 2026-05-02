/**
 * ARIA Settings Panel
 * ─────────────────────────────────────────────────────────────────────────────
 * Configure LLM provider, model, API keys, and behaviour toggles.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, RefreshCw, Check, Loader2, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { agentApi, AgentSettings } from '@/api/agent'
import toast from 'react-hot-toast'

const PROVIDERS = [
  {
    value: 'ollama',
    label: 'Ollama (Local/Free)',
    description: 'Runs on your PC. Zero cost, zero privacy risk.',
    recommended: true,
  },
  {
    value: 'openai',
    label: 'OpenAI (GPT-4o)',
    description: 'gpt-4o-mini: ~$0.15/1M tokens. Very cheap.',
    recommended: false,
  },
  {
    value: 'claude',
    label: 'Claude (Anthropic)',
    description: 'claude-3-5-haiku: Fast, smart, affordable.',
    recommended: false,
  },
  {
    value: 'gemini',
    label: 'Gemini (Google)',
    description: 'gemini-1.5-flash: Fast and capable.',
    recommended: false,
  },
]

const OLLAMA_MODELS = ['llama3.2', 'llama3.1:8b', 'mistral', 'phi3.5', 'qwen2.5:7b', 'codellama']
const OPENAI_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']
const CLAUDE_MODELS = ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229']
const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp']

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-accent-cyan' : 'bg-dark-border'}`}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

interface ARIASettingsProps {
  onClose: () => void
}

export default function ARIASettings({ onClose }: ARIASettingsProps) {
  const queryClient = useQueryClient()
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [reindexing, setReindexing] = useState(false)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['agent-settings'],
    queryFn: agentApi.getSettings,
  })

  const { data: status } = useQuery({
    queryKey: ['agent-status'],
    queryFn: agentApi.getStatus,
    staleTime: 30_000,
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<AgentSettings> & { api_key?: string }) =>
      agentApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-settings'] })
      queryClient.invalidateQueries({ queryKey: ['agent-status'] })
      toast.success('Settings saved')
    },
    onError: () => toast.error('Failed to save settings'),
  })

  const handleUpdate = (field: string, value: any) => {
    updateMutation.mutate({ [field]: value })
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    setConnectionResult(null)
    try {
      const result = await agentApi.getStatus()
      setConnectionResult({
        ok: result.llm_available,
        msg: result.llm_status,
      })
    } catch (e) {
      setConnectionResult({ ok: false, msg: 'Connection failed' })
    } finally {
      setTestingConnection(false)
    }
  }

  const handleReindex = async () => {
    setReindexing(true)
    try {
      await agentApi.reindexVault()
      toast.success('Reindexing started in background')
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['agent-status'] })
        setReindexing(false)
      }, 3000)
    } catch (e) {
      toast.error('Reindex failed')
      setReindexing(false)
    }
  }

  const getModelsForProvider = (provider: string) => {
    switch (provider) {
      case 'ollama': return OLLAMA_MODELS
      case 'openai': return OPENAI_MODELS
      case 'claude': return CLAUDE_MODELS
      case 'gemini': return GEMINI_MODELS
      default: return []
    }
  }

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-accent-cyan animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col bg-dark-surface border-l border-dark-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border flex-shrink-0">
        <h3 className="font-semibold text-dark-text-primary">ARIA Configuration</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors">
          <X className="w-4 h-4 text-dark-text-muted" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-custom p-4 space-y-6">
        {/* AI Provider */}
        <section>
          <h4 className="text-xs font-semibold text-dark-text-muted uppercase tracking-wider mb-3">
            AI Provider
          </h4>
          <div className="space-y-2">
            {PROVIDERS.map((p) => (
              <button
                key={p.value}
                onClick={() => handleUpdate('llm_provider', p.value)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  settings.llm_provider === p.value
                    ? 'border-accent-cyan bg-accent-cyan/5'
                    : 'border-dark-border hover:border-dark-text-muted'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                    settings.llm_provider === p.value
                      ? 'border-accent-cyan bg-accent-cyan'
                      : 'border-dark-text-muted'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-dark-text-primary">{p.label}</span>
                    {p.recommended && (
                      <span className="px-1.5 py-0.5 text-xs bg-accent-cyan/10 text-accent-cyan rounded border border-accent-cyan/20">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-dark-text-muted mt-0.5">{p.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Model selection */}
        <section>
          <h4 className="text-xs font-semibold text-dark-text-muted uppercase tracking-wider mb-3">
            Model
          </h4>
          <select
            value={settings.llm_model}
            onChange={(e) => handleUpdate('llm_model', e.target.value)}
            className="w-full px-3 py-2.5 bg-dark-elevated border border-dark-border rounded-xl text-sm text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan"
          >
            {getModelsForProvider(settings.llm_provider).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </section>

        {/* Ollama URL */}
        {settings.llm_provider === 'ollama' && (
          <section>
            <h4 className="text-xs font-semibold text-dark-text-muted uppercase tracking-wider mb-3">
              Ollama Server URL
            </h4>
            <input
              defaultValue={settings.ollama_url}
              onBlur={(e) => handleUpdate('ollama_url', e.target.value)}
              className="w-full px-3 py-2.5 bg-dark-elevated border border-dark-border rounded-xl text-sm text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              placeholder="http://localhost:11434"
            />
            <p className="text-xs text-dark-text-muted mt-1.5">
              Docker: use <code className="bg-dark-elevated px-1 rounded">http://host.docker.internal:11434</code>
            </p>
            <a
              href="https://ollama.com/download"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent-cyan hover:underline mt-1"
            >
              Download Ollama <ExternalLink className="w-3 h-3" />
            </a>
          </section>
        )}

        {/* API Key */}
        {settings.llm_provider !== 'ollama' && (
          <section>
            <h4 className="text-xs font-semibold text-dark-text-muted uppercase tracking-wider mb-3">
              API Key
            </h4>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onBlur={() => {
                  if (apiKeyInput) updateMutation.mutate({ api_key: apiKeyInput })
                }}
                placeholder={settings.has_api_key ? '••••••••••••••••' : 'Enter API key...'}
                className="w-full px-3 py-2.5 pr-10 bg-dark-elevated border border-dark-border rounded-xl text-sm text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-text-muted hover:text-dark-text-primary"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {settings.has_api_key && (
              <p className="text-xs text-accent-cyan mt-1">✓ API key saved</p>
            )}
          </section>
        )}

        {/* Connection test */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-dark-text-muted uppercase tracking-wider">
              Connection
            </h4>
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-dark-elevated border border-dark-border rounded-lg hover:border-accent-cyan/30 transition-colors disabled:opacity-50"
            >
              {testingConnection ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Test connection
            </button>
          </div>
          {connectionResult && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                connectionResult.ok
                  ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                  : 'bg-accent-red/10 text-accent-red border border-accent-red/20'
              }`}
            >
              {connectionResult.ok ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              {connectionResult.msg}
            </div>
          )}
          {status && !connectionResult && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
              status.llm_available
                ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                : 'bg-dark-elevated text-dark-text-muted border border-dark-border'
            }`}>
              <div className={`w-2 h-2 rounded-full ${status.llm_available ? 'bg-accent-cyan' : 'bg-dark-text-muted'}`} />
              {status.llm_status}
            </div>
          )}
        </section>

        {/* Persona */}
        <section>
          <h4 className="text-xs font-semibold text-dark-text-muted uppercase tracking-wider mb-3">
            Persona
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-dark-text-muted mb-1">Assistant name</label>
              <input
                defaultValue={settings.aria_name}
                onBlur={(e) => handleUpdate('aria_name', e.target.value)}
                className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-xl text-sm text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-text-muted mb-1">Language</label>
              <select
                value={settings.language_preference}
                onChange={(e) => handleUpdate('language_preference', e.target.value)}
                className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-xl text-sm text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              >
                <option value="en">English</option>
                <option value="ml">Malayalam (മലയാളം)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Behaviour toggles */}
        <section>
          <h4 className="text-xs font-semibold text-dark-text-muted uppercase tracking-wider mb-3">
            Automatic Actions
          </h4>
          <div className="space-y-3">
            {[
              { key: 'auto_tag_cards', label: 'Auto-tag new cards with AI' },
              { key: 'auto_summarise', label: 'Auto-summarise saved URLs' },
              { key: 'daily_briefing', label: 'Daily morning briefing' },
              { key: 'memory_enabled', label: 'Remember personal facts' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-dark-text-secondary">{label}</span>
                <Toggle
                  checked={settings[key as keyof AgentSettings] as boolean}
                  onChange={(v) => handleUpdate(key, v)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Vault indexing */}
        <section>
          <h4 className="text-xs font-semibold text-dark-text-muted uppercase tracking-wider mb-3">
            Vault Indexing
          </h4>
          <div className="p-3 bg-dark-elevated border border-dark-border rounded-xl space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-text-secondary">Cards indexed</span>
              <span className="font-medium text-dark-text-primary">
                {status?.indexed_cards ?? 0} / {status?.total_cards ?? 0}
              </span>
            </div>
            {settings.last_indexed_at && (
              <p className="text-xs text-dark-text-muted">
                Last indexed: {new Date(settings.last_indexed_at).toLocaleString()}
              </p>
            )}
            <button
              onClick={handleReindex}
              disabled={reindexing}
              className="w-full flex items-center justify-center gap-2 py-2 bg-dark-surface border border-dark-border rounded-lg text-sm text-dark-text-secondary hover:border-accent-cyan/30 hover:text-accent-cyan transition-all disabled:opacity-50"
            >
              {reindexing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {reindexing ? 'Indexing...' : 'Re-index vault'}
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  )
}
