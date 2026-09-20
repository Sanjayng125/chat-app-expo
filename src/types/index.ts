export interface User {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at?: string;
}

export interface Conversation {
    id: string;
    created_at: string;
    other_users: User[];
    last_message?: Message;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

export interface ConversationParticipant {
    id: string;
    conversation_id: string;
    user_id: string;
    joined_at: string;
}
