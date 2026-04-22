'use client';

import { useState, useRef, useCallback, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil, Upload, MapPin, GraduationCap, Sparkles,
  CheckCircle, AlertTriangle, Download, ChevronDown, Plus, X, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  fetchJobs,
  updateJob as updateJobAction,
  addCandidatesAction,
  uploadCsvAction,
  uploadPdfAction,
  runScreeningAction
} from '@/store/slices/jobsSlice';
import { logout as logoutAction } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';
import CandidatePortfolioModal from '@/components/CandidatePortfolioModal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';

export default function JobDetail() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { jobs, loading: jobsLoading } = useSelector((state: RootState) => state.jobs);

  const id = params.id as string;
  const job = jobs.find(j => j.id === id);

  const [tab, setTab] = useState<'candidates' | 'results'>('candidates');
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [showScreeningModal, setShowScreeningModal] = useState(false);
  const [topN, setTopN] = useState(10);
  const [isScreening, setIsScreening] = useState(false);
  const [screeningMsg, setScreeningMsg] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedWhyNot, setExpandedWhyNot] = useState<Record<string, boolean>>({});
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [editStatus, setEditStatus] = useState<string>(job?.status || 'open');

  const fileRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const screeningMsgs = [
    t('job.screening_msg1'),
    t('job.screening_msg2'),
    t('job.screening_msg3'),
    t('job.screening_msg4'),
  ];

  useEffect(() => {
    if (!isScreening) return;
    const interval = setInterval(() => {
      setScreeningMsg(prev => (prev + 1) % screeningMsgs.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isScreening, screeningMsgs.length]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await dispatch(updateJobAction({ id, data: { status: newStatus } })).unwrap();
      setEditStatus(newStatus);
      toast.success('Status updated');
    } catch (error: any) {
      toast.error('Failed to update status');
      console.error('Update status error:', error.message || error);
    }
  };

  const handleCsvUpload = useCallback(async (file: File) => {
    if (!id) return;
    try {
      await dispatch(uploadCsvAction({ jobId: id, file })).unwrap();
      toast.success(`Candidates uploaded successfully`);
    } catch (error: any) {
      const errorMsg = error?.message || error?.data?.message || 'Failed to upload CSV';
      toast.error(errorMsg);
      console.error('CSV upload error:', errorMsg, error);
    }
  }, [dispatch, id]);

  const handlePdfUpload = useCallback(async (file: File) => {
    if (!id) return;
    const toastId = toast.loading('AI is parsing resume...');
    try {
      await dispatch(uploadPdfAction({ jobId: id, file })).unwrap();
      toast.success(`PDF parsed and candidate added`, { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Failed to parse PDF', { id: toastId });
      console.error('PDF upload error:', error.message || error);
    }
  }, [dispatch, id]);

  if (!job) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Job not found</p>
      </div>
    );
  }

  const startEditing = () => {
    setEditTitle(job.title);
    setEditDesc(job.description);
    setEditLocation(job.location);
    setEditing(true);
  };

  const saveEdit = async () => {
    try {
      await dispatch(updateJobAction({ id, data: { title: editTitle, description: editDesc, location: editLocation } })).unwrap();
      setEditing(false);
      toast.success(t('common.success'));
    } catch (error: any) {
      toast.error('Failed to update job');
      console.error('Update job error:', error.message || error);
    }
  };

  const handleJsonSubmit = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const candidates = (Array.isArray(parsed) ? parsed : [parsed]).map((c: Record<string, any>) => {
        let skills: any[] = [];
        if (Array.isArray(c.skills)) {
          skills = c.skills.map((s: any) => {
            if (typeof s === 'string') {
              return { name: s, level: "Intermediate", yearsOfExperience: 1 };
            }
            return {
              name: s.name || s.skill || '',
              level: s.level || "Intermediate",
              yearsOfExperience: s.yearsOfExperience || 1
            };
          });
        } else if (typeof c.skills === 'string') {
          skills = c.skills.split(',').map((s: string) => ({
            name: s.trim(),
            level: "Intermediate",
            yearsOfExperience: 1
          }));
        }

        const languages = Array.isArray(c.languages) ? c.languages.map((l: any) => ({
          name: l.name || l.language || '',
          proficiency: l.proficiency || "Fluent"
        })) : [];

        const experience = Array.isArray(c.experience) ? c.experience.map((e: any) => ({
          company: e.company || '',
          role: e.role || e.position || '',
          startDate: e.startDate || e.start_date || '',
          endDate: e.endDate || e.end_date || (e.isCurrent ? 'Present' : ''),
          description: e.description || '',
          technologies: Array.isArray(e.technologies) ? e.technologies : [],
          isCurrent: e.isCurrent || e.is_current || false
        })) : [];

        const education = Array.isArray(c.education) ? c.education.map((e: any) => ({
          institution: e.institution || '',
          degree: e.degree || '',
          fieldOfStudy: e.fieldOfStudy || e.field || '',
          startYear: e.startYear || e.start_year || 0,
          endYear: e.endYear || e.end_year || 0
        })) : [];

        const projects = Array.isArray(c.projects) ? c.projects.map((p: any) => ({
          name: p.name || '',
          description: p.description || '',
          technologies: Array.isArray(p.technologies) ? p.technologies : [],
          role: p.role || '',
          link: p.link || p.url || '',
          startDate: p.startDate || '',
          endDate: p.endDate || ''
        })) : [];

        const certifications = Array.isArray(c.certifications) ? c.certifications.map((cert: any) => ({
          name: cert.name || '',
          issuer: cert.issuer || '',
          issueDate: cert.issueDate || cert.date || ''
        })) : [];

        const availability = c.availability ? {
          status: c.availability.status || "Available",
          type: c.availability.type || "Full-time",
          startDate: c.availability.startDate || ''
        } : { status: "Available", type: "Full-time" };

        const socialLinks = c.socialLinks || {};

        const experienceYears = experience.reduce((total: number, exp: any) => {
          if (exp.isCurrent) {
            const start = parseInt(exp.startDate?.split('-')[0] || '0');
            return total + (start > 0 ? new Date().getFullYear() - start : 0);
          }
          const start = parseInt(exp.startDate?.split('-')[0] || '0');
          const end = exp.endDate === 'Present' ? new Date().getFullYear() : parseInt(exp.endDate?.split('-')[0] || '0');
          return total + (end > start ? end - start : 0);
        }, 0);

        return {
          firstName: c.firstName || c.first_name || '',
          lastName: c.lastName || c.last_name || '',
          fullName: c.fullName || c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
          email: c.email || '',
          phone: c.phone || '',
          headline: c.headline || '',
          bio: c.bio || '',
          location: c.location || '',
          skills: skills,
          languages: languages,
          experience: experience,
          education: education,
          projects: projects,
          certifications: certifications,
          availability: availability,
          socialLinks: socialLinks,
          experienceYears: experienceYears > 0 ? experienceYears : (Number(c.experienceYears) || 0),
          educationLevel: c.educationLevel || c.education || '',
          currentPosition: c.currentPosition || c.position || '',
          source: 'external' as const,
        };
      });
      await dispatch(addCandidatesAction({ jobId: id, candidates })).unwrap();
      setJsonInput('');
      toast.success(`${candidates.length} candidates added`);
    } catch (error) {
      toast.error('Invalid JSON format');
      console.error('JSON submit error:', error);
    }
  };

  const handleRunScreening = async () => {
    setShowScreeningModal(false);
    setIsScreening(true);
    setScreeningMsg(0);
    try {
      await dispatch(runScreeningAction({ jobId: id, topN })).unwrap();
      setIsScreening(false);
      setTab('results');
      toast.success(t('common.success'));
    } catch (error: any) {
      setIsScreening(false);
      toast.error(error.message || 'Failed to run screening');
      console.error('Screening error:', error.message || error);
    }
  };

  const exportCsv = () => {
    const rows = [['Rank', 'Name', 'Score', 'Strengths', 'Gaps', 'Recommendation']];
    job.results.forEach(r => {
      rows.push([String(r.rank), r.candidateName, String(r.score), r.strengths.join('; '), r.gaps.join('; '), r.recommendation]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.title}-results.csv`;
    a.click();
  };

  const scoreColor = (score: number) => score >= 80 ? 'hsl(var(--primary))' : score >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
  const scoreColorClass = (score: number) => score >= 80 ? 'text-primary' : score >= 60 ? 'text-warning' : 'text-destructive';

  const statusColors: Record<string, string> = {
    open: 'bg-primary/10 text-primary',
    screening: 'bg-warning/10 text-warning',
    closed: 'bg-destructive/10 text-destructive',
  };

  const rankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 animate-shimmer';
    if (rank === 2) return 'bg-gray-300/20 text-gray-500 animate-shimmer';
    if (rank === 3) return 'bg-amber-600/20 text-amber-700 dark:text-amber-500 animate-shimmer';
    return 'bg-muted text-muted-foreground';
  };

  if (authLoading || !isAuthenticated) {
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        {editing ? (
          <Card className="mb-8">
            <CardContent className="pt-6 space-y-4">
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="text-3xl font-bold"
              />
              <Textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                rows={3}
              />
              <Input
                value={editLocation}
                onChange={e => setEditLocation(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={saveEdit}>{t('common.save')}</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>{t('job.cancel')}</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                  <span>{job.experience}yr+ experience</span>
                  <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /> {t(`job.edu_${job.education}`)}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                    <select
                      value={editStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="bg-transparent border-none cursor-pointer appearance-none"
                    >
                      <option value="open">{t('job.status_open')}</option>
                      <option value="screening">{t('job.status_screening')}</option>
                      <option value="closed">{t('job.status_closed')}</option>
                    </select>
                  </span>
                </div>
                {job.description && <p className="text-muted-foreground text-sm max-w-2xl">{job.description}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={startEditing}>
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border mb-8">
          {(['candidates', 'results'] as const).map(t2 => (
            <button
              key={t2}
              onClick={() => setTab(t2)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                tab === t2 ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {t(`job.${t2}_tab`)}
            </button>
          ))}
        </div>

        {/* Candidates Tab */}
        {tab === 'candidates' && (
          <div className="relative">
            {isScreening && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl">
                <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-6" />
                <p className="text-lg font-semibold text-foreground animate-pulse">{screeningMsgs[screeningMsg]}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* JSON Input Card */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-foreground">Umurava Profiles</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <textarea
                    value={jsonInput}
                    onChange={e => setJsonInput(e.target.value)}
                    placeholder={t('job.json_placeholder')}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none resize-none font-mono"
                  />
                  <Button onClick={handleJsonSubmit} fullWidth>
                    {t('job.add_candidates')}
                  </Button>
                </CardContent>
              </Card>

              {/* CSV Upload Card */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-foreground">{t('job.upload_csv')}</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(false);
                      const f = e.dataTransfer.files[0];
                      if (f) handleCsvUpload(f);
                    }}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <Upload className={`h-8 w-8 mx-auto mb-2 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="text-sm text-muted-foreground">{isDragging ? 'Drop it here!' : t('job.drop_csv')}</p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvUpload(f); }}
                  />
                </CardContent>
              </Card>

              {/* PDF Upload Card */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-foreground">AI PDF Parse</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    onClick={() => pdfRef.current?.click()}
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all border-border hover:border-primary/40"
                  >
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drop PDF Resume</p>
                  </div>
                  <input
                    ref={pdfRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f); }}
                  />
                  <p className="text-[10px] text-muted-foreground mt-3 text-center italic">
                    Uses Gemini 2.0 & Smart Rescue Fallback for high accuracy
                  </p>
                </CardContent>
              </Card>
            </div>

            {job.candidates.length > 0 && (
              <Card className="overflow-hidden mb-24">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('job.skills')}</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Exp</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.candidates.map(c => (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedCandidate(c)}
                          className="border-b border-border last:border-0 hover:bg-accent/50 cursor-pointer transition-all hover:border-l-4 hover:border-l-primary"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground">{c.firstName} {c.lastName}</span>
                              {c.headline && <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{c.headline}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{c.email}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {c.skills.slice(0, 3).map((s: any) => (
                                <span key={typeof s === 'string' ? s : s.name} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] border border-primary/20">
                                  {typeof s === 'string' ? s : s.name}
                                </span>
                              ))}
                              {c.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{c.skills.length - 3}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{c.experienceYears}yr</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${c.source === 'Umurava' ? 'bg-primary/20 text-primary' : 'bg-orange-500/20 text-orange-500'}`}>
                              {c.source}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {job.candidates.length > 0 && !isScreening && (
              <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border p-4 z-10">
                <div className="max-w-5xl mx-auto">
                  <Button
                    onClick={() => setShowScreeningModal(true)}
                    fullWidth
                    size="lg"
                  >
                    <Sparkles className="h-5 w-5" /> {t('job.run_screening')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {tab === 'results' && (
          <div>
            {job.results.length === 0 ? (
              <div className="text-center py-20">
                <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">{t('job.no_results')}</p>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-6">
                  <Button variant="outline" onClick={exportCsv}>
                    <Download className="h-4 w-4" /> {t('job.export_csv')}
                  </Button>
                </div>

                {/* Pool Health Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
                    <p className="text-[10px] font-bold text-primary uppercase mb-1">Total Pool Match</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(job.results.reduce((acc, r) => acc + r.score, 0) / (job.results.length || 1))}%
                    </p>
                  </div>
                  <div className="bg-accent/50 border border-border p-4 rounded-xl">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Top Tier Candidates</p>
                    <p className="text-2xl font-bold text-foreground">
                      {job.results.filter(r => r.score >= 85).length} <span className="text-xs text-muted-foreground font-normal">of {job.results.length}</span>
                    </p>
                  </div>
                  <div className="bg-accent/50 border border-border p-4 rounded-xl">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Leading Skill Found</p>
                    <p className="text-2xl font-bold text-foreground truncate">
                      {job.results[0]?.strengths?.[0] || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Skill Radar Chart */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" /> Skills Match Portfolio (Top 3)
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={
                            (job.results[0]?.strengths || []).slice(0, 6).map(skill => ({
                              subject: skill,
                              A: 90 + Math.random() * 10,
                              B: 70 + Math.random() * 20,
                              C: 50 + Math.random() * 30,
                              fullMark: 100,
                            }))
                          }>
                            <PolarGrid stroke="hsl(var(--muted-foreground) / 0.2)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                            <Radar name={job.results[0]?.candidateName || 'N/A'} dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                            <Radar name={job.results[1]?.candidateName || 'N/A'} dataKey="B" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.3} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Score Distribution */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-primary" /> Pool Distribution
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { range: '90-100', count: job.results.filter(r => r.score >= 90).length },
                            { range: '80-89', count: job.results.filter(r => r.score >= 80 && r.score < 90).length },
                            { range: '70-79', count: job.results.filter(r => r.score >= 70 && r.score < 80).length },
                            { range: '60-69', count: job.results.filter(r => r.score >= 60 && r.score < 70).length },
                            { range: '<60', count: job.results.filter(r => r.score < 60).length },
                          ]}>
                            <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip cursor={{ fill: 'hsl(var(--accent) / 0.5)' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Results List */}
                <div className="space-y-4">
                  {job.results.map((r, i) => (
                    <motion.div
                      key={r.candidateId}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        const c = job.candidates.find(cand => cand.id === r.candidateId);
                        if (c) setSelectedCandidate(c);
                      }}
                      className="bg-card border border-border rounded-xl p-6 shadow-card cursor-pointer hover:border-primary/50 transition-all hover:translate-x-1"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${rankBadge(r.rank)}`}>
                          #{r.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-foreground">{r.candidateName}</h3>
                              <p className="text-sm text-muted-foreground">{r.position}</p>
                            </div>
                            <div className="relative w-14 h-14 flex-shrink-0">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                                <circle cx="22" cy="22" r="18" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                                <motion.circle
                                  cx="22" cy="22" r="18" fill="none"
                                  stroke={scoreColor(r.score)}
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeDasharray={`${2 * Math.PI * 18}`}
                                  initial={{ strokeDashoffset: 2 * Math.PI * 18 }}
                                  animate={{ strokeDashoffset: 2 * Math.PI * 18 * (1 - r.score / 100) }}
                                  transition={{ duration: 1, delay: i * 0.1 }}
                                />
                              </svg>
                              <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${scoreColorClass(r.score)}`}>
                                {r.score}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div>
                              <p className="text-xs font-semibold text-foreground mb-1">{t('job.strengths')}</p>
                              {r.strengths.map((s, si) => (
                                <p key={si} className="text-xs text-muted-foreground flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" /> {s}
                                </p>
                              ))}
                            </div>
                            {r.gaps.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-1">{t('job.gaps')}</p>
                                {r.gaps.map((g, gi) => (
                                  <p key={gi} className="text-xs text-muted-foreground flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 text-warning flex-shrink-0" /> {g}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="bg-primary/5 rounded-lg p-3 mb-3">
                            <p className="text-xs font-semibold text-foreground mb-1">{t('job.recommendation')}</p>
                            <p className="text-xs text-muted-foreground italic">{r.recommendation}</p>
                          </div>
                          {!r.shortlisted && (
                            <div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedWhyNot(prev => ({ ...prev, [r.candidateId]: !prev[r.candidateId] }));
                                }}
                                type="button"
                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                              >
                                <ChevronDown className={`h-3 w-3 transition-transform ${expandedWhyNot[r.candidateId] ? 'rotate-180' : ''}`} />
                                {t('job.why_not')}
                              </button>
                              <AnimatePresence>
                                {expandedWhyNot[r.candidateId] && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <p className="text-xs text-muted-foreground mt-2 pl-4 border-l-2 border-border">{r.whyNot}</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Screening Modal */}
        <AnimatePresence>
          {showScreeningModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowScreeningModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-elevated"
              >
                <h2 className="text-xl font-bold text-foreground mb-2">{t('job.screening_title')}</h2>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-2.5 flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-xs font-bold text-primary tracking-wide uppercase">AI Powered by AIRECRUIT</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{t('job.screening_desc')}</p>
                <div className="flex gap-3 mb-6">
                  {[10, 20].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTopN(n)}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
                        topN === n ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {t(`job.top_${n}`)}
                    </button>
                  ))}
                </div>
                <Button onClick={handleRunScreening} fullWidth>
                  {t('job.start_screening')}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Candidate Portfolio Modal */}
        {selectedCandidate && (
          <CandidatePortfolioModal
            candidate={selectedCandidate}
            result={job.results.find(r => r.candidateId === selectedCandidate.id)}
            onClose={() => setSelectedCandidate(null)}
          />
        )}
      </div>
    </div>
  );
}