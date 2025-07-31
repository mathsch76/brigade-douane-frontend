 
// src/pages/AdminDashboard/components/management/UserList.tsx
import React from 'react';
import { Edit3, Bot, User } from 'lucide-react';
import { ManagementUser } from '../../hooks/useManagement';

interface UserListProps {
  users: ManagementUser[];
  loading: boolean;
  onEditUser: (user: ManagementUser) => void;
  onManageBots: (user: ManagementUser) => void;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  loading,
  onEditUser,
  onManageBots,
}) => {

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        Chargement des utilisateurs...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        Aucun utilisateur trouvé
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-4 border-b border-gray-700 last:border-b-0">
          
          {/* Info Utilisateur */}
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-gray-400 ml-6" />
            <div>
              <div className="font-medium">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-sm text-gray-400">
                {user.email} • {user.job_title || 'Poste non défini'}
              </div>
              <div className="flex items-center gap-2 mt-1">
               <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300">
  Actif
</span>
                <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Bots Assignés */}
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <div className="font-medium">
                {user.active_bots}/{user.assigned_bots?.length || 0} bots actifs
              </div>
              <div className="text-gray-400">
                {user.assigned_bots?.map(bot => bot.bot_name).join(', ') || 'Aucun bot'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onEditUser(user)}
                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                title="Modifier le profil"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onManageBots(user)}
                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                title="Gérer les bots"
              >
                <Bot className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};