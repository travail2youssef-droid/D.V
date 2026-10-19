import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Navbar({ onOpenOrder, onOpenAdmin }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "Accueil", href: "#hero" },
    { name: "Services", href: "#services" },
    { name: "Nos offres", href: "#tarifs" },
    { name: "Réalisations", href: "#portfolio" },
    { name: "Pourquoi nous", href: "#pourquoi" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#050505]/90 backdrop-blur-md border-b border-white/[0.08] py-3.5 shadow-lg shadow-black/50'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, '#hero')}
            className="flex items-center group cursor-pointer focus:outline-none"
            aria-label="DigitalVerse - Retour à l'accueil"
          >
            <Logo size="default" />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7" aria-label="Navigation principale">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-neutral-300 hover:text-white transition-colors duration-200 relative group py-1"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F20D25] transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Admin shortcut button */}
            <button
              onClick={onOpenAdmin}
              className="text-xs font-medium text-neutral-400 hover:text-white px-3 py-2 rounded-full border border-white/10 hover:border-white/25 transition-all flex items-center gap-1.5 bg-white/[0.02]"
              title="Accès Espace Administrateur"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#F20D25]" />
              <span>Espace Admin</span>
            </button>

            {/* Primary Order CTA */}
            <button
              onClick={() => onOpenOrder()}
              className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#F20D25] hover:bg-[#d60b20] transition-all duration-300 shadow-[0_0_20px_rgba(242,13,37,0.35)] hover:shadow-[0_0_30px_rgba(242,13,37,0.55)] active:scale-95"
            >
              <span>Commander / Projet</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => onOpenOrder()}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-[#F20D25] shadow-sm flex items-center gap-1"
            >
              <span>Commander</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800 transition-colors"
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/10 px-4 pt-4 pb-6 mt-3 space-y-3 animate-fadeIn">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-neutral-200 hover:text-white hover:bg-neutral-900/80 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOrder();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F20D25] text-white font-semibold text-sm shadow-[0_0_20px_rgba(242,13,37,0.4)]"
            >
              <span>Lancer une commande / Parler du projet</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 text-neutral-300 hover:text-white text-xs font-medium bg-neutral-900/50"
            >
              <ShieldCheck className="w-4 h-4 text-[#F20D25]" />
              <span>Accès Espace Administrateur</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
