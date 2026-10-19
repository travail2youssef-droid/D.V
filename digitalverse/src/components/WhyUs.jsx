import React from 'react';
import { PRINCIPLES } from '../data/content';
import { Sparkles, Target, Smartphone, Shield } from 'lucide-react';

export default function WhyUs() {
  const iconMap = {
    Sparkles: Sparkles,
    Target: Target,
    Smartphone: Smartphone,
    Shield: Shield
  };

  return (
    <section id="pourquoi" className="py-24 bg-[#080808] relative border-t border-white/[0.06] overflow-hidden">
      {/* Background soft red glow */}
      <div className="absolute top-1/2 left-0 w-[450px] h-[450px] bg-[#F20D25]/6 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#F20D25] uppercase">
            Pourquoi DigitalVerse
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Une approche premium, orientée résultats.
          </h2>
          <p className="text-base text-neutral-400 font-normal leading-relaxed">
            Nous combinons exigence esthétique, rigueur technique et intégration IA pragmatique pour délivrer des outils digitaux qui valorisent votre entreprise.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRINCIPLES.map((principle, index) => {
            const Icon = iconMap[principle.iconName] || Sparkles;
            return (
              <div
                key={principle.id}
                className="bg-[#0e0e0e] rounded-2xl p-7 border border-white/[0.07] hover:border-white/20 transition-all duration-300 relative group"
              >
                {/* Number watermark */}
                <div className="absolute top-4 right-5 text-2xl font-black text-white/[0.04] group-hover:text-[#F20D25]/15 transition-colors">
                  0{index + 1}
                </div>

                <div className="w-11 h-11 rounded-xl bg-[#F20D25]/10 border border-[#F20D25]/20 flex items-center justify-center text-[#F20D25] mb-5">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-white mb-2.5">
                  {principle.title}
                </h3>

                <p className="text-sm text-neutral-400 leading-relaxed font-normal">
                  {principle.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
