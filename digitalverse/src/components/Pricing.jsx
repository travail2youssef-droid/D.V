import React, { useState } from 'react';
import { PRICING_PLANS } from '../data/content';
import { Check, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

export default function Pricing({ onSelectPlan }) {
  const [activeTab, setActiveTab] = useState('websites'); // 'websites' | 'aiAgents'

  const currentPlans = activeTab === 'websites' ? PRICING_PLANS.websites : PRICING_PLANS.aiAgents;

  return (
    <section id="tarifs" className="py-24 bg-[#050505] relative border-t border-white/[0.06]">
      {/* Background radial glow */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#F20D25]/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#F20D25] uppercase">
            Nos Offres & Tarifs
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Des offres claires, adaptées à vos besoins.
          </h2>
          <p className="text-base text-neutral-400 font-normal leading-relaxed">
            Transparence intégrale, périmètres définis et aucun coût caché. Choisissez votre formule et initiez votre cadrage immédiatement.
          </p>

          {/* Interactive Category Selector Tabs */}
          <div className="pt-6 flex justify-center">
            <div className="inline-flex p-1 rounded-full bg-neutral-900 border border-white/10 shadow-inner">
              <button
                onClick={() => setActiveTab('websites')}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'websites'
                    ? 'bg-[#F20D25] text-white shadow-[0_0_20px_rgba(242,13,37,0.4)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🌐 Sites Web & Suivi (Dès 300 €)
              </button>
              <button
                onClick={() => setActiveTab('aiAgents')}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'aiAgents'
                    ? 'bg-[#F20D25] text-white shadow-[0_0_20px_rgba(242,13,37,0.4)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🤖 Agents IA & Automatisation (Dès 40 €/m)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div
          className={`grid gap-6 ${
            activeTab === 'websites'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
          }`}
        >
          {currentPlans.map((plan) => {
            const isRec = plan.recommended;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl flex flex-col justify-between transition-all duration-300 p-7 ${
                  isRec
                    ? 'bg-[#111111] border-2 border-[#F20D25] shadow-[0_0_35px_rgba(242,13,37,0.22)] -translate-y-1'
                    : 'bg-[#0c0c0c] border border-white/[0.08] hover:border-white/20 hover:bg-[#101010]'
                }`}
              >
                {/* Recommended Badge */}
                {isRec && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#F20D25] text-white text-[11px] font-bold tracking-wide uppercase shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{plan.badgeText || "Recommandé"}</span>
                  </div>
                )}

                <div>
                  {/* Title & Category */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 min-h-[36px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price Tag */}
                  <div className="py-4 my-2 border-y border-white/[0.06] flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs font-semibold text-neutral-400">
                      {plan.billing}
                    </span>
                  </div>

                  {/* Feature Inclusions List */}
                  <div className="space-y-3 my-6">
                    <div className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                      Ce qui est inclus :
                    </div>
                    {plan.inclusions.map((inc, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-300">
                        <Check className="w-4 h-4 text-[#F20D25] flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Area: Notice & CTA Button */}
                <div className="pt-4 border-t border-white/[0.06] space-y-4">
                  {/* Transparent scope notice */}
                  <div className="text-[11px] text-neutral-500 leading-normal flex items-start gap-1.5">
                    <HelpCircle className="w-3 h-3 text-neutral-500 flex-shrink-0 mt-0.5" />
                    <span>{plan.notice}</span>
                  </div>

                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                      isRec
                        ? 'bg-[#F20D25] hover:bg-[#d60b20] text-white shadow-[0_0_20px_rgba(242,13,37,0.35)] hover:shadow-[0_0_25px_rgba(242,13,37,0.55)] active:scale-[0.98]'
                        : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Global Transparent Pricing Disclaimer */}
        <div className="mt-12 p-5 rounded-2xl bg-[#0A0A0A] border border-white/5 text-center max-w-3xl mx-auto">
          <p className="text-xs text-neutral-400 leading-relaxed">
            <span className="text-white font-semibold">Précision de transparence :</span> Les noms de domaine, abonnements d'hébergement spécifiques et éventuels frais d'utilisation des API IA opérateurs restent à la charge du client ou sont formalisés lors du devis final. Aucune modification illimitée n'est promise : chaque prestation s'exécute dans un périmètre contractuel strict et respecté.
          </p>
        </div>

      </div>
    </section>
  );
}
