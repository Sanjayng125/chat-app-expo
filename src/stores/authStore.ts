import { getUser } from "@/services/auth";
import { User } from "@/types";
import { Session } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthStore {
    session: Session | null
    user: User | null
    setSession: (session: Session | null) => void
    setUser: (user: User | null) => void
    getUser: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
    (set) => ({
        session: null,
        user: null,

        setSession: (session: Session | null) => set({ session }),
        setUser: (user: User | null) => set({ user }),

        getUser: async () => {
            const session = useAuthStore.getState().session;

            if (!session) {
                set({ user: null });
                return;
            }

            try {
                const user = await getUser(session.user.id);
                set({ user });
            } catch (error) {
                set({
                    user: {
                        id: session.user.id,
                        email: session.user.email ?? "",
                        full_name: session.user.user_metadata.full_name,
                        avatar_url: session.user.user_metadata.avatar_url,
                        created_at: session.user.created_at,
                    }
                });
            }
        },
    })
)
