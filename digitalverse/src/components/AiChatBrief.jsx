import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Bot, Send, User, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Clock, RefreshCw, X, ShieldCheck } from 'lucide-react';

export default function AiChatBrief({ order, onClose, onOpenAdmin }) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [messages, setMessages] = useState(order?.chatHistory || []);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFinalized, setIsFinalized] = useState(order?.isBriefComplete || false);
  const [report, setReport] = useState(order?.compatibilityReport || null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Trigger confetti when report is first generated
  useEffect(() => {
    if (isFinalized && report) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }, [isFinalized, report]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = (customText || inputVal).trim();
    if (!textToSend || isTyping) return;

    setInputVal('');

    // Immediately append user message to UI
    const tempUserMsg = {
      id: `local-${Date.now()}`,
      sender: 'user',
      message: textToSend,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Order-Token': currentOrder.clientToken || '' },
        body: JSON.stringify({ message: textToSend })
      });

      const data = await res.json();
      setIsTyping(false);

      if (data.success && data.order) {
        setCurrentOrder(data.order);
        setMessages(data.order.chatHistory);
        if (data.isComplete) {
          setIsFinalized(true);
          setReport(data.compatibilityReport);
        }
      }
    } catch (err) {
      setIsTyping(false);
      console.error("Erreur chat:", err);
    }
  };

  const handleManualFinalize = async () => {
    setIsTyping(true);
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Order-Token': currentOrder.clientToken || '' }
      });
      const data = await res.json();
      setIsTyping(false);
      if (data.success && data.order) {
        setCurrentOrder(data.order);
        setMessages(data.order.chatHistory);
        setIsFinalized(true);
        setReport(data.order.compatibilityReport);
      }
    } catch (err) {
      setIsTyping(false);
      console.error("Erreur finalisation:", err);
    }
  };

  // Quick suggestions based on stage
  const userMessagesCount = messages.filter(m => m.sender === 'user').length;
  const isAgentProject = currentOrder.projectType === 'agent_ai';

  const quickSuggestions = isAgentProject
    ? userMessagesCount === 0
      ? ["Chatbot pour qualifier les prospects entrants", "Automatisation Notion + Slack + CRM", "Assistant support client 24/7"]
      : userMessagesCount === 1
      ? ["Intégration WhatsApp & site web", "Formulaires Tally et HubSpot", "Uniquement widget sur notre site web"]
      : ["FAQ et fiches produits déjà prêtes", "Besoin d'aide pour structurer les données", "Volume estimé : 200 à 500 requêtes/mois"]
    : userMessagesCount === 0
      ? ["Refonte de site vitrine pour cabinet de conseil", "Lancement d'une marque d'artisanat / boutique", "Site corporate avec prise de rendez-vous"]
      : userMessagesCount === 1
      ? ["Accueil, Services, Tarifs, À propos et Contact", "Catalogue de produits sans paiement en ligne", "Page unique épurée avec formulaire de devis"]
      : ["Textes et photos haute définition prêts", "Nous avons notre logo et charte graphique", "Besoin d'accompagnement éditorial"];

  const progressPercent = Math.min(100, Math.round(((userMessagesCount) / 4) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[820px] bg-[#0c0c0c] border border-white/15 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#121212] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-[#F20D25]/15 border border-[#F20D25]/30 flex items-center justify-center text-[#F20D25]">
                <Bot className="w-5 h-5" />
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-[#121212]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Nova — Architecte DigitalVerse</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F20D25]/20 text-[#FF334B] border border-[#F20D25]/30">
                  Cadrage IA
                </span>
              </div>
              <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                <span>Dossier : <strong className="text-white">{currentOrder.id}</strong></span>
                <span>•</span>
                <span className="truncate max-w-[180px] sm:max-w-none text-neutral-300">
                  {currentOrder.planName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct finalize button if user wants to conclude early */}
            {!isFinalized && userMessagesCount >= 1 && (
              <button
                onClick={handleManualFinalize}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-neutral-300 border border-white/10"
                title="Conclure l'entretien et générer le rapport"
              >
                <span>Finaliser le diagnostic</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar (Shows how close the interview is to completion) */}
        <div className="bg-[#181818] px-4 py-2 border-b border-white/5 flex items-center justify-between text-[11px] text-neutral-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F20D25]" />
            <span>
              {isFinalized
                ? "Cadrage terminé • Rapport de faisabilité généré"
                : `Avancement du recueil : Question ${Math.min(4, userMessagesCount + 1)} sur 4 maximum`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-24 sm:w-36 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F20D25] to-[#ff475a] transition-all duration-500"
                style={{ width: `${isFinalized ? 100 : progressPercent}%` }}
              />
            </div>
            <span className="font-semibold text-neutral-300 text-[10px]">
              {isFinalized ? '100%' : `${progressPercent}%`}
            </span>
          </div>
        </div>

        {/* Chat Conversation Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {messages.map((msg, index) => {
            const isAgent = msg.sender === 'agent';
            return (
              <div
                key={msg.id || index}
                className={`flex items-start gap-3 ${isAgent ? 'justify-start' : 'justify-end'} animate-fadeIn`}
              >
                {isAgent && (
                  <div className="w-8 h-8 rounded-xl bg-[#F20D25]/15 border border-[#F20D25]/30 flex items-center justify-center text-[#F20D25] flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isAgent
                      ? 'bg-[#151515] text-neutral-200 border border-white/10 rounded-tl-sm'
                      : 'bg-[#F20D25] text-white font-medium rounded-tr-sm shadow-[0_0_20px_rgba(242,13,37,0.25)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <div
                    className={`text-[10px] mt-1.5 ${
                      isAgent ? 'text-neutral-500' : 'text-white/70'
                    } text-right`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {!isAgent && (
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-[#F20D25]/15 border border-[#F20D25]/30 flex items-center justify-center text-[#F20D25] flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#151515] border border-white/10 rounded-2xl px-4 py-3 text-xs text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F20D25] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#F20D25] animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-[#F20D25] animate-bounce delay-200" />
                <span className="text-[11px] text-neutral-400 ml-1">Nova analyse votre réponse...</span>
              </div>
            </div>
          )}

          {/* COMPATIBILITY REPORT CARD (When brief is finalized!) */}
          {isFinalized && report && (
            <div className="my-6 p-5 sm:p-6 rounded-2xl bg-[#141414] border-2 border-[#F20D25]/50 shadow-2xl animate-fadeIn space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Rapport d'Audit & Cadrage Technique
                    </div>
                    <div className="text-base sm:text-lg font-extrabold text-white">
                      {report.verdictTitle}
                    </div>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F20D25]" />
                  <span>Indication automatique : à confirmer avec notre équipe</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {report.verdictText}
              </p>

              {/* Recommendations list */}
              {report.recommendations && report.recommendations.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Points validés pour la réalisation :
                  </div>
                  {report.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F20D25] flex-shrink-0 mt-1.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Management Actions */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-neutral-400">
                  Commande enregistrée dans le gestionnaire DigitalVerse.
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenAdmin) onOpenAdmin();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#F20D25] hover:bg-[#d60b20] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(242,13,37,0.35)]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Voir dans l'Espace Administrateur</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips (Helps user respond in one tap) */}
        {!isFinalized && quickSuggestions.length > 0 && (
          <div className="px-4 py-2 bg-[#101010] border-t border-white/5 flex items-center gap-2 overflow-x-auto flex-shrink-0 no-scrollbar">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase flex-shrink-0">
              Suggestions :
            </span>
            {quickSuggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(sug)}
                className="text-xs px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-neutral-300 hover:text-white border border-white/10 whitespace-nowrap transition-colors flex-shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-white/10 bg-[#121212] flex-shrink-0">
          {isFinalized ? (
            <div className="text-center py-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-neutral-400">
              <span>Le cadrage technique pour cette commande est validé et archivé.</span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium"
              >
                Retourner au site
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Décrivez votre idée, vos pages ou répondez à Nova..."
                className="flex-1 bg-[#181818] border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25] transition-colors"
                disabled={isTyping}
              />

              <button
                type="submit"
                disabled={!inputVal.trim() || isTyping}
                className="p-3 rounded-2xl bg-[#F20D25] hover:bg-[#d60b20] text-white disabled:opacity-40 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(242,13,37,0.3)]"
                aria-label="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
