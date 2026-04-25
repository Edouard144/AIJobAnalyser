import { Link } from 'react-router-dom';
import {
  Menu, Search, ArrowRight, Zap, ShieldCheck, Users, Brain, BarChart3, Globe,
  Check, X, Play, ChevronRight, FileSearch, Target, Clock, TrendingUp, Plus, Minus, MapPin, Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { GradientAvatar } from '@/components/Avatar';
import { COMPANY_LOGOS } from '@/components/CompanyLogo';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const features = [
  { icon: FileSearch, title: 'Smart résumé screening', desc: 'Identify and rank top-tier talent in seconds with precision skill matching.' },
  { icon: ShieldCheck, title: 'Auditable scoring', desc: 'Every 0–100 score is backed by transparent reasoning and hiring gap analysis.' },
  { icon: Zap, title: 'Recruitment intelligence', desc: 'Query your pipeline in plain language: "Senior engineers with experience in African markets."' },
  { icon: BarChart3, title: 'Strategic analytics', desc: 'Deep insights into pipeline health, quality of hire, and operational efficiency.' },
  { icon: Target, title: 'Bias-free protocols', desc: 'Ensure fairness with blind screening and auditable decision-making workflows.' },
  { icon: Globe, title: 'True multilingualism', desc: 'Native parsing of English, Kinyarwanda, Kiswahili, and French with cultural context.' },
];

const steps = [
  { n: '01', title: 'Post a job', desc: 'Create an opening in seconds with AI-suggested requirements.' },
  { n: '02', title: 'Upload candidates', desc: 'Drag & drop résumés — PDF, CSV, or JSON. Bulk upload supported.' },
  { n: '03', title: 'Automated ranking', desc: 'Our intelligence engine ranks every candidate based on your specific criteria.' },
  { n: '04', title: 'Hire the best', desc: 'Review the leaderboard, approve top picks, and schedule interviews.' },
];

const stats = [
  { value: 2400, suffix: '+', label: 'Recruiters' },
  { value: 180, suffix: 'k', label: 'Résumés screened' },
  { value: 92, suffix: '%', label: 'Time saved' },
  { value: 4.9, suffix: '/5', label: 'User rating', float: true },
];

const faqs = [
  {
    q: 'Will the AI replace my judgement?',
    a: 'No — and that is our core principle. UMURAVA provides precision ranking and depth, but the final decision always belongs to your team. We give you the data to make better hires, faster.',
  },
  {
    q: 'How is this different from our existing ATS?',
    a: 'Most ATSes are static databases. They store data, they don\'t interpret it. UMURAVA actively reads, scores, and interprets résumés — ensuring your recruiters focus only on high-potential talent.',
  },
  {
    q: 'What about bias?',
    a: 'Every score is auditable: you see the exact reasoning. We strip names, photos, and demographic signals from the screening pass by default, and we publish a quarterly fairness report.',
  },
  {
    q: 'Do you support languages other than English?',
    a: 'Yes — English, French, Kinyarwanda, and Kiswahili at launch, with Arabic and Portuguese coming next.',
  },
];

export default function Landing() {
   const [scrollY, setScrollY] = useState(0);
   const [activeFaq, setActiveFaq] = useState<number | null>(null);

   useEffect(() => {
     const handleScroll = () => setScrollY(window.scrollY);
     window.addEventListener('scroll', handleScroll, { passive: true });
     return () => window.removeEventListener('scroll', handleScroll);
   }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-foreground selection:bg-white selection:text-black flex font-sans overflow-x-hidden">
      
      {/* ========== LEFT SIDEBAR ========== */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 border-r border-white/5 flex flex-col items-center py-8 shrink-0 bg-[#080808] z-50">
        <div className="flex flex-col items-center">
          <Menu className="h-6 w-6 text-white/40 cursor-pointer hover:text-white transition-colors" />
        </div>

        <div className="flex-1 flex flex-col justify-end gap-8 pb-10">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1 ml-20 flex flex-col relative w-full">
        
        {/* ========== HEADER ========== */}
        <header className="absolute top-0 left-0 right-0 z-40 px-12 h-24 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto">
            <Link to="/" className="text-2xl font-black tracking-tighter uppercase">
              Umu<span className="text-white/40">rava</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.25em] pointer-events-auto">
            <a href="#" className="text-white border-b border-white pb-1">Home</a>
            <a href="#features" className="text-white/40 hover:text-white transition-colors">Talent</a>
            <a href="#how" className="text-white/40 hover:text-white transition-colors">Process</a>
            <a href="#pricing" className="text-white/40 hover:text-white transition-colors">Pricing</a>
            <Search className="h-4 w-4 text-white/40 cursor-pointer" />
          </nav>
        </header>

        {/* ========== HERO SECTION ========== */}
        <section className="relative h-screen flex flex-col justify-center px-16 border-b border-white/5">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img 
              src="/images/hero-moody.png" 
              alt="Moody Professional" 
              className="w-full h-full object-cover grayscale brightness-[0.5] scale-105"
              style={{ transform: `translate3d(0, ${scrollY * 0.1}px, 1) scale(1.05)` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-transparent to-transparent opacity-40" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 items-center w-full max-w-7xl mx-auto">
            {/* Teaser Left */}
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black tracking-[0.4em] text-white/20">/ 01</span>
                <div className="h-[1px] w-40 bg-white/10" />
              </div>
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90">Enterprise Protocol</h4>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 leading-relaxed">
                  Verified Global Network<br />
                  Strategic Precision Match<br />
                  Next-Gen Talent Engine
                </p>
              </div>
            </div>

            {/* Title Right */}
            <div className="lg:text-right space-y-10 animate-fade-in delay-step-2 mt-20 lg:mt-0">
              <h1 className="text-6xl md:text-7xl lg:text-[110px] font-black leading-[0.85] tracking-tighter">
                Hire with<br />
                <span className="text-white">Absolute Clarity.</span>
              </h1>
              <p className="text-sm md:text-base text-white/40 max-w-lg lg:ml-auto leading-relaxed font-medium">
                Introducing <span className="text-white italic">Umurava</span>, a cinematic hiring experience designed for 
                <span className="text-white underline decoration-white/20 underline-offset-8 decoration-1 mx-1.5">high-performing teams</span> 
                seeking absolute speed and clarity.
              </p>
              <div className="flex justify-end gap-6 pt-4">
                <Link to="/register">
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white border-b-2 border-white/20 pb-2 hover:border-white transition-all cursor-pointer">
                    Start Hiring Now
                  </span>
                </Link>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors cursor-pointer">
                  Watch Film
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Info Bar — Glassy */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-white/[0.02] backdrop-blur-3xl border-t border-white/5 z-20 flex items-center px-24">
            <div className="flex-1 grid grid-cols-3 gap-16 max-w-7xl mx-auto">
              {/* Event Card */}
              <div className="space-y-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Upcoming</span>
                <div className="space-y-2">
                  <p className="text-[13px] font-bold text-white leading-tight">Human Capital Summit @ Virtual Hub</p>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Oct 24 / 2026</p>
                </div>
              </div>

              {/* Visual Divider */}
              <div className="flex items-center gap-8 group">
                <div className="h-28 w-24 bg-white/5 overflow-hidden relative grayscale border border-white/5 transition-all duration-500 group-hover:grayscale-0">
                  <img src="/images/hero-2.png" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-2">
                  <p className="text-[12px] font-bold text-white italic tracking-tight">Precision Network</p>
                  <p className="text-[10px] font-medium text-white/30 max-w-[160px] leading-relaxed">
                    Connecting the top 1% of African engineers with unified global standards.
                  </p>
                </div>
              </div>

              {/* News Card */}
              <div className="space-y-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Bulletin</span>
                <div className="space-y-4">
                  <p className="text-[13px] font-bold text-white leading-snug">The future of technical screening in distributed markets.</p>
                  <a href="#" className="inline-block text-[11px] font-black uppercase tracking-[0.3em] text-white border-b border-white/20 pb-1 hover:border-white transition-colors">
                    Read Intelligence
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== LOGOS — Minimal Monochrome ========== */}
        <section className="py-24 px-16 bg-[#080808]">
          <div className="max-w-7xl mx-auto">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center text-white/20 mb-16">
              Empowering Market Leaders
            </p>
            <div className="flex flex-wrap items-center justify-between gap-12 opacity-30 grayscale hover:opacity-100 transition-all duration-1000">
              {COMPANY_LOGOS.map((Logo, i) => (
                <Logo key={i} className="h-6 w-auto hover:text-white transition-colors" />
              ))}
            </div>
          </div>
        </section>

        {/* ========== STATS — Architectural ========== */}
        <section className="py-32 px-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[160px] translate-x-1/2 -translate-y-1/2" />
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
            {stats.map((s, i) => (
              <div key={i} className="space-y-4">
                <h3 className="text-6xl md:text-7xl font-black tracking-tighter text-white tabular-nums">
                  {s.float ? s.value.toFixed(1) : <AnimatedCounter value={s.value} />}{s.suffix}
                </h3>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========== FEATURES — Obsidian Glass ========== */}
        <section id="features" className="py-40 px-16 relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-24 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="max-w-2xl">
                <span className="inline-block text-[11px] font-black uppercase tracking-[0.4em] text-white/40 mb-6">Capabilities</span>
                <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] text-white">
                  Designed for <br /><span className="text-white/20">The Absolute Best.</span>
                </h2>
              </div>
              <p className="text-lg text-white/40 max-w-sm leading-relaxed mb-4">
                A unified hiring stack that moves at the speed of your ambition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 overflow-hidden">
              {features.map((f, i) => (
                <div key={i} className="bg-[#080808] p-12 space-y-8 hover:bg-white/[0.02] transition-colors border-white/5 group">
                  <div className="h-12 w-12 flex items-center justify-center bg-white/5 text-white/40 group-hover:text-white transition-colors">
                    <f.icon className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white tracking-tight">{f.title}</h3>
                    <p className="text-sm text-white/30 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== PROCESS — Clean & Minimal ========== */}
        <section id="how" className="py-40 px-16 bg-[#0c0c0c]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-32">
              <span className="inline-block text-[11px] font-black uppercase tracking-[0.4em] text-white/30 mb-6">Workflow</span>
              <h2 className="text-6xl font-black tracking-tighter text-white">Seamless Integration</h2>
            </div>

            <div className="grid md:grid-cols-4 gap-12">
              {steps.map((s, i) => (
                <div key={i} className="space-y-8 relative">
                  <span className="text-5xl font-black text-white/5 italic">{s.n}</span>
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-white">{s.title}</h4>
                    <p className="text-sm text-white/30 leading-relaxed">{s.desc}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-[25px] -right-6 w-12 h-[1px] bg-white/5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== PRICING — Obsidian Glass ========== */}
        <section id="pricing" className="py-60 px-16 relative overflow-hidden bg-[#080808]">
          <div className="max-w-7xl mx-auto relative z-10">
            {/* Background Title */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none">
              <h2 className="text-[300px] font-black tracking-tighter leading-none text-white whitespace-nowrap">Pricing</h2>
            </div>

            <div className="text-center mb-32">
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30 mb-6 block">Transparent Value</span>
              <h3 className="text-6xl font-black text-white tracking-tighter">Choose Your Velocity.</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {/* Free Plan */}
              <div className="group bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-12 flex flex-col hover:border-white/20 transition-all duration-700">
                <div className="mb-12">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Free Plan</p>
                  <h4 className="text-6xl font-black text-white tracking-tight">Free</h4>
                </div>
                <div className="space-y-6 flex-1 mb-16">
                  {['Screen up to 10 candidates', 'Basic skill matching', 'Standard email support', 'PDF report exports'].map((f, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                      <div className="h-6 w-6 rounded-full border border-white/10 flex items-center justify-center group-hover/item:border-white/40 transition-colors">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-bold text-white/30 group-hover/item:text-white/80 transition-colors">{f}</span>
                    </div>
                  ))}
                </div>
                <Button className="h-14 rounded-full bg-[#111] border border-white/5 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all">
                  Get Started
                </Button>
              </div>

              {/* Standard Plan (Highlighted) */}
              <div className="group bg-white/[0.04] backdrop-blur-3xl border-2 border-white/10 rounded-[2.5rem] p-12 flex flex-col transform lg:scale-105 shadow-[0_0_80px_rgba(255,255,255,0.05)] transition-all duration-700">
                <div className="mb-12">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-4">Standard Plan</p>
                  <div className="flex items-baseline gap-1">
                    <h4 className="text-6xl font-black text-white tracking-tight">$9.99</h4>
                    <span className="text-white/40 font-bold ml-1">/m</span>
                  </div>
                </div>
                <div className="space-y-6 flex-1 mb-16">
                  {['Unlimited transfers with priority', 'Comprehensive analytics', 'Advanced skill scoring', 'Priority email support', 'Cultural fit analysis'].map((f, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                      <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover/item:bg-white transition-all">
                        <Check className="h-3 w-3 text-white group-hover/item:text-black transition-colors" />
                      </div>
                      <span className="text-xs font-bold text-white/50 group-hover/item:text-white transition-colors">{f}</span>
                    </div>
                  ))}
                </div>
                <Button className="h-14 rounded-full bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-white/90 transition-all shadow-glow">
                  Get Started
                </Button>
              </div>

              {/* Pro Plan */}
              <div className="group bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-12 flex flex-col hover:border-white/20 transition-all duration-700">
                <div className="mb-12">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Pro Plan</p>
                  <div className="flex items-baseline gap-1">
                    <h4 className="text-6xl font-black text-white tracking-tight">$19.99</h4>
                    <span className="text-white/40 font-bold ml-1">/m</span>
                  </div>
                </div>
                <div className="space-y-6 flex-1 mb-16">
                  {['Dedicated account head', 'Full audit trails', 'Advanced API access', '24/7 priority support', 'Custom AI model tuning'].map((f, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                      <div className="h-6 w-6 rounded-full border border-white/10 flex items-center justify-center group-hover/item:border-white/40 transition-colors">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-bold text-white/30 group-hover/item:text-white/80 transition-colors">{f}</span>
                    </div>
                  ))}
                </div>
                <Button className="h-14 rounded-full bg-[#111] border border-white/5 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all">
                  Get Started
                </Button>
              </div>
            </div>

            {/* Billed Yearly Toggle */}
            <div className="flex justify-center items-center gap-4">
              <div className="w-12 h-6 bg-white/10 rounded-full flex items-center px-1 cursor-pointer">
                <div className="h-4 w-4 bg-white rounded-full translate-x-6 transition-transform" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">Billed Yearly</span>
            </div>
          </div>
        </section>

        {/* ========== FAQ — Minimalist Accordion ========== */}
        <section className="py-40 px-16">
          <div className="max-w-3xl mx-auto w-full">
            <div className="mb-20 text-center">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 mb-6 block font-sans">Common Queries</span>
              <h2 className="text-5xl font-black text-white tracking-tighter">Clarifications.</h2>
            </div>
            <div className="space-y-px border-y border-white/5">
              {faqs.map((faq, i) => (
                <div key={i} className="group border-b border-white/5 last:border-0 overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full py-10 flex items-center justify-between text-left group-hover:px-4 transition-all duration-500"
                  >
                    <span className="text-xl font-bold text-white/80 group-hover:text-white transition-colors">{faq.q}</span>
                    {activeFaq === i ? <Minus className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white/20" />}
                  </button>
                  <div className={`transition-all duration-700 ease-in-out ${activeFaq === i ? 'max-h-96 opacity-100 pb-10 px-4' : 'max-h-0 opacity-0 px-4'}`}>
                    <p className="text-white/40 leading-relaxed text-base max-w-2xl font-medium">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== FINAL CTA ========== */}
        <section className="py-60 px-16 bg-[#080808] relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-radial-at-c from-white/[0.03] to-transparent" />
          <div className="max-w-4xl mx-auto relative z-10 space-y-16">
            <h2 className="text-7xl md:text-[120px] font-black leading-[0.85] tracking-[calc(-0.04em)] text-white">
              Sovereign <br /> Hiring.
            </h2>
            <div className="flex flex-col items-center gap-8">
              <Link to="/register">
                <Button size="lg" className="PRESS h-20 px-16 bg-white text-black font-black text-xl hover:bg-white/90 transition-all">
                  Join the Network
                </Button>
              </Link>
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">
                Authorized Enterprises Only
              </p>
            </div>
          </div>
        </section>

        {/* ========== FOOTER ========== */}
        <footer className="py-20 px-16 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-4 text-white/20 text-[10px] font-black uppercase tracking-widest">
            <span>© 2026 Umurava Global</span>
            <div className="h-3 w-[1px] bg-white/20" />
            <a href="#" className="hover:text-white">Privacy Protocol</a>
          </div>
          <div className="flex gap-12 font-black text-[10px] uppercase tracking-[0.3em] text-white/40">
            <a href="#" className="hover:text-white transition-colors">Manifesto</a>
            <a href="#" className="hover:text-white transition-colors">Intelligence</a>
            <a href="#" className="hover:text-white transition-colors">Network</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
