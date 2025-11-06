import axios from 'axios';
import {
  User,
  Group,
  Membership,
  Invitation,
  Expense,
  Settlement,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CreateGroupRequest,
  CreateExpenseRequest,
  PaginatedResponse
} from '../types';

// API base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/users/refresh-token/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post('/users/login/', data).then(res => res.data),
  
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post('/users/register/', data).then(res => res.data),
  
  logout: (access: string, refresh: string): Promise<void> =>
    api.post('/users/logout/', { access, refresh }).then(res => res.data),
  
  refreshToken: (refresh: string): Promise<{ access: string }> =>
    api.post('/users/refresh-token/', { refresh }).then(res => res.data),
};

// Users API
export const usersAPI = {
  searchByPhone: (phoneNumber: string): Promise<User> =>
    api.get(`/users/search/?phone_number=${phoneNumber}`).then(res => res.data),
};

// Groups API
export const groupsAPI = {
  getGroups: (): Promise<Group[]> =>
    api.get('/groups/group/').then(res => res.data),
  
  getGroup: (id: number): Promise<Group> =>
    api.get(`/groups/group/${id}/`).then(res => res.data),
  
  createGroup: (data: CreateGroupRequest): Promise<Group> =>
    api.post('/groups/group/', data).then(res => res.data),
  
  updateGroup: (id: number, data: Partial<CreateGroupRequest>): Promise<Group> =>
    api.patch(`/groups/group/${id}/`, data).then(res => res.data),
  
  deleteGroup: (id: number): Promise<void> =>
    api.delete(`/groups/group/${id}/`).then(res => res.data),
  
  getMemberships: (): Promise<Membership[]> =>
    api.get('/groups/membership/').then(res => res.data),
  
  getGroupMemberships: (groupId: number): Promise<Membership[]> =>
    api.get(`/groups/group-memberships/${groupId}/`).then(res => res.data),
  
  inviteByPhone: (groupId: number, phoneNumber: string): Promise<any> =>
    api.post('/groups/invite-by-phone/', { group: groupId, phone_number: phoneNumber }).then(res => res.data),
};

// Expenses API
export const expensesAPI = {
  getExpenses: (): Promise<PaginatedResponse<Expense>> =>
    api.get('/expenses/expense/').then(res => res.data),
  
  getExpense: (id: number): Promise<Expense> =>
    api.get(`/expenses/expense/${id}/`).then(res => res.data),
  
  createExpense: (data: CreateExpenseRequest): Promise<Expense> =>
    api.post('/expenses/expense/', data).then(res => res.data),
  
  updateExpense: (id: number, data: Partial<CreateExpenseRequest>): Promise<Expense> =>
    api.put(`/expenses/expense/${id}/`, data).then(res => res.data),
  
  deleteExpense: (id: number): Promise<void> =>
    api.delete(`/expenses/expense/${id}/`).then(res => res.data),
  
  getGroupExpenses: (groupId: number): Promise<Expense[]> =>
    api.get(`/expenses/group-expenses/${groupId}/`).then(res => res.data),
  
  calculateSettlements: (groupId: number): Promise<Settlement[]> =>
    api.get(`/expenses/calculate/${groupId}/`).then(res => res.data),
};

// Invitations API
export const invitationsAPI = {
  getMyInvitations: (): Promise<Invitation[]> =>
    api.get('/groups/my-invitations/').then(res => res.data),
  
  respondToInvitation: (invitationId: number, status: 'accepted' | 'declined'): Promise<Invitation> =>
    api.patch(`/groups/invitation/${invitationId}/respond/`, { status }).then(res => res.data),
};

// Health check
export const healthAPI = {
  check: (): Promise<{ status: string }> =>
    api.get('/health-check/').then(res => res.data),
};

export default api;
