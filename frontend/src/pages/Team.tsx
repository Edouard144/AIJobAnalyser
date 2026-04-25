import { useState, useEffect } from 'react';
import { Plus, Loader2, Mail, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { teamApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-white/30" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-2">Workspace</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
            Team <span className="text-white/20">Members.</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-3">
            {members.length} active {members.length === 1 ? 'member' : 'members'}
          </p>
        </div>

        {/* Invite Row */}
        <div className="flex gap-2 items-center">
          <Input
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="w-52 h-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl text-sm focus:border-white/20 transition-all"
          />
          <select
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-[0.1em] focus:outline-none focus:border-white/20 transition-all"
          >
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <Button
            onClick={handleInvite}
            className="gap-2 h-10 bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl"
          >
            <Plus className="h-3.5 w-3.5" />Invite
          </Button>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden animate-fade-in-up">
        {members.length === 0 ? (
          <div className="py-20 text-center">
            <UserCircle2 className="h-8 w-8 text-white/10 mx-auto mb-4" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">No team members yet</p>
          </div>
        ) : members.map((m: any, i: number) => (
          <div
            key={m.id || m.email}
            className={cn(
              'flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors animate-fade-in-up',
              i !== members.length - 1 && 'border-b border-white/5'
            )}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white font-black text-sm shrink-0">
              {(m.fullName || m.name || m.email || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-white uppercase tracking-[0.05em] truncate">{m.fullName || m.name || m.email}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Mail className="h-2.5 w-2.5 text-white/20" />
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/25 truncate">{m.email}</p>
              </div>
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg bg-white/5 text-white/30">{m.role || 'member'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}