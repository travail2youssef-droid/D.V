import { SERVICES } from '../data/content';
import { Code, Brain, Zap, ShieldCheck, ArrowRight, Check } from 'lucide-react';

export default function Services({ onSelectService }) {
  const iconMap = {
    Code: Code,
    Brain: Brain,
    Zap: Zap,
    ShieldCheck: ShieldCheck
  };

  return (
    <section id="services" className="py-24 bg-[#050505] relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#F20D25] uppercase">
              Nos Services
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Des solutions digitales complètes pour votre entreprise.
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-sm sm:text-base text-neutral-400 font-normal leading-relaxed">
              Nous concevons des sites web modernes et performants, et intégrons des solutions IA sur mesure pour automatiser vos processus et booster votre croissance.
            </p>
          </div>
        </div>

        {/* 4 Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, index) => {
            const Icon = iconMap[service.iconName] || Code;
            return (
              <div
                key={service.id}
                className="group relative bg-[#0e0e0e] hover:bg-[#131313] rounded-2xl p-7 border border-white/[0.08] hover:border-[#F20D25]/40 transition-all duration-300 flex flex-col justify-between shadow-lg shadow-black/40 hover:-translate-y-1"
              >
                {/* Top Subtle Red Ambient Hover Glow */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#F20D25]/0 group-hover:bg-[#F20D25]/10 rounded-full blur-2xl transition-all duration-500 pointer-events-none" />

                <div>
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 group-hover:border-[#F20D25]/30 group-hover:bg-[#F20D25]/10 flex items-center justify-center text-white group-hover:text-[#F20D25] transition-all duration-300 mb-6">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-white transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-neutral-400 leading-relaxed mb-6 font-normal">
                    {service.description}
                  </p>

                  {/* Bullet features */}
                  <ul className="space-y-2 mb-6">
                    {service.details.map((item, i) => (
                      <li key={i} className="flex items-center text-xs text-neutral-300 gap-2">
                        <Check className="w-3.5 h-3.5 text-[#F20D25] flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action Link */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 group-hover:text-white transition-colors">
                    {service.highlight}
                  </span>
                  <button
                    onClick={() => onSelectService(service.id)}
                    className="w-8 h-8 rounded-full bg-white/[0.04] group-hover:bg-[#F20D25] flex items-center justify-center text-neutral-400 group-hover:text-white transition-all duration-300"
                    aria-label={`En savoir plus sur ${service.title}`}
                  >
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
