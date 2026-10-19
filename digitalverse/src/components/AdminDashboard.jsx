import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Lock, RefreshCw, Search, Filter, ExternalLink, CheckCircle2,
  AlertCircle, Bot, Globe, Clock, User, Phone, Mail, Calendar, ArrowRight,
  Sliders, Settings, Plus, Copy, Check, Save, Sparkles, X, ChevronRight,
  Volume2, VolumeX, Cpu, Network, FileCode, Play
} from 'lucide-react';

export default function AdminDashboard({ isOpen, onClose }) {
  if (!isOpen) return null;

  // Tabs: 'orders' | 'registry' | 'settings' | 'workflow'
  const [activeTab, setActiveTab] = useState('orders');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Auto-refresh state
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(5);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [refreshCountdown, setRefreshCountdown] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevOrdersCountRef = useRef(0);

  // Registry State
  const [registry, setRegistry] = useState([]);
  const [loadingRegistry, setLoadingRegistry] = useState(false);
  const [newRegModal, setNewRegModal] = useState(false);
  const [newRegData, setNewRegData] = useState({
    clientName: '',
    projectName: '',
    planName: 'Business Fonctionnel',
    deliverableType: 'Site Web',
    deliverableUrl: '',
    notes: ''
  });

  // Settings State
  const [settings, setSettings] = useState({
    provider: 'n8n',
    n8nWebhookUrl: '',
    n8nWebhookId: 'b639adfd-6c4b-48cd-af68-fb21384fcc52',
    n8nMode: 'webhook',
    hasN8n: false,
    groqApiKey: '',
    groqModel: 'llama-3.3-70b-versatile',
    hasGroqKey: false,
    maskedGroqKey: '',
    apiKey: '',
    hasKey: false,
    maskedKey: '',
    model: 'gpt-4o-mini',
    customEndpoint: 'https://api.openai.com/v1',
    systemPrompt: ''
  });

  const [n8nUrlInput, setN8nUrlInput] = useState('');
  const [n8nModeInput, setN8nModeInput] = useState('webhook');
  const [groqKeyInput, setGroqKeyInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [testingApi, setTestingApi] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Copy indicator state
  const [copiedId, setCopiedId] = useState(null);

  // Deliverable edit form for an order
  const [deliverableForm, setDeliverableForm] = useState({
    url: '',
    title: '',
    notes: '',
    type: 'website'
  });
  const [updatingOrder, setUpdatingOrder] = useState(false);

  // Play subtle chime sound
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  // Fetch Orders
  const fetchOrders = async (silent = false) => {
    if (!silent) setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && data.orders) {
        if (prevOrdersCountRef.current > 0 && data.orders.length > prevOrdersCountRef.current) {
          playChime();
        }
        prevOrdersCountRef.current = data.orders.length;
        setOrders(data.orders);

        if (selectedOrder) {
          const updatedCurrent = data.orders.find(o => o.id === selectedOrder.id);
          if (updatedCurrent) setSelectedOrder(updatedCurrent);
        }
      }
    } catch (err) {
      console.error("Erreur chargement commandes:", err);
    } finally {
      if (!silent) setLoadingOrders(false);
      setLastRefreshed(new Date());
      setRefreshCountdown(autoRefreshInterval);
    }
  };

  // Fetch Registry
  const fetchRegistry = async () => {
    setLoadingRegistry(true);
    try {
      const res = await fetch('/api/registry');
      const data = await res.json();
      if (data.success) {
        setRegistry(data.registry);
      }
    } catch (err) {
      console.error("Erreur chargement registre:", err);
    } finally {
      setLoadingRegistry(false);
    }
  };

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setN8nUrlInput(data.settings.n8nWebhookUrl || '');
        setN8nModeInput(data.settings.n8nMode || 'webhook');
      }
    } catch (err) {
      console.error("Erreur chargement paramètres:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRegistry();
    fetchSettings();
  }, []);

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefreshInterval === 0) return;

    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchOrders(true);
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshInterval, selectedOrder]);

  // SSE for live instant notifications
  useEffect(() => {
    let eventSource;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.addEventListener('new_order', (e) => {
        const newOrder = JSON.parse(e.data);
        playChime();
        setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
      });
      eventSource.addEventListener('order_updated', (e) => {
        const updated = JSON.parse(e.data);
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        setSelectedOrder(prev => prev && prev.id === updated.id ? updated : prev);
      });
      eventSource.addEventListener('registry_updated', (e) => {
        const updatedReg = JSON.parse(e.data);
        setRegistry(updatedReg);
      });
    } catch (e) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [soundEnabled]);

  const handleOpenOrder = (order) => {
    setSelectedOrder(order);
    setDeliverableForm({
      url: order.deliverable?.url || '',
      title: order.deliverable?.title || `${order.planName} - ${order.client.lastName}`,
      notes: order.deliverable?.notes || '',
      type: order.projectType === 'agent_ai' ? 'agent_ai' : 'website'
    });
  };

  const handleUpdateOrderStatus = async (newStatus) => {
    if (!selectedOrder) return;
    setUpdatingOrder(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.order);
        setOrders(prev => prev.map(o => o.id === data.order.id ? data.order : o));
      }
    } catch (err) {
      console.error("Erreur statut:", err);
    } finally {
      setUpdatingOrder(false);
    }
  };

  const handleSaveDeliverable = async (e) => {
    e.preventDefault();
    if (!deliverableForm.url.trim()) return;

    setUpdatingOrder(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Prête & Livrée',
          deliverable: {
            ...deliverableForm,
            deliveredAt: new Date().toISOString()
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.order);
        setOrders(prev => prev.map(o => o.id === data.order.id ? data.order : o));
        fetchRegistry();
      }
    } catch (err) {
      console.error("Erreur enregistrement livrable:", err);
    } finally {
      setUpdatingOrder(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage('');
    try {
      const payload = {
        provider: settings.provider,
        n8nWebhookUrl: n8nUrlInput.trim(),
        n8nWebhookId: settings.n8nWebhookId,
        n8nMode: n8nModeInput,
        groqModel: settings.groqModel,
        model: settings.model,
        customEndpoint: settings.customEndpoint,
        systemPrompt: settings.systemPrompt
      };
      if (groqKeyInput.trim()) payload.groqApiKey = groqKeyInput.trim();
      if (apiKeyInput.trim()) payload.apiKey = apiKeyInput.trim();

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSettingsMessage("Paramètres de l'Agent IA & n8n enregistrés avec succès !");
        setGroqKeyInput('');
        setApiKeyInput('');
        fetchSettings();
      }
    } catch (err) {
      setSettingsMessage("Erreur lors de l'enregistrement.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Test n8n Webhook
  const handleTestN8n = async () => {
    setTestingApi(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/settings/test-n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          n8nWebhookUrl: n8nUrlInput.trim(),
          n8nWebhookId: settings.n8nWebhookId,
          n8nMode: n8nModeInput
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTestingApi(false);
    }
  };

  // Test Direct Groq or LLM
  const handleTestApi = async (provider = 'groq') => {
    setTestingApi(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: provider === 'groq' ? (groqKeyInput.trim() || undefined) : (apiKeyInput.trim() || undefined),
          model: provider === 'groq' ? settings.groqModel : settings.model,
          customEndpoint: settings.customEndpoint
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTestingApi(false);
    }
  };

  const handleCreateRegistryEntry = async (e) => {
    e.preventDefault();
    if (!newRegData.deliverableUrl.trim()) return;

    try {
      const res = await fetch('/api/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRegData)
      });
      const data = await res.json();
      if (data.success) {
        setNewRegModal(false);
        setNewRegData({
          clientName: '',
          projectName: '',
          planName: 'Business Fonctionnel',
          deliverableType: 'Site Web',
          deliverableUrl: '',
          notes: ''
        });
        fetchRegistry();
      }
    } catch (err) {
      console.error("Erreur ajout registre:", err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.client.firstName} ${order.client.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'new' && order.status.includes('Nouveau')) ||
      (statusFilter === 'briefed' && order.status.includes('Brief')) ||
      (statusFilter === 'production' && order.status.includes('production')) ||
      (statusFilter === 'ready' && order.status.includes('Prête'));

    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'site' && order.projectType === 'site') ||
      (typeFilter === 'agent' && order.projectType === 'agent_ai');

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-7xl h-[94vh] bg-[#0A0A0A] border border-white/15 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* TOP HEADER */}
        <div className="p-4 sm:p-5 bg-[#111111] border-b border-white/10 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F20D25]/15 border border-[#F20D25]/30 flex items-center justify-center text-[#F20D25]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Espace Administrateur DigitalVerse
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En direct</span>
                </span>
              </div>
              <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                <span>Gestionnaire de commandes & Intégration Agent IA n8n</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-neutral-300">
              <RefreshCw className={`w-3.5 h-3.5 text-[#F20D25] ${loadingOrders ? 'animate-spin' : ''}`} />
              <span>Auto-refresh :</span>
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value={5} className="bg-neutral-900">5s</option>
                <option value={10} className="bg-neutral-900">10s</option>
                <option value={30} className="bg-neutral-900">30s</option>
                <option value={0} className="bg-neutral-900">Désactivé</option>
              </select>
              {autoRefreshInterval > 0 && (
                <span className="text-[10px] text-neutral-400">({refreshCountdown}s)</span>
              )}
            </div>

            <button
              onClick={() => fetchOrders()}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors"
              title="Rafraîchir maintenant"
            >
              <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin text-[#F20D25]' : ''}`} />
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors"
              title={soundEnabled ? "Notifications sonores activées" : "Sourdine"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors ml-2"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="px-6 py-2.5 bg-[#0e0e0e] border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-[#F20D25] text-white shadow-[0_0_15px_rgba(242,13,37,0.35)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Gestionnaire de Commandes</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('registry')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'registry'
                  ? 'bg-[#F20D25] text-white shadow-[0_0_15px_rgba(242,13,37,0.35)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Registre des Commandes Prêtes</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                {registry.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-[#F20D25] text-white shadow-[0_0_15px_rgba(242,13,37,0.35)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Configuration Agent IA & n8n</span>
              {settings.hasN8n && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Webhook n8n actif" />
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-xs text-neutral-400">
            <span>Dernière synchro : {lastRefreshed.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* TAB 1: GESTIONNAIRE DE COMMANDES */}
        {activeTab === 'orders' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Filter Bar */}
            <div className="p-4 bg-[#0d0d0d] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par client, email ou N° dossier..."
                  className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25]"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-[#F20D25]"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="new">Nouveaux (En cadrage)</option>
                  <option value="briefed">Brief validé</option>
                  <option value="production">En production</option>
                  <option value="ready">Prêtes & Livrées</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-[#F20D25]"
                >
                  <option value="all">Tous les types</option>
                  <option value="site">Sites Web</option>
                  <option value="agent">Agents IA & Auto</option>
                </select>
              </div>
            </div>

            {/* Orders Table Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-neutral-500">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Aucune commande trouvée</h3>
                  <p className="text-xs text-neutral-400">
                    Modifiez vos critères de recherche ou passez une nouvelle commande test depuis le site.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => {
                    const isAgent = order.projectType === 'agent_ai';
                    const isReady = order.status.includes('Prête');
                    const hasReport = Boolean(order.compatibilityReport);

                    return (
                      <div
                        key={order.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                          selectedOrder?.id === order.id
                            ? 'bg-[#181818] border-[#F20D25] shadow-[0_0_20px_rgba(242,13,37,0.2)]'
                            : 'bg-[#111111] border-white/10 hover:border-white/20 hover:bg-[#141414]'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isAgent ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'bg-red-500/15 text-[#F20D25] border border-red-500/30'
                          }`}>
                            {isAgent ? <Bot className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                {order.id}
                              </span>
                              <span className="text-xs font-bold text-white">
                                {order.client.firstName} {order.client.lastName}
                              </span>
                              <span className="text-[11px] text-neutral-400">
                                • {order.client.email}
                              </span>
                            </div>

                            <div className="text-xs text-neutral-300 font-medium mt-1">
                              Offre : <strong className="text-white">{order.planName}</strong>
                            </div>

                            <div className="text-[11px] text-neutral-400 flex items-center gap-3 mt-1">
                              <span>Échéance : <strong className="text-neutral-300">{order.deadline}</strong></span>
                              <span>•</span>
                              <span>Reçue le : {new Date(order.createdAt).toLocaleDateString()} à {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/5 text-[11px] text-neutral-300">
                            Chat IA : <strong className="text-white">{order.chatHistory?.length || 0} messages</strong>
                          </div>

                          {hasReport && (
                            <div className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 ${
                              order.compatibilityReport.status === 'compatible'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{order.compatibilityReport.score}% Faisabilité</span>
                            </div>
                          )}

                          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            isReady
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : order.status.includes('production')
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-[#F20D25]/15 text-[#FF2E44] border-[#F20D25]/30'
                          }`}>
                            {order.status}
                          </div>

                          <button
                            onClick={() => handleOpenOrder(order)}
                            className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                          >
                            <span>Examiner le dossier</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: REGISTRE DES COMMANDES PRÊTES */}
        {activeTab === 'registry' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-[#0d0d0d] border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Registre des livrables finalisés & Actifs en production
                </h3>
                <p className="text-xs text-neutral-400">
                  Conservez l'inventaire des sites déployés, des widgets d'agents IA et des accès clients.
                </p>
              </div>

              <button
                onClick={() => setNewRegModal(true)}
                className="px-4 py-2 rounded-xl bg-[#F20D25] hover:bg-[#d60b20] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(242,13,37,0.3)]"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un livrable au registre</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {registry.map((entry) => (
                <div
                  key={entry.id}
                  className="p-5 rounded-2xl bg-[#111111] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10">
                        {entry.id}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {entry.projectName}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {entry.status}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-300">
                      Client : <strong className="text-white">{entry.clientName}</strong> • Forfait : {entry.planName}
                    </div>

                    <div className="text-xs text-neutral-400 flex items-center gap-2">
                      <span>URL / Accès :</span>
                      <a
                        href={entry.deliverableUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#FF2E44] hover:underline font-mono text-[11px] flex items-center gap-1"
                      >
                        <span>{entry.deliverableUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {entry.notes && (
                      <div className="text-[11px] text-neutral-500 mt-1 italic">
                        Notes : {entry.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(entry.deliverableUrl, entry.id)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-300 flex items-center gap-1.5 transition-colors"
                      title="Copier l'URL"
                    >
                      {copiedId === entry.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === entry.id ? 'Copié' : 'Copier lien'}</span>
                    </button>

                    <a
                      href={entry.deliverableUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-[#F20D25] hover:bg-[#d60b20] text-xs font-bold text-white flex items-center gap-1.5"
                    >
                      <span>Ouvrir</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: CONFIGURATION AGENT IA & n8n */}
        {activeTab === 'settings' && (
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                {/* 3. OpenAI / Custom LLM */}
                {settings.provider === 'openai' && (
                  <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        Clé d'API LLM (OpenAI, Anthropic ou compatible)
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
                      placeholder="sk-..."
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25] font-mono"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Modèle</label>
                        <input
                          type="text"
                          value={settings.model}
                          onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
                          placeholder="gpt-4o-mini"
                          className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F20D25]"
                        />
                      </div>

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
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTestApi('openai')}
                      disabled={testingApi}
                      className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2"
                    >
                      <Play className={`w-3.5 h-3.5 text-emerald-400 ${testingApi ? 'animate-spin' : ''}`} />
                      <span>{testingApi ? "Test en cours..." : "Tester l'API LLM"}</span>
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
        )}

      </div>

      {/* ORDER DETAILS DRAWER / MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl h-full bg-[#0d0d0d] border-l border-white/15 p-6 sm:p-8 flex flex-col shadow-2xl overflow-y-auto">
            
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-white/10 pb-5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#F20D25]/15 text-[#FF2E44] border border-[#F20D25]/30">
                  {selectedOrder.id}
                </span>
                <span className="text-xs text-neutral-400">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white">
                {selectedOrder.client.firstName} {selectedOrder.client.lastName}
              </h3>
              <p className="text-xs text-[#FF2E44] font-semibold mt-0.5">
                {selectedOrder.planName}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 mb-6 space-y-2">
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Coordonnées du client
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Mail className="w-3.5 h-3.5 text-[#F20D25]" />
                  <a href={`mailto:${selectedOrder.client.email}`} className="hover:underline">
                    {selectedOrder.client.email}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-neutral-300">
                  <Phone className="w-3.5 h-3.5 text-[#F20D25]" />
                  <a href={`tel:${selectedOrder.client.phone}`} className="hover:underline">
                    {selectedOrder.client.phone}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-neutral-300">
                  <Clock className="w-3.5 h-3.5 text-[#F20D25]" />
                  <span>Échéance : <strong>{selectedOrder.deadline}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-neutral-300">
                  <Globe className="w-3.5 h-3.5 text-[#F20D25]" />
                  <span>Type : <strong>{selectedOrder.projectType === 'agent_ai' ? 'Agent IA' : 'Site Web'}</strong></span>
                </div>
              </div>

              {selectedOrder.initialNotes && (
                <div className="pt-2 mt-2 border-t border-white/5 text-xs text-neutral-400 italic">
                  Note client : "{selectedOrder.initialNotes}"
                </div>
              )}
            </div>

            <div className="mb-6 p-4 rounded-2xl bg-[#141414] border border-white/10">
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Statut de la commande
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Nouveau — En cours de cadrage IA",
                  "Brief finalisé — En analyse",
                  "En cours de production",
                  "Prête & Livrée"
                ].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateOrderStatus(st)}
                    disabled={updatingOrder}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedOrder.status === st
                        ? 'bg-[#F20D25] text-white shadow-[0_0_15px_rgba(242,13,37,0.3)]'
                        : 'bg-white/5 text-neutral-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {selectedOrder.compatibilityReport && (
              <div className="mb-6 p-4 rounded-2xl bg-[#161616] border border-[#F20D25]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#F20D25] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Audit de compatibilité IA</span>
                  </div>
                  <span className="text-xs font-extrabold text-white">
                    Score : {selectedOrder.compatibilityReport.score}/100
                  </span>
                </div>

                <div className="text-xs font-bold text-white">
                  {selectedOrder.compatibilityReport.verdictTitle}
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {selectedOrder.compatibilityReport.verdictText}
                </p>

                {selectedOrder.compatibilityReport.recommendations?.length > 0 && (
                  <ul className="space-y-1 pt-1">
                    {selectedOrder.compatibilityReport.recommendations.map((rec, i) => (
                      <li key={i} className="text-[11px] text-neutral-400 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F20D25] mt-1 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#F20D25]" />
                  <span>Transcription intégrale du cadrage IA ({selectedOrder.chatHistory?.length || 0} messages)</span>
                </h4>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto p-3 rounded-2xl bg-[#111111] border border-white/10">
                {selectedOrder.chatHistory?.map((msg, i) => {
                  const isAgent = msg.sender === 'agent';
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-xs leading-relaxed ${
                        isAgent
                          ? 'bg-[#181818] text-neutral-300 border border-white/5 mr-4'
                          : 'bg-[#F20D25]/15 text-white border border-[#F20D25]/30 ml-4'
                      }`}
                    >
                      <div className="font-bold text-[10px] mb-1 flex items-center justify-between text-neutral-400">
                        <span>{isAgent ? 'Nova (Agent IA)' : `${selectedOrder.client.firstName} (Client)`}</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 space-y-3 mt-auto">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Livraison & Enregistrement au registre</span>
              </div>

              <form onSubmit={handleSaveDeliverable} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    URL du site ou lien d'accès à l'Agent IA *
                  </label>
                  <input
                    type="url"
                    required
                    value={deliverableForm.url}
                    onChange={(e) => setDeliverableForm(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://client.digitalverse.app"
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F20D25]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    Notes de livraison / Identifiants transmis
                  </label>
                  <input
                    type="text"
                    value={deliverableForm.notes}
                    onChange={(e) => setDeliverableForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="DNS relié, accès admin WP / Strapi envoyé par email."
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F20D25]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingOrder || !deliverableForm.url.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer dans le Registre des Commandes Prêtes</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* NEW REGISTRY ENTRY MODAL */}
      {newRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0e0e0e] border border-white/15 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setNewRegModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">
              Ajouter une réalisation au registre
            </h3>

            <form onSubmit={handleCreateRegistryEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Nom du client *</label>
                <input
                  type="text"
                  required
                  value={newRegData.clientName}
                  onChange={(e) => setNewRegData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Maison Vélora"
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F20D25]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Titre du projet *</label>
                <input
                  type="text"
                  required
                  value={newRegData.projectName}
                  onChange={(e) => setNewRegData(prev => ({ ...prev, projectName: e.target.value }))}
                  placeholder="Maison Vélora — Boutique de luxe"
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F20D25]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Type de livrable</label>
                  <select
                    value={newRegData.deliverableType}
                    onChange={(e) => setNewRegData(prev => ({ ...prev, deliverableType: e.target.value }))}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F20D25]"
                  >
                    <option value="Site Web">Site Web</option>
                    <option value="Agent IA & Widget">Agent IA & Widget</option>
                    <option value="Automatisation Flux">Automatisation Flux</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Forfait</label>
                  <select
                    value={newRegData.planName}
                    onChange={(e) => setNewRegData(prev => ({ ...prev, planName: e.target.value }))}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F20D25]"
                  >
                    <option value="Vitrine Starter (300 €)">Vitrine Starter (300 €)</option>
                    <option value="Business Fonctionnel (600 €)">Business Fonctionnel (600 €)</option>
                    <option value="Chatbot IA (40 €/m)">Chatbot IA (40 €/m)</option>
                    <option value="Automatisations (100 €/m)">Automatisations (100 €/m)</option>
                    <option value="Sur mesure">Sur mesure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">URL du Livrable *</label>
                <input
                  type="url"
                  required
                  value={newRegData.deliverableUrl}
                  onChange={(e) => setNewRegData(prev => ({ ...prev, deliverableUrl: e.target.value }))}
                  placeholder="https://client.digitalverse.app"
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F20D25]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Notes / Détails</label>
                <textarea
                  rows={2}
                  value={newRegData.notes}
                  onChange={(e) => setNewRegData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Remarques éventuelles sur la livraison..."
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F20D25] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#F20D25] hover:bg-[#d60b20] text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(242,13,37,0.3)]"
              >
                Ajouter au registre
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
