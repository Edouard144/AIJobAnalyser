import { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { aiChatApi, jobsApi, activityApi } from '@/lib/api';

type Msg = { id: number; from: 'user' | 'ai'; text: string; timestamp?: string };

const SUGGESTIONS = [
  'Who is the best candidate for the Backend role?',
  'How many candidates were screened this week?',
  'Show me top 3 product designers',
];

const initialMessage: Msg = { id: 1, from: 'ai', text: "Hi! I'm your AI hiring assistant. Ask me anything about your candidates or jobs." };

export const AIChatBubble = ({ selectedJobId }: { selectedJobId?: string }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([initialMessage]);
  const [typing, setTyping] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | undefined>(selectedJobId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedJobId) setActiveJobId(selectedJobId);
  }, [selectedJobId]);

  useEffect(() => {
    if (open && activeJobId) {
      aiChatApi.getHistory(activeJobId)
        .then((history: any) => {
          if (history && history.length > 0) {
            const messages: Msg[] = history.map((h: any, i: number) => ({
              id: Date.now() + i,
              from: h.role === 'user' ? 'user' : 'ai',
              text: h.content || h.message || '',
              timestamp: h.timestamp || h.createdAt,
            }));
            if (messages.length > 0) setMsgs(messages);
          }
        })
        .catch(() => {});
    }
  }, [open, activeJobId]);

  useEffect(() => {
    jobsApi.getAll()
      .then((res: any) => {
        const jobsArray = Array.isArray(res) ? res : (res?.data || []);
        setJobs(jobsArray);
        if (!activeJobId && jobsArray.length > 0) setActiveJobId(jobsArray[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { id: Date.now(), from: 'user', text, timestamp: new Date().toISOString() };
    setMsgs(m => [...m, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const response: any = await aiChatApi.chat(text, activeJobId);
      const reply: Msg = {
        id: Date.now() + 1,
        from: 'ai',
        text: response?.message || response?.text || response || "I'm sorry, I couldn't process that request.",
        timestamp: new Date().toISOString(),
      };
      setMsgs(m => [...m, reply]);

      activityApi.create('ai_chat', activeJobId || 'global', `Asked AI: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`).catch(() => {});
    } catch (err: any) {
      const errorMsg: Msg = {
        id: Date.now() + 1,
        from: 'ai',
        text: err.message || "Sorry, I couldn't process that request. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMsgs(m => [...m, errorMsg]);
    } finally {
      setTyping(false);
    }
  };

  const clearChat = () => setMsgs([initialMessage]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-primary glow-primary flex items-center justify-center transition-all hover:scale-110 animate-glow-pulse',
          open && 'scale-0 opacity-0 pointer-events-none'
        )}
      >
        <Sparkles className="h-6 w-6 text-primary-foreground" />
      </button>

      <div
        className={cn(
          'fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] h-[540px] max-h-[calc(100vh-3rem)] glass rounded-2xl shadow-elegant flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right',
          open ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">AI Assistant</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat"><Trash2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-border flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Talking about:</span>
          <select
            value={activeJobId || ''}
            onChange={(e) => setActiveJobId(e.target.value || undefined)}
            className="text-xs bg-muted border-none rounded px-2 py-1 flex-1"
          >
            <option value="">All jobs</option>
            {jobs.map((j: any) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.map(m => (
            <div key={m.id} className={cn('flex animate-fade-in-up', m.from === 'user' && 'justify-end')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                  m.from === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex animate-fade-in">
              <div className="bg-muted rounded-2xl px-4 py-3 flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          {msgs.length === 1 && !typing && (
            <div className="space-y-2 pt-2">
              <p className="text-xs text-muted-foreground px-1">Try asking:</p>
              {SUGGESTIONS.map(s => (
                <button
                  key={s} onClick={() => send(s)}
                  className="w-full text-left text-xs p-2.5 rounded-lg bg-accent/40 hover:bg-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="p-3 border-t border-border flex gap-2"
        >
          <Input
            value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..." className="rounded-full"
          />
          <Button type="submit" size="icon" className="rounded-full shrink-0 bg-gradient-primary">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  );
};