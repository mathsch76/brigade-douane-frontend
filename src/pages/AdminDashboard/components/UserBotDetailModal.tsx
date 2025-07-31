// UserBotDetailModal.tsx - CORRIGÉ - Dates cohérentes et informatives
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

interface UserBotDetailModalProps {
  isOpen: boolean;
  botId: string | null;
  botName: string;
  userTokens: Array<{
    bot_id: string;
    input_tokens: number;
    output_tokens: number;
    timestamp: string;
  }>;
  onClose: () => void;
  onRefresh?: () => Promise<void>; // 🔄 NOUVEAU
}

type TimePeriod = '1d' | '7d' | '30d' | 'all';

export const UserBotDetailModal: React.FC<UserBotDetailModalProps> = ({
  isOpen,
  botId,
  botName,
  userTokens,
  onClose,
  onRefresh // 🔄 NOUVEAU
}) => {

  // 🎯 État pour la période sélectionnée - Défaut "all" pour données limitées
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);


  // 🎯 Filtrer les données par période avec logique adaptative
  const filteredData = useMemo(() => {
    console.log('🔍 Données reçues:', { botId, userTokens, selectedPeriod });
    
    if (!botId || !userTokens) return [];
    
    const baseData = userTokens.filter(token => token.bot_id === botId);
    console.log('🔍 Données du bot:', baseData);
    
    if (baseData.length === 0) return [];
    
    // 🚨 LOGIQUE CORRECTIVE : Si période "all" ou données limitées, pas de filtrage
    if (selectedPeriod === 'all' || baseData.length <= 2) {
      console.log('🎯 Mode adaptatif: toutes les données incluses');
      return baseData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    
    // Filtrage temporel uniquement pour données nombreuses
    const now = new Date();
    const periodHours = {
      '1d': 24,
      '7d': 24 * 7,
      '30d': 24 * 30,
      'all': Infinity
    };
    
    const cutoffTime = new Date(now.getTime() - periodHours[selectedPeriod] * 60 * 60 * 1000);
    console.log('🔍 Filtrage temporel:', { 
      cutoffTime: cutoffTime.toISOString(), 
      selectedPeriod,
      now: now.toISOString()
    });
    
    const filtered = baseData.filter(token => {
      const tokenDate = new Date(token.timestamp);
      const isInRange = tokenDate >= cutoffTime;
      console.log(`🔍 Token ${token.timestamp} in range: ${isInRange}`);
      return isInRange;
    });
    
    // 🚨 FALLBACK : Si filtrage temporel donne 0 résultat, retourner toutes les données
    if (filtered.length === 0) {
      console.log('⚠️ Aucune donnée après filtrage - retour à toutes les données');
      return baseData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    
    console.log('🔍 Données après filtrage temporel:', filtered);
    
    return filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [botId, userTokens, selectedPeriod]);

  // ✅ ANALYSE INTELLIGENTE DE LA PÉRIODE RÉELLE
  const periodAnalysis = useMemo(() => {
    if (!filteredData.length) {
      return {
        type: 'empty',
        message: 'Aucune donnée disponible',
        dateRange: null,
        count: 0
      };
    }

    const timestamps = filteredData.map(d => new Date(d.timestamp));
    const oldestDate = new Date(Math.min(...timestamps.map(d => d.getTime())));
    const newestDate = new Date(Math.max(...timestamps.map(d => d.getTime())));
    const count = filteredData.length;

    // Cas 1: Une seule donnée
    if (count === 1) {
      return {
        type: 'single',
        message: `Donnée du ${oldestDate.toLocaleDateString('fr-FR')}`,
        dateRange: {
          start: oldestDate.toLocaleDateString('fr-FR'),
          end: oldestDate.toLocaleDateString('fr-FR')
        },
        count: 1
      };
    }

    // Cas 2: Données multiples - même jour
    if (oldestDate.toDateString() === newestDate.toDateString()) {
      return {
        type: 'same-day',
        message: `${count} requêtes le ${oldestDate.toLocaleDateString('fr-FR')}`,
        dateRange: {
          start: oldestDate.toLocaleDateString('fr-FR'),
          end: newestDate.toLocaleDateString('fr-FR')
        },
        count
      };
    }

    // Cas 3: Données sur plusieurs jours
    const daysDiff = Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      type: 'multi-day',
      message: `${count} requêtes sur ${daysDiff} jour${daysDiff > 1 ? 's' : ''}`,
      dateRange: {
        start: oldestDate.toLocaleDateString('fr-FR'),
        end: newestDate.toLocaleDateString('fr-FR')
      },
      count
    };
  }, [filteredData]);

  // 🎯 Calculer les statistiques totales
  const totalStats = useMemo(() => {
    if (!filteredData.length) return null;

    const totalInput = filteredData.reduce((sum, d) => sum + d.input_tokens, 0);
    const totalOutput = filteredData.reduce((sum, d) => sum + d.output_tokens, 0);
    const totalTokens = totalInput + totalOutput;
    const totalRequests = filteredData.length;

    // Calcul GPT-4.1 : Input $2/1M, Output $8/1M, taux EUR/USD 0.92
    const inputCostUSD = (totalInput / 1_000_000) * 2.00;
    const outputCostUSD = (totalOutput / 1_000_000) * 8.00;
    const totalCostEUR = (inputCostUSD + outputCostUSD) / 0.92;

    return {
      totalInput,
      totalOutput,
      totalTokens,
      totalRequests,
      totalCostEUR: Math.round(totalCostEUR * 10000) / 10000,
      inputCostEUR: Math.round((inputCostUSD / 0.92) * 10000) / 10000,
      outputCostEUR: Math.round((outputCostUSD / 0.92) * 10000) / 10000
    };
  }, [filteredData]);

  // 🎯 Préparer les données pour le graphique temporel adaptatif
  const chartData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const now = new Date();
    let startDate: Date;
    let endDate = now;
    
    // 🎯 PÉRIODE ADAPTATIVE selon la sélection
    if (selectedPeriod === '1d') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (selectedPeriod === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (selectedPeriod === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      // Pour "all" : calculer plage des données réelles
      const timestamps = filteredData.map(d => new Date(d.timestamp).getTime());
      startDate = new Date(Math.min(...timestamps) - 3 * 24 * 60 * 60 * 1000); // 3 jours avant
      endDate = new Date(Math.max(...timestamps) + 3 * 24 * 60 * 60 * 1000); // 3 jours après
    }
    
    // Grouper les données réelles par jour
    const dataByDay = filteredData.reduce((acc, item) => {
      const date = new Date(item.timestamp).toLocaleDateString('fr-FR');
      if (!acc[date]) {
        acc[date] = { date, input_tokens: 0, output_tokens: 0, requests: 0 };
      }
      acc[date].input_tokens += item.input_tokens;
      acc[date].output_tokens += item.output_tokens;
      acc[date].requests += 1;
      return acc;
    }, {} as Record<string, any>);
    
    // Créer la série temporelle complète
    const timeSeriesData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toLocaleDateString('fr-FR');
      const existingData = dataByDay[dateStr];
      
      timeSeriesData.push({
        date: dateStr,
        input_tokens: existingData?.input_tokens || 0,
        output_tokens: existingData?.output_tokens || 0,
        requests: existingData?.requests || 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return timeSeriesData;
  }, [filteredData, selectedPeriod]);

  // 🎯 Calculer Chat Completions vs Prompt Tokens
  const completionStats = useMemo(() => {
    if (!totalStats) return null;
    
    return {
      completions: {
        requests: totalStats.totalRequests,
        tokens: totalStats.totalOutput,
        cost: totalStats.outputCostEUR
      },
      prompts: {
        requests: totalStats.totalRequests,
        tokens: totalStats.totalInput,
        cost: totalStats.inputCostEUR
      }
    };
  }, [totalStats]);

  // 🎯 Helper pour formater les nombres
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString('fr-FR');
  };

  // 🎯 Helper pour formater les prix
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

// 🔄 Fonction pour actualiser les données - VERSION FINALE
const handleRefresh = async () => {
  setIsRefreshing(true);
  try {
    console.log('🔄 Actualisation des données du bot...');
    console.error('🔥 BOUTON ACTUALISER CLIQUÉ !');
    
    // Si onRefresh est fourni (depuis le parent), l'utiliser
    if (onRefresh) {
      await onRefresh();
      console.log('✅ Données actualisées via le parent');
    } else {
      console.log('⚠️ Aucune fonction d\'actualisation fournie');
      // Simuler un délai pour feedback utilisateur
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('❌ Erreur lors du rafraîchissement:', error);
  } finally {
    setIsRefreshing(false);
  }
};

  if (!isOpen || !botId) return null;

// 🎯 FONCTION MESSAGES INTELLIGENTS - À insérer après "if (!isOpen || !botId) return null;"
  const generateSmartMessage = (data: typeof filteredData) => {
    const dataCount = data.length;
    
    // Pas de données
    if (dataCount === 0) {
      return {
        icon: "📭",
        message: "Aucune donnée disponible",
        level: 'info' as const
      };
    }

    // Analyse des dates
    const dates = data.map(d => new Date(d.timestamp).toDateString());
    const uniqueDates = [...new Set(dates)];
    const totalRequests = dataCount;
    
    // 🎯 CAS 1: Une seule requête
    if (totalRequests === 1) {
      const date = new Date(data[0].timestamp).toLocaleDateString('fr-FR');
      return {
        icon: "🎯",
        message: `1 requête le ${date}`,
        level: 'info' as const
      };
    }
    
    // 📅 CAS 2: Plusieurs requêtes, même jour
    if (uniqueDates.length === 1) {
      const date = new Date(data[0].timestamp).toLocaleDateString('fr-FR');
      return {
        icon: "📅",
        message: `${totalRequests} requêtes le ${date}`,
        level: 'success' as const
      };
    }
    
    // 📊 CAS 3: Données sur plusieurs jours (2-7 jours)
    if (uniqueDates.length <= 7) {
      const firstDate = new Date(Math.min(...data.map(d => new Date(d.timestamp).getTime())));
      const lastDate = new Date(Math.max(...data.map(d => new Date(d.timestamp).getTime())));
      
      return {
        icon: "📊",
        message: `${totalRequests} requêtes sur ${uniqueDates.length} jours (${firstDate.toLocaleDateString('fr-FR')} - ${lastDate.toLocaleDateString('fr-FR')})`,
        level: 'success' as const
      };
    }
    
    // 🚀 CAS 4: Bot très actif (plus de 7 jours)
    if (uniqueDates.length > 7) {
      // Trouver le jour avec le plus de requêtes
      const requestsByDay = data.reduce((acc, item) => {
        const day = new Date(item.timestamp).toLocaleDateString('fr-FR');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const peakDay = Object.entries(requestsByDay)
        .sort(([,a], [,b]) => b - a)[0];
      
      return {
        icon: "🚀",
        message: `${totalRequests} requêtes sur ${uniqueDates.length} jours (pic: ${peakDay[1]} requêtes le ${peakDay[0]})`,
        level: 'warning' as const
      };
    }
    
    // 📈 CAS 5: Données massives (plus de 1000 requêtes)
    if (totalRequests > 1000) {
      const avgPerDay = Math.round(totalRequests / uniqueDates.length);
      return {
        icon: "📈",
        message: `${totalRequests.toLocaleString()} requêtes (moyenne: ${avgPerDay}/jour)`,
        level: 'warning' as const
      };
    }
    
    // Fallback par défaut
    return {
      icon: "💡",
      message: `${totalRequests} requêtes disponibles`,
      level: 'info' as const
    };
  };

  // Générer le message intelligent
  const smartMessage = generateSmartMessage(filteredData);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white max-w-7xl w-full max-h-[95vh] rounded-lg shadow-xl overflow-hidden">
        
{/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              🤖
            </div>
            <div>
              <h2 className="text-xl font-semibold">{botName}</h2>
              <p className="text-sm opacity-90">Analyse détaillée • {botId}</p>
            </div>
          </div>
          
          {/* NOUVEAUX BOUTONS */}
          <div className="flex items-center gap-2">
            {/* Bouton Actualiser */}
           <button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handleRefresh();
  }}
  disabled={isRefreshing}
  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 
             text-white px-3 py-2 rounded-lg transition-colors
             disabled:cursor-not-allowed disabled:opacity-50"
  title="Actualiser les données"
>
              <div className={`transition-transform ${isRefreshing ? 'animate-spin' : ''}`}>
                🔄
              </div>
              <span className="text-sm font-medium">
                {isRefreshing ? 'Actualisation...' : 'Actualiser'}
              </span>
            </button>
            
            {/* Bouton Fermer */}
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded p-2 transition-colors"
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenu Modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
          {!totalStats ? (
            <div className="text-center py-8">
              <div className="text-slate-500 dark:text-slate-400">
                Aucune donnée disponible pour ce bot
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* 💰 SECTION TOTAL SPEND - Style OpenAI */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm text-slate-500 dark:text-slate-400 mb-2">Total Spend</h3>
                  <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    {formatCurrency(totalStats.totalCostEUR)}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {formatNumber(totalStats.totalInput)} in + {formatNumber(totalStats.totalOutput)} out
                  </div>
                  
                  {/* ✅ MESSAGES INFORMATIFS COHÉRENTS */}
                  <div className="mt-3 space-y-1">
                    {/* Message principal basé sur l'analyse */}
                    <div className={`
  flex items-center gap-2 p-3 rounded-lg
  ${smartMessage.level === 'info' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : ''}
  ${smartMessage.level === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : ''}
  ${smartMessage.level === 'warning' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' : ''}
`}>
  <span className="text-xl">{smartMessage.icon}</span>
  <span className="font-medium">{smartMessage.message}</span>
</div>                    
                    {/* Détail de la période si multi-day */}
                    {periodAnalysis.type === 'multi-day' && periodAnalysis.dateRange && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Du {periodAnalysis.dateRange.start} au {periodAnalysis.dateRange.end}
                      </div>
                    )}
                    
                    {/* Indication du filtre actif */}
                    {selectedPeriod !== 'all' && (
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        🔍 Filtre actif: {
                          selectedPeriod === '1d' ? 'Dernières 24h' :
                          selectedPeriod === '7d' ? 'Derniers 7 jours' :
                          'Derniers 30 jours'
                        }
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 🎯 Sélecteur de période adaptatif */}
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  {(['1d', '7d', '30d', 'all'] as TimePeriod[]).map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        selectedPeriod === period
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {period === 'all' ? 'tout' : period}
                    </button>
                  ))}
                </div>
              </div>

              {/* 📈 GRAPHIQUE PRINCIPAL - Style OpenAI */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      className="text-xs"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      className="text-xs"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="input_tokens"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Tokens Input"
                    />
                    <Area
                      type="monotone"
                      dataKey="output_tokens"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                      name="Tokens Output"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* 🔄 SECTIONS TOKEN COMPLETIONS & TOKENS PROMPT */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Token Completions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Token Completions</h4>
                    <span className="text-sm text-slate-500">→</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {completionStats?.completions.requests}
                      </div>
                      <div className="text-xs text-slate-500">requêtes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatNumber(completionStats?.completions.tokens || 0)}
                      </div>
                      <div className="text-xs text-slate-500">tokens output</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(completionStats?.completions.cost || 0)}
                      </div>
                      <div className="text-xs text-slate-500">coût</div>
                    </div>
                  </div>

                  {/* Graphique temporel completions */}
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="output_tokens" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                          activeDot={{ r: 5, fill: '#f59e0b' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tokens Prompt */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Tokens Prompt</h4>
                    <span className="text-sm text-slate-500">→</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {completionStats?.prompts.requests}
                      </div>
                      <div className="text-xs text-slate-500">requêtes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(completionStats?.prompts.tokens || 0)}
                      </div>
                      <div className="text-xs text-slate-500">tokens input</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(completionStats?.prompts.cost || 0)}
                      </div>
                      <div className="text-xs text-slate-500">coût</div>
                    </div>
                  </div>

                  {/* Graphique temporel prompts */}
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="input_tokens" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                          activeDot={{ r: 5, fill: '#3b82f6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* 📝 Informations détaillées */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-slate-800 dark:text-slate-200">
                  📝 Informations détaillées
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Bot ID:</span>
                    <p className="text-slate-600 dark:text-slate-400 font-mono">{botId}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Nom du bot:</span>
                    <p className="text-slate-600 dark:text-slate-400">{botName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Période analysée:</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedPeriod === '1d' ? 'Dernières 24h' : 
                       selectedPeriod === '7d' ? 'Derniers 7 jours' : 
                       selectedPeriod === '30d' ? 'Derniers 30 jours' :
                       'Toutes les données'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Total requêtes:</span>
                    <p className="text-slate-600 dark:text-slate-400">{totalStats.totalRequests}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Données disponibles:</span>
                    <p className="text-slate-600 dark:text-slate-400">{filteredData.length} entrée(s)</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Période réelle:</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      {periodAnalysis.dateRange ? 
                        `${periodAnalysis.dateRange.start} → ${periodAnalysis.dateRange.end}` : 
                        'Aucune donnée'
                      }
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
