// src/pages/AdminDashboard/tabs/CreationTab.tsx - VERSION CORRIGÉE

import React, { useState, useEffect } from 'react';
import { StatsCards } from '../components/StatsCards';
import { useAdminData } from '../hooks/useAdminData';
import type { UserForm } from '../types/admin.types';

export const CreationTab: React.FC = () => {
const {
  users,
  companies,
  loading,
  error,
  success,
  loadUsers,
  loadCompanies,
  createUser,
  AVAILABLE_BOTS,
  loadAvailableBots,
  clearMessages
} = useAdminData();

  // Debug pour voir ce que contient companies
  console.log('🔍 Debug companies:', companies, 'Type:', typeof companies, 'Array?', Array.isArray(companies));

  // État du formulaire
  const [userForm, setUserForm] = useState<UserForm>({
    email: "",
    first_name: "",
    last_name: "",
    job_title: "",
    company_id: "",
    new_company_name: "",
    new_company_siren: "",
    nickname: "",
    role: "user",
    selected_bots: []
  });

  // Charger les données au montage
 useEffect(() => {
  loadUsers();
  loadCompanies();
  loadAvailableBots();
}, [loadUsers, loadCompanies, loadAvailableBots]);

  // Calculer les statistiques
  const pendingUsers = users.filter(u => u.first_login).length;
  const activeUsers = users.filter(u => !u.first_login).length;
  const totalLicenses = users.reduce((acc, u) => acc + (u.licenses_count || 0), 0);

  // Gestion du formulaire
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBotToggle = (botId: string) => {
    setUserForm(prev => ({
      ...prev,
      selected_bots: prev.selected_bots.includes(botId)
        ? prev.selected_bots.filter(id => id !== botId)
        : [...prev.selected_bots, botId]
    }));
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    // ✅ CORRECTION : Récupérer les vrais license_ids depuis AVAILABLE_BOTS
    console.log('🔍 Debug AVAILABLE_BOTS:', AVAILABLE_BOTS);
    console.log('🔍 Debug selected_bots:', userForm.selected_bots);
    
    // Récupérer les licences sélectionnées avec leurs vrais IDs
    const selectedLicenseIds = AVAILABLE_BOTS
      .filter(bot => userForm.selected_bots.includes(bot.id))
      .map(bot => {
        // ✅ CORRECTION : Utiliser l'ID de la licence depuis la base de données
        // Si AVAILABLE_BOTS contient license_id, l'utiliser
        // Sinon, on va utiliser une correspondance bot.id -> license_id
        return bot.license_id || bot.id; // Fallback sur bot.id si license_id n'existe pas
      })
      .filter(id => id && id !== ''); // Supprimer les IDs vides

    console.log('🔍 Debug selectedLicenseIds:', selectedLicenseIds);

    // ✅ CORRECTION : Envoyer les vrais license_ids au backend
    const formData = {
      ...userForm,
      license_ids: selectedLicenseIds // ← Utiliser les vrais IDs
    };

    console.log('🔍 Debug formData envoyé:', formData);

    const success = await createUser(formData);

    if (success) {
      // Reset formulaire
      setUserForm({
        email: "", first_name: "", last_name: "", job_title: "",
        company_id: "", new_company_name: "", new_company_siren: "",
        nickname: "", role: "user", selected_bots: []
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Formulaire de création */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">➕ Créer un nouvel utilisateur</h2>
          
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary"
                type="text" name="first_name" placeholder="Prénom" 
                value={userForm.first_name} onChange={handleUserChange} required
              />
              <input
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary"
                type="text" name="last_name" placeholder="Nom"
                value={userForm.last_name} onChange={handleUserChange} required
              />
            </div>

            <input
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary"
              type="email" name="email" placeholder="Email professionnel"
              value={userForm.email} onChange={handleUserChange} required
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
                type="text" name="job_title" placeholder="Poste"
                value={userForm.job_title} onChange={handleUserChange}
              />
              <input
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
                type="text" name="nickname" placeholder="Nom d'utilisateur"
                value={userForm.nickname} onChange={handleUserChange}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Entreprise</label>
              <select
                name="company_id" 
                value={userForm.company_id} 
                onChange={handleUserChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Sélectionner une entreprise existante</option>
                <option value="e38a3744-9be7-4481-b118-c84f18b37389">NAO&CO</option>
                <option value="062470da-4bba-45cd-8152-9b0aeffeab74">SOS DOUANE</option>
              </select>
              
              <div className="text-center text-muted-foreground">ou</div>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  type="text" name="new_company_name" placeholder="Nouvelle entreprise"
                  value={userForm.new_company_name} onChange={handleUserChange}
                />
                <input
                  className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  type="text" name="new_company_siren" placeholder="SIREN"
                  value={userForm.new_company_siren} onChange={handleUserChange}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Licences à attribuer ({userForm.selected_bots.length} sélectionnées)
              </label>
              <div className="space-y-2">
                {AVAILABLE_BOTS.map((bot) => (
                  <label
                    key={bot.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      userForm.selected_bots.includes(bot.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={userForm.selected_bots.includes(bot.id)}
                      onChange={() => handleBotToggle(bot.id)}
                      className="mr-3 h-4 w-4"
                    />
                    <div>
                      <div className="font-medium">{bot.name}</div>
                      <div className="text-sm text-muted-foreground">{bot.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "⏳ Création en cours..." : "✅ Créer l'utilisateur et envoyer l'email"}
            </button>
          </form>
        </div>

        {/* Stats et comptes récents */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">📊 Statistiques</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Entreprises</span>
                <span className="font-bold text-primary">{companies.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Utilisateurs totaux</span>
                <span className="font-bold text-green-500">{users.length}</span>
              </div>
              <div className="flex justify-between">
                <span>En attente</span>
                <span className="font-bold text-orange-500">{pendingUsers}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🕒 Comptes récents</h3>
            <div className="space-y-3">
              {users.slice(-5).reverse().map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{user.first_name} {user.last_name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.first_login ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300'
                  }`}>
                    {user.first_login ? '⏳' : '✅'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};