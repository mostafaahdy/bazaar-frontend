import apiClient from '@/lib/api';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserProfile;
}

export const authService = {
  /**
   * Register a new user with real PostgreSQL persistence
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      fullName: payload.fullName.trim(),
      email: payload.email.trim(),
      password: payload.password,
      phoneNumber: payload.phoneNumber?.trim() || undefined,
    });
    return response.data;
  },

  /**
   * Login with email and password
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email: payload.email.trim(),
      password: payload.password,
    });
    return response.data;
  },

  /**
   * Fetch current authenticated user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/auth/me');
    return response.data;
  },
};

export default authService;

