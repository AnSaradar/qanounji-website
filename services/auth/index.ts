/**
 * Auth Service Barrel Export
 * Simplifies imports across the application
 */

// Types
export type {
  User,
  UserRole,
  Language,
  LoginDto,
  RegisterDto,
  AuthResponse,
  AuthContextType,
  ApiError,
} from './auth.types';

export { UserRole as UserRoleEnum, Language as LanguageEnum } from './auth.types';

// Service
export { authService } from './auth.service';

// Hook
export { useAuth } from './auth.hook';

