'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Plus } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { addJob as addJobAction } from '@/store/slices/jobsSlice';
import type { RootState, AppDispatch } from '@/store';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const educationLevels = [
  { value: 'any', label: 'Any' },
  { value: 'highschool', label: 'High School' },
  { value: 'bachelor', label: "Bachelor's" },
  { value: 'master', label: "Master's" },
  { value: 'phd', label: 'PhD' },
];

export default function CreateJob() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth);
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

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
      await dispatch(addJobAction({
        title,
        description,
        location,
        status,
        requiredSkills: skills,
        experienceYears: experience,
        educationLevel: education
      })).unwrap();
      toast.success(t('common.success'));
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create job');
      console.error('Create job error:', error);
    } finally {
      setLoading(false);
    }
  };

  const canNext = step === 0 ? title && location : true;

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('job.create_title')}</h1>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-10">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
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

        {/* Form Steps */}
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
              <Card className="p-0">
                <CardContent className="pt-6 space-y-5">
                  <div>
                    <Label htmlFor="title">{t('job.title')}</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">{t('job.description')}</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the role"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">{t('job.location')}</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Kigali, Rwanda"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">{t('job.status')}</Label>
                    <Select
                      id="status"
                      value={status}
                      onChange={(value) => setStatus(value as 'open' | 'screening' | 'closed')}
                      options={[
                        { value: 'open', label: t('job.status_open') },
                        { value: 'screening', label: t('job.status_screening') },
                        { value: 'closed', label: t('job.status_closed') },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 1 && (
              <Card className="p-0">
                <CardContent className="pt-6 space-y-5">
                  <div>
                    <Label>{t('job.skills')}</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {skills.map(s => (
                        <Badge key={s} variant="primary">
                           {s}
                           <button
                             type="button"
                             onClick={() => setSkills(skills.filter(sk => sk !== s))}
                             className="ml-1 hover:text-primary"
                           >
                             <X className="h-3 w-3" />
                           </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                        placeholder={t('job.skill_placeholder')}
                      />
                      <Button type="button" onClick={addSkill} variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="experience">{t('job.experience')}</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="15"
                        value={experience}
                        onChange={(e) => setExperience(Number(e.target.value))}
                        className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-sm font-medium text-foreground w-12 text-center">
                        {experience}yr
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="education">{t('job.education')}</Label>
                    <Select
                      id="education"
                      value={education}
                      onChange={(value) => setEducation(value)}
                      options={educationLevels.map(l => ({
                        value: l.value,
                        label: t(`job.edu_${l.value}`),
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="p-0">
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-foreground">{t('job.step_basics')}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setStep(0)}>{t('job.edit')}</Button>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1 bg-muted/30 p-4 rounded-lg">
                      <p><strong className="text-foreground">{t('job.title')}:</strong> {title || '—'}</p>
                      <p><strong className="text-foreground">{t('job.location')}:</strong> {location || '—'}</p>
                      <p><strong className="text-foreground">{t('job.description')}:</strong> {description || '—'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-foreground">{t('job.step_requirements')}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setStep(1)}>{t('job.edit')}</Button>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1 bg-muted/30 p-4 rounded-lg">
                      <p><strong className="text-foreground">{t('job.skills')}:</strong> {skills.length > 0 ? skills.join(', ') : '—'}</p>
                      <p><strong className="text-foreground">{t('job.experience')}:</strong> {experience} years</p>
                      <p><strong className="text-foreground">{t('job.education')}:</strong> {t(`job.edu_${education}`)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={() => setStep(Math.max(0, step - 1))}
            variant="outline"
            className={step === 0 ? 'invisible' : ''}
          >
            {t('job.back')}
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext}>
              {t('job.next')}
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading}>
              {loading ? t('common.loading') : t('job.create')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}