// App.tsx or main.tsx
import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
});
