// src/pages/AdminDashboard/components/CompanyView.tsx - VERSION AVEC COLONNE COÛTS

import React, { useState } from 'react';
import { Building2, Users, Award, TrendingUp, ChevronRight, ArrowLeft, Eye, X, Bot, AlertTriangle, DollarSign, Activity } from 'lucide-react';
import type { CompanyWithStats, CompanyUser, NavigationState, ViewState } from '../types/admin.types';

interface CompanyViewProps {
  companiesWithStats: CompanyWithStats[];
  loading: boolean;
  onLoadCompanyUsers: (companyId: string) => Promise<any>;
  onUserClick: (userId: string) => void;
}

export const CompanyView: React.FC<CompanyViewProps> = ({
  companiesWithStats,
  loading,
  onLoadCompanyUsers,
  onUserClick
}) => {
  // État de navigation
  const [navigation, setNavigation] = useState<NavigationState>({
    view: 'companies',
    breadcrumb: ['Admin', 'Entreprises']
  });
  
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // ✅ FONCTION POUR CALCULER LE COÛT ESTIMÉ
  const calculateEstimatedCost = (totalTokens: number): number => {
    // Estimation basée sur les prix moyens des LLM
    // Input tokens: ~85% du total à 0.002€ / 1K tokens
    // Output tokens: ~15% du total à 0.006€ / 1K tokens
    const inputTokens = Math.round(totalTokens * 0.85);
    const outputTokens = Math.round(totalTokens * 0.15);
    
    const inputCost = (inputTokens / 1000) * 0.002;
    const outputCost = (outputTokens / 1000) * 0.006;
    
    return inputCost + outputCost;
  };

  // ✅ FONCTION POUR FORMATER LE COÛT EN EUROS
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  // ✅ FONCTION POUR OBTENIR LA COULEUR DU COÛT SELON LE MONTANT
  const getCostColor = (cost: number): string => {
    if (cost === 0) return 'text-gray-500';
    if (cost < 0.10) return 'text-green-600'; // < 10 centimes
    if (cost < 1.00) return 'text-orange-600'; // < 1€
    return 'text-red-600'; // >= 1€
  };
 
  // Charger les utilisateurs d'une entreprise
  const loadCompanyUsers = async (company: CompanyWithStats) => {
    console.log('🔍 Chargement users pour:', company.name, company.id);
    setLoadingUsers(true);
    try {
      const result = await onLoadCompanyUsers(company.id);
      console.log('📊 Résultat API complète:', result);
      console.log('👥 result.users:', result.users);
      if (result) {
        console.log('✅ Données reçues, users length:', result.users?.length);
        setUsers(result.users || []);
        console.log('🔄 State users mis à jour avec:', result.users);
        setNavigation({
          view: 'users',
          selectedCompany: company,
          breadcrumb: ['Admin', 'Entreprises', company.name]
        });
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Navigation retour
  const navigateBack = () => {
    if (navigation.view === 'users') {
      setNavigation({
        view: 'companies',
        breadcrumb: ['Admin', 'Entreprises']
      });
    }
  };

  // Gestion du modal utilisateur
  const handleUserClick = (user: CompanyUser) => {
    onUserClick(user.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600 bg-red-100';
    if (rate >= 70) return 'text-orange-600 bg-orange-100';
    if (rate >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  // Breadcrumb component
  const Breadcrumb = () => (
    <div className="flex items-center space-x-2 mb-6">
      {navigation.breadcrumb.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <span className={`text-sm ${index === navigation.breadcrumb.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            {item}
          </span>
        </React.Fragment>
      ))}
    </div>
  );

  // Vue Entreprises
  const CompaniesView = () => {
    // ✅ CALCUL DU COÛT TOTAL DE TOUTES LES ENTREPRISES
    const totalCostAllCompanies = companiesWithStats.reduce((sum, company) => {
      return sum + calculateEstimatedCost(company.total_usage || 0);
    }, 0);

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestion des Entreprises</h2>
            <p className="text-muted-foreground">Vue d'ensemble de toutes les entreprises et leurs licences</p>
          </div>
        </div>

        {/* Summary Cards - ✅ CARTE COÛT AJOUTÉE */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Entreprises</p>
                <p className="text-2xl font-bold text-foreground">{companiesWithStats.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Utilisateurs Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {companiesWithStats.reduce((sum, c) => sum + (c.users_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Licences Actives</p>
                <p className="text-2xl font-bold text-foreground">
                  {companiesWithStats.reduce((sum, c) => sum + (c.active_licenses || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Assignations Totales</p>
                <p className="text-2xl font-bold text-foreground">
                  {companiesWithStats.reduce((sum, c) => sum + (c.total_assignments || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          {/* ✅ NOUVELLE CARTE COÛT TOTAL */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Coût Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalCostAllCompanies)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Companies Table - ✅ COLONNE COÛT AJOUTÉE */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-medium text-foreground">Liste des Entreprises</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Utilisateurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Licences / Assignations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Usage Total
                  </th>
                  {/* ✅ NOUVELLE COLONNE COÛT */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Coûts (€)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Créée le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Chargement...</p>
                    </td>
                  </tr>
                ) : companiesWithStats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      Aucune entreprise trouvée
                    </td>
                  </tr>
                ) : (
                  companiesWithStats.map((company) => {
                    const estimatedCost = calculateEstimatedCost(company.total_usage || 0);
                    
                    return (
                      <tr 
                        key={company.id} 
                        className="hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          console.log('🖱️ CLIC détecté sur:', company.name);
                          loadCompanyUsers(company);
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="w-5 h-5 text-muted-foreground mr-3" />
                            <div>
                              <div className="text-sm font-medium text-foreground">{company.name}</div>
                              {company.siren && (
                                <div className="text-sm text-muted-foreground">SIREN: {company.siren}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            <div className="font-medium">{company.users_count || 0} total</div>
                            <div className="text-xs text-muted-foreground">
                              {company.active_users || 0} actifs
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            <div>
                              <span className="font-medium">{company.active_licenses || 0}</span>
                              <span className="text-muted-foreground"> / {company.total_licenses || 0} licences</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {company.total_assignments || 0} assignations
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-foreground">
                              {(company.total_usage || 0).toLocaleString()} tokens
                            </div>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getUtilizationColor(company.utilization_rate || 0)}`}>
                              {company.utilization_rate || 0}%
                            </span>
                          </div>
                        </td>
                        
                        {/* ✅ NOUVELLE CELLULE COÛT */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${getCostColor(estimatedCost)}`}>
                            {formatCurrency(estimatedCost)}
                          </div>
                          {estimatedCost > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {((estimatedCost / totalCostAllCompanies) * 100).toFixed(1)}% du total
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(company.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              loadCompanyUsers(company);
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Vue Utilisateurs - COMPLÈTE ET CORRIGÉE
  const UsersView = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Utilisateurs - {navigation.selectedCompany?.name}
          </h2>
          <p className="text-muted-foreground">
            {users.length} utilisateur{users.length > 1 ? 's' : ''} dans cette entreprise
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={navigateBack}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            Retour
          </button>
        </div>
      </div>

      {/* Company Summary - ✅ AVEC COÛT AJOUTÉ */}
      {navigation.selectedCompany && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Utilisateurs</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{navigation.selectedCompany.users_count}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Licences Actives</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{navigation.selectedCompany.active_licenses}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Utilisation Totale</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {(navigation.selectedCompany.total_usage || 0).toLocaleString()} tokens
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Assignations</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{navigation.selectedCompany.total_assignments || 0}</p>
            </div>
            
            {/* ✅ NOUVEAU - COÛT ESTIMÉ DE L'ENTREPRISE */}
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Coût Estimé</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(calculateEstimatedCost(navigation.selectedCompany.total_usage || 0))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">Liste des Utilisateurs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Licences
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Usage Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quota / Utilisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Dernière Activité
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {loadingUsers ? (
                <tr>
                  <td colSpan={7} className="text-center p-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Chargement...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleUserClick(user)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-medium text-foreground">
                              {(user.first_name?.[0] || '?').toUpperCase()}{(user.last_name?.[0] || '?').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {user.first_name || 'Sans nom'} {user.last_name || ''}
                          </div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.job_title && (
                            <div className="text-xs text-muted-foreground">{user.job_title}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        <span className="font-medium">{user.licenses_count || 0}</span>
                        <span className="text-muted-foreground"> licence{(user.licenses_count || 0) > 1 ? 's' : ''}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {user.total_usage ? (
                          <span className="font-medium">{user.total_usage.toLocaleString('fr-FR')} tokens</span>
                        ) : (
                          <span className="text-muted-foreground italic">Aucune utilisation</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {user.total_quota > 0 ? (
                          <>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                {user.total_quota.toLocaleString('fr-FR')} quota
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  (user.total_usage / user.total_quota) > 0.9 ? 'bg-red-500' :
                                  (user.total_usage / user.total_quota) > 0.7 ? 'bg-orange-500' : 'bg-green-500'
                                }`}
                                style={{ 
                                  width: `${Math.min((user.total_usage / user.total_quota) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {((user.total_usage / user.total_quota) * 100).toFixed(1)}% utilisé
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground italic">Aucun quota</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {user.last_activity ? (
                        <div>
                          <div>{formatDate(user.last_activity)}</div>
                          <div className="text-xs">
                            {(() => {
                              const days = Math.floor((Date.now() - new Date(user.last_activity).getTime()) / (1000 * 60 * 60 * 24));
                              return days === 0 ? "Aujourd'hui" : 
                                     days === 1 ? "Hier" : 
                                     days < 7 ? `Il y a ${days} jours` : 
                                     days < 30 ? `Il y a ${Math.floor(days/7)} semaines` : 
                                     `Il y a ${Math.floor(days/30)} mois`;
                            })()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Aucune activité</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user);
                        }}
                        className="text-primary hover:text-primary/80"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Breadcrumb />
      
      {navigation.view === 'companies' && <CompaniesView />}
      {navigation.view === 'users' && <UsersView />}
    </div>
  );
};