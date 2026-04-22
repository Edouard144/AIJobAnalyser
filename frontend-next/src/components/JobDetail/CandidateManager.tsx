'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Upload, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface CandidateManagerProps {
  jobId: string;
  onAddCandidates: (candidates: any[]) => void;
}

export function CandidateManager({ jobId, onAddCandidates }: CandidateManagerProps) {
  const { t } = useTranslation();
  const [jsonInput, setJsonInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const pdfRef = React.useRef<HTMLInputElement>(null);

  // These handlers need to be passed from parent
  const handleJsonSubmit = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      onAddCandidates(candidates);
      setJsonInput('');
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  };

  const handleCsvUpload = async (file: File) => {
    // Implementation from parent
  };

  const handlePdfUpload = async (file: File) => {
    // Implementation from parent
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* JSON Input */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-foreground">Umurava Profiles</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={t('job.json_placeholder')}
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none resize-none font-mono"
          />
          <Button onClick={handleJsonSubmit} fullWidth>
            {t('job.add_candidates')}
          </Button>
        </CardContent>
      </Card>

      {/* CSV Upload */}
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

      {/* PDF Upload */}
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
  );
}

CandidateManager.displayName = 'CandidateManager';
