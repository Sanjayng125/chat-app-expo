import { supabase } from "@/lib/supabase";
import { User } from "@/types";
import { File } from "expo-file-system";

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

export const updateUser = async ({ user_id, full_name }: { user_id: string, full_name: string }): Promise<User> => {
    const { data: updatedUser, error } = await supabase.from("users").update({ full_name: full_name.trim() }).eq("id", user_id).select().single()
    if (error) throw error
    return updatedUser
}

export const updateAvatar = async (userId: string, uri: string, mimeType: string, oldFileURL?: string): Promise<User> => {
    const fileExt = mimeType.split('/')[1];
    const filePath = `${userId}/avatar.${fileExt}`;

    const file = new File(uri);

    const arrayBuffer = await file.arrayBuffer();

    if (!arrayBuffer) throw new Error('Failed to read file');

    const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, { upsert: true, contentType: mimeType })

    if (error) {
        console.log("Error: ", error);
        throw error
    }

    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

    if (!data) throw new Error('Failed to get public URL');

    const cacheBustedUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { data: updatedUser, error: updateError } = await supabase.from('users').update({ avatar_url: cacheBustedUrl }).eq('id', userId).select().single()

    if (updateError) {
        await supabase.storage.from('avatars').remove([filePath])
        throw updateError
    }

    if (oldFileURL) {
        const cleanUrl = oldFileURL.split('?')[0];
        const oldPath = new URL(cleanUrl).pathname.split("/avatars/")[1];

        if (oldPath && oldPath !== filePath) {
            await supabase.storage.from("avatars").remove([oldPath]);
        }
    }

    return updatedUser;
}

export const deleteAccount = async (avatar_url?: string) => {
    if (avatar_url) {
        const cleanUrl = avatar_url.split('?')[0];
        const pathname = new URL(cleanUrl).pathname;
        const filePath = pathname.split("/avatars/")[1];

        if (filePath) {
            const { error: storageError } = await supabase.storage
                .from("avatars")
                .remove([filePath]);

            if (storageError) {
                throw new Error('Failed to delete avatar');
            }
        }
    }

    const { error } = await supabase.rpc('delete_user');
    if (error) throw error;

    return true;
}
