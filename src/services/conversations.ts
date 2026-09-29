import { supabase } from "@/lib/supabase";
import { Conversation } from "@/types";

export async function getConversations() {

    const { data, error } = await supabase.from('get_my_convos').select('*')


    if (error) {
        throw error;
    }

    return data
}

export const createConversation = async ({ currentUserId, otherUserId }: { currentUserId: string, otherUserId: string }): Promise<Conversation> => {

    const { data: otherUser, error: otherUserError } = await supabase
        .from("users")
        .select("*")
        .eq("id", otherUserId)
        .single();

    if (otherUserError) throw otherUserError;

    const { data: myParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", currentUserId);

    const { data: sharedParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", otherUserId)
        .in("conversation_id", myParticipants?.map(p => p.conversation_id) ?? []);

    if (sharedParticipants && sharedParticipants.length > 0) {
        return {
            id: sharedParticipants[0].conversation_id,
            created_at: new Date().toISOString(),
            other_users: [{
                id: otherUserId,
                email: otherUser.email,
                full_name: otherUser.full_name,
                avatar_url: otherUser.avatar_url
            }],
        };
    }

    const { data: newConversation, error: newConversationError } = await supabase
        .from("conversations")
        .insert([{}])
        .select()
        .single();

    if (newConversationError) throw newConversationError;

    const { error: newParticipantError } = await supabase
        .from("conversation_participants")
        .insert([
            { user_id: currentUserId, conversation_id: newConversation.id },
            { user_id: otherUserId, conversation_id: newConversation.id },
        ]);

    if (newParticipantError) {
        await supabase.from("conversations").delete().eq("id", newConversation.id);
        throw newParticipantError;
    }

    return {
        id: newConversation.id,
        created_at: newConversation.created_at,
        other_users: [{
            id: otherUserId,
            email: otherUser.email,
            full_name: otherUser.full_name,
            avatar_url: otherUser.avatar_url
        }],
    };
};
