// UserDetailModal.tsx - VERSION CORRIGÉE - SUPPRESSION DU RANDOM
import React, { useState, useEffect } from 'react';
import type { UserDetailModalProps } from '../types/admin.types';
import { UserBotStatsTable } from './UserBotStatsTable';
import { UserBotDetailModal } from './UserBotDetailModal';

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onRevokeLicense,
  loading
}) => {
  // 🎯 État pour gérer le modal détaillé des bots
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [selectedBotName, setSelectedBotName] = useState<string>('');
  const [userTokenData, setUserTokenData] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  // 🔄 FONCTION D'ACTUALISATION DES DONNÉES DU BOT
  const refreshBotData = async () => {
    if (!selectedBotId || !user?.id) return;
    
    setLoadingTokens(true);
    try {
      console.log('🔄 Actualisation des données bot:', selectedBotId);
console.error('🚨 TEST ACTUALISATION - CETTE LIGNE DOIT APPARAÎTRE !');

console.log('🔑 Token utilisé:', localStorage.getItem('token'));
console.log('🔗 URL appelée:', `${import.meta.env.VITE_API_URL || 'http://localhost:4002'}/admin/users/${user.id}/tokens?bot_id=${selectedBotId}`);
console.log('🌍 VITE_API_URL env:', import.meta.env.VITE_API_URL);
      
      // Appeler la vraie route API
 const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4002'}/admin/users/${user.id}/tokens?bot_id=${selectedBotId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const tokenData = await response.json();
        console.log('✅ Données actualisées:', tokenData);
setUserTokenData(tokenData.data?.tokens || []);
      } else {
        console.error('❌ Erreur actualisation:', response.status);
        // Garder les données actuelles en cas d'erreur
      }
    } catch (error) {
      console.error('❌ Erreur fetch actualisation:', error);
    } finally {
      setLoadingTokens(false);
    }
  };


  // 🔥 RESET DU BOT SÉLECTIONNÉ QUAND ON CHANGE D'UTILISATEUR
  useEffect(() => {
    setSelectedBotId(null);
    setSelectedBotName('');
    setUserTokenData([]);
  }, [user?.id]);

  if (!isOpen || !user) return null;

  // 🔍 DEBUG LOGS
  console.log('🔍 USER COMPLET REÇU PAR MODAL:', JSON.stringify(user, null, 2));
  console.log('🔍 user.usage_stats DIRECT:', user?.usage_stats);
  console.log('🔍 user.bots_usage DIRECT:', user?.bots_usage);

  // 🎯 Helper pour formater les nombres
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  // 🎯 Helper pour formater les prix
  const formatCurrency = (amount: number, currency: 'EUR' | 'USD'): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  // 🔥 EXTRACTION DIRECTE - NOMS UNIQUES
  const usageStats = user?.usage_stats || {};
  const botsUsage = user?.bots_usage || [];

  // 🔥 VALEURS FORCÉES
  const totalTokens = usageStats.total_tokens || 0;
  const inputTokens = usageStats.input_tokens || 0;
  const outputTokens = usageStats.output_tokens || 0;
  const totalRequests = usageStats.total_requests || 0;
  const estimatedCost = usageStats.estimated_cost_eur || 0;
  const uniqueBots = usageStats.unique_bots_used || botsUsage.length || 0;
  const lastActivity = usageStats.last_activity;

  console.log('🔥 VALEURS FINALES EXTRAITES:', {
    totalTokens,
    inputTokens,
    outputTokens,
    totalRequests,
    estimatedCost,
    uniqueBots,
    botsLength: botsUsage.length
  });

  // 🎯 Handler pour l'ouverture du modal détaillé - AVEC FETCH DES VRAIES DONNÉES
  const handleBotClick = async (botId: string, botName: string) => {
    setSelectedBotId(botId);
    setSelectedBotName(botName);
    setLoadingTokens(true);

    try {
      // 🚀 APPEL DE TA ROUTE EXISTANTE !
     const response = await fetch(`${import.meta.env.VITE_API_ASSISTANT_URL}/admin/users/${user.id}/tokens?bot_id=${botId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  },
});

      if (response.ok) {
        const tokenData = await response.json();
        console.log('🎯 DONNÉES TOKENS REÇUES:', tokenData);
	setUserTokenData(tokenData.data?.tokens || []);
      } else {
        console.error('❌ Erreur récupération tokens:', response.status);
        // ✅ FALLBACK CORRIGÉ - UTILISE LES VRAIES DONNÉES DU BOT
        setUserTokenData(getRealTokenDataFallback(botId));
      }
    } catch (error) {
      console.error('❌ Erreur fetch tokens:', error);
      // ✅ FALLBACK CORRIGÉ - UTILISE LES VRAIES DONNÉES DU BOT
      setUserTokenData(getRealTokenDataFallback(botId));
    } finally {
      setLoadingTokens(false);
    }
  };

  // ✅ FALLBACK CORRIGÉ - PLUS DE RANDOM, UTILISE LES VRAIES DONNÉES
  const getRealTokenDataFallback = (botId: string) => {
    const botData = botsUsage.find(bot => bot.bot_id === botId);
    if (botData && botData.stats) {
      // ✅ UTILISE LA VRAIE DERNIÈRE ACTIVITÉ DE L'UTILISATEUR
      const realTimestamp = lastActivity || new Date().toISOString();
      
      console.log('✅ FALLBACK avec vraie date:', realTimestamp);
      
      return [{
        bot_id: botId,
        input_tokens: botData.stats.input_tokens || 0,
        output_tokens: botData.stats.output_tokens || 0,
        timestamp: realTimestamp // ✅ VRAIE DATE AU LIEU DE RANDOM
      }];
    }
    return [];
  };

  // 🎯 Handler pour fermer le modal détaillé
  const handleBotModalClose = () => {
    setSelectedBotId(null);
    setSelectedBotName('');
    setUserTokenData([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white max-w-6xl w-full max-h-[90vh] rounded-lg shadow-xl overflow-hidden">
        
        {/* Header Modal */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-sm opacity-90">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded p-2 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Contenu Modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2">Chargement des détails...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* ✅ Informations personnelles */}
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">📋 Informations personnelles</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-slate-600 dark:text-slate-300">{user.email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Poste:</span>
                    <p className="text-slate-600 dark:text-slate-300">{user.job_title || '-'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Entreprise:</span>
                    <p className="text-slate-600 dark:text-slate-300">
                      {user.company?.name || user.company || 'Non définie'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Rôle:</span>
                    <p className="text-slate-600 dark:text-slate-300">{user.role}</p>
                  </div>
                  <div>
                    <span className="font-medium">Créé le:</span>
                    <p className="text-slate-600 dark:text-slate-300">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Statut:</span>
                    <p className="font-medium text-green-500">✅ Actif</p>
                  </div>
                </div>
              </div>

              {/* 🔥 STATISTIQUES DIRECTES */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200">
                  📊 Statistiques d'utilisation
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  
                  {/* Tokens Totaux */}
                  <div className="bg-white dark:bg-slate-600 p-4 rounded-lg text-center shadow-sm">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatNumber(totalTokens)}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-300">Tokens totaux</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {formatNumber(inputTokens)} in + {formatNumber(outputTokens)} out
                    </div>
                  </div>
                  
                  {/* Requêtes */}
                  <div className="bg-white dark:bg-slate-600 p-4 rounded-lg text-center shadow-sm">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatNumber(totalRequests)}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-300">Requêtes</div>
                  </div>
                  
                  {/* Coût estimé */}
                  <div className="bg-white dark:bg-slate-600 p-4 rounded-lg text-center shadow-sm">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(estimatedCost, 'EUR')}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-300">Coût estimé</div>
                  </div>
                  
                  {/* Bots utilisés */}
                  <div className="bg-white dark:bg-slate-600 p-4 rounded-lg text-center shadow-sm">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {uniqueBots}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-300">
                      Bots utilisés
                    </div>
                  </div>
                </div>

                {/* ✅ DERNIÈRE ACTIVITÉ RÉELLE - PLUS DE CALCUL DYNAMIQUE */}
                {lastActivity && (
                  <div className="bg-white dark:bg-slate-600 p-3 rounded border-l-4 border-blue-500">
                    <span className="font-medium text-blue-600 dark:text-blue-400">📅 Dernière activité réelle:</span> {' '}
                    <span className="text-slate-700 dark:text-slate-200">
                      {new Date(lastActivity).toLocaleString('fr-FR')}
                    </span>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Donnée provenant directement de la base de données
                    </div>
                  </div>
                )}

                {/* ✅ INDICATION SI PAS DE DERNIÈRE ACTIVITÉ */}
                {!lastActivity && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border-l-4 border-yellow-500">
                    <span className="text-yellow-700 dark:text-yellow-300">
                      ⚠️ Aucune donnée d'activité disponible
                    </span>
                  </div>
                )}
              </div>

              {/* 🤖 TABLEAU DES BOTS UTILISÉS */}
              <UserBotStatsTable 
                botsUsage={botsUsage}
                onBotClick={handleBotClick}
              />

              {/* 🔍 MODAL DÉTAILLÉ D'UN BOT - DONNÉES DYNAMIQUES RÉELLES */}
            <UserBotDetailModal
  isOpen={selectedBotId !== null}
  botId={selectedBotId}
  botName={selectedBotName}
  userTokens={userTokenData}
  onClose={handleBotModalClose}
  onRefresh={refreshBotData}
/>

              {/* 🔄 Indicateur de chargement pour les tokens */}
              {loadingTokens && selectedBotId && (
                <div className="fixed inset-0 z-60 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-sm">Chargement des données du bot...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};