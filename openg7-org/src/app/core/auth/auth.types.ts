export interface JwtPayload {
  exp: number;
  iat?: number;
  [key: string]: unknown;
}

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  premiumActive?: boolean;
  premiumPlan?: string | null;
  premiumSince?: string | null;
  premiumReference?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  organization?: string | null;
  avatarUrl?: string | null;
  sectorPreferences?: string[];
  provincePreferences?: string[];
  notificationPreferences?: UserNotificationPreferences | null;
}

export interface AuthResponse {
  jwt: string;
  user: AuthUser;
}

export type RegisterResponse = AuthResponse;
export type LoginResponse = AuthResponse;
export type ProfileResponse = AuthUser;

export interface UpdateProfilePayload {
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  organization?: string | null;
  avatarUrl?: string | null;
  sectorPreferences?: string[];
  provincePreferences?: string[];
  premiumPlan?: string | null;
  notificationPreferences?: UserNotificationPreferences | null;
}

export interface UserNotificationPreferences {
  emailOptIn?: boolean;
  webhookUrl?: string | null;
}
