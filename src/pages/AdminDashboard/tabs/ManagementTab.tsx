// src/pages/AdminDashboard/tabs/ManagementTab.tsx - VERSION CORRIGÉE PAR ENTREPRISE

import React, { useState, useEffect } from 'react';
import { useManagement, Company, ManagementUser } from '../hooks/useManagement';
import { CompanyList } from '../components/management/CompanyList';
import { UserList } from '../components/management/UserList';
import { EditUserModal } from '../components/management/EditUserModal';
import { ManageBotsModal } from '../components/management/ManageBotsModal';

export const ManagementTab: React.FC = () => {
  const {
    companies,
    users,
    availableBots,
    loading,
    loadingCompanies,
    loadCompanies,
    loadCompanyUsers,
    loadAvailableBots,
    updateUserProfile,
    assignBot,
    revokeBot,
    setUsers,
    setAvailableBots,
  } = useManagement();

  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [companyUsers, setCompanyUsers] = useState<Record<string, ManagementUser[]>>({});
  const [companyLoading, setCompanyLoading] = useState<Record<string, boolean>>({});
  const [selectedUser, setSelectedUser] = useState<ManagementUser | null>(null);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showManageBots, setShowManageBots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

 const handleToggleCompany = async (companyId: string) => {
  console.log("🔍 CLICK sur entreprise:", companyId);
  
  setSelectedCompanies(prev => {
    const newSet = new Set(prev);
    if (newSet.has(companyId)) {
      console.log("🔴 FERMETURE:", companyId);
      newSet.delete(companyId);
      setCompanyUsers(prevUsers => {
        const newUsers = { ...prevUsers };
        delete newUsers[companyId];
        return newUsers;
      });
    } else {
      console.log("🟢 OUVERTURE:", companyId);
      newSet.add(companyId);
      loadCompanyUsersForCompany(companyId);
    }
    return newSet;
  });
};

const loadCompanyUsersForCompany = async (companyId: string) => {
  try {
    setCompanyLoading(prev => ({ ...prev, [companyId]: true }));
console.log("🔍 [COMPANY-LOAD] Chargement pour company:", companyId);
console.log("🔍 [COMPANY-LOAD] URL appelée:", `${import.meta.env.VITE_API_ASSISTANT_URL}/api/admin/user-management/companies/${companyId}/users/detailed`);

    
    const token = sessionStorage.getItem('token');
    console.log("🔍 TOKEN RÉCUPÉRÉ:", token ? token.substring(0, 20) + "..." : "NULL");
    
    if (!token) {
      throw new Error('Aucun token d\'authentification trouvé');
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_ASSISTANT_URL}/api/admin/user-management/companies/${companyId}/users/detailed`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des utilisateurs');
    }
    
    const data = await response.json();
    setCompanyUsers(prev => ({ ...prev, [companyId]: data.users || [] }));
    await loadAvailableBots(companyId);
  } catch (err: any) {
    console.error(`❌ [loadCompanyUsersForCompany] Erreur pour ${companyId}:`, err);
    setError(err.message);
    setCompanyUsers(prev => ({ ...prev, [companyId]: [] }));
  } finally {
    setCompanyLoading(prev => ({ ...prev, [companyId]: false }));
  }
};

  const handleEditUser = (user: ManagementUser) => {
    setSelectedUser(user);
    setShowEditUser(true);
  };

  const handleManageBots = (user: ManagementUser) => {
    setSelectedUser(user);
    setShowManageBots(true);
  };

const handleUpdateUserProfile = async (userForm: any) => {
    if (!selectedUser) return;
    console.log("🔍 FORM DATA:", userForm);
    console.log("🔍 USER ID:", selectedUser.id);
    try {
      const result = await updateUserProfile(selectedUser.id, userForm);
      console.log("🔍 RESULT:", result);
      if (result.success) {
        setSuccess('Profil mis à jour avec succès !');
        setShowEditUser(false);
        for (const companyId of selectedCompanies) {
          await loadCompanyUsersForCompany(companyId);
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };
  const handleAssignBot = async (userId: string, botId: string) => {
    try {
      const result = await assignBot(userId, botId);
      if (result.success) {
        setSuccess('Bot assigné avec succès !');
        for (const companyId of selectedCompanies) {
          await loadCompanyUsersForCompany(companyId);
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRevokeBot = async (userId: string, botId: string) => {
    try {
      const result = await revokeBot(userId, botId);
      if (result.success) {
        setSuccess('Bot révoqué avec succès !');
        for (const companyId of selectedCompanies) {
          await loadCompanyUsersForCompany(companyId);
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const closeModals = () => {
    setShowEditUser(false);
    setShowManageBots(false);
    setSelectedUser(null);
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    loadCompanies().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">👥 Gestion de Compte</h2>
          <p className="text-gray-400">Administration des utilisateurs et attribution des bots</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
          <p className="text-green-200">{success}</p>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-700 rounded-lg">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Entreprises et Utilisateurs</h3>
        </div>

        <CompanyList
          companies={companies.filter(c => c.name !== 'Test Company')}
          selectedCompanies={selectedCompanies}
          companyUsers={companyUsers}
          companyLoading={companyLoading}
          onToggleCompany={handleToggleCompany}
          loadingCompanies={loadingCompanies}
          onEditUser={handleEditUser}
          onManageBots={handleManageBots}
        />
      </div>

      <EditUserModal
        show={showEditUser}
        user={selectedUser}
        loading={loading}
        onClose={closeModals}
        onSave={handleUpdateUserProfile}
      />

      <ManageBotsModal
        show={showManageBots}
        user={selectedUser}
        availableBots={availableBots}
        loading={loading}
        onClose={closeModals}
        onAssignBot={handleAssignBot}
        onRevokeBot={handleRevokeBot}
      />
    </div>
  );
};

