import { cn } from '@/lib/utils';

export const ScoreRing = ({ score, size = 64, stroke = 6, animated = true }: {
  score: number; size?: number; stroke?: number; animated?: boolean;
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? 'hsl(var(--primary))' : score >= 70 ? 'hsl(var(--secondary))' : score >= 55 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className={cn(animated && 'transition-all duration-1000 ease-out')}
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display font-bold text-sm" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
};
