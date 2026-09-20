import { getMessages } from "@/services/messages"
import { Message } from "@/types"
import { useQuery } from "@tanstack/react-query"

interface Messages {
    messages: Message[]
    isLoading: boolean
    refetch: () => void
    isRefetching: boolean
    error: Error | null
}

export const useMessages = (conversationId: string): Messages => {
    const { data = [], isPending, error, refetch, isRefetching } = useQuery({
        queryKey: ["messages", conversationId],
        queryFn: () => {
            const messages = getMessages(conversationId)

            return messages
        },
        enabled: !!conversationId
    })

    return { messages: data, isLoading: isPending, error, refetch, isRefetching: isRefetching }
}
