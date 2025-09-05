// src/auth/Protected.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { ReactNode } from 'react';

export default function Protected({ children }: { children: ReactNode }) {
  const { logged, loading } = useAuth();
  if (loading) return <div className="p-6">Cargando…</div>;
  if (!logged) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
