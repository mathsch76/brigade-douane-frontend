// src/pages/AdminDashboard/hooks/useFilters.ts

import { useState, useMemo } from 'react';
import type { User, CompanyWithStats } from '../types/admin.types';

export const useFilters = () => {
  // États des filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fonction de filtrage des utilisateurs
  const filterUsers = useMemo(() => (users: User[]) => {
    return users.filter(user => {
      const searchMatch = 
        `${user.first_name || ""} ${user.last_name || ""} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = !filterRole || user.role === filterRole;
      const companyMatch = !filterCompany || user.company?.toLowerCase().includes(filterCompany.toLowerCase());
      const statusMatch = 
        !filterStatus || 
        (filterStatus === 'pending' && user.first_login) ||
        (filterStatus === 'active' && !user.first_login);
      
      return searchMatch && roleMatch && companyMatch && statusMatch;
    });
  }, [searchTerm, filterRole, filterCompany, filterStatus]);

  // Fonction de filtrage des entreprises
  const filterCompanies = useMemo(() => (companies: CompanyWithStats[]) => {
    return companies.filter(company => {
      const searchMatch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
      // On peut ajouter d'autres filtres spécifiques aux entreprises ici
      return searchMatch;
    });
  }, [searchTerm]);

  // Reset des filtres
  const resetFilters = () => {
    setSearchTerm("");
    setFilterRole("");
    setFilterCompany("");
    setFilterStatus("");
  };

  return {
    // États
    searchTerm,
    filterRole,
    filterCompany,
    filterStatus,
    
    // Setters
    setSearchTerm,
    setFilterRole,
    setFilterCompany,
    setFilterStatus,
    
    // Fonctions
    filterUsers,
    filterCompanies,
    resetFilters
  };
};