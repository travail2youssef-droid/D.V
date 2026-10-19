import { AlertCircle, Bot, CheckCircle2, Cpu, Network, Play, Save } from 'lucide-react';

export default function AdminAiSettings({
  settings,
  setSettings,
  n8nUrlInput,
  setN8nUrlInput,
  n8nModeInput,
  setN8nModeInput,
  groqKeyInput,
  setGroqKeyInput,
  apiKeyInput,
  setApiKeyInput,
  savingSettings,
  settingsMessage,
  testingApi,
  testResult,
  handleSaveSettings,
  handleTestN8n,
  handleTestApi,
}) {
  return (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full">
            <div className="bg-[#111111] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-8">

              {/* Header with n8n workflow badge */}
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#F20D25] uppercase tracking-wider mb-2">
                  <Network className="w-4 h-4" />
                  <span>Architecture Agent IA & n8n LangChain Détectée</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Connexion de votre Agent IA
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1 leading-relaxed">
                  Votre workflow n8n (Chat Trigger LangChain + AI Agent + Groq Chat Model + Simple Memory Buffer Window) est pris en charge nativement. Vous pouvez relier directement l'URL de votre webhook n8n ou utiliser une clé d'API Groq directe.
                </p>
              </div>

              {/* N8N WORKFLOW SCHEMATIC OVERVIEW */}
              <div className="p-4 rounded-2xl bg-[#090909] border border-white/10 space-y-3">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Schéma du Workflow n8n Actif :</span>
                  <span className="text-[#FF2E44] font-mono text-[10px]">Webhook ID : {settings.n8nWebhookId}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#141414] border border-emerald-500/30 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="font-bold text-white text-[11px]">Chat Trigger</div>
                      <div className="text-[10px] text-neutral-400">LangChain v1.5</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141414] border border-[#F20D25]/40 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F20D25]" />
                    <div>
                      <div className="font-bold text-white text-[11px]">AI Agent</div>
                      <div className="text-[10px] text-neutral-400">LangChain v3.1</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141414] border border-purple-500/30 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <div>
                      <div className="font-bold text-white text-[11px]">Groq Chat Model</div>
                      <div className="text-[10px] text-neutral-400">gpt-oss-20b / Llama</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141414] border border-blue-500/30 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <div>
                      <div className="font-bold text-white text-[11px]">Memory Buffer</div>
                      <div className="text-[10px] text-neutral-400">Simple Memory</div>
                    </div>
                  </div>
                </div>
              </div>

              {settingsMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{settingsMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6">

                {/* Method selector */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                    Mode d'exécution de l'Agent IA
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, provider: 'n8n' }))}
                      className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        settings.provider === 'n8n'
                          ? 'bg-[#181818] border-[#F20D25] text-white shadow-[0_0_15px_rgba(242,13,37,0.25)]'
                          : 'bg-[#141414] border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Network className="w-4 h-4 text-[#F20D25]" />
                        <span>Webhook n8n en direct</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        Connecte votre workflow n8n via webhook
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, provider: 'groq' }))}
                      className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        settings.provider === 'groq'
                          ? 'bg-[#181818] border-[#F20D25] text-white shadow-[0_0_15px_rgba(242,13,37,0.25)]'
                          : 'bg-[#141414] border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <span>API Groq Directe</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        Ultra-rapide avec votre clé Groq
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, provider: 'openai' }))}
                      className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        settings.provider === 'openai'
                          ? 'bg-[#181818] border-[#F20D25] text-white shadow-[0_0_15px_rgba(242,13,37,0.25)]'
                          : 'bg-[#141414] border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-emerald-400" />
                        <span>OpenAI / Standard LLM</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        GPT-4o / Endpoint personnalisé
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        provider: 'anthropic',
                        model: prev.model.toLowerCase().startsWith('claude-') ? prev.model : 'claude-3-5-sonnet-latest',
                      }))}
                      className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        settings.provider === 'anthropic'
                          ? 'bg-[#181818] border-[#F20D25] text-white shadow-[0_0_15px_rgba(242,13,37,0.25)]'
                          : 'bg-[#141414] border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-orange-300" />
                        <span>Anthropic / Claude</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        API Messages native, sans endpoint personnalisé
                      </div>
                    </button>
                  </div>
                </div>

                {/* 1. N8N Webhook URL input */}
                {settings.provider === 'n8n' && (
                  <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        URL de votre instance n8n ou Webhook direct *
                      </label>
                      <span className="text-[11px] text-neutral-400">
                        Webhook ID : <code className="text-[#FF2E44]">{settings.n8nWebhookId}</code>
                      </span>
                    </div>

                    <input
                      type="url"
                      value={n8nUrlInput}
                      onChange={(e) => setN8nUrlInput(e.target.value)}
                      placeholder="https://n8n.votre-domaine.com (ou https://.../webhook/b639adfd-.../chat)"
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25] font-mono"
                    />

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-neutral-400">Mode n8n :</span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300">
                        <input
                          type="radio"
                          name="n8nMode"
                          value="webhook"
                          checked={n8nModeInput === 'webhook'}
                          onChange={() => setN8nModeInput('webhook')}
                          className="text-[#F20D25] focus:ring-0"
                        />
                        <span>Production (<code>/webhook/...</code>)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300">
                        <input
                          type="radio"
                          name="n8nMode"
                          value="webhook-test"
                          checked={n8nModeInput === 'webhook-test'}
                          onChange={() => setN8nModeInput('webhook-test')}
                          className="text-[#F20D25] focus:ring-0"
                        />
                        <span>Test UI n8n (<code>/webhook-test/...</code>)</span>
                      </label>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleTestN8n}
                        disabled={testingApi || !n8nUrlInput.trim()}
                        className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-40"
                      >
                        <Play className={`w-3.5 h-3.5 text-[#F20D25] ${testingApi ? 'animate-spin' : ''}`} />
                        <span>{testingApi ? "Test en cours..." : "Tester la connexion avec le Webhook n8n"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Groq Direct API Input */}
                {settings.provider === 'groq' && (
                  <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        Clé d'API Groq (Groq API Key)
                      </label>
                      {settings.hasGroqKey && (
                        <span className="text-[11px] text-emerald-400 font-mono">
                          Clé active : {settings.maskedGroqKey}
                        </span>
                      )}
                    </div>

                    <input
                      type="password"
                      value={groqKeyInput}
                      onChange={(e) => setGroqKeyInput(e.target.value)}
                      placeholder={settings.hasGroqKey ? "Entrez une nouvelle clé pour la remplacer..." : "gsk_..."}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25] font-mono"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Modèle Groq</label>
                        <input
                          type="text"
                          value={settings.groqModel}
                          onChange={(e) => setSettings(prev => ({ ...prev, groqModel: e.target.value }))}
                          placeholder="llama-3.3-70b-versatile ou openai/gpt-oss-20b"
                          className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F20D25]"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTestApi('groq')}
                      disabled={testingApi}
                      className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2"
                    >
                      <Play className={`w-3.5 h-3.5 text-purple-400 ${testingApi ? 'animate-spin' : ''}`} />
                      <span>{testingApi ? "Test en cours..." : "Tester la clé Groq"}</span>
                    </button>
                  </div>
                )}

                {/* OpenAI-compatible / Anthropic configuration */}
                {['openai', 'custom', 'anthropic'].includes(settings.provider) && (
                  <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        {settings.provider === 'anthropic' ? "Clé d'API Anthropic" : "Clé d'API OpenAI-compatible"}
                      </label>
                      {settings.hasKey && (
                        <span className="text-[11px] text-emerald-400 font-mono">
                          Clé active : {settings.maskedKey}
                        </span>
                      )}
                    </div>

                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder={settings.provider === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25] font-mono"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Modèle</label>
                        <input
                          type="text"
                          value={settings.model}
                          onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
                          placeholder={settings.provider === 'anthropic' ? 'claude-3-5-sonnet-latest' : 'gpt-4o-mini'}
                          className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F20D25]"
                        />
                      </div>

                      {settings.provider !== 'anthropic' && (
                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">Endpoint de base</label>
                          <input
                            type="text"
                            value={settings.customEndpoint}
                            onChange={(e) => setSettings(prev => ({ ...prev, customEndpoint: e.target.value }))}
                            placeholder="https://api.openai.com/v1"
                            className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F20D25]"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTestApi(settings.provider === 'anthropic' ? 'anthropic' : settings.provider)}
                      disabled={testingApi}
                      className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2"
                    >
                      <Play className={`w-3.5 h-3.5 text-emerald-400 ${testingApi ? 'animate-spin' : ''}`} />
                      <span>{testingApi ? 'Test en cours...' : settings.provider === 'anthropic' ? "Tester l'API Anthropic" : "Tester l'API LLM"}</span>
                    </button>
                  </div>
                )}

                {/* System Prompt Customization */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Prompt Système de l'Agent Nova (Instructions de cadrage & limitation des questions)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.systemPrompt}
                    onChange={(e) => setSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-[#F20D25] font-mono resize-none leading-relaxed"
                  />
                </div>

                {/* Test results banner */}
                {testResult && (
                  <div className={`p-4 rounded-xl border text-xs ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}>
                    {testResult.success ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{testResult.message}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span>{testResult.error}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#F20D25] hover:bg-[#d60b20] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(242,13,37,0.35)]"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSettings ? "Enregistrement en cours..." : "Enregistrer la configuration de l'Agent IA"}</span>
                  </button>
                </div>

              </form>

            </div>
          </div>
  );
}
