import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Logo from './Logo';

export default function Footer({ onOpenAdmin, onOpenLegal, onOpenPrivacy }) {
  return (
    <footer className="bg-[#030303] border-t border-white/[0.08] text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="default" />
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              DigitalVerse conçoit des sites web sur mesure et des solutions d'intelligence artificielle haut de gamme pour les entreprises exigeantes.
            </p>
            <div className="text-[11px] text-neutral-500 tracking-wider uppercase font-semibold">
              Websites • AI • Automation
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Navigation</div>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/expertises" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/offres" className="hover:text-white transition-colors">Nos offres & Tarifs</Link></li>
              <li><Link to="/realisations" className="hover:text-white transition-colors">Réalisations</Link></li>
              <li><Link to="/agence" className="hover:text-white transition-colors">Pourquoi nous</Link></li>
              <li><Link to="/offres" className="hover:text-white transition-colors">Foire aux questions</Link></li>
            </ul>
          </div>

          {/* Solutions */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Expertises</div>
            <ul className="space-y-2">
              <li><span className="text-neutral-300">Sites Vitrine Starter</span></li>
              <li><span className="text-neutral-300">Sites Business Fonctionnel</span></li>
              <li><span className="text-neutral-300">Agents Chatbots IA 24/7</span></li>
              <li><span className="text-neutral-300">Automatisations sur mesure</span></li>
              <li><span className="text-neutral-300">Maintenance & Sérénité</span></li>
            </ul>
          </div>

          {/* Internal Access & Contact */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Espace Client & Pro</div>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/10 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-[#F20D25]" />
                  <span>Espace Administrateur</span>
                </button>
              </li>
              <li>
                <span className="block text-neutral-500 text-[11px]">Contact officiel :</span>
                <a href="mailto:contact@digitalverse.fr" className="text-white hover:text-[#F20D25] transition-colors">
                  contact@digitalverse.fr
                </a>
              </li>
              <li className="text-[11px] text-neutral-500">
                Paris, France
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} DigitalVerse. Tous droits réservés.
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button onClick={onOpenLegal} className="hover:text-neutral-300 transition-colors">
              Mentions légales
            </button>
            <span>•</span>
            <button onClick={onOpenPrivacy} className="hover:text-neutral-300 transition-colors">
              Politique de confidentialité
            </button>
            <span>•</span>
            <a href="#contact" className="hover:text-neutral-300 transition-colors">
              Contact
            </a>
          </div>

          {/* Social Icons matching screenshot */}
          <div className="flex items-center gap-4 text-neutral-400">
            <span className="hover:text-white cursor-pointer transition-colors" title="LinkedIn">in</span>
            <span className="hover:text-white cursor-pointer transition-colors" title="X (Twitter)">𝕏</span>
            <span className="hover:text-white cursor-pointer transition-colors" title="Instagram">ig</span>
            <span className="hover:text-white cursor-pointer transition-colors" title="YouTube">yt</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
