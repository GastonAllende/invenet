export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type AuthResponse = {
  accessToken: string;
  expiresInSeconds: number;
  refreshToken: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  username: string;
  password: string;
};

export type LogoutRequest = {
  refreshToken: string;
};
