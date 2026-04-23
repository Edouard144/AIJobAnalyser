import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard, Briefcase, Users, ScanSearch, BarChart3, UserCircle,
  Plus, Upload, Sparkles,
} from 'lucide-react';
import { jobsApi } from '@/lib/api';

export const CommandPalette = ({ open, setOpen }: { open: boolean; setOpen: (b: boolean) => void }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  useEffect(() => {
    if (open && jobs.length === 0) {
      jobsApi.getAll()
        .then((res: any) => {
          const data = Array.isArray(res) ? res : (res?.data || []);
          setJobs(data.slice(0, 4));
        })
        .catch(() => {});
    }
  }, [open]);

  const go = (path: string) => { navigate(path); setOpen(false); };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command, job, or candidate..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => go('/jobs')}><Plus className="mr-2 h-4 w-4" />Post new job</CommandItem>
          <CommandItem onSelect={() => go('/candidates')}><Upload className="mr-2 h-4 w-4" />Upload candidates</CommandItem>
          <CommandItem onSelect={() => go('/screenings')}><Sparkles className="mr-2 h-4 w-4" />Run AI screening</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go('/dashboard')}><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</CommandItem>
          <CommandItem onSelect={() => go('/jobs')}><Briefcase className="mr-2 h-4 w-4" />Jobs</CommandItem>
          <CommandItem onSelect={() => go('/candidates')}><Users className="mr-2 h-4 w-4" />Candidates</CommandItem>
          <CommandItem onSelect={() => go('/screenings')}><ScanSearch className="mr-2 h-4 w-4" />Screenings</CommandItem>
          <CommandItem onSelect={() => go('/reports')}><BarChart3 className="mr-2 h-4 w-4" />Reports</CommandItem>
          <CommandItem onSelect={() => go('/account')}><UserCircle className="mr-2 h-4 w-4" />Account</CommandItem>
        </CommandGroup>
        {jobs.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Your Jobs">
              {jobs.map((j: any) => (
                <CommandItem key={j.id} onSelect={() => go(`/jobs/${j.id}`)}>
                  <Briefcase className="mr-2 h-4 w-4" />{j.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};