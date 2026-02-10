export interface JwtPayload {
  exp: number;
  iat?: number;
  [key: string]: unknown;
}

export interface AuthRolePayload {
  type?: string | null;
  name?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  confirmed?: boolean;
  blocked?: boolean;
  accountStatus?: AccountStatus;
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

export interface AuthUserPayload {
  id?: string | number;
  email?: string;
  roles?: string[] | null;
  role?: AuthRolePayload | string | null;
  confirmed?: boolean;
  blocked?: boolean;
  accountStatus?: AccountStatus;
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
  user: AuthUserPayload;
}

export interface RegisterPendingResponse {
  user: AuthUserPayload;
}

export type RegisterResponse = AuthResponse | RegisterPendingResponse;
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

export type AlertSeverityPreference = 'info' | 'success' | 'warning' | 'critical';
export type AlertSourcePreference = 'saved-search' | 'system';
export type AlertFrequencyPreference = 'instant' | 'daily-digest';

export interface UserNotificationChannels {
  inApp?: boolean;
  email?: boolean;
  webhook?: boolean;
}

export interface UserNotificationFilters {
  severities?: AlertSeverityPreference[];
  sources?: AlertSourcePreference[];
}

export interface UserNotificationQuietHours {
  enabled?: boolean;
  start?: string | null;
  end?: string | null;
  timezone?: string | null;
}

export interface UserNotificationPreferences {
  emailOptIn?: boolean;
  webhookUrl?: string | null;
  channels?: UserNotificationChannels | null;
  filters?: UserNotificationFilters | null;
  frequency?: AlertFrequencyPreference | null;
  quietHours?: UserNotificationQuietHours | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}

export interface EmailChangePayload {
  currentPassword: string;
  email: string;
}

export interface EmailChangeResponse {
  email: string;
  sent: boolean;
  accountStatus: AccountStatus;
}

export type AccountStatus = 'active' | 'emailNotConfirmed' | 'disabled';
