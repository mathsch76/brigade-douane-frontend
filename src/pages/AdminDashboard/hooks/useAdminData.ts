// src/pages/AdminDashboard/hooks/useAdminData.ts

import { useState, useCallback } from 'react';
import axios from 'axios';
import { getToken } from '@/utils/auth';
import type { 
  User, 
  UserDetail, 
  Company, 
  CompanyWithStats, 
  CompanyUser, 
  UserForm,
  Bot 
} from '../types/admin.types';

export const useAdminData = () => {
  // ==================== ÉTATS ====================
  
  // États de données
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesWithStats, setCompaniesWithStats] = useState<CompanyWithStats[]>([]);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserDetail | null>(null);
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  
  // États d'erreur et succès
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ==================== CONSTANTES ====================
  

  // ==================== UTILITAIRES ====================
  
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const handleError = useCallback((err: any, message: string) => {
    console.error(message, err);
    setError(err.response?.data?.message || message);
  }, []);

// États pour les bots disponibles
  const [availableBots, setAvailableBots] = useState<Bot[]>([]);
  const [loadingBots, setLoadingBots] = useState(false);

  // Charger les bots disponibles depuis la base
  const loadAvailableBots = useCallback(async () => {
    setLoadingBots(true);
    try {
      const token = getToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_ASSISTANT_URL}/api/admin/user-management/bots/available`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("🤖 Bots disponibles récupérés:", response.data);
      
      // Adapter la structure pour correspondre au type Bot
      const bots = (response.data || []).map((bot: any) => ({
        id: bot.id,
        name: bot.name,
        description: bot.description,
        license_id: null
      }));
      
      setAvailableBots(bots);
      return bots;
    } catch (err) {
      console.error("❌ Erreur chargement bots:", err);
      handleError(err, "Erreur lors du chargement des bots disponibles");
      return [];
    } finally {
      setLoadingBots(false);
    }
  }, [handleError]);

  const isExpired = useCallback((dateStr: string): boolean => {
    if (!dateStr) return false;
    const endDate = new Date(dateStr);
    return endDate < new Date();
  }, []);

  const getDaysRemaining = useCallback((dateStr: string): number | null => {
    if (!dateStr) return null;
    const endDate = new Date(dateStr);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  // ==================== API: DONNÉES DE BASE ====================

  // Charger les utilisateurs (format original)
  const loadUsers = useCallback(async () => {
    setLoading(true);
    clearMessages();
    
    try {
      const token = getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_ASSISTANT_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
    } catch (err) {
      handleError(err, "Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  }, [clearMessages, handleError]);

  // Charger les entreprises (format original)
  const loadCompanies = useCallback(async () => {
    try {
      console.log("🔄 Début du chargement des entreprises");
      const token = getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_ASSISTANT_URL}/companies/with-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("📊 Réponse complète de l'API:", response.data);
      
      if (response.data && response.data.companies) {
        console.log("✅ Format attendu: { companies: [...] }");
        console.log("📋 Nombre d'entreprises reçues:", response.data.companies.length);
        setCompanies(response.data.companies || []);
      } else {
        console.error("⚠️ Format inattendu:", response.data);
        if (Array.isArray(response.data)) {
          console.log("📋 Les données sont un tableau de longueur:", response.data.length);
          setCompanies(response.data);
        } else {
          console.error("❌ Impossible de déterminer la structure des données");
          setCompanies([]);
        }
      }
    } catch (err) {
      console.error("❌ Erreur lors du chargement des entreprises:", err);
      handleError(err, "Erreur lors du chargement des entreprises");
    }
  }, [handleError]);

  // Charger les entreprises avec statistiques
  const loadCompaniesWithStats = useCallback(async () => {
    setLoadingCompanies(true);
    clearMessages();
    
    try {
      const token = getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_ASSISTANT_URL}/companies/with-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompaniesWithStats(response.data.companies || []);
    } catch (err) {
      handleError(err, "Erreur lors du chargement des entreprises");
    } finally {
      setLoadingCompanies(false);
    }
  }, [clearMessages, handleError]);

  // Charger les utilisateurs d'une entreprise
  const loadCompanyUsers = useCallback(async (companyId: string) => {
    setLoading(true);
    clearMessages();
    
    try {
      const token = getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_ASSISTANT_URL}/companies/${companyId}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanyUsers(response.data.users || []);
      return response.data || null;
    } catch (err) {
      handleError(err, "Erreur lors du chargement des utilisateurs de l'entreprise");
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearMessages, handleError]);

  // ==================== API: UTILISATEUR DÉTAILS ====================

  // Charger les détails d'un utilisateur (VERSION SIMPLIFIÉE)
  const loadUserDetails = useCallback(async (userId: string) => {
    setLoadingUserDetail(true);
    clearMessages();

    try {
      const token = getToken();
      console.log("🚀 Chargement détails utilisateur:", userId);
      
      // Appel principal pour les détails utilisateur
      const userResponse = await axios.get(
        `${import.meta.env.VITE_API_ASSISTANT_URL}/user/${userId}/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("🎯 Réponse API utilisateur:", userResponse.data);
      
      // Vérifier si on a la nouvelle structure enrichie
       if (userResponse.data.user && userResponse.data.user.usage_stats && userResponse.data.user.bots_usage) {
        console.log("✅ Structure backend moderne détectée (usage_stats + bots_usage)!");
        
        const userData = userResponse.data.user;
        const usageStats = userData.usage_stats;
        const botsUsage = userData.bots_usage;
        
        // Passer les données DIRECTEMENT au modal sans transformation
        const userDetail: UserDetail = {
          // Infos de base
          id: userData.id || "",
          email: userData.email || "",
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          nickname: userData.nickname || "",
          job_title: userData.job_title || "",
          role: userData.role || "user",
          company: userData.company || null,
          created_at: userData.created_at || new Date().toISOString(),
          first_login: userData.first_login || false,
          last_login_at: userData.last_login_at,
          communication_style: userData.communication_style || "normal",
          content_orientation: userData.content_orientation || "neutral",
          
          // 🔥 AJOUT DES DONNÉES BACKEND DIRECTES
          usage_stats: usageStats,
          bots_usage: botsUsage,
          
          // Licences adaptées
          licenses: botsUsage.map((bot: any) => ({
            id: bot.bot_id || "",
            user_license_id: `${userData.id}_${bot.bot_id}`,
            bot: {
              id: bot.bot_id || "",
              name: bot.bot_name || "Bot inconnu",
              description: bot.bot_description || "Description non disponible"
            },
            start_date: userData.created_at || new Date().toISOString(),
            end_date: "",
            status: 'active',
            assigned_at: userData.created_at || new Date().toISOString(),
            created_at: userData.created_at || new Date().toISOString(),
            is_expired: false,
            days_remaining: null
          })),
          
          // Stats licences
          license_stats: {
            total: botsUsage.length || 0,
            active: botsUsage.length || 0,
            expired: 0,
            revoked: 0
          },
          
          // Stats tokens CORRECTES
          token_stats: {
            total_tokens: usageStats.total_tokens || 0,
            total_requests: usageStats.total_requests || 0,
            estimated_cost_eur: usageStats.estimated_cost_eur || 0,
            estimated_cost_usd: (usageStats.estimated_cost_eur || 0) / 0.92,
            unique_bots_used: usageStats.unique_bots_used || 0,
            last_30_days_tokens: usageStats.total_tokens || 0,
            bot_breakdown: botsUsage.map((bot: any) => ({
              bot_id: bot.bot_id || "",
              bot_name: bot.bot_name || "Bot inconnu",
              total_tokens: bot.stats?.total_tokens || 0,
              total_requests: bot.stats?.requests_count || 0,
              estimated_cost_eur: bot.stats?.estimated_cost || 0
            }))
          }
        };
        
        console.log("✅ UserDetail créé avec usage_stats:", userDetail);
        setSelectedUserDetail(userDetail);
        return userDetail;
              
      } else {
        // Fallback - ancienne structure
        console.log("⚠️ Ancienne structure détectée, utilisation du fallback...");
        
        const userData = userResponse.data.user || userResponse.data;
        
        // Créer un UserDetail basique sans stats complexes
        const userDetail: UserDetail = {
          id: userData.id || "",
          email: userData.email || "",
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          nickname: userData.nickname || "",
          job_title: userData.job_title || "",
          role: userData.role || "user",
          company: userData.company || "",
          created_at: userData.created_at || new Date().toISOString(),
          first_login: userData.first_login || false,
          last_login_at: userData.last_login_at,
          communication_style: userData.communication_style || "normal",
          content_orientation: userData.content_orientation || "neutral",
          licenses: [], // À compléter si nécessaire
          license_stats: {
            total: 0,
            active: 0,
            expired: 0,
            revoked: 0
          },
          token_stats: {
            total_tokens: 0,
            total_requests: 0,
            estimated_cost_eur: 0,
            estimated_cost_usd: 0,
            unique_bots_used: 0,
            last_30_days_tokens: 0,
            bot_breakdown: []
          }
        };
        
        console.log("✅ UserDetail créé (fallback):", userDetail);
        setSelectedUserDetail(userDetail);
        return userDetail;
      }
      
    } catch (err: any) {
      console.error("❌ Erreur loadUserDetails:", err);
      handleError(err, `Erreur lors du chargement des détails de l'utilisateur: ${err.response?.status === 404 ? "Utilisateur non trouvé" : err.response?.data?.message || err.message}`);
      return null;
    } finally {
      setLoadingUserDetail(false);
    }
  }, [clearMessages, handleError]);

  // ==================== API: STATISTIQUES GLOBALES ====================

  // Charger les quotas globaux
  const loadGlobalQuotas = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_ASSISTANT_URL}/admin/quotas/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error("❌ Erreur chargement quotas globaux:", err);
      handleError(err, "Erreur lors du chargement des quotas");
      return null;
    }
  }, [handleError]);

  // Charger toutes les licences
  const loadAllLicenses = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_ASSISTANT_URL}/admin/export/licenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error("❌ Erreur chargement licences:", err);
      handleError(err, "Erreur lors du chargement des licences");
      return null;
    }
  }, [handleError]);

  // Charger tous les utilisateurs
  const loadAllUsers = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_ASSISTANT_URL}/admin/export/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error("❌ Erreur chargement utilisateurs export:", err);
      handleError(err, "Erreur lors du chargement des utilisateurs");
      return null;
    }
  }, [handleError]);

  // Charger toutes les entreprises
  const loadAllCompanies = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_ASSISTANT_URL}/admin/export/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error("❌ Erreur chargement entreprises export:", err);
      handleError(err, "Erreur lors du chargement des entreprises");
      return null;
    }
  }, [handleError]);

  // Calculer les statistiques globales
  const calculateGlobalStats = useCallback(async () => {
    try {
      // Charger toutes les données en parallèle
      const [quotasData, licensesData, usersData, companiesData] = await Promise.all([
        loadGlobalQuotas(),
        loadAllLicenses(),
        loadAllUsers(),
        loadAllCompanies()
      ]);

      if (!quotasData || !licensesData || !usersData || !companiesData) {
        throw new Error("Impossible de charger toutes les données nécessaires");
      }

      const quotas = quotasData.quotas || [];
      const licenses = licensesData.licenses || [];
      const users = usersData.users || [];
      const companies = companiesData.companies || [];

      // Calculs des statistiques globales
      const totalTokens = quotas.reduce((sum: number, q: any) => sum + (q.current_usage || 0), 0);
      const totalRequests = quotas.reduce((sum: number, q: any) => sum + (q.requests_count || 0), 0);
      const totalCost = quotas.reduce((sum: number, q: any) => sum + (q.estimated_cost || 0), 0);

      // Statistiques par entreprise
      const companyStatsMap = new Map();
      quotas.forEach((quota: any) => {
        const companyName = quota.company || 'Entreprise inconnue';
        if (!companyStatsMap.has(companyName)) {
          companyStatsMap.set(companyName, {
            company_name: companyName,
            siren: quota.siren || null,
            total_tokens: 0,
            total_requests: 0,
            estimated_cost_eur: 0,
            users_count: 0,
            utilization_rate: 0
          });
        }
        const stats = companyStatsMap.get(companyName);
        stats.total_tokens += quota.current_usage || 0;
        stats.total_requests += quota.requests_count || 0;
        stats.estimated_cost_eur += quota.estimated_cost || 0;
        stats.utilization_rate = Math.round((stats.total_requests / (quota.max_requests_per_month || 1)) * 100);
      });

      // Compter les utilisateurs par entreprise
      const usersByCompany = new Map();
      users.forEach((user: any) => {
        const company = user.company || 'Entreprise inconnue';
        if (!usersByCompany.has(company)) {
          usersByCompany.set(company, new Set());
        }
        usersByCompany.get(company).add(user.id);
      });

      companyStatsMap.forEach((stats, companyName) => {
        stats.users_count = usersByCompany.get(companyName)?.size || 0;
      });

      // Statistiques par bot
      const botStatsMap = new Map();
      quotas.forEach((quota: any) => {
        const botId = quota.bot_id || 'unknown';
const botName = availableBots.find(b => b.id === botId)?.name || 'Bot inconnu';        
        if (!botStatsMap.has(botId)) {
          botStatsMap.set(botId, {
            bot_id: botId,
            bot_name: botName,
            total_tokens: 0,
            total_requests: 0,
            estimated_cost_eur: 0,
            active_users: 0,
            companies_using: 0
          });
        }
        
        const stats = botStatsMap.get(botId);
        stats.total_tokens += quota.current_usage || 0;
        stats.total_requests += quota.requests_count || 0;
        stats.estimated_cost_eur += quota.estimated_cost || 0;
      });

      // Compter utilisateurs et entreprises par bot
      licenses.forEach((license: any) => {
        const botId = license.bot_id || 'unknown';
        if (botStatsMap.has(botId)) {
          const botLicenses = licenses.filter((l: any) => l.bot_id === botId);
          const stats = botStatsMap.get(botId);
          stats.active_users = new Set(botLicenses.map((l: any) => l.user_id)).size;
          stats.companies_using = new Set(botLicenses.map((l: any) => l.company)).size;
        }
      });

      return {
        global: {
          total_users: users.length,
          total_companies: companies.length,
          total_licenses: licenses.length,
          active_licenses: licenses.filter((l: any) => l.status === 'active').length,
          total_tokens_consumed: totalTokens,
          total_requests: totalRequests,
          total_cost_eur: totalCost,
          monthly_growth: {
            users: 12,
            requests: 8,
            tokens: 15
          }
        },
        companies: Array.from(companyStatsMap.values()).sort((a: any, b: any) => b.total_tokens - a.total_tokens),
        bots: Array.from(botStatsMap.values()).sort((a: any, b: any) => b.total_tokens - a.total_tokens)
      };

    } catch (err) {
      console.error("❌ Erreur calcul statistiques globales:", err);
      handleError(err, "Erreur lors du calcul des statistiques");
      return null;
    }
  }, [loadGlobalQuotas, loadAllLicenses, loadAllUsers, loadAllCompanies, handleError, availableBots]);

  // ==================== API: ACTIONS ====================

  // Révoquer une licence
  const revokeLicense = useCallback(async (userId: string, licenseId: string) => {
    try {
      const token = getToken();
      await axios.patch(
        `${import.meta.env.VITE_API_ASSISTANT_URL}/user/${userId}/revoke-license`,
        { licenseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess("Licence révoquée avec succès");
      await loadUserDetails(userId);
    } catch (err: any) {
      handleError(err, "Erreur lors de la révocation de la licence");
    }
  }, [handleError, loadUserDetails]);

  // Créer un utilisateur
  const createUser = useCallback(async (userForm: UserForm) => {
    setLoading(true);
    clearMessages();
    try {
      const token = getToken();
      const payload = userForm;

      await axios.post(
        `${import.meta.env.VITE_API_ASSISTANT_URL}/auth/register-user`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`✅ Utilisateur ${userForm.first_name} ${userForm.last_name} créé avec succès ! Email envoyé à ${userForm.email}`);
      await Promise.all([loadUsers(), loadCompanies(), loadCompaniesWithStats()]);
      return true;
    } catch (err: any) {
      handleError(err, "❌ Erreur lors de la création de l'utilisateur");
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearMessages, handleError, loadUsers, loadCompanies, loadCompaniesWithStats]);

  // ==================== RETURN ====================

  return {
    // États
    users,
    companies,
    companiesWithStats,
    companyUsers,
    selectedUserDetail,
    loading,
    loadingUserDetail,
    loadingCompanies,
    error,
    success,
    
    // Constantes
    AVAILABLE_BOTS: availableBots,
    availableBots,
    loadingBots,   
 
    // Actions de base
    loadUsers,
    loadCompanies,
    loadCompaniesWithStats,
    loadCompanyUsers,
    loadUserDetails,
    revokeLicense,
    createUser,
clearMessages,
setSelectedUserDetail,
loadAvailableBots,
    
    // Fonctions statistiques
    loadGlobalQuotas,
    loadAllLicenses,
    loadAllUsers,
    loadAllCompanies,
    calculateGlobalStats,
    
    // Utilitaires
    isExpired,
    getDaysRemaining
  };
};