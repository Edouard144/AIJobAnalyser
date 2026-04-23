import { useEffect, useRef } from 'react';

// Mouse-following soft glow. Wrap a section with this — pointer-events stay free.
export const CursorSpotlight = ({ className = '' }: { className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;
    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.background = `radial-gradient(600px circle at ${x}px ${y}px, hsl(var(--primary) / 0.12), transparent 60%)`;
    };
    parent.addEventListener('mousemove', onMove);
    return () => parent.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`absolute inset-0 pointer-events-none transition-[background] duration-100 ${className}`}
    />
  );
};
