// sign/verify tokens
import jwt from "jsonwebtoken";
import { env } from "../config/env";

// Access token — short lived (15 minutes)
// Used on every protected request
export const signAccessToken = (userId: string) => {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
};

// Refresh token — long lived (7 days)
// Used only to get a new access token when it expires
export const signRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
};