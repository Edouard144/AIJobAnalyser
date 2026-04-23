// billing service
import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { users } from "../../db/schema/users";

const PLAN_MAP: Record<string, string> = {
  starter: 'free',
  free: 'free',
  pro: 'pro',
  enterprise: 'enterprise',
};

const PLANS = {
  free: { screeningsLimit: 10, name: "Free" },
  pro: { screeningsLimit: 100, name: "Pro" },
  enterprise: { screeningsLimit: Infinity, name: "Enterprise" }
};

export const billingService = {
  
  // Get billing info
  async getBilling(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return null;
    
    const planInfo = PLANS[user.plan as keyof typeof PLANS] || PLANS.free;
    const usageCount = parseInt(user.usageCount || "0");
    
    // Calculate renewal date (30 days from billing cycle start)
    const billingCycleStart = user.billingCycleStart || new Date();
    const renewalDate = new Date(billingCycleStart);
    renewalDate.setMonth(renewalDate.getMonth() + 1);
    
    return {
      plan: user.plan || "free",
      planName: planInfo.name,
      screeningsUsed: usageCount,
      screeningsLimit: planInfo.screeningsLimit,
      renewalDate: renewalDate.toISOString(),
      canUpgrade: user.plan !== "enterprise"
    };
  },
  
  // Upgrade plan
  async upgrade(userId: string, newPlan: string) {
    const planValue = PLAN_MAP[newPlan] || newPlan;
    if (!PLANS[planValue as keyof typeof PLANS]) {
      throw new Error("Invalid plan");
    }
    
    const [updated] = await db
      .update(users)
      .set({ 
        plan: planValue,
        billingCycleStart: new Date(),
        usageCount: "0"
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updated) throw new Error("User not found");
    return { plan: planValue, upgradeSuccess: true };
  },
  
  // Increment usage
  async incrementUsage(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const currentCount = parseInt(user?.usageCount || "0");
    
    await db
      .update(users)
      .set({ usageCount: String(currentCount + 1) })
      .where(eq(users.id, userId));
  },
  
  // Check if can screen
  async canScreen(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const planInfo = PLANS[user?.plan as keyof typeof PLANS] || PLANS.free;
    const usageCount = parseInt(user?.usageCount || "0");
    
    return usageCount < planInfo.screeningsLimit;
  },

  // Get invoices
  async getInvoices(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return [];

    const planName = PLANS[user.plan as keyof typeof PLANS]?.name || "Free";
    const planPrice = user.plan === "pro" ? 30 : user.plan === "enterprise" ? 99 : 0;
    const billingStart = user.billingCycleStart || new Date();

    return [
      {
        id: `inv_${Date.now()}`,
        description: `${planName} Plan - AIRECRUIT`,
        amount: planPrice,
        status: "paid",
        date: billingStart.toISOString(),
        createdAt: billingStart.toISOString(),
      },
      {
        id: `inv_${Date.now() - 2592000000}`,
        description: `${planName} Plan - AIRECRUIT`,
        amount: planPrice,
        status: "paid",
        date: new Date(billingStart.getTime() - 2592000000).toISOString(),
        createdAt: new Date(billingStart.getTime() - 2592000000).toISOString(),
      },
    ].filter(inv => inv.amount > 0);
  }
};