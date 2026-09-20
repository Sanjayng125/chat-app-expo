import { supabase } from "@/lib/supabase";
import { Conversation, User } from "@/types";

export async function getConversations(userId: string) {
    const { data, error } = await supabase
        .from("conversation_participants")
        .select(`
        conversation_id,
        conversations (
            id,
            created_at
        ),
        users (
            id,
            email,
            full_name,
            avatar_url,
            created_at
        )
    `)
        .eq("user_id", userId);

    if (error) {
        throw error;
    }

    if (!data) return [];

    const conversationIds = data.map(
        (item) => item.conversation_id
    );


    const { data: participants, error: participantsError } = await supabase
        .from("conversation_participants")
        .select(`
        conversation_id,
        user_id,
        joined_at,
        users (
            id,
            email,
            full_name,
            avatar_url
        )
    `)
        .in("conversation_id", conversationIds)
        .neq("user_id", userId);

    if (participantsError) {
        throw participantsError;
    }

    // console.log("Conversations: ", data);
    // console.log("Participants: ", participants);

    const { data: lastMessages } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })

    const conversations: Conversation[] = data.map((item) => {
        const otherParticipants = participants.filter(
            (p) => p.conversation_id === item.conversation_id
        );
        const lastMessage = lastMessages?.find((m) => m.conversation_id === item.conversation_id);

        return {
            id: item.conversation_id,
            created_at: (item.conversations as any).created_at,
            other_users: otherParticipants.map((p) => p.users as unknown as User),
            last_message: lastMessage,
        };
    });

    // console.log("Conversations: ", JSON.stringify(conversations));

    return conversations;
}
