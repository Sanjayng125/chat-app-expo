import { User } from "@/types";
import { Session } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthStore {
    session: Session | null
    user: User | null
    setSession: (session: Session | null) => void
    setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>()(
    (set) => ({
        session: null,
        user: null,

        setSession: (session: Session | null) => set({ session }),
        setUser: (user: User | null) => set({ user }),
    })
)
