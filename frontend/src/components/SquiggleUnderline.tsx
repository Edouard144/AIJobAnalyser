// Hand-drawn squiggle underline — used to highlight key words in headlines.
export const SquiggleUnderline = ({ className = '' }: { className?: string }) => (
  <svg
    className={`absolute left-0 -bottom-2 w-full pointer-events-none ${className}`}
    height="14"
    viewBox="0 0 300 14"
    preserveAspectRatio="none"
    fill="none"
    aria-hidden
  >
    <path
      d="M2 8 Q 50 1, 100 7 T 200 7 T 298 6"
      stroke="hsl(var(--primary))"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
      style={{
        strokeDasharray: 320,
        strokeDashoffset: 320,
        animation: 'draw 1.2s ease-out 0.4s forwards',
      }}
    />
  </svg>
);

// Hand-drawn arrow — points toward CTAs.
export const SquiggleArrow = ({ className = '' }: { className?: string }) => (
  <svg
    className={`pointer-events-none ${className}`}
    width="80"
    height="60"
    viewBox="0 0 80 60"
    fill="none"
    aria-hidden
  >
    <path
      d="M5 10 Q 30 5, 45 25 T 65 50"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      style={{ strokeDasharray: 120, strokeDashoffset: 120, animation: 'draw 1s ease-out 0.6s forwards' }}
    />
    <path
      d="M58 42 L 65 50 L 56 53"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'draw 0.4s ease-out 1.4s forwards' }}
    />
  </svg>
);
