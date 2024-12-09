import { UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';

import React, { useCallback, useContext } from 'react';

import { useNotification } from '@/hooks/use-notification';
import { socket } from '@/lib/socket-io';
import { getSession } from '@/services/auth';
import { SessionErrorResponse, SessionSuccessResponse } from '@/types/api/auth';

/**
 * Manage client side session state (SPA State)
 */

interface SessionContextValue {
  sessionQuery: UseQueryResult<SessionSuccessResponse, SessionErrorResponse>;
  deleteSession: () => void;
  updateSession: ({ name, username, profilePhoto }: { name: string; username: string; profilePhoto: string }) => void;
}

export const SessionContext = React.createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const sessionQuery = useQuery<SessionSuccessResponse, SessionErrorResponse>({
    queryKey: ['session'],
    queryFn: getSession,
    retry: 0,
  });

  const { requestPermission } = useNotification();

  const queryClient = useQueryClient();

  const deleteSession = useCallback(() => {
    // Clear query cache
    queryClient.clear();
    queryClient.removeQueries({ predicate: () => true });

    // Disconnect from socket
    socket.disconnect();

    // Navigate to login page
    if (window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login';
    }
  }, [queryClient]);

  const updateSession = useCallback(
    ({ name, username, profilePhoto }: { name: string; username: string; profilePhoto: string }) => {
      queryClient.setQueryData<SessionSuccessResponse>(['session'], (prevData) => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          data: {
            ...prevData.body,
            name,
            username,
            profilePhoto,
          },
        };
      });
    },
    [queryClient],
  );

  React.useEffect(() => {
    if (sessionQuery.isSuccess) {
      // Everytime session query succeeded, connect to socket
      socket.connect();

      // Prompt notification request
      requestPermission();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionQuery.isSuccess, sessionQuery.error]);

  return <SessionContext.Provider value={{ sessionQuery, deleteSession, updateSession }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within an AuthProvider');
  }

  const { sessionQuery, updateSession, deleteSession } = context;

  const sessionData = React.useMemo(() => {
    if (sessionQuery.isSuccess) {
      return sessionQuery.data.body;
    }

    return undefined;
  }, [sessionQuery.isSuccess, sessionQuery.data]);

  return {
    session: sessionData,
    isSuccessSession: sessionQuery.isSuccess,
    isLoadingSession: sessionQuery.isLoading,
    isPendingSession: sessionQuery.isPending,
    isErrorSession: sessionQuery.isError,
    errorSession: sessionQuery.error,
    refetchSession: sessionQuery.refetch,
    updateSession,
    deleteSession,
  };
}
