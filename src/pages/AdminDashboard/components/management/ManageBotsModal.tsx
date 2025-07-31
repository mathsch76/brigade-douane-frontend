// src/pages/AdminDashboard/components/management/ManageBotsModal.tsx
import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { ManagementUser, AvailableBot } from '../../hooks/useManagement';

interface ManageBotsModalProps {
  show: boolean;
  user: ManagementUser | null;
  availableBots: AvailableBot[];
  loading: boolean;
  onClose: () => void;
  onAssignBot: (userId: string, botId: string) => Promise<void>;
  onRevokeBot: (userId: string, botId: string) => Promise<void>;
}

export const ManageBotsModal: React.FC<ManageBotsModalProps> = ({
  show,
  user,
  availableBots,
  loading,
  onClose,
  onAssignBot,
  onRevokeBot,
}) => {

  if (!show || !user) return null;

  // Séparer les bots assignés et non assignés
  const assignedBotIds = user.assigned_bots?.map(bot => bot.bot_id) || [];
  const unassignedBots = availableBots.filter(bot => 
    !assignedBotIds.includes(bot.bot_id)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Gestion des bots - {user.first_name} {user.last_name}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Bots Assignés */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">
            Bots assignés ({user.assigned_bots?.length || 0})
          </h4>
          
          {!user.assigned_bots || user.assigned_bots.length === 0 ? (
            <div className="p-4 bg-gray-800 rounded-lg text-center text-gray-400">
              Aucun bot assigné
            </div>
          ) : (
            <div className="space-y-2">
              {user.assigned_bots.map((bot) => (
                <div
                  key={bot.bot_id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={bot.bot_icon || '/default-bot.png'}
                      alt={bot.bot_name}
                      className="w-8 h-8 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-bot.png';
                      }}
                    />
                   <div>
         		<div className="font-medium">{bot.bot_name}</div>
  			<div className="text-sm text-gray-400">
    			{bot.bot_description}
  			</div>
  <div className="text-xs text-gray-500">
    Assigné le {bot.assigned_at ? new Date(bot.assigned_at).toLocaleDateString('fr-FR') : 'N/A'}
  </div>
  <div className="text-xs text-gray-500">
    Expire le {bot.expiration_date ? new Date(bot.expiration_date).toLocaleDateString('fr-FR') : 'N/A'}
  </div>
</div>
		                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      bot.access_status === 'active'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {bot.access_status === 'active' ? 'Actif' : 'Révoqué'}
                    </span>
                    
                    {bot.access_status === 'active' && (
                      <button
                        onClick={() => onRevokeBot(user.id, bot.bot_id)}
                        disabled={loading}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
                        title="Révoquer l'accès"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bots Disponibles */}
        <div>
          <h4 className="font-medium mb-3">
            Bots disponibles ({unassignedBots.length})
          </h4>
          
          {unassignedBots.length === 0 ? (
            <div className="p-4 bg-gray-800 rounded-lg text-center text-gray-400">
              {availableBots.length === 0 
                ? "Aucune licence active pour cette entreprise"
                : "Tous les bots disponibles sont déjà assignés"
              }
            </div>
          ) : (
            <div className="space-y-2">
              {unassignedBots.map((bot) => (
                <div
                  key={bot.bot_id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={bot.bot_icon || '/default-bot.png'}
                      alt={bot.bot_name}
                      className="w-8 h-8 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-bot.png';
                      }}
                    />
                    <div>
                      <div className="font-medium">{bot.bot_name}</div>
                      <div className="text-sm text-gray-400">
                        {bot.bot_description}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onAssignBot(user.id, bot.bot_id)}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Assigner
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};