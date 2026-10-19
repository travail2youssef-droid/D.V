import Logo from './Logo';
import { ArrowRight } from 'lucide-react';

export default function CtaBanner({ onOpenOrder }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative rounded-3xl bg-gradient-to-r from-[#121212] via-[#0f0f0f] to-[#14080a] p-6 sm:p-8 md:p-10 border border-white/10 hover:border-[#F20D25]/40 transition-all duration-300 shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden group">
        
        {/* Ambient red glow inside banner */}
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#F20D25]/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          
          {/* Left: Brand Logo */}
          <div className="flex-shrink-0">
            <Logo size="large" />
          </div>

          {/* Divider line on desktop */}
          <div className="hidden lg:block w-[1px] h-12 bg-white/10" />

          {/* Middle: Slogan */}
          <div className="text-center lg:text-left flex-1">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Prêt à passer au <span className="text-[#F20D25]">niveau supérieur</span> ?
            </h3>
            <p className="text-sm text-neutral-400 mt-1 font-normal">
              Parlons de votre projet et trouvons ensemble la meilleure solution pour votre entreprise.
            </p>
          </div>

          {/* Right: CTA Button */}
          <div className="flex-shrink-0">
            <button
              onClick={() => onOpenOrder()}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white bg-[#F20D25] hover:bg-[#d60b20] transition-all duration-300 shadow-[0_0_25px_rgba(242,13,37,0.45)] hover:shadow-[0_0_35px_rgba(242,13,37,0.65)] hover:scale-105 active:scale-95"
            >
              <span>Prendre contact</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
