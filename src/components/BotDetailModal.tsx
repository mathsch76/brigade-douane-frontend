import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getToken } from '@/utils/auth';

interface BotHistoryData {
  date: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  requests: number;
  cost_eur: number;
}

interface BotHistorySummary {
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  total_requests: number;
  estimated_cost_eur: number;
}

interface BotDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  botId: string;
  botName: string;
}

type PeriodType = '1d' | '1w' | '1m' | '1y';

const PERIODS: Array<{ key: PeriodType; label: string; color: string }> = [
  { key: '1d', label: '1 Jour', color: 'bg-blue-600' },
  { key: '1w', label: '1 Semaine', color: 'bg-green-600' },
  { key: '1m', label: '1 Mois', color: 'bg-orange-600' },
  { key: '1y', label: '1 An', color: 'bg-purple-600' }
];

export function BotDetailModal({ isOpen, onClose, botId, botName }: BotDetailModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('1w');
  const [historyData, setHistoryData] = useState<BotHistoryData[]>([]);
  const [summary, setSummary] = useState<BotHistorySummary>({
    total_input_tokens: 0,
    total_output_tokens: 0,
    total_tokens: 0,
    total_requests: 0,
    estimated_cost_eur: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les données historiques
  const loadBotHistory = async (period: PeriodType) => {
    if (!isOpen) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      if (!token) throw new Error('Token manquant');

      const response = await fetch(
        `${import.meta.env.VITE_API_ASSISTANT_URL}/admin/dashboard/bot-history/${botId}?period=${period}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement');
      }

      setHistoryData(result.data.aggregated_data || []);
      setSummary(result.data.summary || {
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_tokens: 0,
        total_requests: 0,
        estimated_cost_eur: 0
      });

      console.log(`✅ Historique bot ${botId} chargé:`, result.data.total_records, 'points');

    } catch (err: any) {
      console.error('❌ Erreur chargement historique bot:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données quand le modal s'ouvre ou que la période change
  useEffect(() => {
    loadBotHistory(selectedPeriod);
  }, [isOpen, botId, selectedPeriod]);

  // Formatage des nombres
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

  // Tooltip personnalisé pour les graphiques
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatNumber(entry.value)}
              {entry.dataKey.includes('cost') && ' €'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h2 className="text-xl font-bold text-white">{botName}</h2>
              <p className="text-sm text-gray-400">Analyse détaillée • {botId}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Sélecteur de période */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex gap-2">
            {PERIODS.map(period => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period.key
                    ? `${period.color} text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
          
          {/* Messages d'état */}
          {loading && (
            <div className="p-6 text-center">
              <div className="text-blue-400">🔄 Chargement des données...</div>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                ❌ Erreur: {error}
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Stats résumé */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📈 Résumé de la période</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-2xl font-bold text-blue-400">{formatNumber(summary.total_input_tokens)}</div>
                    <div className="text-sm text-gray-300">Input Tokens</div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-2xl font-bold text-orange-400">{formatNumber(summary.total_output_tokens)}</div>
                    <div className="text-sm text-gray-300">Output Tokens</div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-2xl font-bold text-purple-400">{formatNumber(summary.total_tokens)}</div>
                    <div className="text-sm text-gray-300">Total Tokens</div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-2xl font-bold text-cyan-400">{summary.total_requests}</div>
                    <div className="text-sm text-gray-300">Requêtes</div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-2xl font-bold text-green-400">{formatCurrency(summary.estimated_cost_eur)}</div>
                    <div className="text-sm text-gray-300">Coût Total</div>
                  </div>
                </div>
              </div>

              {/* Graphiques */}
              {historyData.length > 0 ? (
                <div className="p-6 space-y-8">
                  
                  {/* Graphique Tokens */}
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h4 className="text-lg font-semibold text-white mb-4">🎯 Consommation de Tokens</h4>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#9CA3AF"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickFormatter={formatNumber}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="input_tokens" 
                            stackId="1"
                            stroke="#3B82F6" 
                            fill="#3B82F6" 
                            fillOpacity={0.6}
                            name="Input Tokens"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="output_tokens" 
                            stackId="1"
                            stroke="#F97316" 
                            fill="#F97316" 
                            fillOpacity={0.6}
                            name="Output Tokens"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Graphique Coûts */}
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h4 className="text-lg font-semibold text-white mb-4">💰 Évolution des Coûts</h4>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#9CA3AF"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickFormatter={(value) => formatCurrency(value)}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="cost_eur" 
                            stroke="#10B981" 
                            strokeWidth={2}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                            name="Coût (€)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Graphique Requêtes */}
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h4 className="text-lg font-semibold text-white mb-4">📊 Nombre de Requêtes</h4>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#9CA3AF"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="#9CA3AF"
                            fontSize={12}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="requests" 
                            stroke="#8B5CF6" 
                            strokeWidth={2}
                            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                            name="Requêtes"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              ) : !loading && (
                <div className="p-6 text-center text-gray-400">
                  📭 Aucune donnée disponible pour cette période
                </div>
              )}

            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Données en temps réel depuis openai_token_usage</span>
            <button
              onClick={() => loadBotHistory(selectedPeriod)}
              disabled={loading}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
            >
              🔄 Actualiser
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}