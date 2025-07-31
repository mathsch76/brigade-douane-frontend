import React, { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

// 🔑 FONCTION GET TOKEN (remplace par ton import existant)
import { getToken } from '@/utils/auth';

interface BotMetrics {
  total_queries: number;
  avg_response_time_ms: number;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_eur: number;
  queries_per_hour: number;
  last_activity: string | null;
}

export const MetricsSection: React.FC<{ selectedBot: string }> = ({ selectedBot }) => {
  const [metrics, setMetrics] = useState<BotMetrics>({} as BotMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('24h');

  // 📊 CHARGER MÉTRIQUES
  const loadMetrics = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error('Token manquant');

      // 🔗 URL API (remplace par ton URL ou utilise une variable d'environnement)
  const API_URL = import.meta.env.VITE_API_ASSISTANT_URL;
      
      const response = await fetch(
        `${API_URL}/admin/metrics/realtime/${encodeURIComponent(selectedBot)}?timeframe=${timeframe}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      
      const data = await response.json();
      setMetrics(data.data || {});
      setError(null);
      
    } catch (err: any) {
      console.error('❌ Erreur métriques:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 ACTUALISATION
  useEffect(() => {
    if (selectedBot) {
      loadMetrics();
     const interval = setInterval(loadMetrics, 300000); // ← 5 minutes = OPTIMAL
      return () => clearInterval(interval);
    }
  }, [selectedBot, timeframe]);

  // 🎨 FORMATAGE
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 4
    }).format(amount);
  };

  // 🚨 ALERTES
  const getResponseTimeColor = (ms: number) => {
    if (ms < 1000) return 'text-green-400';
    if (ms < 2000) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-2 text-blue-400">
          <Activity className="h-5 w-5 animate-spin" />
          <span>Chargement des métriques...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-300">
          <AlertTriangle className="h-5 w-5" />
          <span>Erreur: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🎛️ CONTRÔLES */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-400" />
          Métriques Temps Réel - {selectedBot}
        </h3>
        
        <div className="flex items-center gap-2">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 text-sm"
          >
            <option value="1h">1 Heure</option>
            <option value="24h">24 Heures</option>
            <option value="7d">7 Jours</option>
          </select>
          
          <button
            onClick={loadMetrics}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            🔄
          </button>
        </div>
      </div>

      {/* 📊 MÉTRIQUES PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* ⚡ TEMPS RÉPONSE */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Clock className={`h-6 w-6 ${getResponseTimeColor(metrics.avg_response_time_ms || 0)}`} />
            <div>
              <div className={`text-xl font-bold ${getResponseTimeColor(metrics.avg_response_time_ms || 0)}`}>
                {metrics.avg_response_time_ms || 0}ms
              </div>
              <div className="text-sm text-gray-300">Temps Réponse</div>
              <div className="text-xs text-gray-400">
                {metrics.avg_response_time_ms < 1000 ? '🟢 Excellent' :
                 metrics.avg_response_time_ms < 2000 ? '🟡 Bon' : '🔴 Lent'}
              </div>
            </div>
          </div>
        </div>

        {/* 📊 TOKENS */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-purple-400" />
            <div>
              <div className="text-xl font-bold text-purple-400">
                {formatNumber(metrics.total_tokens || 0)}
              </div>
              <div className="text-sm text-gray-300">Total Tokens</div>
              <div className="text-xs text-gray-400">
                In: {formatNumber(metrics.input_tokens || 0)} | Out: {formatNumber(metrics.output_tokens || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* 💰 COÛT */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <div>
              <div className="text-xl font-bold text-green-400">
                {formatCurrency(metrics.estimated_cost_eur || 0)}
              </div>
              <div className="text-sm text-gray-300">Coût Estimé</div>
              <div className="text-xs text-gray-400">
                {metrics.total_queries || 0} requêtes
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 ACTIVITÉ */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-orange-400" />
            <div>
              <div className="text-xl font-bold text-orange-400">
                {(metrics.queries_per_hour || 0).toFixed(1)}/h
              </div>
              <div className="text-sm text-gray-300">Requêtes/Heure</div>
              <div className="text-xs text-gray-400">
                {metrics.last_activity ? 
                  `Dernière: ${new Date(metrics.last_activity).toLocaleTimeString()}` : 
                  'Aucune activité'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📈 DÉTAILS */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h4 className="text-md font-semibold text-white mb-4">Détails Performance</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 📊 UTILISATION */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-300">Consommation</h5>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Input Tokens</span>
              <span className="text-blue-400 font-mono">{formatNumber(metrics.input_tokens || 0)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Output Tokens</span>
              <span className="text-orange-400 font-mono">{formatNumber(metrics.output_tokens || 0)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Coût Total</span>
              <span className="text-green-400 font-mono">{formatCurrency(metrics.estimated_cost_eur || 0)}</span>
            </div>
          </div>

          {/* ⚡ PERFORMANCE */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-300">Performance</h5>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Temps Réponse Moyen</span>
              <span className={`font-mono ${getResponseTimeColor(metrics.avg_response_time_ms || 0)}`}>
                {metrics.avg_response_time_ms || 0}ms
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Requêtes</span>
              <span className="text-cyan-400 font-mono">{metrics.total_queries || 0}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Requêtes/Heure</span>
              <span className="text-orange-400 font-mono">{(metrics.queries_per_hour || 0).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📅 DERNIÈRE MISE À JOUR */}
      <div className="text-center text-xs text-gray-400">
        Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')} • 
        Actualisation automatique toutes les 30s
      </div>
    </div>
  );
};