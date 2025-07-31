// UserBotStatsTable.tsx - Tableau des bots utilisés par un utilisateur
import React from 'react';

interface BotUsageData {
  bot_id: string;
  bot_name?: string;
  stats: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    requests_count: number;
    estimated_cost: number;
  };
}

interface UserBotStatsTableProps {
  botsUsage: BotUsageData[];
  onBotClick: (botId: string, botName: string) => void;
}

export const UserBotStatsTable: React.FC<UserBotStatsTableProps> = ({ botsUsage, onBotClick }) => {
  // 🎯 Helper pour formater les nombres
  const formatNumber = (num: number): string => {
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

  if (!botsUsage || botsUsage.length === 0) {
    return (
      <div className="bg-slate-100 dark:bg-slate-700 p-6 rounded-lg text-center">
        <p className="text-slate-500 dark:text-slate-400">Aucun bot utilisé</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200">
        🤖 Utilisation par Bot ({botsUsage.length})
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-300 dark:border-slate-600">
              <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">Bot</th>
              <th className="text-right p-3 font-medium text-slate-700 dark:text-slate-300">Input Tokens</th>
              <th className="text-right p-3 font-medium text-slate-700 dark:text-slate-300">Output Tokens</th>
              <th className="text-right p-3 font-medium text-slate-700 dark:text-slate-300">Total</th>
              <th className="text-right p-3 font-medium text-slate-700 dark:text-slate-300">Requêtes</th>
              <th className="text-right p-3 font-medium text-slate-700 dark:text-slate-300">Coût (€)</th>
              <th className="text-center p-3 font-medium text-slate-700 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {botsUsage.map((bot, index) => (
              <tr 
                key={`${bot.bot_id}-${index}`} 
                className="border-b border-slate-200 dark:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
              >
                {/* Nom du bot */}
               <td className="p-3">
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    <div>
      <button
        onClick={() => onBotClick(bot.bot_id, bot.bot_name || bot.bot_id)}
        className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
      >
        {bot.bot_name || bot.bot_id}
      </button>
      <div className="text-xs text-slate-500 dark:text-slate-400">
        ID: {bot.bot_id}
      </div>
    </div>
  </div>
</td>
                {/* Input Tokens */}
                <td className="text-right p-3">
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {formatNumber(bot.stats?.input_tokens || 0)}
                  </span>
                </td>

                {/* Output Tokens */}
                <td className="text-right p-3">
                  <span className="font-mono text-orange-600 dark:text-orange-400">
                    {formatNumber(bot.stats?.output_tokens || 0)}
                  </span>
                </td>

                {/* Total Tokens */}
                <td className="text-right p-3">
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatNumber(bot.stats?.total_tokens || 0)}
                  </span>
                </td>

                {/* Requêtes */}
                <td className="text-right p-3">
                  <span className="text-slate-700 dark:text-slate-300">
                    {bot.stats?.requests_count || 0}
                  </span>
                </td>

                {/* Coût */}
                <td className="text-right p-3">
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    {formatCurrency(bot.stats?.estimated_cost || 0)}
                  </span>
                </td>

                {/* Actions */}
                <td className="text-center p-3">
                  <button
                    onClick={() => onBotClick(bot.bot_id, bot.bot_name || bot.bot_id)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                    title="Voir les détails temporels"
                  >
                    🔍 Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Résumé sous le tableau */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-white dark:bg-slate-600 p-3 rounded text-center">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {formatNumber(botsUsage.reduce((sum, bot) => sum + (bot.stats?.input_tokens || 0), 0))}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Input</div>
        </div>

        <div className="bg-white dark:bg-slate-600 p-3 rounded text-center">
          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
            {formatNumber(botsUsage.reduce((sum, bot) => sum + (bot.stats?.output_tokens || 0), 0))}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Output</div>
        </div>

        <div className="bg-white dark:bg-slate-600 p-3 rounded text-center">
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {formatNumber(botsUsage.reduce((sum, bot) => sum + (bot.stats?.total_tokens || 0), 0))}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Tokens</div>
        </div>

        <div className="bg-white dark:bg-slate-600 p-3 rounded text-center">
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(botsUsage.reduce((sum, bot) => sum + (bot.stats?.estimated_cost || 0), 0))}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Coût Total</div>
        </div>
      </div>
    </div>
  );
};