// Enums matching backend
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum Language {
  AR = 'ar',
  EN = 'en',
}

// User interface (matches backend UserResponseDto)
export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string;
  role: UserRole;
  preferredLang: Language;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Auth DTOs matching backend
export interface LoginDto {
  identifier: string; // email or phone
  password: string;
}

export interface RegisterDto {
  email?: string;
  phone?: string;
  displayName: string;
  password: string;
  preferredLang?: Language;
}

// Auth Response (matches backend AuthResponseDto)
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Auth Context State
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// API Error Response
export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}

