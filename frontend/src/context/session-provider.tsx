import { UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';

import React, { useContext } from 'react';

import { socket } from '@/lib/socket-io';
import { getSession } from '@/services/auth';
import { SessionErrorResponse, SessionSuccessResponse } from '@/types/api/auth';

/**
 * Manage client side session state (SPA State)
 */

interface SessionContextValue {
  sessionQuery: UseQueryResult<SessionSuccessResponse, SessionErrorResponse>;
  deleteSession: () => Promise<void>;
  updateSession: ({ name, profilePhoto }: { name: string; profilePhoto: string }) => void;
}

export const SessionContext = React.createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const sessionQuery = useQuery<SessionSuccessResponse, SessionErrorResponse>({
    queryKey: ['session'],
    queryFn: getSession,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });

  const queryClient = useQueryClient();

  const deleteSession = async () => {
    await queryClient.resetQueries({
      queryKey: ['session'],
    });
  };

  const updateSession = ({ name, profilePhoto }: { name: string; profilePhoto: string }) => {
    queryClient.setQueryData<SessionSuccessResponse>(['session'], (prevData) => {
      if (!prevData) return prevData;

      return {
        ...prevData,
        data: {
          ...prevData.data,
          name,
          profilePhoto,
        },
      };
    });
  };

  // Everytime session query succeeded, connect to socket
  React.useEffect(() => {
    if (sessionQuery.isSuccess) {
      // connect to socket
      socket.connect();
    }
  }, [sessionQuery.isSuccess]);

  return <SessionContext.Provider value={{ sessionQuery, deleteSession, updateSession }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within an AuthProvider');
  }

  const { sessionQuery, updateSession, deleteSession } = context;

  return {
    session: sessionQuery.data?.data,
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
