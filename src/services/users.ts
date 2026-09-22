import { supabase } from "@/lib/supabase";

export const searchUsers = async ({ query, currentUserId }: { query: string, currentUserId: string }) => {
    const searchQuery = query.trim()
    if (!searchQuery || searchQuery.length === 0) return [];
    const { data, error } = await supabase.from("users").select("*").ilike("full_name", `%${searchQuery}%`).neq("id", currentUserId);

    if (error) {
        throw error;
    }

    return data ?? [];
};
