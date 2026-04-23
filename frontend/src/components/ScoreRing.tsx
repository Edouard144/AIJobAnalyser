import { memo } from 'react';
import { cn } from '@/lib/utils';

export const ScoreRing = memo(({ score, size = 64, stroke = 6, animated = true }: {
  score: number; size?: number; stroke?: number; animated?: boolean;
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? 'hsl(var(--primary))' : score >= 70 ? 'hsl(var(--secondary))' : score >= 55 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
  
  const fontSize = Math.max(10, size * 0.28);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(animated && 'transition-all duration-1000 ease-out')}
          style={{ filter: `drop-shadow(0 0 6px ${color}30)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="font-display font-bold" 
          style={{ 
            color, 
            fontSize: fontSize,
            lineHeight: 1,
            textShadow: '0 1px 2px hsl(var(--background)/0.5)',
          }}
        >
          {score}%
        </span>
      </div>
    </div>
  );
});
