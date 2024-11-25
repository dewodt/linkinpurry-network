import { useNavigate } from '@tanstack/react-router';

import { useEffect } from 'react';

import { ErrorPage } from '@/components/shared/error-page';
import { LoadingPage } from '@/components/shared/loading-page';
import { useSession } from '@/hooks/use-session';

interface AuthGuardLayoutProps {
  level: 'unauthenticated-only' | 'authenticated-only';
  children: React.ReactNode;
}

export function AuthGuardLayout({ children, level }: AuthGuardLayoutProps) {
  const { session, isSuccessSession, isLoadingSession, isErrorSession, errorSession, refetchSession } = useSession();

  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  const isRedirectLogin = level === 'authenticated-only' && currentPath !== '/auth/login' && isErrorSession && errorSession?.response?.status === 401;

  const isRedirectHome = level === 'unauthenticated-only' && isSuccessSession && currentPath !== '/';

  useEffect(() => {
    if (isRedirectHome) {
      navigate({ to: '/' });
    } else if (isRedirectLogin) {
      navigate({ to: '/auth/login' });
    }
  }, [isRedirectHome, isRedirectLogin, navigate]);

  if (level === 'authenticated-only') {
    if (isLoadingSession || (isErrorSession && errorSession?.response?.status === 401)) {
      return <LoadingPage />;
    }

    if (isErrorSession && errorSession?.response?.status !== 401) {
      return <ErrorPage statusText={errorSession?.response?.statusText} message={errorSession?.response?.data.message} refetch={refetchSession} />;
    }

    if (isSuccessSession && session) {
      return <>{children}</>;
    }
  } else if (level === 'unauthenticated-only') {
    if (isLoadingSession || isSuccessSession) {
      return <LoadingPage />;
    }

    if (isErrorSession && errorSession?.response?.status !== 401) {
      return <ErrorPage statusText={errorSession?.response?.statusText} message={errorSession?.response?.data.message} refetch={refetchSession} />;
    }

    if (isErrorSession && errorSession?.response?.status === 401) {
      return <>{children}</>;
    }
  }

  return null;
}
