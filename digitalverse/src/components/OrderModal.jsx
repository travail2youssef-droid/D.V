import React, { useState, useEffect } from 'react';
import { PRICING_PLANS } from '../data/content';
import { X, ArrowRight, CheckCircle2, Globe, Bot, Calendar, User, Mail, Phone, Sparkles, AlertCircle } from 'lucide-react';

export default function OrderModal({ isOpen, onClose, initialPlan, onOrderCreated }) {
  if (!isOpen) return null;

  // Form State
  const [projectType, setProjectType] = useState('site'); // 'site' | 'agent_ai'
  const [selectedPlanId, setSelectedPlanId] = useState('business-fonctionnel');
  const [deadline, setDeadline] = useState('2 à 3 semaines');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [initialNotes, setInitialNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync initial plan if passed
  useEffect(() => {
    if (initialPlan) {
      if (initialPlan.category === 'ai' || initialPlan.id.startsWith('agent')) {
        setProjectType('agent_ai');
      } else {
        setProjectType('site');
      }
      setSelectedPlanId(initialPlan.id);
    }
  }, [initialPlan]);

  // Current plans available based on project type
  const availablePlans = projectType === 'site'
    ? PRICING_PLANS.websites
    : PRICING_PLANS.aiAgents;

  // Ensure selectedPlanId matches available plans
  useEffect(() => {
    const exists = availablePlans.some(p => p.id === selectedPlanId);
    if (!exists && availablePlans.length > 0) {
      setSelectedPlanId(availablePlans[0].id);
    }
  }, [projectType, availablePlans, selectedPlanId]);

  const activePlan = availablePlans.find(p => p.id === selectedPlanId) || availablePlans[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Veuillez renseigner votre prénom et votre nom.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Veuillez renseigner une adresse email valide.');
      return;
    }
    if (!phone.trim()) {
      setError('Veuillez renseigner votre numéro de téléphone.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        client: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim()
        },
        projectType,
        planId: activePlan.id,
        planName: `${activePlan.name} (${activePlan.price}${activePlan.billing === 'paiement unique' ? ' unique' : activePlan.billing})`,
        deadline,
        initialNotes: initialNotes.trim()
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setLoading(false);

      if (data.success && data.order) {
        onOrderCreated(data.order);
      } else {
        setError(data.error || "Une erreur est survenue lors de l'enregistrement.");
      }
    } catch (err) {
      setLoading(false);
      setError("Impossible de contacter le serveur. Veuillez réessayer.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0e0e0e] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F20D25]/10 border border-[#F20D25]/30 text-[11px] font-bold text-[#FF2E44] uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Étape 1 : Configuration de votre commande</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Lancez votre projet DigitalVerse
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Sélectionnez votre offre et vos coordonnées. Vous serez ensuite immédiatement orienté vers notre Agent IA Nova pour le cadrage technique précis.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-[#F20D25]/50 text-xs text-[#FF8591] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: Type Selection (Site Web vs Agent IA) */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              1. Que souhaitez-vous concevoir ? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProjectType('site')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  projectType === 'site'
                    ? 'bg-[#181818] border-[#F20D25] shadow-[0_0_20px_rgba(242,13,37,0.2)]'
                    : 'bg-[#111111] border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  projectType === 'site' ? 'bg-[#F20D25] text-white' : 'bg-white/5 text-neutral-400'
                }`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Site Web Professionnel</div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Site vitrine ou business haute performance
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProjectType('agent_ai')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  projectType === 'agent_ai'
                    ? 'bg-[#181818] border-[#F20D25] shadow-[0_0_20px_rgba(242,13,37,0.2)]'
                    : 'bg-[#111111] border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  projectType === 'agent_ai' ? 'bg-[#F20D25] text-white' : 'bg-white/5 text-neutral-400'
                }`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Agent IA & Automatisation</div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Chatbot 24/7 (40€/m) ou flux sur mesure (100€/m)
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: Choose Plan */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              2. Forfait sélectionné *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availablePlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-[#161616] border-[#F20D25] ring-1 ring-[#F20D25]'
                        : 'bg-[#101010] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{plan.name}</span>
                        {plan.recommended && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F20D25] text-white">
                            Populaire
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1 line-clamp-1">
                        {plan.description}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-2">
                      <div className="text-sm font-extrabold text-[#F20D25]">{plan.price}</div>
                      <div className="text-[10px] text-neutral-400">{plan.billing}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Timeline / Pour quand */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              3. Pour quand souhaitez-vous la livraison ? *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                "Moins d'une semaine (urgent)",
                "2 à 3 semaines",
                "1 mois environ",
                "Pas de date fixe"
              ].map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setDeadline(opt)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                    deadline === opt
                      ? 'bg-[#F20D25]/15 border-[#F20D25] text-white font-semibold'
                      : 'bg-[#111111] border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4: Client Coordinates */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              4. Vos coordonnées professionnelles *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Prénom *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Nom *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Email professionnel *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean.dupont@entreprise.fr"
                    className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Numéro de téléphone *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Optional Initial Project Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              5. Première description du besoin (optionnel)
            </label>
            <textarea
              rows={2}
              value={initialNotes}
              onChange={(e) => setInitialNotes(e.target.value)}
              placeholder="Ex : Site vitrine pour cabinet d'avocats, ou bot de prise de contact WhatsApp..."
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25] resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-full bg-[#F20D25] hover:bg-[#d60b20] text-white text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(242,13,37,0.4)] disabled:opacity-50 group"
            >
              {loading ? (
                <span>Création de votre commande en cours...</span>
              ) : (
                <>
                  <span>Valider & Démarrer le cadrage avec l'Agent IA</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            <div className="text-[11px] text-neutral-500 text-center mt-2">
              Aucun débit immédiat. Votre commande sera vérifiée lors du cadrage interactif.
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
