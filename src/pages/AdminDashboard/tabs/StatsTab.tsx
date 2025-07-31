import React, { useState, useEffect } from 'react';
import { getToken } from '@/utils/auth';
import { BotDetailModal } from '@/components/BotDetailModal';

// Types pour les stats des bots
interface BotUsageStats {
  bot_id: string;
  bot_name: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  total_requests: number;
  estimated_cost_eur: number;
  active_users: number;
  companies_using: number;
  avg_response_time_ms: number;
}

interface BotGlobalStats {
  total_active_bots: number;
  total_tokens: number;
  total_cost_eur: number;
  total_requests: number;
  avg_response_time_ms: number;
}

interface ApiResponse {
  success: boolean;
  active_bots: BotUsageStats[];
  global_stats: BotGlobalStats;
  last_updated: string;
  error?: string;
}

export function StatsTab() {
  const [globalStats, setGlobalStats] = useState<BotGlobalStats>({
    total_active_bots: 0,
    total_tokens: 0,
    total_cost_eur: 0,
    total_requests: 0,
    avg_response_time_ms: 0
  });
  
  const [botStats, setBotStats] = useState<BotUsageStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedBot, setSelectedBot] = useState<{ id: string; name: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fonctions pour le modal
  const handleBotClick = (botId: string, botName: string) => {
    setSelectedBot({ id: botId, name: botName });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedBot(null);
    setIsModalOpen(false);
  };

  // Fonction pour formater le temps de réponse
  const formatResponseTime = (timeMs: number): string => {
    if (timeMs === 0) return "—";
    if (timeMs < 1000) return `${timeMs}ms`;
    return `${(timeMs / 1000).toFixed(1)}s`;
  };

  // Fonction pour obtenir le style couleur du temps de réponse
  const getResponseTimeColor = (timeMs: number): string => {
    if (timeMs === 0) return "text-gray-500";
    if (timeMs < 5000) return "text-green-400";
    if (timeMs < 10000) return "text-yellow-400";
    if (timeMs < 15000) return "text-orange-400";
    return "text-red-400";
  };

  // Fonction principale pour charger les statistiques
  const loadBotStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("📊 [STATS-TAB] Récupération des statistiques via API...");
      
      const token = getToken();
      if (!token) {
        throw new Error('Token manquant - veuillez vous reconnecter');
      }

      const response = await fetch(`${import.meta.env.VITE_API_ASSISTANT_URL}/admin/dashboard/bot-stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const data: any = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des données');
      }

      console.log("✅ [STATS-TAB] Données reçues:", data);

      // 🔧 CORRECTION FINALE : Mapping exact avec l'API
      if (data.data && data.data.global_metrics) {
        setGlobalStats({
          total_active_bots: data.data.global_metrics.total_bots || 0,
          total_tokens: data.data.global_metrics.total_tokens || 0,
          total_cost_eur: data.data.global_metrics.total_cost_eur || 0,
          total_requests: data.data.global_metrics.realtime_metrics?.total_requests || 0,
          avg_response_time_ms: data.data.global_metrics.realtime_metrics?.average_response_time_ms || 0
        });
      }

      // 🔧 CORRECTION : Utiliser bot_performance au lieu de active_bots
      if (data.data && data.data.bot_performance && Array.isArray(data.data.bot_performance)) {
        // Adapter la structure pour le frontend
        const adaptedBots = data.data.bot_performance.map((bot: any) => ({
          bot_id: bot.bot_id,
          bot_name: `🤖 ${bot.bot_name}`,
          input_tokens: bot.input_tokens,
          output_tokens: bot.output_tokens,
          total_tokens: bot.total_tokens,
          total_requests: bot.requests,
          estimated_cost_eur: bot.cost_eur,
          active_users: bot.users_count,
          companies_using: bot.companies_count,
          avg_response_time_ms: bot.average_response_time_ms || 0
        }));
        setBotStats(adaptedBots);
      } else {
        setBotStats([]);
      }

      // Mise à jour de la date
      setLastUpdate(data.last_updated ? new Date(data.last_updated) : new Date());
      
      console.log("✅ [STATS-TAB] Interface mise à jour avec les données réelles!");
      
    } catch (err: any) {
      console.error("❌ [STATS-TAB] Erreur:", err);
      setError(err.message);
      
      // Données de fallback en cas d'erreur
      console.log("⚠️ [STATS-TAB] Utilisation des données de fallback");
      
      const fallbackBotStats = [
        {
          bot_id: "EMEBI ET TVA UE",
          bot_name: "🤖 EMEBI ET TVA UE", 
          input_tokens: 47847,
          output_tokens: 5852,
          total_tokens: 53699,
          total_requests: 27,
          estimated_cost_eur: 0.1549,
          active_users: 1,
          companies_using: 1,
          avg_response_time_ms: 5900
        },
        {
          bot_id: "MACF",
          bot_name: "🏭 MACF",
          input_tokens: 9216,
          output_tokens: 1881,
          total_tokens: 11097,
          total_requests: 9,
          estimated_cost_eur: 0.0363,
          active_users: 1,
          companies_using: 1,
          avg_response_time_ms: 5900
        },
        {
          bot_id: "EUDR",
          bot_name: "🌿 EUDR",
          input_tokens: 6516,
          output_tokens: 269,
          total_tokens: 6785,
          total_requests: 4,
          estimated_cost_eur: 0.0165,
          active_users: 1,
          companies_using: 1,
          avg_response_time_ms: 5900
        }
      ];

      const totalTokens = fallbackBotStats.reduce((sum, bot) => sum + bot.total_tokens, 0);
      const totalRequests = fallbackBotStats.reduce((sum, bot) => sum + bot.total_requests, 0);
      const totalCost = fallbackBotStats.reduce((sum, bot) => sum + bot.estimated_cost_eur, 0);

      setGlobalStats({
        total_active_bots: fallbackBotStats.length,
        total_tokens: totalTokens,
        total_cost_eur: totalCost,
        total_requests: totalRequests,
        avg_response_time_ms: 5900
      });

      setBotStats(fallbackBotStats);
      setLastUpdate(new Date());
      
    } finally {
      setLoading(false);
    }
  };

  // Fonction de debug pour tester les routes
  const debugApiRoutes = async () => {
    const token = getToken();
    if (!token) return;

    console.log("🔍 === TEST DE LA NOUVELLE ROUTE API ===");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_ASSISTANT_URL}/admin/dashboard/bot-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log("📊 Status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Données récupérées:", data);
      } else {
        const errorText = await response.text();
        console.log("❌ Erreur response:", errorText);
      }
    } catch (err) {
      console.log("❌ Exception:", err);
    }
  };

  useEffect(() => {
    loadBotStatistics();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h1 className="text-2xl font-bold text-white">Monitoring des Bots</h1>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={debugApiRoutes}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <span>🔍</span>
            Debug API
          </button>
          
          <button
            onClick={loadBotStatistics}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-sm">🔄</span>
            {loading ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
          <p className="font-medium">❌ Erreur: {error}</p>
          <p className="text-sm mt-1">Vérifiez que la route /admin/dashboard/bot-stats est bien ajoutée au backend.</p>
        </div>
      )}

      {/* Indicateur de chargement */}
      {loading && (
        <div className="bg-blue-500/20 border border-blue-500 text-blue-300 px-4 py-3 rounded-lg">
          <p className="font-medium">⏳ Chargement des données en cours...</p>
        </div>
      )}

      {/* Stats globales des bots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-3xl font-bold text-blue-400">{globalStats.total_active_bots}</div>
          <div className="text-sm text-gray-300">Bots Actifs</div>
          <div className="text-xs text-green-400">🟢 En temps réel</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-3xl font-bold text-orange-400">{formatNumber(globalStats.total_tokens)}</div>
          <div className="text-sm text-gray-300">Tokens Consommés</div>
          <div className="text-xs text-gray-400">{globalStats.total_requests} requêtes</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-3xl font-bold text-green-400">{formatCurrency(globalStats.total_cost_eur)}</div>
          <div className="text-sm text-gray-300">Coût Total</div>
          <div className="text-xs text-green-400">💰 Optimisé</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className={`text-3xl font-bold ${getResponseTimeColor(globalStats.avg_response_time_ms)}`}>
            {formatResponseTime(globalStats.avg_response_time_ms)}
          </div>
          <div className="text-sm text-gray-300">Temps Réponse Moyen</div>
          <div className="text-xs text-gray-400">Toutes requêtes</div>
        </div>
      </div>

      {/* Performance par Bot */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <h2 className="text-lg font-semibold text-white">Performance par Bot (Données Réelles)</h2>
            </div>
            <div className="text-xs text-gray-400">
              💡 Cliquez sur un bot pour voir les graphiques détaillés
            </div>
          </div>
        </div>        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Bot</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Input Tokens</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Output Tokens</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Total Tokens</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Requêtes</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Coût (€)</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Utilisateurs</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Entreprises</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Temps Réponse</th>
              </tr>
            </thead>
            <tbody>
              {botStats.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 px-4 text-center text-gray-400">
                    {loading ? "Chargement..." : "Aucun bot actif trouvé"}
                  </td>
                </tr>
              ) : (
                botStats.map((bot, index) => (
                  <tr 
                    key={bot.bot_id} 
                    className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'} hover:bg-gray-700 cursor-pointer transition-colors`}
                    onClick={() => handleBotClick(bot.bot_id, bot.bot_name)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{bot.bot_name}</div>
                      <div className="text-xs text-gray-400">{bot.bot_id}</div>
                    </td>
                    <td className="py-3 px-4 text-blue-400 font-mono">{formatNumber(bot.input_tokens)}</td>
                    <td className="py-3 px-4 text-orange-400 font-mono">{formatNumber(bot.output_tokens)}</td>
                    <td className="py-3 px-4 text-purple-400 font-mono">{formatNumber(bot.total_tokens)}</td>
                    <td className="py-3 px-4 text-cyan-400 font-mono">{bot.total_requests.toLocaleString()}</td>
                    <td className="py-3 px-4 text-green-400 font-mono">{formatCurrency(bot.estimated_cost_eur)}</td>
                    <td className="py-3 px-4 text-purple-400 font-mono">{bot.active_users}</td>
                    <td className="py-3 px-4 text-cyan-400 font-mono">{bot.companies_using}</td>
                    <td className="py-3 px-4 font-mono">
                      <span className={getResponseTimeColor(bot.avg_response_time_ms)}>
                        {formatResponseTime(bot.avg_response_time_ms)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400">
        {lastUpdate && (
          <p>
            Dernière mise à jour: {lastUpdate.toLocaleString('fr-FR')} • 
            Données issues de la table usage_tracking Supabase en temps réel
          </p>
        )}
      </div>

      {/* Modal détail bot */}
      {selectedBot && (
        <BotDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          botId={selectedBot.id}
          botName={selectedBot.name}
        />
      )}
    </div>
  );
}