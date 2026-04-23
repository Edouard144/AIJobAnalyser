// Real-looking SVG monogram logos for the social-proof strip.
// Each logo is a unique mark — no AI-default rounded squares.

type Props = { className?: string };

export const LogoAndela = ({ className = '' }: Props) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path d="M11 2 L20 18 H2 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="11" cy="13" r="2.5" fill="currentColor" />
    </svg>
    <span className="font-display font-bold tracking-tight">Andela</span>
  </div>
);

export const LogoNorrsken = ({ className = '' }: Props) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path d="M11 1 L13 9 L21 11 L13 13 L11 21 L9 13 L1 11 L9 9 Z" fill="currentColor" />
    </svg>
    <span className="font-display font-bold tracking-tight">Norrsken</span>
  </div>
);

export const LogoFlutterwave = ({ className = '' }: Props) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path d="M2 11 Q 7 2, 11 11 T 20 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="11" cy="11" r="1.5" fill="currentColor" />
    </svg>
    <span className="font-display font-bold tracking-tight">Flutterwave</span>
  </div>
);

export const LogoPaystack = ({ className = '' }: Props) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <rect x="3" y="3" width="16" height="3" fill="currentColor" />
      <rect x="3" y="9.5" width="16" height="3" fill="currentColor" opacity="0.7" />
      <rect x="3" y="16" width="10" height="3" fill="currentColor" opacity="0.4" />
    </svg>
    <span className="font-display font-bold tracking-tight">Paystack</span>
  </div>
);

export const LogoKasha = ({ className = '' }: Props) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M7 11 H 15 M 11 7 V 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
    <span className="font-display font-bold tracking-tight">Kasha</span>
  </div>
);

export const LogoWave = ({ className = '' }: Props) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path d="M2 8 Q 6 14, 11 8 T 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M2 14 Q 6 20, 11 14 T 20 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
    </svg>
    <span className="font-display font-bold tracking-tight">Wave</span>
  </div>
);

export const COMPANY_LOGOS = [LogoAndela, LogoNorrsken, LogoFlutterwave, LogoPaystack, LogoKasha, LogoWave];
