import { UseQueryResult, useQuery } from '@tanstack/react-query';

import React from 'react';

import { getSession } from '@/services/auth';
import { SessionErrorResponse, SessionSuccessResponse } from '@/types/api/auth';

/**
 * Manage client side session state (SPA State)
 */

interface SessionContextValue {
  sessionQuery: UseQueryResult<SessionSuccessResponse, SessionErrorResponse>;
}

export const SessionContext = React.createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const sessionQuery = useQuery<SessionSuccessResponse, SessionErrorResponse>({
    queryKey: ['session'],
    queryFn: getSession,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });

  return <SessionContext.Provider value={{ sessionQuery }}>{children}</SessionContext.Provider>;
}
