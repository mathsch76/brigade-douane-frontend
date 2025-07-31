// src/pages/AdminDashboard/types/admin.types.ts

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  job_title: string | null;
  company: string | null;
  role: string;
  first_login: boolean;
  created_at: string;
  licenses_count: number;
}

export interface UserLicense {
  id: string;
  user_license_id: string;
  bot: {
    id: string;
    name: string;
    description: string;
  };
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'revoked';
  assigned_at: string;
  created_at: string;
  is_expired: boolean;
  days_remaining: number | null;
}

export interface Company {
  id: string;
  name: string;
  siren: string;
  users_count: number;
  licenses_count: number;
}

// NOUVEAUX TYPES pour la vue hiérarchique
export interface CompanyWithStats {
  id: string;
  name: string;
  siren: string | null;
  users_count: number;
  total_licenses: number;
  active_licenses: number;
  expired_licenses: number;
  total_usage: number;
  total_quota: number;
  utilization_rate: number;
  created_at: string;
}

export interface CompanyUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  role: string;
  created_at: string;
  licenses_count: number;
  total_usage: number;
  total_quota: number;
  last_activity: string | null;
}

export interface UserForm {
  email: string;
  first_name: string;
  last_name: string;
  job_title: string;
  company_id: string;
  new_company_name: string;
  new_company_siren: string;
  nickname: string;
  role: string;
  selected_bots: string[];
}

export interface Bot {
  id: string;
  name: string;
  description: string;
}

// 🆕 AJOUT DU TYPE MANAGEMENT
export type TabType = 'users' | 'creation' | 'management' | 'stats' | 'access';

// Navigation state pour la vue hiérarchique
export type ViewState = 'companies' | 'users' | 'user-detail';

export interface NavigationState {
  view: ViewState;
  selectedCompany?: CompanyWithStats;
  selectedUser?: CompanyUser;
  breadcrumb: string[];
}

// 🆕 NOUVEAUX TYPES POUR GESTION DE COMPTE
export interface ManagementUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  created_at: string;
  company_id: string;
  assigned_bots: AssignedBot[];
  total_bots_assigned: number;
  active_bots: number;
}

export interface AssignedBot {
  bot_id: string;
  bot_name: string;
  bot_description: string;
  bot_icon: string;
  access_status: 'active' | 'revoked';
  assigned_at: string;
  expires_at?: string;
  access_id: string;
}

export interface AvailableBot {
  license_id: string;
  bot_id: string;
  bot_name: string;
  bot_description: string;
  bot_icon: string;
  bot_status: string;
  license_created_at: string;
}

export interface UserProfileForm {
  email: string;
  first_name: string;
  last_name: string;
  job_title: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
}

export interface BotAssignmentForm {
  bot_id: string;
  start_date: string;
  end_date: string;
}

// Props types pour les composants
export interface StatsCardsProps {
  totalUsers: number;
  pendingUsers: number;
  activeUsers: number;
  totalLicenses: number;
}

export interface UserTableProps {
  users: User[];
  loading: boolean;
  onUserClick: (userId: string) => void;
}

export interface UserDetailModalProps {
  user: UserDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onRevokeLicense: (userId: string, licenseId: string) => void;
  loading: boolean;
}

export interface FiltersProps {
  searchTerm: string;
  filterRole: string;
  filterCompany: string;
  filterStatus: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

// 🎯 NOUVEAU TYPE: Stats tokens utilisateur
export interface UserTokenStats {
  total_tokens: number;
  total_requests: number;
  estimated_cost_eur: number;
  estimated_cost_usd: number;
  unique_bots_used: number;
  last_30_days_tokens: number;
  bot_breakdown: BotUsageBreakdown[];
}

export interface BotUsageBreakdown {
  bot_id: string;
  bot_name: string;
  total_tokens: number;
  total_requests: number;
  estimated_cost_eur: number;
  estimated_cost_usd: number;
  last_used_at: string | null;
}

// 🔧 UserDetail avec stats tokens ✅
export interface UserDetail {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  nickname: string;
  job_title: string;
  role: string;
  company: string;
  created_at: string;
  first_login: boolean;
  last_login_at?: string;
  communication_style: string;
  content_orientation: string;
  licenses: UserLicense[];
  license_stats: {
    total: number;
    active: number;
    expired: number;
    revoked: number;
  };
  // 🎯 Nouvelles stats tokens
  token_stats?: UserTokenStats;
}