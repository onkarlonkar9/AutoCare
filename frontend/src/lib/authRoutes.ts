import type { UserRole } from '@/types/user';

export function getDefaultAppRoute(role: UserRole | null) {
  if (role === 'service_center') return '/service-center';
  if (role === 'owner') return '/dashboard';
  if (role === 'admin') return '/dashboard';
  return '/';
}
