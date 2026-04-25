import { Search, Mail, BookOpen, MessageCircle, Keyboard, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const faqs = [
  { q: 'How does AI screening work?', a: 'Our AI parses each candidate resume, extracts skills and experience, then scores them against your job requirements using a proprietary matching algorithm.' },
  { q: 'Can I customize the AI scoring?', a: 'Yes. On the Pro plan you can adjust skill weighting, experience requirements, and add custom evaluation criteria.' },
  { q: 'What file formats are supported?', a: 'We support PDF, DOCX, CSV, and JSON for resume uploads. Maximum file size is 10MB per resume.' },
  { q: 'How accurate is the AI matching?', a: 'Our model achieves 94% agreement with human recruiters in blind tests across 12,000+ hiring decisions.' },
  { q: 'Is my data secure?', a: 'All data is encrypted at rest and in transit. We are SOC 2 Type II certified and GDPR compliant.' },
  { q: 'How do I invite my team?', a: 'Go to Settings → Team and click "Invite member". You can assign roles like Recruiter or Hiring Manager.' },
];

const shortcuts = [
  { keys: ['⌘', 'K'], action: 'Open command palette' },
  { keys: ['G', 'D'], action: 'Go to Dashboard' },
  { keys: ['G', 'J'], action: 'Go to Jobs' },
  { keys: ['G', 'C'], action: 'Go to Candidates' },
  { keys: ['N'], action: 'New job' },
  { keys: ['?'], action: 'Show shortcuts' },
];

export default function Help() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in-up">
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-2">Support</span>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
          Help <span className="text-white/20">Center.</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-3">Find answers or reach the team</p>
      </div>

      {/* Search */}
      <div className="relative animate-fade-in-up">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
        <Input placeholder="Search help articles..." className="pl-12 h-14 bg-white/[0.02] border-white/5 text-white placeholder:text-white/20 rounded-2xl text-sm focus:border-white/15 transition-all" />
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        {[
          { icon: BookOpen, title: 'Documentation', text: 'Complete guides & API reference' },
          { icon: MessageCircle, title: 'Live Chat', text: 'Chat with the support team' },
          { icon: Mail, title: 'Email', text: 'support@umurava.africa' },
        ].map((c, i) => (
          <button
            key={c.title}
            className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-left hover:bg-white/[0.05] hover:border-white/15 transition-all duration-200 group"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
              <c.icon className="h-4.5 w-4.5 text-white/40" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white mb-1">{c.title}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/25">{c.text}</p>
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '160ms' }}>
        <div className="px-6 pt-6 pb-4 border-b border-white/5">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Frequently Asked</p>
        </div>
        {faqs.map((f, i) => (
          <div key={i} className={cn('border-b border-white/5 last:border-0')}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.03] transition-colors group"
            >
              <span className="text-[11px] font-bold text-white/60 group-hover:text-white/80 transition-colors pr-4">{f.q}</span>
              <ChevronDown className={cn('h-4 w-4 text-white/20 shrink-0 transition-transform duration-200', openFaq === i && 'rotate-180')} />
            </button>
            {openFaq === i && (
              <div className="px-6 pb-4">
                <p className="text-[11px] text-white/40 leading-relaxed font-medium">{f.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '240ms' }}>
        <div className="px-6 pt-6 pb-4 border-b border-white/5 flex items-center gap-2">
          <Keyboard className="h-3.5 w-3.5 text-white/20" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Keyboard Shortcuts</p>
        </div>
        <div className="divide-y divide-white/5">
          {shortcuts.map(s => (
            <div key={s.action} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
              <span className="text-[10px] font-bold text-white/40">{s.action}</span>
              <div className="flex gap-1">
                {s.keys.map(k => (
                  <kbd key={k} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-white/30 font-mono">{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
