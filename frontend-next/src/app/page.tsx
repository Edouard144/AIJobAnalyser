'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crosshair, Target, BarChart3, MessageSquare } from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();
  const router = useRouter();

  const features = [
    { icon: Target, title: t('landing.feature1_title'), desc: t('landing.feature1_desc') },
    { icon: BarChart3, title: t('landing.feature2_title'), desc: t('landing.feature2_desc') },
    { icon: MessageSquare, title: t('landing.feature3_title'), desc: t('landing.feature3_desc') },
  ];

  return (
    <div className="min-h-screen pt-16">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <Crosshair className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold text-foreground">Scout</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
            {t('landing.headline')}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('landing.subheadline')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/register')}
              className="px-8 py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold text-base hover:opacity-90 transition-opacity btn-press"
            >
              {t('landing.cta_start')}
            </button>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3.5 border border-border rounded-lg font-semibold text-base text-foreground hover:bg-accent transition-colors btn-press"
            >
              {t('landing.cta_how')}
            </button>
          </div>
        </motion.div>
      </section>

      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-card border border-border rounded-xl p-8 shadow-card"
            >
              <f.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}