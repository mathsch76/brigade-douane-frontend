// TokensChart.tsx - Graphique tokens Input/Output par bot
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TokensChartProps {
  botsUsage: Array<{
    bot_id: string;
    bot_name?: string;
    stats: {
      input_tokens: number;
      output_tokens: number;
      total_tokens: number;
      requests_count: number;
      estimated_cost: number;
    };
  }>;
}

export const TokensChart: React.FC<TokensChartProps> = ({ botsUsage }) => {
  // 🎯 Transformer les données pour Recharts
  const chartData = botsUsage.map(bot => ({
    bot_name: bot.bot_name || bot.bot_id,
    input_tokens: bot.stats.input_tokens || 0,
    output_tokens: bot.stats.output_tokens || 0,
    total_tokens: bot.stats.total_tokens || 0,
    requests: bot.stats.requests_count || 0
  }));

  // 🎨 Couleurs cohérentes avec votre interface
  const colors = {
    input: '#3b82f6',   // Bleu
    output: '#f97316',  // Orange
    background: '#1e293b', // Slate-800
    text: '#f1f5f9'     // Slate-100
  };

  // 🔧 Formateur de tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload[0].payload.total_tokens;
      const requests = payload[0].payload.requests;
      
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-blue-300">Input: {payload[0].value.toLocaleString('fr-FR')} tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-orange-300">Output: {payload[1].value.toLocaleString('fr-FR')} tokens</span>
            </div>
            <div className="border-t border-slate-600 pt-1 mt-2">
              <p className="text-slate-300">Total: {total.toLocaleString('fr-FR')} tokens</p>
              <p className="text-slate-300">{requests} requête{requests > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // 🔧 Formateur des valeurs sur les axes
  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  if (!botsUsage || botsUsage.length === 0) {
    return (
      <div className="bg-slate-100 dark:bg-slate-700 p-6 rounded-lg text-center">
        <p className="text-slate-500 dark:text-slate-400">Aucune donnée de tokens disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200">
        📊 Répartition des tokens par bot
      </h3>
      
      {/* Graphique */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#475569" 
              opacity={0.3}
            />
            <XAxis 
              dataKey="bot_name" 
              stroke="#64748b"
              fontSize={12}
              tick={{ fill: '#64748b' }}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tick={{ fill: '#64748b' }}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#64748b' }}
              iconType="rect"
            />
            <Bar 
              dataKey="input_tokens" 
              fill={colors.input}
              name="Tokens Input"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="output_tokens" 
              fill={colors.output}
              name="Tokens Output"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Résumé sous le graphique */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {chartData.map((bot, index) => (
          <div key={index} className="bg-white dark:bg-slate-600 p-3 rounded text-center">
            <div className="font-semibold text-slate-900 dark:text-white mb-1">
              {bot.bot_name}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-blue-600">Input:</span>
                <span>{bot.input_tokens.toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">Output:</span>
                <span>{bot.output_tokens.toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-1">
                <span>Total:</span>
                <span>{bot.total_tokens.toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Coût:</span>
                <span>{((bot.input_tokens * 2 + bot.output_tokens * 8) / 1000000 / 0.92).toFixed(4)}€</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};