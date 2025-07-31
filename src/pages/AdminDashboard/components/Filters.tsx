// src/pages/AdminDashboard/components/Filters.tsx

import React from 'react';
import type { FiltersProps } from '../types/admin.types';

export const Filters: React.FC<FiltersProps> = ({
  searchTerm,
  filterRole,
  filterCompany,
  filterStatus,
  onSearchChange,
  onRoleChange,
  onCompanyChange,
  onStatusChange
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">🔍 Recherche et filtres</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary"
        />
        <select
          value={filterRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary"
        >
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="user">Utilisateur</option>
        </select>
        <input
          type="text"
          placeholder="Filtrer par entreprise..."
          value={filterCompany}
          onChange={(e) => onCompanyChange(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary"
        />
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="active">Actifs</option>
        </select>
      </div>
    </div>
  );
};