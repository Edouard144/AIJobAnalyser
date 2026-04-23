// notifications service
import { eq, desc, and } from "drizzle-orm";
import { db } from "../../config/db";
import { notifications } from "../../db/schema/notifications";

export const notificationsService = {
  
  // Create notification
  async create(userId: string, message: string, type: string, title?: string) {
    const [notif] = await db
      .insert(notifications)
      .values({ userId, message, type, title: title || null })
      .returning();
    return notif;
  },

  // Get notifications for user
  async getByUser(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    const [countResult] = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(eq(notifications.userId, userId));
    
    const total = Number(countResult?.count) || 0;
    
    const notifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get unread count
    const [unreadResult] = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    
    return { 
      data: notifs, 
      unreadCount: Number(unreadResult?.count) || 0,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } 
    };
  },

  // Mark as read
  async markAsRead(notifId: string, userId: string) {
    const [updated] = await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, notifId), eq(notifications.userId, userId)))
      .returning();
    return updated || null;
  },

  // Mark all as read
  async markAllAsRead(userId: string) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
    return { success: true };
  }
};