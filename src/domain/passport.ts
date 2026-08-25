/**
 * Aesthetics Passport — types and pure helpers for the local treatment
 * history log. All entries are user-recorded (not diagnosed or
 * prescribed by the app) per CLAUDE.md Product Boundaries.
 */

export type SatisfactionRating = 1 | 2 | 3 | 4 | 5;

export type PassportPhotoSlot = 'baseline' | 'follow_up';

export type PassportEntry = {
  id: string;
  treatment: string;
  date: string; // ISO date string
  provider: string;
  cost: number;
  product: string;
  amountUnits: string;
  area: string;
  notes: string;
  satisfaction: SatisfactionRating;
  wouldDoAgain: boolean;
  photos: Partial<Record<PassportPhotoSlot, boolean>>;
};

export type NewPassportEntryInput = Omit<PassportEntry, 'id' | 'photos'>;

export function summarizeEntriesThisYear(entries: PassportEntry[], now: Date = new Date()) {
  const year = now.getFullYear();
  const thisYear = entries.filter((entry) => new Date(entry.date).getFullYear() === year);

  const spendThisYear = thisYear.reduce((sum, entry) => sum + entry.cost, 0);
  const treatmentsThisYear = thisYear.length;

  const mostRecent = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null;

  return { spendThisYear, treatmentsThisYear, mostRecent };
}

export function sortEntriesByDateDesc(entries: PassportEntry[]): PassportEntry[] {
  return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export const samplePassportEntries: PassportEntry[] = [
  {
    id: 'sample-entry-1',
    treatment: 'Tox / Neuromodulators',
    date: '2026-06-12',
    provider: 'Ivory & Ash Aesthetics Studio',
    cost: 480,
    product: 'Botox',
    amountUnits: '24 units',
    area: 'Forehead, crow’s feet',
    notes: 'Very natural result, no bruising.',
    satisfaction: 5,
    wouldDoAgain: true,
    photos: { baseline: true, follow_up: true },
  },
  {
    id: 'sample-entry-2',
    treatment: 'Microneedling',
    date: '2026-03-02',
    provider: 'The Skin Atelier',
    cost: 350,
    product: 'SkinPen',
    amountUnits: '1 session',
    area: 'Full face',
    notes: 'Some redness for 2 days, glow after a week.',
    satisfaction: 4,
    wouldDoAgain: true,
    photos: { baseline: true },
  },
];
