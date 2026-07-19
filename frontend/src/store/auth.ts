"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import api, { REFRESH_KEY, TOKEN_KEY } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  fetchMe: () => Promise<AuthUser | null>;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hydrated: false,

      setHydrated: (v) => set({ hydrated: v }),

      setToken: (token) => {
        if (typeof window !== "undefined") {
          if (token) localStorage.setItem(TOKEN_KEY, token);
          else localStorage.removeItem(TOKEN_KEY);
        }
        set({ token });
      },

      login: async (username, password) => {
        const { data } = await api.post("/auth/login/", { username, password });
        const access = data.access as string;
        const refresh = data.refresh as string;

        if (typeof window !== "undefined") {
          localStorage.setItem(TOKEN_KEY, access);
          localStorage.setItem(REFRESH_KEY, refresh);
        }

        set({ token: access });

        const me = await get().fetchMe();
        if (!me) throw new Error("تعذر جلب بيانات المستخدم");
        return me;
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_KEY);
        }
        set({ token: null, user: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get<AuthUser>("/accounts/me/");
          set({ user: data });
          return data;
        } catch {
          get().logout();
          return null;
        }
      },
    }),
    {
      name: "as-auth",
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state?.token && typeof window !== "undefined") {
          localStorage.setItem(TOKEN_KEY, state.token);
        }
      },
    }
  )
);
