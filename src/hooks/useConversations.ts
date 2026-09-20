import { getConversations } from "@/services/conversations"
import { useAuthStore } from "@/stores/authStore"
import { Conversation } from "@/types"
import { useQuery } from "@tanstack/react-query"

interface Conversations {
    conversations: Conversation[]
    isLoading: boolean
    refetch: () => void
    isRefetching: boolean
    error: Error | null
}

export const useConversations = (): Conversations => {
    const { session } = useAuthStore()

    const { data = [], isPending, error, refetch, isRefetching } = useQuery({
        queryKey: ["conversations", session?.user.id],
        queryFn: () => {
            const conversations = getConversations(session?.user.id!)

            return conversations
        },
        enabled: !!session?.user.id
    })

    return { conversations: data, isLoading: isPending, error, refetch, isRefetching: isRefetching }
}
