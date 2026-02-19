export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type AuthResponse = {
  accessToken: string;
  expiresAt: string; // ISO 8601 datetime string
  refreshToken: string;
};

export type MessageResponse = {
  message: string;
};

export type LoginRequest = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterRequest = {
  email: string;
  username: string;
  password: string;
};

export type LogoutRequest = {
  refreshToken: string;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  token: string;
  newPassword: string;
};

export type ConfirmEmailRequest = {
  email: string;
  token: string;
};

export type ResendVerificationRequest = {
  email: string;
};
