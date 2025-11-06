// User types
export interface User {
  id: number;
  username: string;
  phone_number: string;
  email?: string;
  date_joined: string;
}

// Group types
export interface Group {
  id: number;
  name: string;
  description: string;
  owner_username: string;
  created_at: string;
}

export interface Membership {
  id: number;
  user_id: number;
  user_phone: string;
  group: number;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface GroupJoinRequest {
  id: number;
  user: number;
  group: number;
  status: 'pending' | 'accepted' | 'declined';
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
}

export interface GroupInvitation {
  id: number;
  invited_user: number;
  group: number;
  invited_by: number;
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  invited_at: string;
  responded_at?: string;
}

export interface Invitation {
  id: number;
  group: number;
  group_name: string;
  group_description: string;
  invited_username: string;
  inviting_username: string;
  invited_at: string;
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  responded_at?: string;
}

// Expense types
export interface Expense {
  id: number;
  name: string;
  paid_by: number;
  group: number;
  description?: string;
  created_at: string;
  shares: ExpenseShare[];
}

export interface ExpenseShare {
  id: number;
  expense: number;
  user: number;
  share_amount: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface Settlement {
  from_user: number;
  to_user: number;
  amount: number;
}

// Auth types
export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface RegisterRequest {
  phone_number: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// Form types
export interface CreateGroupRequest {
  name: string;
  description: string;
}

export interface CreateExpenseRequest {
  name: string;
  group: number;
  description?: string;
  shares: {
    user: number;
    share_amount: string;
  }[];
}
