import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { Conversation, Message } from "@/types"
import { RealtimeChannel } from "@supabase/supabase-js"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

interface Realtime {
    conversationId: string
}

export const useRealtime = ({ conversationId }: Realtime) => {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        const channel = supabase.channel(`conversation:${conversationId}`)

        channel.on("broadcast" as any, { event: "new_message" }, (payload: any) => {
            queryClient.setQueryData(["messages", conversationId], (oldMessages: Message[] = []) => {
                const exists = oldMessages.some(m => m.id === payload.payload.new_message.id)
                if (exists) return oldMessages
                return [...oldMessages, payload.payload.new_message]
            })
            queryClient.setQueryData(
                ["conversations", session?.user.id],
                (conversations: Conversation[] | undefined) => {
                    if (!conversations) return conversations;

                    const currentConversation = conversations.find(
                        (item) => item.id === payload.payload.new_message.conversation_id,
                    );
                    if (!currentConversation) return conversations;

                    const updatedConversation: Conversation = {
                        ...currentConversation,
                        last_message: payload.payload.new_message,
                    };

                    return [
                        ...conversations.filter((item) => item.id !== updatedConversation.id),
                        updatedConversation,
                    ];
                },
            );
        }).subscribe()

        channelRef.current = channel;

        return () => {
            channel.unsubscribe()
            supabase.removeChannel(channel)
        }
    }, [conversationId])

    return { channelRef }
}
