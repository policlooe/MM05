import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '@/services/api';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = localStorage.getItem('user');
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const userData = JSON.parse(user);
        
        const response = await api.get('/auth/me');
        const currentUser = response.data.data;
        
        setIsAdmin(currentUser.role === 'ADMIN');
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
