// auth service
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { users } from "../../db/schema/users";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.utils";
import { RegisterInput, LoginInput } from "./auth.schema";

export const authService = {

  // ── Register ──────────────────────────────────────────────────────────────
  async register(input: RegisterInput) {
    // 1. Check if email already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("Email already registered");
    }

    // 2. Hash password — never store plain text
    const hashedPassword = await bcrypt.hash(input.password, 12);

    // 3. Insert new user
    const [newUser] = await db
      .insert(users)
      .values({
        email:    input.email,
        password: hashedPassword,
        fullName: input.fullName,
      })
      .returning({ id: users.id, email: users.email, fullName: users.fullName });

    // 4. Return tokens immediately — user is logged in after register
    return {
      user:         newUser,
      accessToken:  signAccessToken(newUser.id),
      refreshToken: signRefreshToken(newUser.id),
    };
  },

  // ── Login ─────────────────────────────────────────────────────────────────
  async login(input: LoginInput) {
    // 1. Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (!user) {
      throw new Error("Invalid email or password"); // vague on purpose — security
    }

    // 2. Compare password with hash
    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    // 3. Return tokens
    return {
      user:         { id: user.id, email: user.email, fullName: user.fullName },
      accessToken:  signAccessToken(user.id),
      refreshToken: signRefreshToken(user.id),
    };
  },

  // ── Refresh Token ──────────────────────────────────────────────────────────
  async refresh(refreshToken: string) {
    // Verify the refresh token and issue a new access token
    const payload = verifyRefreshToken(refreshToken);

    return {
      accessToken: signAccessToken(payload.userId),
    };
  },
};