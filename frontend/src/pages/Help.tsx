import { Search, Mail, BookOpen, MessageCircle, Keyboard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';

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
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">Help & Support</h1>
        <p className="text-muted-foreground mt-1">Find answers or reach out to our team</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search help articles..." className="pl-12 h-14 text-base rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: BookOpen, title: 'Documentation', text: 'Read our complete guides' },
          { icon: MessageCircle, title: 'Live chat', text: 'Chat with our support team' },
          { icon: Mail, title: 'Email us', text: 'support@airecruit.com' },
        ].map(c => (
          <button key={c.title} className="glass rounded-2xl p-5 text-left hover:scale-[1.02] hover:border-primary/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <c.icon className="h-5 w-5" />
            </div>
            <p className="font-semibold mb-1">{c.title}</p>
            <p className="text-xs text-muted-foreground">{c.text}</p>
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Frequently asked</h3>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Keyboard className="h-4 w-4" />Keyboard shortcuts</h3>
        <div className="space-y-2">
          {shortcuts.map(s => (
            <div key={s.action} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm">{s.action}</span>
              <div className="flex gap-1">
                {s.keys.map(k => (
                  <kbd key={k} className="px-2 py-1 rounded bg-muted text-xs font-mono">{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
