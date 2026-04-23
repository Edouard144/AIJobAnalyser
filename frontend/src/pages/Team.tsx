import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { teamApi } from '@/lib/api';
import { toast } from 'sonner';

export default function Team() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('recruiter');

  useEffect(() => {
    teamApi.getMembers()
      .then((m: any) => setMembers(m?.members || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      await teamApi.invite(inviteEmail, inviteRole);
      toast.success('Invitation sent!');
      setInviteEmail('');
      const m: any = await teamApi.getMembers();
      setMembers(m?.members || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Team</h1>
          <p className="text-muted-foreground mt-1">{members.length} members in your workspace</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="email@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-48" />
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="h-10 px-2 rounded-lg bg-muted border text-sm">
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <Button onClick={handleInvite} className="gap-2 bg-gradient-primary glow-primary"><Plus className="h-4 w-4" />Invite</Button>
        </div>
      </div>

      <div className="glass rounded-2xl divide-y divide-border overflow-hidden">
        {members.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No team members yet</div>
        ) : members.map((m: any, i: number) => (
          <div key={m.id || m.email} className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="h-11 w-11 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
              {(m.fullName || m.name || m.email || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{m.fullName || m.name || m.email}</p>
              <p className="text-sm text-muted-foreground truncate">{m.email}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-muted capitalize">{m.role || 'member'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}