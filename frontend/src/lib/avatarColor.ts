// Hash-based gradient avatars — same name always produces the same gradient.
// Uses HSL palette tied to the design system's brand hue range (blues + analogous).

const PALETTES: Array<[string, string]> = [
  ['hsl(217 91% 55%)', 'hsl(199 95% 60%)'],
  ['hsl(230 85% 60%)', 'hsl(260 85% 65%)'],
  ['hsl(190 90% 50%)', 'hsl(217 91% 55%)'],
  ['hsl(250 80% 60%)', 'hsl(290 70% 60%)'],
  ['hsl(170 75% 45%)', 'hsl(199 90% 55%)'],
  ['hsl(280 75% 60%)', 'hsl(217 91% 60%)'],
  ['hsl(210 90% 50%)', 'hsl(180 80% 50%)'],
  ['hsl(240 85% 65%)', 'hsl(200 95% 55%)'],
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

export function avatarGradient(name: string): string {
  const [a, b] = PALETTES[hash(name) % PALETTES.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}
