'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Crosshair, Target, BarChart3, MessageSquare, 
  Upload, Search, Award, Shield, Lock, Clock,
  ArrowRight, CheckCircle2, Users, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Navbar from '@/components/Navbar';

export default function Landing() {
  const { t } = useTranslation();
  const router = useRouter();

  const steps = [
    {
      num: '01',
      title: 'Upload CSV',
      desc: 'Drag and drop your applicant file. We accept any CSV format.'
    },
    {
      num: '02', 
      title: 'Define Ideal',
      desc: 'Set job requirements: skills, experience, education level.'
    },
    {
      num: '03',
      title: 'Get Top 10',
      desc: 'Receive ranked candidates with clear reasoning.'
    }
  ];

  const comparison = [
    { old: 'Manual CTRL+F search', new: 'Context-aware AI ranking' },
    { old: 'Hours of biased skimming', new: '30-second analysis' },
    { old: 'Missing hidden gems', new: 'Data-driven Top 10' }
  ];

  const trustItems = [
    { icon: Lock, text: '256-bit encryption' },
    { icon: Shield, text: 'No training on your data' },
    { icon: Clock, text: 'Files deleted after processing' }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation - Use main Navbar with language toggle and dark mode */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">AI-Powered Candidate Screening</span>
            </motion.div>

            {/* Headline - Outcome focused */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
              Get your top 10 candidates in{' '}
              <span className="text-primary">30 seconds</span>,{' '}
              not 3 hours
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Upload any applicant CSV and let Scout rank every candidate with clear, transparent reasoning. 
              No black box — just data-driven decisions.
            </p>

            {/* Primary CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={() => router.push('/register')} 
                size="lg"
                className="group"
              >
                Analyze My First CSV Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                variant="ghost"
                size="lg"
              >
                See how it works
              </Button>
            </div>

            {/* Micro-trust under CTA */}
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • CSV processed securely • Free forever plan
            </p>
          </motion.div>
        </div>
      </section>

      {/* Product Visual - Simulated */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-xl overflow-hidden shadow-elevated"
          >
            {/* Mock header */}
            <div className="h-10 bg-muted/30 border-b border-border flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-400/70" />
              <div className="ml-4 text-xs text-muted-foreground font-medium">Scout - Frontend Developer Screening</div>
            </div>
            {/* Mock content - Before/After */}
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Before - Messy CSV */}
              <div className="p-6">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Your CSV (Unfiltered)</div>
                <div className="space-y-2 text-sm">
                  {['John Doe - React, Node', 'Jane Smith - Python ML', 'Bob Wilson - Java', 'Alice Chen - Fullstack', 'Mike Ross - Ruby'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/20">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">{i + 1}</div>
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground pt-2">+ 47 more rows...</div>
                </div>
              </div>
              {/* After - Ranked */}
              <div className="p-6 bg-primary/5">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-4">Scout Top 10</div>
                <div className="space-y-2">
                  {[
                    { name: 'Alice Chen', score: 94, reason: '5yrs React + Node' },
                    { name: 'John Doe', score: 87, reason: '3yrs Fullstack' },
                    { name: 'Jane Smith', score: 82, reason: 'ML + Python' }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded bg-card border border-border/50"
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-muted'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.reason}</div>
                      </div>
                      <div className="text-sm font-bold text-primary">{item.score}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section id="how-it-works" className="py-24 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">How Scout Works</h2>
            <p className="mt-3 text-muted-foreground">Three simple steps to your top candidates</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative bg-card border border-border rounded-xl p-8 shadow-card"
              >
                <div className="text-6xl font-bold text-primary/10 absolute top-4 right-6">{step.num}</div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    {i === 0 && <Upload className="h-6 w-6 text-primary" />}
                    {i === 1 && <Search className="h-6 w-6 text-primary" />}
                    {i === 2 && <Award className="h-6 w-6 text-primary" />}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Why Scout Wins</h2>
            <p className="mt-3 text-muted-foreground">The old way vs the Scout way</p>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">The Old Way</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-primary">The Scout Way</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-4 px-6 text-sm text-muted-foreground">{row.old}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{row.new}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground">Your data stays secure</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 justify-center">
                <item.icon className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-8 items-center opacity-60">
            <div className="text-2xl font-bold text-muted-foreground">500+ Candidates</div>
            <div className="text-2xl font-bold text-muted-foreground">50+ Companies</div>
            <div className="text-2xl font-bold text-muted-foreground">1000+ Hours Saved</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-10 shadow-elevated"
          >
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-3">Ready to find your best candidates?</h2>
            <p className="text-muted-foreground mb-8">Join recruiters who've already found their top talent.</p>
            <Button onClick={() => router.push('/register')} size="lg" className="w-full sm:w-auto">
              Start Screening Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Scout</span>
          </div>
          <p className="text-sm text-muted-foreground">Built for the Umurava AI Hackathon</p>
        </div>
      </footer>
    </div>
  );
}