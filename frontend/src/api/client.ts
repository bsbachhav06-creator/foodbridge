import axios from 'axios';
import {
  ApiResponse,
  AuthResponse,
  UserDto,
  DonationResponse,
  ClaimResponse,
  PickupResponse,
  QrCodeResponse,
  QrVerificationResponse,
  ImpactStatsResponse,
  DonorDashboardResponse,
  NgoDashboardResponse,
  VolunteerDashboardResponse,
  AdminAnalyticsResponse,
  NotificationResponse,
  FoodCategory,
  DonationStatus,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodbridge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Optional: auto-logout on expired token
      // localStorage.removeItem('foodbridge_token');
      // localStorage.removeItem('foodbridge_user');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: any) => api.post<ApiResponse<AuthResponse>>('/api/auth/login', data),
  register: (data: any) => api.post<ApiResponse<AuthResponse>>('/api/auth/register', data),
  getMe: () => api.get<ApiResponse<UserDto>>('/api/auth/me'),
};

export const donationApi = {
  create: (data: any) => api.post<ApiResponse<DonationResponse>>('/api/donations', data),
  getAll: (params?: { category?: FoodCategory; vegetarian?: boolean; status?: DonationStatus }) =>
    api.get<ApiResponse<DonationResponse[]>>('/api/donations', { params }),
  getNearby: (params?: { latitude?: number; longitude?: number; radiusKm?: number }) =>
    api.get<ApiResponse<DonationResponse[]>>('/api/donations/nearby', { params }),
  getMy: () => api.get<ApiResponse<DonationResponse[]>>('/api/donations/my'),
  getById: (id: number) => api.get<ApiResponse<DonationResponse>>(`/api/donations/${id}`),
  update: (id: number, data: any) => api.put<ApiResponse<DonationResponse>>(`/api/donations/${id}`, data),
  cancel: (id: number) => api.post<ApiResponse<DonationResponse>>(`/api/donations/${id}/cancel`),
  uploadImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<DonationResponse>>(`/api/donations/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const claimApi = {
  claim: (donationId: number) => api.post<ApiResponse<ClaimResponse>>(`/api/donations/${donationId}/claim`),
  getMy: () => api.get<ApiResponse<ClaimResponse[]>>('/api/claims/my'),
  cancel: (claimId: number) => api.post<ApiResponse<ClaimResponse>>(`/api/claims/${claimId}/cancel`),
};

export const pickupApi = {
  getAvailable: (params?: { latitude?: number; longitude?: number; radiusKm?: number }) =>
    api.get<ApiResponse<PickupResponse[]>>('/api/pickups/available', { params }),
  accept: (claimId: number) => api.post<ApiResponse<PickupResponse>>(`/api/pickups/${claimId}/accept`),
  getMy: () => api.get<ApiResponse<PickupResponse[]>>('/api/pickups/my'),
  getById: (id: number) => api.get<ApiResponse<PickupResponse>>(`/api/pickups/${id}`),
};

export const qrApi = {
  getPickupQr: (assignmentId: number) => api.get<ApiResponse<QrCodeResponse>>(`/api/qr/pickup/${assignmentId}`),
  getDeliveryQr: (assignmentId: number) => api.get<ApiResponse<QrCodeResponse>>(`/api/qr/delivery/${assignmentId}`),
  verify: (token: string) => api.post<ApiResponse<QrVerificationResponse>>('/api/qr/verify', { token }),
};

export const dashboardApi = {
  getImpact: () => api.get<ApiResponse<ImpactStatsResponse>>('/api/dashboard/impact'),
  getDonor: () => api.get<ApiResponse<DonorDashboardResponse>>('/api/dashboard/donor'),
  getNgo: () => api.get<ApiResponse<NgoDashboardResponse>>('/api/dashboard/ngo'),
  getVolunteer: () => api.get<ApiResponse<VolunteerDashboardResponse>>('/api/dashboard/volunteer'),
};

export const adminApi = {
  getUsers: () => api.get<ApiResponse<UserDto[]>>('/api/admin/users'),
  getPendingNgos: () => api.get<ApiResponse<UserDto[]>>('/api/admin/ngos/pending'),
  verifyNgo: (orgId: number) => api.post<ApiResponse<UserDto>>(`/api/admin/ngos/${orgId}/verify`),
  rejectNgo: (orgId: number) => api.post<ApiResponse<UserDto>>(`/api/admin/ngos/${orgId}/reject`),
  toggleUserStatus: (userId: number, active: boolean) =>
    api.post<ApiResponse<UserDto>>(`/api/admin/users/${userId}/toggle-status`, { active }),
  getAnalytics: () => api.get<ApiResponse<AdminAnalyticsResponse>>('/api/admin/analytics'),
};

export const notificationApi = {
  getAll: () => api.get<ApiResponse<NotificationResponse[]>>('/api/notifications'),
  markRead: (id: number) => api.post<ApiResponse<void>>(`/api/notifications/${id}/read`),
  markAllRead: () => api.post<ApiResponse<void>>('/api/notifications/read-all'),
};

export default api;
