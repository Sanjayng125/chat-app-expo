import { User } from "@/types";
import { Session } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthStore {
    user: User | null
    session: Session | null
    setUser: (user: User | null) => void
    setSession: (session: Session | null) => void
}

export const useAuthStore = create<AuthStore>()(
    (set) => ({
        user: null,
        session: null,

        setUser: (user: User | null) => set({ user }),
        setSession: (session: Session | null) => set({ session }),
    })
)
