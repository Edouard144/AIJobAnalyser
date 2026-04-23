// auth service
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "../../config/db";
import { users } from "../../db/schema/users";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.utils";
import { RegisterInput, LoginInput } from "./auth.schema";
import { env } from "../../config/env";
import nodemailer from "nodemailer";

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP email using Gmail SMTP
const sendOTPEmail = async (email: string, otp: string) => {
  // Remove spaces from app password
  const smtpPass = (env.SMTP_PASS || '').replace(/\s+/g, '');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.SMTP_USER || 'airecruit@gmail.com',
      pass: smtpPass,
    },
  });

  const mailOptions = {
    from: `"AIRECRUIT" <${env.SMTP_USER || 'airecruit@gmail.com'}>`,
    to: email,
    subject: 'Your AIRECRUIT Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">AIRECRUIT</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">Your Verification Code</h2>
          <p style="color: #666; font-size: 16px;">Enter this code to verify your email:</p>
          <div style="background: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; border-radius: 8px; border: 2px solid #667eea;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
    text: `Your AIRECRUIT verification code is: ${otp}. This code expires in 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP sent to ${email}`);
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    console.log(`📧 OTP for ${email}: ${otp}`);
  }
};

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
    // Combine names for backward compatibility with schema
    const fullName = input.fullName || `${input.firstName || ''} ${input.lastName || ''}`.trim() || undefined;

    const [newUser] = await db
      .insert(users)
      .values({
        email:    input.email,
        password: hashedPassword,
        fullName,
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

  // ── Send OTP ───────────────────────────────────────────────────────────────
  async sendOTP(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      throw new Error("Email not found");
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db
      .update(users)
      .set({ otpCode: otp, otpExpiresAt: expiresAt })
      .where(eq(users.id, user.id));

    await sendOTPEmail(email, otp);

    return { otpSent: true };
  },

  // ── Verify OTP ───────────────────────────────────────────────────────────────
  async verifyOTP(email: string, otp: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      throw new Error("Email not found");
    }

    // Check OTP matches and not expired
    if (user.otpCode !== otp) {
      throw new Error("Invalid OTP");
    }

    if (!user.otpExpiresAt || new Date() > new Date(user.otpExpiresAt)) {
      throw new Error("OTP expired");
    }

    // Mark email as verified and clear OTP
    await db
      .update(users)
      .set({ emailVerified: true, otpCode: null, otpExpiresAt: null })
      .where(eq(users.id, user.id));

    // Generate tokens for verified user
    return {
      user: { id: user.id, email: user.email, fullName: user.fullName, emailVerified: true },
      accessToken: signAccessToken(user.id),
      refreshToken: signRefreshToken(user.id),
      verified: true,
    };
  },

  // ── Update Profile (Language/Theme) ───────────────────────────────────────────
  async updateProfile(userId: string, data: { language?: string; theme?: string; onboardingCompleted?: boolean }) {
    const updateData: any = {};
    if (data.language) updateData.language = data.language;
    if (data.theme) updateData.theme = data.theme;
    if (data.onboardingCompleted !== undefined) updateData.onboardingCompleted = data.onboardingCompleted;

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    return updated;
  },

  // ── Get Full Profile ───────────────────────────────────────────────────────
  async getProfile(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      language: user.language,
      theme: user.theme,
      onboardingCompleted: user.onboardingCompleted,
      emailVerified: user.emailVerified,
      plan: user.plan,
      usageCount: user.usageCount,
    };
  },
};