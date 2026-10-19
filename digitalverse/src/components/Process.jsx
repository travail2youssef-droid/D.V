import React from 'react';
import { PROCESS_STEPS } from '../data/content';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Process() {
  return (
    <section className="py-24 bg-[#050505] relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#F20D25] uppercase">
            Méthodologie & Déploiement
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            De l'idée à la mise en ligne.
          </h2>
          <p className="text-base text-neutral-400 font-normal leading-relaxed">
            Un processus en 4 étapes clés pour garantir transparence, respect des délais et rigueur technique à chaque jalon.
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Subtle horizontal line behind steps on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-[1px] bg-white/[0.08] -z-0 -translate-y-6" />

          {PROCESS_STEPS.map((step, index) => (
            <div
              key={step.step}
              className="relative z-10 bg-[#0e0e0e] rounded-2xl p-7 border border-white/[0.07] hover:border-[#F20D25]/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Step number badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-white/20 group-hover:text-[#F20D25] transition-colors">
                    {step.step}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] group-hover:bg-[#F20D25]/15 border border-white/10 group-hover:border-[#F20D25]/30 flex items-center justify-center text-neutral-400 group-hover:text-[#F20D25] transition-all">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-white transition-colors">
                  {step.title}
                </h3>

                <p className="text-sm text-neutral-400 font-normal leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.04] text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Jalon {step.step} / 04
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
