import { UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';

import React from 'react';

import { getSession } from '@/services/auth';
import { SessionErrorResponse, SessionSuccessResponse } from '@/types/api/auth';

/**
 * Manage client side session state (SPA State)
 */

interface SessionContextValue {
  sessionQuery: UseQueryResult<SessionSuccessResponse, SessionErrorResponse>;
  deleteSession: () => void;
  updateSession: ({ name, avatarUrl }: { name: string; avatarUrl: string }) => void;
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

  const deleteSession = () => {
    queryClient.setQueryData(['session'], undefined);
  };

  const updateSession = ({ name, avatarUrl }: { name: string; avatarUrl: string }) => {
    queryClient.setQueryData(['session'], (prevData: SessionSuccessResponse | undefined) => {
      if (!prevData) return prevData;

      return {
        ...prevData,
        data: {
          ...prevData.data,
          name,
          avatar_url: avatarUrl,
        },
      };
    });
  };

  return <SessionContext.Provider value={{ sessionQuery, deleteSession, updateSession }}>{children}</SessionContext.Provider>;
}
