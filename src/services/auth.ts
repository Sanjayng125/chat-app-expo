import { supabase } from "@/lib/supabase";
import { User } from "@/types";

export const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) throw error;
    return data;
}

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export const getUser = async (user_id: string): Promise<User> => {
    const { data, error } = await supabase.from("users").select("*").eq("id", user_id).single()
    if (error) throw error
    return data
}
