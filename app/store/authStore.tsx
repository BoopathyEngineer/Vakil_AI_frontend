import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  role: string | null;
  setRole: (role: string) => void;
  university: string | null;
  setUniversity: (university: string) => void;
  clearState: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role: string) => set({ role }),
      university: null,
      setUniversity: (university: string) => set({ university }),
      clearState: () => set({ role: null }),
    }),
    {
      name: 'auth-store',
    }
  )
);

export default useAuthStore;
