// activity service
import { eq, desc } from "drizzle-orm";
import { db } from "../../config/db";
import { activityLogs } from "../../db/schema/activity";

const ACTION_DESCRIPTIONS: Record<string, (details: any) => string> = {
  job_created: (d) => `Created job "${d?.title || 'Untitled'}"`,
  job_updated: (d) => `Updated job "${d?.title || 'Untitled'}"`,
  job_deleted: (d) => `Deleted job "${d?.title || 'a job'}"`,
  candidates_uploaded: (d) => `Uploaded ${d?.count || 0} candidate${(d?.count || 0) === 1 ? '' : 's'}`,
  screening_completed: (d) => `Screened ${d?.candidatesCount || 0} candidate${(d?.candidatesCount || 0) === 1 ? '' : 's'}`,
  ai_chat: (d) => `Asked AI: "${(d?.question || '').slice(0, 60)}${(d?.question || '').length > 60 ? '...' : ''}"`,
  notification_read: () => `Read a notification`,
  profile_updated: () => `Updated profile settings`,
};

function buildDescription(action: string, details?: any): string {
  const fn = ACTION_DESCRIPTIONS[action];
  if (fn) return fn(details || {});
  return action.replace(/_/g, ' ');
}

export const activityService = {
  
  async log(userId: string, action: string, target: string, details?: any, description?: string) {
    const desc = description || buildDescription(action, details);
    const [log] = await db
      .insert(activityLogs)
      .values({ userId, action, target, description: desc, details: details || null })
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
    
    const data = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);
    
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  // Get all activities (admin)
  async getAll(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    const [countResult] = await db
      .select({ count: activityLogs.id })
      .from(activityLogs);
    
    const total = Number(countResult?.count) || 0;
    
    const data = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);
    
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
};