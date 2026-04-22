// activity service
import { eq, desc } from "drizzle-orm";
import { db } from "../../config/db";
import { activityLogs } from "../../db/schema/activity";

export const activityService = {
  
  // Log an activity
  async log(userId: string, action: string, target: string, details?: any) {
    const [log] = await db
      .insert(activityLogs)
      .values({ userId, action, target, details: details || null })
      .returning();
    return log;
  },

  // Get activities for a user (paginated)
  async getByUser(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    const [countResult] = await db
      .select({ count: activityLogs.id })
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId));
    
    const total = Number(countResult?.count) || 0;
    
    const logs = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);
    
    return { logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  // Get all activities (admin)
  async getAll(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    const [countResult] = await db
      .select({ count: activityLogs.id })
      .from(activityLogs);
    
    const total = Number(countResult?.count) || 0;
    
    const logs = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);
    
    return { logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
};