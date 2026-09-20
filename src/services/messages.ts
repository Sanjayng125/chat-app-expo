import { supabase } from "@/lib/supabase";
import { Message } from "@/types";

export const getMessages = async (conversationId: string): Promise<Message[]> => {
    const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
    if (error) {
        throw error;
    }
    return data ?? [];
};

export const sendMessage = async ({ conversation_id, sender_id, content }: { conversation_id: string, sender_id: string, content: string }): Promise<Message> => {
    const { data, error } = await supabase.from("messages").insert([
        {
            conversation_id,
            sender_id,
            content,
        },
    ]).select().single();

    if (error) {
        throw error;
    }

    return data
};
