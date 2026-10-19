import { useState } from 'react';
import { PROJECTS } from '../data/content';
import { ArrowRight, X, CheckCircle } from 'lucide-react';

export default function Portfolio({ onOpenOrder }) {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <section id="portfolio" className="py-24 bg-[#080808] relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#F20D25] uppercase">
              Portfolio & Réalisations
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Des projets qui font la différence.
            </h2>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <p className="text-sm sm:text-base text-neutral-400 font-normal leading-relaxed">
              Découvrez quelques-uns de nos concepts et réalisations conçus pour concilier prestige esthétique, conversion et innovation technologique.
            </p>
            <div className="text-xs text-neutral-500 italic">
              * Réalisations et concepts représentatifs des capacités techniques de l'agence.
            </div>
          </div>
        </div>

        {/* 3 Projects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              role="button"
              tabIndex={0}
              aria-label={`Ouvrir la fiche du projet ${project.title}`}
              onClick={() => setSelectedProject(project)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedProject(project); }
              }}
              className="group cursor-pointer bg-[#0e0e0e] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[#F20D25]/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col shadow-xl shadow-black/60"
            >
              {/* Image Preview Box */}
              <div className="relative aspect-[16/11] bg-[#141414] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                
                {/* Fallback gradient if image not loaded */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-80" />

                {/* Badge Category */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#050505]/80 backdrop-blur-md text-white border border-white/10">
                    {project.category}
                  </span>
                </div>

                {/* Subtle Concept label */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F20D25]/15 text-[#FF2E44] border border-[#F20D25]/30">
                    {project.type}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#F20D25] transition-colors flex items-center justify-between">
                    <span>{project.title}</span>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#F20D25] group-hover:translate-x-1 transition-all" />
                  </h3>
                  
                  <p className="text-xs font-semibold text-neutral-400 mt-1 mb-3">
                    {project.accent}
                  </p>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="pt-4 mt-4 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                  {project.features.map((feat, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-neutral-300 border border-white/5"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#0e0e0e] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[#F20D25] tracking-wider uppercase">
                {selectedProject.category}
              </span>
              <span className="text-xs text-neutral-500">•</span>
              <span className="text-xs text-neutral-400">
                {selectedProject.type}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              {selectedProject.title}
            </h3>

            {/* Image Preview */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 mb-6 bg-neutral-900">
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description */}
            <div className="space-y-4 text-sm text-neutral-300 leading-relaxed mb-6">
              <p>{selectedProject.description}</p>
              
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Spécificités techniques & UX
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
                  {selectedProject.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#F20D25]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA in Modal */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setSelectedProject(null);
                  onOpenOrder(selectedProject.id === 'nexora' ? 'agent_ai' : 'site');
                }}
                className="flex-1 py-3 px-5 rounded-full bg-[#F20D25] hover:bg-[#d60b20] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(242,13,37,0.3)]"
              >
                <span>Commander un projet similaire</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedProject(null)}
                className="py-3 px-5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 font-medium text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
