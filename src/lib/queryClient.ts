import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            retry: 1
        }
    }
});

export default queryClient
