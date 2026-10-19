import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, Bot, ArrowRight } from 'lucide-react';

export default function Contact({ onStartAiChat }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    projectType: 'site-web',
    budget: '500-1500',
    message: '',
    consent: false
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Veuillez renseigner votre nom complet.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Veuillez renseigner une adresse email valide.');
      return;
    }
    if (!formData.message.trim()) {
      setError('Veuillez décrire brièvement votre besoin.');
      return;
    }
    if (!formData.consent) {
      setError('Veuillez accepter la politique de confidentialité pour transmettre vos coordonnées.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Impossible d’enregistrer votre demande.');
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Une erreur réseau est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-[#050505] relative border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#F20D25] uppercase">
            Contact & Devis
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Parlons de votre projet.
          </h2>
          <p className="text-base text-neutral-400 font-normal leading-relaxed max-w-2xl mx-auto">
            Expliquez-nous votre besoin et construisons ensemble une solution adaptée à votre entreprise. Votre demande sera enregistrée et étudiée par notre équipe.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct info & AI alternative */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Instant AI Cadrage Alternative Box */}
            <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-[#F20D25]/30 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F20D25]/10 rounded-full blur-xl" />
              <div className="flex items-center gap-2 text-xs font-bold text-[#F20D25] uppercase tracking-wider mb-2">
                <Bot className="w-4 h-4" />
                <span>Recommandé & Plus rapide</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Besoin d'un cadrage immédiat ?
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                Passez directement par notre parcours de commande avec cadrage interactif par notre Agent IA Nova pour vérifier la faisabilité de votre projet en 3 minutes.
              </p>
              <button
                onClick={onStartAiChat}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F20D25] hover:bg-[#d60b20] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(242,13,37,0.3)]"
              >
                <span>Lancer le cadrage interactif</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct Coordinates */}
            <div className="p-6 rounded-2xl bg-[#0c0c0c] border border-white/[0.07] space-y-4">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Nos engagements
              </div>
              <ul className="space-y-3 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F20D25]" />
                  <span>Devis clair et transparent sans engagement</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F20D25]" />
                  <span>Interlocuteur technique senior basé en France</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F20D25]" />
                  <span>Confidentialité absolue de vos données et projets</span>
                </li>
              </ul>
              <div className="pt-4 border-t border-white/[0.06] text-xs text-neutral-400">
                Email direct : <span className="text-white font-medium">contact@digitalverse.fr</span>
              </div>
            </div>

          </div>

          {/* Right Column: Standard Contact Form */}
          <div className="lg:col-span-7 bg-[#0e0e0e] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            {submitted ? (
              <div role="status" className="py-12 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-[#F20D25]/15 border border-[#F20D25]/30 text-[#F20D25] mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Message bien reçu !</h3>
                <p className="text-sm text-neutral-300 max-w-md mx-auto">
                  Merci {formData.name}. Votre demande a été enregistrée. Notre équipe la consultera pour revenir vers vous.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      company: '',
                      email: '',
                      projectType: 'site-web',
                      budget: '500-1500',
                      message: '',
                      consent: false
                    });
                  }}
                  className="mt-4 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 border border-white/10"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {error && (
                  <div role="alert" className="p-3.5 rounded-xl bg-red-950/40 border border-[#F20D25]/50 text-xs text-[#FF8591] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="contact-name" name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jean Dupont"
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-company" className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Entreprise (optionnel)
                    </label>
                    <input
                      type="text"
                      id="contact-company" name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Société SAS"
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Email professionnel *
                    </label>
                    <input
                      type="email"
                      id="contact-email" name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@entreprise.fr"
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-projectType" className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Type de projet
                    </label>
                    <select
                      id="contact-projectType" name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F20D25] transition-colors"
                    >
                      <option value="site-web">Création de site web</option>
                      <option value="agent-ia">Agent conversationnel IA</option>
                      <option value="automation">Automatisation de processus</option>
                      <option value="maintenance">Maintenance & Suivi technique</option>
                      <option value="autre">Projet personnalisé</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-budget" className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Budget envisagé
                  </label>
                  <select
                    id="contact-budget" name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F20D25] transition-colors"
                  >
                    <option value="starter-300">Moins de 500 € (Idéal Vitrine Starter)</option>
                    <option value="500-1500">500 € à 1 500 € (Idéal Business Fonctionnel)</option>
                    <option value="1500-3000">1 500 € à 3 000 € (Projet avancé & IA)</option>
                    <option value="3000+">Plus de 3 000 € (Sur-mesure entreprise)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Description de votre projet *
                  </label>
                  <textarea
                    rows={4}
                    id="contact-message" name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Présentez brièvement vos besoins, vos objectifs ou vos questions..."
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F20D25] transition-colors resize-none"
                    required
                  />
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    className="mt-1 rounded bg-[#161616] border-white/20 text-[#F20D25] focus:ring-0 focus:ring-offset-0"
                    required
                  />
                  <label htmlFor="consent" className="text-xs text-neutral-400">
                    J'accepte que les informations saisies soient exploitées dans le cadre de ma demande de contact et de devis, conformément à la politique de confidentialité.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-full bg-[#F20D25] hover:bg-[#d60b20] text-white text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(242,13,37,0.35)] disabled:opacity-50"
                >
                  {loading ? (
                    <span>Transmission en cours...</span>
                  ) : (
                    <>
                      <span>Envoyer ma demande</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
