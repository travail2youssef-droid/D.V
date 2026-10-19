import { Shield, Cpu, Layers } from 'lucide-react';

export default function About() {
  return (
    <section id="a-propos" className="py-24 bg-[#080808] relative border-t border-white/[0.06] overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-[#F20D25]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold tracking-widest text-[#F20D25] uppercase">
              À Propos de DigitalVerse
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Une vision du digital tournée vers l'avenir.
            </h2>

            <p className="text-base sm:text-lg text-neutral-300 font-normal leading-relaxed">
              DigitalVerse est née d'une conviction fondamentale : le web moderne ne peut plus se contenter de templates standardisés et de gadgets éphémères. Les entreprises ont besoin d'outils solides, ergonomiques et capables de convertir des opportunités réelles.
            </p>

            <p className="text-sm sm:text-base text-neutral-400 font-normal leading-relaxed">
              Nous allions une exigence de design héritée des plus beaux standards contemporains à une maîtrise rigoureuse des technologies web et des modèles d'intelligence artificielle. Notre mission : concevoir pour votre entreprise une vitrine haut de gamme et des automatisations intelligentes qui libèrent votre temps et renforcent votre rentabilité.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#F20D25]" />
                  <span>Rigueur & Éthique</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Des devis transparents et aucun engagement opaque.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#F20D25]" />
                  <span>IA Utile</span>
                </div>
                <p className="text-xs text-neutral-400">
                  L'intelligence artificielle au service de vos gains de temps.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#F20D25]" />
                  <span>Sur-Mesure</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Chaque interface est pensée spécifiquement pour votre audience.
                </p>
              </div>
            </div>

          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#0e0e0e] rounded-3xl p-8 border border-white/10 relative overflow-hidden shadow-2xl shadow-black">
              {/* Red glow accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F20D25]/15 rounded-full blur-2xl" />

              <div className="space-y-6 relative z-10">
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Le Manifeste DigitalVerse
                </div>

                <blockquote className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  "Nous ne créons pas seulement du code. Nous construisons des ponts technologiques entre votre savoir-faire et vos futurs clients."
                </blockquote>

                <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F20D25]/15 border border-[#F20D25]/30 flex items-center justify-center font-bold text-white text-base">
                    DV
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">DigitalVerse Studio</div>
                    <div className="text-xs text-neutral-400">Web Design, Ingénierie & Solutions IA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
