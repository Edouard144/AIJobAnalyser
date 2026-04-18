import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useJobs } from '@/contexts/JobsContext';
import toast from 'react-hot-toast';

const educationLevels = ['any', 'highschool', 'bachelor', 'master', 'phd'];

export default function CreateJob() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addJob } = useJobs();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'open' | 'screening' | 'closed'>('open');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [experience, setExperience] = useState(0);
  const [education, setEducation] = useState('any');

  const steps = [t('job.step_basics'), t('job.step_requirements'), t('job.step_review')];

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
    }
    setSkillInput('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addJob({ title, description, location, status, skills, experience, education });
      toast.success(t('common.success'));
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to create job');
      console.error('Create job error:', error);
    } finally {
      setLoading(false);
    }
  };

  const canNext = step === 0 ? title && location : true;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('job.create_title')}</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-10">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 transition-colors ${i < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {step === 0 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('job.title')}</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('job.description')}</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('job.location')}</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('job.status')}</label>
                  <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none">
                    <option value="open">{t('job.status_open')}</option>
                    <option value="screening">{t('job.status_screening')}</option>
                    <option value="closed">{t('job.status_closed')}</option>
                  </select>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('job.skills')}</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map(s => (
                      <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {s}
                        <button onClick={() => setSkills(skills.filter(sk => sk !== s))}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                  <input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    placeholder={t('job.skill_placeholder')}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('job.experience')}</label>
                  <input type="number" min={0} value={experience} onChange={e => setExperience(Number(e.target.value))} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('job.education')}</label>
                  <select value={education} onChange={e => setEducation(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none">
                    {educationLevels.map(l => (
                      <option key={l} value={l}>{t(`job.edu_${l}`)}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">{t('job.step_basics')}</h3>
                  <button onClick={() => setStep(0)} className="text-primary text-sm font-medium hover:underline">{t('job.edit')}</button>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong className="text-foreground">{t('job.title')}:</strong> {title}</p>
                  <p><strong className="text-foreground">{t('job.location')}:</strong> {location}</p>
                  <p><strong className="text-foreground">{t('job.description')}:</strong> {description || '—'}</p>
                </div>
                <hr className="border-border" />
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">{t('job.step_requirements')}</h3>
                  <button onClick={() => setStep(1)} className="text-primary text-sm font-medium hover:underline">{t('job.edit')}</button>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong className="text-foreground">{t('job.skills')}:</strong> {skills.join(', ')}</p>
                  <p><strong className="text-foreground">{t('job.experience')}:</strong> {experience} years</p>
                  <p><strong className="text-foreground">{t('job.education')}:</strong> {t(`job.edu_${education}`)}</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors btn-press ${step === 0 ? 'invisible' : ''}`}
          >
            {t('job.back')}
          </button>
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity btn-press disabled:opacity-50"
            >
              {t('job.next')}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity btn-press disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('job.create')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
