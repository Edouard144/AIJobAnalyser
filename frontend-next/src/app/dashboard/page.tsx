'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Briefcase, Users, Zap, MapPin, Clock, User, Search, Plus, 
  ChevronRight, SlidersHorizontal, ArrowUpDown, Sparkles, MoreHorizontal,
  Edit, Trash2, Copy, Play
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchJobs } from '@/store/slices/jobsSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const duration = 800;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span>{display}</span>;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { jobs, loading: jobsLoading } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchJobs());
  }, [dispatch, isAuthenticated]);

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const totalCandidates = jobs.reduce((sum, j) => sum + j.candidates.length, 0);
  const screeningsRun = jobs.filter(j => j.results.length > 0).length;
  const activeJobs = jobs.filter(j => j.status === 'open').length;

  const stats = [
    { label: 'TOTAL JOBS', value: jobs.length, icon: Briefcase, trend: '+2 this week', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'TOTAL CANDIDATES', value: totalCandidates, icon: Users, trend: '+12 this week', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'SCREENINGS RUN', value: screeningsRun, icon: Zap, trend: 'AI powered', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const statusColors: Record<string, string> = {
    open: 'bg-emerald-500/90 text-white',
    screening: 'bg-amber-500/90 text-white',
    closed: 'bg-slate-500/90 text-white',
  };

  const daysAgo = (date: string) => {
    if (!mounted) return '...';
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    return days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`;
  };

  // Filter and sort
  let filteredJobs = searchQuery 
    ? jobs.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : jobs;
  
  if (statusFilter !== 'all') {
    filteredJobs = filteredJobs.filter(j => j.status === statusFilter);
  }
  
  if (sortBy === 'recent') {
    filteredJobs = [...filteredJobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === 'candidates') {
    filteredJobs = [...filteredJobs].sort((a, b) => b.candidates.length - a.candidates.length);
  }

  if (authLoading || (jobsLoading && !mounted)) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">Scout</span>
          </div>
          
          {/* AI Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-xs font-medium text-purple-400">AI screening on</span>
            <span className="text-xs text-white/40">{activeJobs} active jobs</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">{user?.email?.split('@')[0]}</Button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">
              {user?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Page Header with Title and Subtitle */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Your Jobs</h1>
          <p className="text-muted-foreground mt-1">Manage open roles and track AI screenings in one place.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-gradient-to-br from-card to-card/50 border border-white/5 rounded-xl p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                {s.trend && (
                  <span className="text-xs text-white/40">{s.trend}</span>
                )}
              </div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-semibold text-foreground mt-1">
                <AnimatedNumber value={s.value} />
              </p>
            </motion.div>
          ))}
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs by title or tag..."
              className="pl-10 h-11 bg-card/80 border-white/5"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-white/10"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <div className="relative">
              <Button variant="outline" size="sm" className="border-white/10">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-wrap gap-3 mb-6 p-4 bg-card/50 rounded-lg border border-white/5"
          >
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 bg-background/50 border border-white/10 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="screening">Screening</option>
              <option value="closed">Closed</option>
            </select>
          </motion.div>
        )}

        {/* New Job Button - Full Width on Mobile */}
        <div className="flex justify-end mb-6">
          <Button onClick={() => router.push('/jobs/create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No jobs yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first job to start screening candidates with AI. Upload resumes, run AI screening, and find your best talent in seconds.
            </p>
            <Button onClick={() => router.push('/jobs/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first job
            </Button>
          </div>
        ) : (
          /* Job Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="group relative bg-card border border-white/5 rounded-xl p-5 cursor-pointer hover:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                {/* Top Row: Title + Status */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors pr-2">
                    {job.title}
                  </h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${statusColors[job.status]}`}>
                    {job.status === 'open' ? 'Open' : job.status === 'screening' ? 'Screening' : 'Closed'}
                  </span>
                </div>
                
                {/* Meta Info - Chips */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md text-xs text-white/60">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                  <span className="px-2 py-1 bg-muted/50 rounded-md text-xs text-white/60">
                    {job.experience}+ yrs
                  </span>
                </div>
                
                {/* Skills as Pill Chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.skills.slice(0, 4).map(s => (
                    <span key={s} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                      {s}
                    </span>
                  ))}
                  {job.skills.length > 4 && (
                    <span className="px-2.5 py-1 bg-muted/30 text-white/40 rounded-full text-xs">
                      +{job.skills.length - 4}
                    </span>
                  )}
                </div>
                
                {/* Bottom Row: Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {job.candidates.length} candidates
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {daysAgo(job.createdAt)}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/jobs/${job.id}`);
                      }}
                      className="h-8 px-2"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Screen
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}