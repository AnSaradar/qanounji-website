/**
 * Auth Hook
 * Re-exports the useAuth hook from the provider for easy importing
 * Following the 3-file pattern: types, service, hook
 */

export { useAuth } from '@/providers/auth-provider';
export type { AuthContextType } from './auth.types';

