import { X, Shield } from 'lucide-react';

export default function LegalModal({ isOpen, type, onClose }) {
  if (!isOpen) return null;

  const isLegal = type === 'legal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0e0e0e] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-[#F20D25]" />
          <span className="text-xs font-bold text-[#F20D25] tracking-wider uppercase">
            Informations réglementaires
          </span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-6">
          {isLegal ? 'Mentions Légales' : 'Politique de Confidentialité'}
        </h3>

        {/* Modal Content */}
        {isLegal ? (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
            <section className="space-y-1">
              <h4 className="font-bold text-white">1. Éditeur de la plateforme</h4>
              <p>
                Le site DigitalVerse est édité par l'agence DigitalVerse (immatriculation et numéro SIREN/RCS en cours d'enregistrement auprès du greffe du tribunal de commerce de Paris).
              </p>
              <p>Email de contact : contact@digitalverse.fr</p>
            </section>

            <section className="space-y-1">
              <h4 className="font-bold text-white">2. Directeur de la publication</h4>
              <p>Direction générale de DigitalVerse Studio.</p>
            </section>

            <section className="space-y-1">
              <h4 className="font-bold text-white">3. Hébergement</h4>
              <p>
                Ce site web et son infrastructure applicative sont hébergés sur des serveurs sécurisés situés au sein de l'Union Européenne (Vercel Inc. / Cloudflare).
              </p>
            </section>

            <section className="space-y-1">
              <h4 className="font-bold text-white">4. Propriété intellectuelle</h4>
              <p>
                L'ensemble des contenus (textes, logos, maquettes graphiques et codes sources) présents sur ce site relèvent de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
            <section className="space-y-1">
              <h4 className="font-bold text-white">1. Données collectées</h4>
              <p>
                Dans le cadre des demandes de contact et des parcours de commande et cadrage IA, DigitalVerse collecte uniquement les données strictement nécessaires : prénom, nom, adresse email, numéro de téléphone et détails du projet client.
              </p>
            </section>

            <section className="space-y-1">
              <h4 className="font-bold text-white">2. Finalité des traitements</h4>
              <p>
                Ces informations sont traitées exclusivement pour l'établissement des devis, la conduite du cadrage technique et le suivi contractuel de vos commandes. Elles ne sont en aucun cas cédées ni vendues à des tiers.
              </p>
            </section>

            <section className="space-y-1">
              <h4 className="font-bold text-white">3. Droits des utilisateurs (RGPD)</h4>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et d'effacement de vos données personnelles par simple email adressé à contact@digitalverse.fr.
              </p>
            </section>
          </div>
        )}

        <div className="pt-6 mt-6 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
