'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mail, MapPin, Briefcase, GraduationCap, 
  ExternalLink, Calendar, CheckCircle, Target, 
  Sparkles, Globe, User, Code, HelpCircle, Loader2 
} from 'lucide-react';
import { screeningService } from '@/services/screening.service';

interface CandidatePortfolioModalProps {
  candidate: any;
  onClose: () => void;
  result?: any;
}

export default function CandidatePortfolioModal({ candidate, onClose, result }: CandidatePortfolioModalProps) {
  const [questions, setQuestions] = React.useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = React.useState(false);

  if (!candidate) return null;

  const handleGenerateQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const qs = await screeningService.getInterviewKit(candidate.jobId, candidate.id);
      setQuestions(qs);
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between bg-accent/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {candidate.firstName?.[0]}{candidate.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{candidate.firstName} {candidate.lastName}</h2>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4" /> {candidate.headline || 'Talent'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-muted-foreground" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column: Sidebar Info */}
              <div className="space-y-8">
                {/* Contact & Status */}
                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact & Location</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-foreground">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>{candidate.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{candidate.location || 'Remote'}</span>
                    </div>
                    {candidate.socialLinks?.linkedin && (
                      <a href={candidate.socialLinks.linkedin} target="_blank" className="flex items-center gap-3 text-sm text-primary hover:underline">
                        <Globe className="h-4 w-4" />
                        <span>LinkedIn Profile</span>
                      </a>
                    )}
                  </div>
                </section>

                {/* AI Screening Insights if available */}
                {result && (
                  <section className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="h-3 w-3" /> AI Evaluation
                      </h3>
                      <span className="text-lg font-bold text-primary">{result.score}%</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground">Strengths</p>
                      <div className="flex flex-wrap gap-1">
                        {result.strengths?.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[10px]">{s}</span>
                        ))}
                      </div>
                    </div>
                    {result.gaps?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-foreground">Development Gaps</p>
                        <div className="flex flex-wrap gap-1">
                          {result.gaps?.map((g: string) => (
                            <span key={g} className="px-2 py-0.5 bg-destructive/10 text-destructive rounded-md text-[10px]">{g}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* AI Interview Kit */}
                <section className="p-4 bg-accent/30 border border-border rounded-xl space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="h-3 w-3" /> Interview Kit
                  </h3>
                  
                  {questions.length === 0 ? (
                    <button 
                      onClick={handleGenerateQuestions}
                      disabled={loadingQuestions}
                      className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {loadingQuestions ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      {loadingQuestions ? 'Analyzing Gaps...' : 'Generate Smart Questions'}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {questions.map((q, i) => (
                        <div key={i} className="text-[10px] text-foreground leading-snug p-2 bg-background/50 rounded-lg border border-border">
                          {q}
                        </div>
                      ))}
                      <button 
                        onClick={() => setQuestions([])}
                        className="w-full text-[9px] text-muted-foreground hover:text-primary transition-colors text-center"
                      >
                        Regenerate
                      </button>
                    </div>
                  )}
                </section>

                {/* Skills Cloud */}
                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Skills Portfolio</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills?.map((s: any) => (
                      <div 
                        key={typeof s === 'string' ? s : s.name}
                        className="px-3 py-1 bg-accent border border-border rounded-lg text-xs flex flex-col"
                      >
                        <span className="font-semibold text-foreground">{typeof s === 'string' ? s : s.name}</span>
                        {s.level && <span className="text-[9px] text-muted-foreground">{s.level} • {s.yearsOfExperience}y</span>}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column: Main Content */}
              <div className="md:col-span-2 space-y-12">
                
                {/* About / Bio */}
                <section>
                  <h3 className="text-lg font-bold text-foreground mb-4">Professional Summary</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {candidate.bio || `A passionate ${candidate.headline || 'professional'} focused on delivering high-quality results and continuous improvement in the field of technology and innovation.`}
                  </p>
                </section>

                {/* Experience Timeline */}
                <section className="space-y-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" /> Professional Experience
                  </h3>
                  <div className="space-y-8 border-l-2 border-border ml-2 pl-6">
                    {candidate.experience?.length > 0 ? candidate.experience.map((exp: any, i: number) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                        <div className="space-y-2">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                            <h4 className="font-bold text-foreground">{exp.role}</h4>
                            <span className="text-xs font-medium text-muted-foreground bg-accent px-2 py-1 rounded-md flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {exp.startDate} - {exp.endDate}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-primary">{exp.company}</p>
                          <p className="text-sm text-muted-foreground">{exp.description}</p>
                          {exp.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {exp.technologies.map((tech: string) => (
                                <span key={tech} className="text-[10px] text-muted-foreground px-2 py-0.5 border border-border rounded-md italic">
                                  #{tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground italic">No detailed experience provided.</p>
                    )}
                  </div>
                </section>

                {/* Projects */}
                {candidate.projects?.length > 0 && (
                  <section className="space-y-6">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Code className="h-5 w-5 text-primary" /> Key Projects
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {candidate.projects.map((proj: any, i: number) => (
                        <div key={proj.name} className="p-4 bg-accent/20 border border-border rounded-xl space-y-2">
                          <h4 className="font-bold text-sm text-foreground">{proj.name}</h4>
                          <p className="text-[11px] text-muted-foreground line-clamp-3">{proj.description}</p>
                          <div className="flex flex-wrap gap-1 pt-2">
                            {proj.technologies?.slice(0, 3).map((t: string) => (
                              <span key={t} className="text-[9px] bg-background px-1.5 py-0.5 rounded border border-border">{t}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Education */}
                <section className="space-y-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" /> Education
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {candidate.education?.map((edu: any, i: number) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                          <Target className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{edu.degree} in {edu.fieldOfStudy}</h4>
                          <p className="text-xs text-primary">{edu.institution}</p>
                          <p className="text-[10px] text-muted-foreground">{edu.startYear} - {edu.endYear}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            </div>
          </div>
          
          {/* Footer Action */}
          <div className="p-6 border-t border-border bg-accent/10 flex justify-between items-center">
            <p className="text-xs text-muted-foreground italic">This profile was synchronized with Umurava Official Talent Schema.</p>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-foreground text-background rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Close Profile
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
