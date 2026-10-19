import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data/content';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';

export default function Faq({ onOpenContact }) {
  const [openIndex, setOpenIndex] = useState(0); // Open first question by default

  const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="py-24 bg-[#050505] relative border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#F20D25] uppercase">
            Foire Aux Questions
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Des réponses claires à vos interrogations.
          </h2>
          <p className="text-base text-neutral-400 font-normal leading-relaxed">
            Consultez les réponses aux questions les plus fréquentes sur nos processus, nos forfaits et nos garanties techniques.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl transition-all duration-300 border ${
                  isOpen
                    ? 'bg-[#0f0f0f] border-[#F20D25]/40 shadow-lg shadow-black/40'
                    : 'bg-[#0a0a0a] border-white/[0.07] hover:border-white/20'
                }`}
              >
                <button
                  onClick={() => toggleIndex(index)}
                  className="w-full py-5 px-6 sm:px-7 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#F20D25] flex-shrink-0" />
                    <span>{item.question}</span>
                  </span>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.04] transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180 bg-[#F20D25]/15 text-[#F20D25]' : 'text-neutral-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 sm:px-7 pb-6 pt-1 text-sm sm:text-base text-neutral-300 font-normal leading-relaxed border-t border-white/[0.04] animate-fadeIn">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA if question not answered */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-[#0e0e0e] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <div className="text-sm font-bold text-white">Vous avez une question spécifique sur votre projet ?</div>
            <div className="text-xs text-neutral-400">Notre équipe et notre assistant IA analysent votre demande avec précision.</div>
          </div>
          <button
            onClick={onOpenContact}
            className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 flex-shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#F20D25]" />
            <span>Poser une question directe</span>
          </button>
        </div>

      </div>
    </section>
  );
}
