import { useContext } from 'react';

import { SessionContext } from '@/context/session-provider';

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
