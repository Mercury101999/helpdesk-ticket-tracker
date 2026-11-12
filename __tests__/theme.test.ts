import { palettes, priorityTones, roleTones, statusTones, Tone } from '@/lib/theme';

function channel(hex: string, shift: number) {
  const value = (parseInt(hex.slice(1), 16) >> shift) & 255;
  const scaled = value / 255;
  return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
}

function contrast(a: string, b: string) {
  const lum = (hex: string) => 0.2126 * channel(hex, 16) + 0.7152 * channel(hex, 8) + 0.0722 * channel(hex, 0);
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function expectReadable(name: string, foreground: string, background: string) {
  const ratio = contrast(foreground, background);
  if (ratio < 4.5) throw new Error(`${name} contrast ${ratio.toFixed(2)} is below 4.5 (${foreground} on ${background})`);
}

describe('theme contrast', () => {
  it.each(['light', 'dark'] as const)('%s text, badges, and solid chips meet WCAG AA', (scheme) => {
    const palette = palettes[scheme];
    expectReadable('text', palette.text, palette.bg);
    expectReadable('muted on background', palette.muted, palette.bg);
    expectReadable('muted on card', palette.muted, palette.card);
    expectReadable('link', palette.link, palette.bg);
    expectReadable('link on card', palette.link, palette.card);
    expectReadable('danger', palette.danger, palette.bg);
    expectReadable('danger on card', palette.danger, palette.card);
    expectReadable('placeholder', palette.placeholder, palette.input);
    expectReadable('disabled', palette.disabledText, palette.disabledBg);
    expectReadable('demo banner', palette.demoText, palette.demoBg);
    expectReadable('success', palette.success, palette.bg);
    expectReadable('primary button', palette.primaryText, palette.primary);
    expectReadable('danger button', palette.primaryText, palette.dangerSolid);

    const tones: [string, Tone][] = [
      ...Object.entries(statusTones[scheme]).map(([name, tone]) => [`status ${name}`, tone] as [string, Tone]),
      ...Object.entries(priorityTones[scheme]).map(([name, tone]) => [`priority ${name}`, tone] as [string, Tone]),
      ...Object.entries(roleTones[scheme]).map(([name, tone]) => [`role ${name}`, tone] as [string, Tone]),
    ];
    for (const [name, tone] of tones) {
      expectReadable(`${name} badge`, tone.fg, tone.bg);
      expectReadable(`${name} chip`, '#ffffff', tone.solid);
    }
  });
});
