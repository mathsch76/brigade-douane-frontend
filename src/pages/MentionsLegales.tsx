// src/pages/MentionsLegales.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const MentionsLegales: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header avec retour */}
      <div className="bg-slate-800/90 text-white border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            ← Retour
          </button>
          <div>
            <h1 className="text-2xl font-bold">📄 Mentions légales</h1>
            <p className="text-slate-300 text-sm">Informations légales NAO&CO</p>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="prose prose-invert max-w-none space-y-8">
          
          {/* Section Éditeur */}
          <section className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">📍 Éditeur du site</h2>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Nom :</strong> NAO&CO</p>
              <p><strong>Forme juridique :</strong> [À compléter]</p>
              <p><strong>Adresse :</strong> [À compléter]</p>
              <p><strong>Téléphone :</strong> [À compléter]</p>
              <p><strong>Email :</strong> contact@naoandco.com</p>
              <p><strong>SIRET :</strong> [À compléter]</p>
            </div>
          </section>

          {/* Section Hébergement */}
          <section className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">🌐 Hébergement</h2>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Hébergeur :</strong> Railway</p>
              <p><strong>Adresse :</strong> Railway Corp, San Francisco, USA</p>
              <p><strong>Site web :</strong> <a href="https://railway.app" className="text-blue-400 hover:text-blue-300">railway.app</a></p>
            </div>
          </section>

          {/* Section Données personnelles */}
          <section className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">🔒 Protection des données</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground mb-2">Collecte des données</h3>
                <p>Les données collectées sont nécessaires au fonctionnement du service :</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Informations de compte (nom, email, entreprise)</li>
                  <li>Préférences utilisateur (thème, style de communication)</li>
                  <li>Conversations avec les assistants IA</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-foreground mb-2">Utilisation des données</h3>
                <p>Vos données sont utilisées exclusivement pour :</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Fournir le service d'assistance IA douanière</li>
                  <li>Personnaliser votre expérience utilisateur</li>
                  <li>Améliorer nos services</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-2">Vos droits</h3>
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Droit d'accès à vos données</li>
                  <li>Droit de rectification</li>
                  <li>Droit à l'effacement</li>
                  <li>Droit à la portabilité</li>
                </ul>
                <p className="mt-2">Pour exercer vos droits : <strong>contact@naoandco.com</strong></p>
              </div>
            </div>
          </section>

          {/* Section Cookies */}
          <section className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">🍪 Cookies et stockage</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>Ce site utilise le stockage local du navigateur pour :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Maintenir votre session de connexion</li>
                <li>Sauvegarder vos préférences d'interface</li>
                <li>Optimiser les performances</li>
              </ul>
              <p className="mt-2">Aucun cookie tiers n'est utilisé à des fins publicitaires.</p>
            </div>
          </section>

          {/* Section Propriété intellectuelle */}
          <section className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">⚖️ Propriété intellectuelle</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>L'ensemble du contenu de ce site (textes, images, code) est protégé par le droit d'auteur.</p>
              <p>La marque NAO&CO et tous les éléments distinctifs du site sont la propriété exclusive de NAO&CO.</p>
              <p>Toute reproduction ou utilisation sans autorisation expresse est interdite.</p>
            </div>
          </section>

          {/* Section Contact */}
          <section className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-lg border border-blue-500/30">
            <h2 className="text-xl font-semibold mb-4 text-foreground">📧 Contact</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>Pour toute question concernant ces mentions légales :</p>
              <p><strong>Email :</strong> contact@naoandco.com</p>
              <p><strong>Réponse :</strong> Sous 48h ouvrées</p>
            </div>
          </section>

          {/* Footer info */}
          <div className="text-center pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              NAO&CO - Plateforme d'assistance IA pour les douanes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;