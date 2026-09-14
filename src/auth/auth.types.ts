export interface JwtPayload {
  sub: number;
  email: string;
  jti: string;
  exp?: number;
}

export interface AuthenticatedUser {
  email: string;
  token: string;
  username: string;
  bio: string;
  image: string | null;
}

export interface UserResponse {
  user: AuthenticatedUser;
}
