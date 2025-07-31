 
// src/pages/AdminDashboard/components/management/EditUserModal.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ManagementUser, UserForm } from '../../hooks/useManagement';

interface EditUserModalProps {
  show: boolean;
  user: ManagementUser | null;
  loading: boolean;
  onClose: () => void;
  onSave: (userForm: UserForm) => Promise<void>;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  show,
  user,
  loading,
  onClose,
  onSave,
}) => {
  const [userForm, setUserForm] = useState<UserForm>({
    first_name: '',
    last_name: '',
    email: '',
    job_title: '',
    role: 'user',
    status: 'active'
  });

  // Initialiser le formulaire quand l'utilisateur change
  useEffect(() => {
    if (user) {
      setUserForm({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        job_title: user.job_title || '',
        role: user.role,
        status: user.status
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await onSave(userForm);
    } catch (err) {
      // L'erreur est gérée dans le parent
      console.error('Erreur lors de la sauvegarde:', err);
    }
  };

  if (!show || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Modifier le profil</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulaire */}
        <div className="space-y-4">
          
          {/* Prénom et Nom */}
          <div className="grid grid-cols-2 gap-3">
            <input
              className="px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              type="text"
              placeholder="Prénom"
              value={userForm.first_name}
              onChange={(e) => setUserForm(prev => ({ ...prev, first_name: e.target.value }))}
            />
            <input
              className="px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              type="text"
              placeholder="Nom"
              value={userForm.last_name}
              onChange={(e) => setUserForm(prev => ({ ...prev, last_name: e.target.value }))}
            />
          </div>

          {/* Email */}
          <input
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            type="email"
            placeholder="Email"
            value={userForm.email}
            onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
          />

          {/* Poste */}
          <input
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            type="text"
            placeholder="Poste"
            value={userForm.job_title}
            onChange={(e) => setUserForm(prev => ({ ...prev, job_title: e.target.value }))}
          />

          {/* Rôle et Statut */}
          <div className="grid grid-cols-2 gap-3">
            <select
              className="px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:border-blue-500"
              value={userForm.role}
              onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:border-blue-500"
              value={userForm.status}
              onChange={(e) => setUserForm(prev => ({ ...prev, status: e.target.value as 'active' | 'suspended' }))}
            >
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-400 border border-gray-600 rounded-md hover:bg-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};