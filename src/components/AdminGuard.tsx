import { AdminRoute } from '@/components/AdminRoute';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <AdminRoute>{children}</AdminRoute>;
}
