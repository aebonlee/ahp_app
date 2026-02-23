import React from 'react';
import type { User } from '../../types';

interface AuthGuardProps {
  user: User | null;
  /** Rendered when user is not authenticated */
  fallback: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Guard component that renders children only when user is authenticated.
 * When not authenticated, renders the fallback (typically a login page).
 */
export default function AuthGuard({ user, fallback, children }: AuthGuardProps) {
  if (!user) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
