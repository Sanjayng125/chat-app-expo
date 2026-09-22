import { supabase } from "@/lib/supabase"
import { getMessages } from "@/services/messages"
import { useAuthStore } from "@/stores/authStore"
import { Conversation, Message } from "@/types"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

export const useRealtime = () => {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();

    useEffect(() => {
        const conversationIds = queryClient.getQueryData<Conversation[]>([
            "conversations",
            session?.user.id,
        ])?.map((c) => c.id) ?? [];

        const channels = conversationIds.map((conversationId) => {
            const channel = supabase.channel(`conversation:${conversationId}`)

            channel.on("broadcast" as any, { event: "new_message" }, async (payload: any) => {
                const existingCache = queryClient.getQueryState(["messages", conversationId])?.data;

                if (!existingCache) {
                    await queryClient.query({
                        queryKey: ["messages", conversationId],
                        queryFn: () => getMessages(conversationId),
                    });
                }

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
                            updatedConversation,
                            ...conversations.filter((item) => item.id !== updatedConversation.id),
                        ];
                    },
                );
            }).subscribe()

            return channel;
        });

        return () => {
            channels.forEach((channel) => {
                channel.unsubscribe()
                supabase.removeChannel(channel)
            })
        }
    }, [JSON.stringify(queryClient.getQueryData<Conversation[]>(["conversations", session?.user.id])?.map(c => c.id))])
}
