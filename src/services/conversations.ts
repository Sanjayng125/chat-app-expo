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

    const sortedConversations = conversations.sort((a, b) => {
        if (!a.last_message) return 1;
        if (!b.last_message) return -1;
        return new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime();
    });

    return sortedConversations;
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
