import { useEffect, useState } from 'react';

export const AnimatedCounter = ({ value, duration = 1200, suffix = '' }: { value: number; duration?: number; suffix?: string }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{display.toLocaleString()}{suffix}</span>;
};
