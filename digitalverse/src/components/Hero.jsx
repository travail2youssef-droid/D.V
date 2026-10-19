import React from 'react';
import { ArrowRight, Sparkles, TrendingUp, Cpu, CheckCircle } from 'lucide-react';

export default function Hero({ onOpenOrder, onOpenServices, onOpenPortfolio }) {
  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Ambient Red Lights & Beams */}
      <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-[#F20D25]/12 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[250px] bg-[#F20D25]/8 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      {/* Subtle diagonal red light bar */}
      <div 
        className="absolute top-12 right-[-5%] w-[800px] h-[2px] bg-gradient-to-r from-transparent via-[#F20D25]/40 to-transparent rotate-[32deg] pointer-events-none -z-10 blur-[1px]" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Slogan & Value Proposition */}
          <div className="lg:col-span-6 space-y-7 z-10 text-left">
            
            {/* Small red tag / badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F20D25]/10 border border-[#F20D25]/30 text-xs font-semibold tracking-wider text-[#FF2E44] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F20D25] animate-ping" />
              <span>Agence Digitale • Web & IA</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.1] text-white">
              Construisez plus qu'un site.{' '}
              <span className="block mt-1 text-[#F20D25] drop-shadow-[0_0_35px_rgba(242,13,37,0.4)]">
                Construisez votre avenir.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-300 font-normal leading-relaxed max-w-xl">
              DigitalVerse conçoit des sites web sur mesure et des solutions IA puissantes pour les entreprises qui veulent aller plus loin, gagner en efficacité et imposer leur marque.
            </p>

            {/* Two Main CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onOpenOrder()}
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-[#F20D25] hover:bg-[#d60b20] transition-all duration-300 shadow-[0_0_25px_rgba(242,13,37,0.4)] hover:shadow-[0_0_35px_rgba(242,13,37,0.6)] transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Commander un projet</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <a
                href="#tarifs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-neutral-200 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/80 hover:border-neutral-600 transition-all duration-200"
              >
                <span>Découvrir nos offres</span>
              </a>
            </div>

            {/* Credibility & Trust Indicators */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg">
              <div className="space-y-0.5">
                <div className="text-2xl font-bold text-white tracking-tight flex items-baseline">
                  <span>+50</span>
                </div>
                <div className="text-xs text-neutral-400 font-medium">Projets cadrés</div>
              </div>

              <div className="space-y-0.5 border-l border-white/10 pl-4">
                <div className="text-2xl font-bold text-white tracking-tight flex items-baseline">
                  <span>98%</span>
                </div>
                <div className="text-xs text-neutral-400 font-medium">Clients satisfaits</div>
              </div>

              <div className="space-y-0.5 border-l border-white/10 pl-4">
                <div className="text-2xl font-bold text-[#F20D25] tracking-tight flex items-baseline">
                  <span>5.0★</span>
                </div>
                <div className="text-xs text-neutral-400 font-medium">Note moyenne</div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Angled Laptop Mockup & Floating UI Widgets */}
          <div className="lg:col-span-6 relative flex justify-center items-center mt-6 lg:mt-0">
            
            {/* Ambient halo behind laptop */}
            <div className="absolute inset-0 bg-radial-gradient from-[#F20D25]/20 to-transparent blur-3xl opacity-75 pointer-events-none" />

            {/* Container for laptop and floating widgets */}
            <div className="relative w-full max-w-[580px] select-none">
              
              {/* Floating Badge 1 (Top Left): "L'IA au service de votre croissance" */}
              <div 
                onClick={() => onOpenOrder('agent_ai')}
                className="absolute -top-4 sm:-top-6 left-2 sm:-left-4 z-20 cursor-pointer group bg-[#0e0e0e]/90 hover:bg-[#151515] backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-white/15 hover:border-[#F20D25]/50 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-float"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#F20D25]/15 border border-[#F20D25]/30 flex items-center justify-center text-[#F20D25]">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">Intelligence Artificielle</div>
                    <div className="text-xs sm:text-sm font-bold text-white group-hover:text-[#F20D25] transition-colors flex items-center gap-1.5">
                      <span>L'IA au service de votre croissance</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#F20D25] transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Laptop Visual Frame */}
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(242,13,37,0.2)] bg-[#0A0A0A] group">
                
                {/* Visual image asset or high fidelity mockup */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#070707]">
                  <img
                    src="/assets/hero-mockup.png"
                    alt="DigitalVerse Interface et solutions sur mesure"
                    className="w-full h-full object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                    onError={(e) => {
                      // Fallback if image fails
                      e.target.style.display = 'none';
                    }}
                  />

                  {/* Fallback mockup content in case image is missing */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60 pointer-events-none" />
                  
                  {/* Subtle red rim light on top border */}
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#F20D25] to-transparent" />
                </div>

              </div>

              {/* Floating Badge 2 (Bottom Right): "Plus d'efficacité. Plus de résultats." with Live Red Chart */}
              <div className="absolute -bottom-6 -right-2 sm:-right-6 z-20 bg-[#0e0e0e]/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.9)] max-w-[210px] sm:max-w-[230px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] font-semibold text-neutral-400">Performances Digitales</div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#F20D25]">
                    <TrendingUp className="w-3 h-3" />
                    <span>+140%</span>
                  </div>
                </div>

                <div className="text-xs font-bold text-white mb-2">
                  Plus d'efficacité. Plus de résultats.
                </div>

                {/* SVG Red Line Chart Curve */}
                <div className="w-full h-10 overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 160 40" fill="none">
                    <path
                      d="M2 34 Q 30 32, 50 25 T 90 20 T 130 10 T 158 4"
                      fill="none"
                      stroke="#F20D25"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M2 34 Q 30 32, 50 25 T 90 20 T 130 10 T 158 4 L 158 40 L 2 40 Z"
                      fill="url(#redCurveGrad)"
                      opacity="0.25"
                    />
                    <defs>
                      <linearGradient id="redCurveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F20D25" />
                        <stop offset="100%" stopColor="#F20D25" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Glowing end point */}
                    <circle cx="157" cy="4" r="3.5" fill="#F20D25" className="animate-ping" />
                    <circle cx="157" cy="4" r="2.5" fill="#FFFFFF" />
                  </svg>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
