// billing service
import { eq, and } from "drizzle-orm";
import { db } from "../../config/db";
import { users } from "../../db/schema/users";

export const teamService = {
  
  // Get team members (users with same teamId)
  async getTeam(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const teamId = user?.teamId;
    
    if (!teamId) {
      // No team yet, return just this user
      return [{ ...user, role: user?.role || "admin" }];
    }
    
    const members = await db
      .select()
      .from(users)
      .where(eq(users.teamId, teamId));
    
    return members.map(m => ({
      ...m,
      role: m.role || "recruiter"
    }));
  },
  
  // Invite member (create pending user or send email)
  async invite(userId: string, email: string, role: string = "recruiter") {
    // For now, just return success - in production would send invite email
    return { inviteSent: true, email, role };
  },
  
  // Update member role
  async updateRole(memberId: string, newRole: string) {
    const [updated] = await db
      .update(users)
      .set({ role: newRole })
      .where(eq(users.id, memberId))
      .returning();
    
    return updated;
  },
  
  // Remove member
  async remove(memberId: string) {
    await db
      .delete(users)
      .where(eq(users.id, memberId));
    
    return { removed: true };
  }
};