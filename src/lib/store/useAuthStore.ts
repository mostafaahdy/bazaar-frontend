import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/types';
import { authService, type UserProfile } from '@/services/auth.service';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthOpen: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string, phoneNumber?: string) => Promise<boolean>;
  logout: () => void;
  openAuth: () => void;
  closeAuth: () => void;
  clearError: () => void;
  initAuth: () => Promise<void>;
}

function mapProfileToUser(profile: UserProfile): User {
  return {
    id: profile.id,
    name: profile.fullName,
    email: profile.email,
    avatar:
      profile.avatarUrl ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.email)}`,
    isLoggedIn: true,
    role: profile.role,
    phoneNumber: profile.phoneNumber,
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAuthOpen: false,
      isLoading: false,
      error: null,

      /**
       * Real database authentication via /api/auth/login
       */
      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.login({ email, password });
          if (typeof window !== 'undefined') {
            localStorage.setItem('bazaar_auth_token', res.token);
          }
          set({
            token: res.token,
            isAuthenticated: true,
            user: mapProfileToUser(res.user),
            isAuthOpen: false,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Invalid email or password credentials.';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      /**
       * Real user registration via /api/auth/register
       */
      register: async (
        fullName: string,
        email: string,
        password: string,
        phoneNumber?: string
      ): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.register({
            fullName,
            email,
            password,
            phoneNumber,
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('bazaar_auth_token', res.token);
          }
          set({
            token: res.token,
            isAuthenticated: true,
            user: mapProfileToUser(res.user),
            isAuthOpen: false,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Registration failed. Please check your details.';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bazaar_auth_token');
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      openAuth: () => set({ isAuthOpen: true, error: null }),
      closeAuth: () => set({ isAuthOpen: false, error: null }),
      clearError: () => set({ error: null }),

      /**
       * Rehydrate authenticated session from token & verify with backend /api/auth/me
       */
      initAuth: async () => {
        if (typeof window === 'undefined') return;
        const storedToken = localStorage.getItem('bazaar_auth_token');
        if (!storedToken) return;

        try {
          const profile = await authService.getCurrentUser();
          set({
            user: mapProfileToUser(profile),
            token: storedToken,
            isAuthenticated: true,
          });
        } catch (err) {
          console.warn('[initAuth] Token expired or invalid, clearing session:', err);
          get().logout();
        }
      },
    }),
    {
      name: 'bazaar-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
