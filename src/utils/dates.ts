export function toDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDaysISO(iso: string, deltaDays: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + deltaDays);
  return toDateISO(d);
}

export function compareISO(a: string, b: string): number {
  return a.localeCompare(b);
}
