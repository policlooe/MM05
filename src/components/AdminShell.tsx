import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminRoute } from './AdminRoute';

/**
 * Оболочка админки: единственное место, где нужен react-query.
 *
 * Провайдер раньше стоял в App.tsx и тянул @tanstack/react-query (~45 КБ) в
 * первую загрузку всем покупателям, хотя на витрине он не используется.
 * Теперь он загружается только при входе в /admin.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AdminLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
  </div>
);

export default function AdminShell() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminRoute>
        <Suspense fallback={<AdminLoader />}>
          <Outlet />
        </Suspense>
      </AdminRoute>
    </QueryClientProvider>
  );
}
