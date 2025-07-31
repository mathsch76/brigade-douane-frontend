// src/pages/AdminDashboard/tabs/UsersTab.tsx

import React, { useEffect, useState } from 'react';
import { CompanyView } from '../components/CompanyView';
import { UserDetailModal } from '../components/UserDetailModal';
import { useAdminData } from '../hooks/useAdminData';
import type { UserDetail } from '../types/admin.types';

export const UsersTab: React.FC = () => {
  const {
    companiesWithStats,
    selectedUserDetail,
    loadingCompanies,
    loadingUserDetail,
    error,
    success,
    loadCompaniesWithStats,
    loadCompanyUsers,
    loadUserDetails,
    revokeLicense,
    setSelectedUserDetail,
    clearMessages
  } = useAdminData();

  const [showUserDetail, setShowUserDetail] = useState(false);

  // Charger les entreprises au montage
  useEffect(() => {
    loadCompaniesWithStats();
  }, [loadCompaniesWithStats]);

  // Gérer l'ouverture du modal utilisateur
  const handleUserClick = async (userId: string) => {
    const userDetail = await loadUserDetails(userId);
    if (userDetail) {
      setShowUserDetail(true);
    }
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowUserDetail(false);
    setSelectedUserDetail(null);
    clearMessages();
  };

  // Gérer la révocation de licence
  const handleRevokeLicense = async (userId: string, licenseId: string) => {
    await revokeLicense(userId, licenseId);
  };

  return (
    <div className="space-y-6">
      {/* Messages d'erreur et de succès */}
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

      {/* Vue hiérarchique des entreprises */}
      <CompanyView
        companiesWithStats={companiesWithStats}
        loading={loadingCompanies}
        onLoadCompanyUsers={loadCompanyUsers}
        onUserClick={handleUserClick}
      />

      {/* Modal détail utilisateur */}
      <UserDetailModal
        user={selectedUserDetail}
        isOpen={showUserDetail}
        onClose={handleCloseModal}
        onRevokeLicense={handleRevokeLicense}
        loading={loadingUserDetail}
      />
    </div>
  );
};