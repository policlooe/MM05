import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

interface AdminRouteProps {
  children: React.ReactNode;
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AdminRoute({ children }: AdminRouteProps) {
  const storedUser = getStoredUser();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.data;
    },
    enabled: !!storedUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    );
  }

  if (isError || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
