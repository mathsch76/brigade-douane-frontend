// src/pages/AdminDashboard/hooks/useManagement.ts - VERSION CORRIGÉE

import { useState } from 'react';
import { getToken } from '../../../utils/auth'; // ✅ IMPORT CORRIGÉ
import api from '../../../utils/axios';
import { ManagementUser, Company, Bot } from '../../../types';

export function useManagement() {
  // ✅ UTILISATION DIRECTE DE getToken() AU LIEU DE useAuth()
  const token = getToken();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<ManagementUser[]>([]);
  const [availableBots, setAvailableBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const loadCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const res = await api.get('/api/admin/user-management/companies');
      console.log('🔍 [DEBUG] Response complète:', res.data);
      console.log('🔍 [DEBUG] Type de response:', typeof res.data);
      console.log('🔍 [DEBUG] Est un tableau:', Array.isArray(res.data));
      
      // ✅ GESTION FLEXIBLE : Objet avec success OU tableau direct
      let companies;
      
      if (res.data.success) {
        // Format: { success: true, companies: [...] }
        companies = res.data.companies || res.data.data || [];
      } else if (Array.isArray(res.data)) {
        // Format: [{...}, {...}, {...}] (tableau direct)
        companies = res.data;
      } else {
        // Format: { data: [...] } ou autre
        companies = res.data.data || res.data.companies || [];
      }
      
      console.log('🔍 [DEBUG] Entreprises extraites:', companies);
      console.log('🔍 [DEBUG] Nombre d\'entreprises:', companies.length);
      
      setCompanies(companies);
    } catch (err) {
      console.error('Exception chargement entreprises', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadCompanyUsers = async (companyId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/user-management/companies/${companyId}/users/detailed`);
      console.log('🔍 [DEBUG] Users Response:', res.data);
      
      // ✅ GESTION FLEXIBLE : Objet avec success OU tableau direct
      let users;
      
      if (res.data.success) {
        users = res.data.users || res.data.data?.users || res.data.data || [];
      } else if (Array.isArray(res.data)) {
        users = res.data;
      } else {
        users = res.data.users || res.data.data || [];
      }
      
      console.log('🔍 [DEBUG] Users extraits:', users);
      setUsers(users);
    } catch (err) {
      console.error('Exception chargement utilisateurs', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

const loadAvailableBots = async (companyId: string) => {
  try {
    const res = await api.get(`/api/admin/user-management/companies/${companyId}/available-bots`);
      console.log('🔍 [DEBUG] Bots Response:', res.data);
      
      // ✅ GESTION FLEXIBLE : Objet avec success OU tableau direct
      let bots;
      
      if (res.data.success) {
        bots = res.data.bots || res.data.data || [];
      } else if (Array.isArray(res.data)) {
        bots = res.data;
      } else {
        bots = res.data.bots || res.data.data || [];
      }
      
      console.log('🔍 [DEBUG] Bots extraits:', bots);
      setAvailableBots(bots);
    } catch (err) {
      console.error('Exception chargement bots disponibles', err);
      setAvailableBots([]);
    }
  };

  const updateUserProfile = async (userId: string, userForm: Partial<ManagementUser>) => {
    try {
      const res = await api.put(`/api/admin/user-management/users/${userId}`, userForm);
      return res.data;
    } catch (err) {
      console.error('Erreur updateUserProfile', err);
      return { success: false, error: 'Erreur réseau' };
    }
  };

  const assignBot = async (userId: string, botId: string) => {
    try {
      const res = await api.post(`/api/admin/user-management/users/${userId}/bots/${botId}`);
      return res.data;
    } catch (err) {
      console.error('Erreur assignBot', err);
      return { success: false, error: 'Erreur réseau' };
    }
  };

  const revokeBot = async (userId: string, botId: string) => {
    try {
      const res = await api.delete(`/api/admin/user-management/users/${userId}/bots/${botId}`);
      return res.data;
    } catch (err) {
      console.error('Erreur revokeBot', err);
      return { success: false, error: 'Erreur réseau' };
    }
  };

  return {
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
  };
}