// src/pages/AdminDashboard/components/StatsCards.tsx

import React from 'react';
import type { StatsCardsProps } from '../types/admin.types';

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalUsers,
  pendingUsers,
  activeUsers,
  totalLicenses
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-2xl font-bold text-primary">{totalUsers}</div>
        <div className="text-sm text-muted-foreground">Total utilisateurs</div>
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-2xl font-bold text-orange-500">{pendingUsers}</div>
        <div className="text-sm text-muted-foreground">En attente</div>
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-2xl font-bold text-green-500">{activeUsers}</div>
        <div className="text-sm text-muted-foreground">Actifs</div>
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-2xl font-bold text-blue-500">{totalLicenses}</div>
        <div className="text-sm text-muted-foreground">Licences attribuées</div>
      </div>
    </div>
  );
};