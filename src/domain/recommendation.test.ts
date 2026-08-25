import { getRecommendation, treatmentCategories } from './recommendation';
import type { QuizAnswers } from './quiz';

function answers(overrides: Partial<QuizAnswers> = {}): QuizAnswers {
  return {
    concern: 'volume_loss',
    area: 'cheeks',
    intensity: 'natural',
    downtime: 'not_concern',
    comfort: 'injectables',
    budget: '3000_plus',
    ...overrides,
  };
}

describe('getRecommendation', () => {
  it('is deterministic — same answers always produce the same top match', () => {
    const a = getRecommendation(answers());
    const b = getRecommendation(answers());
    expect(a.topMatch.category.id).toBe(b.topMatch.category.id);
  });

  it('picks the primary candidate when comfort and downtime are unrestricted', () => {
    const result = getRecommendation(
      answers({ concern: 'volume_loss', comfort: 'injectables', downtime: 'not_concern' }),
    );
    expect(result.topMatch.category.id).toBe('fillers');
    expect(result.alternates).toHaveLength(2);
    expect(result.alternates.map((c) => c.id)).toEqual(['biostimulators', 'skin_boosters']);
  });

  it('falls back through comfort filtering and still returns 2 alternates (alternate path)', () => {
    // "lips" candidates are [fillers, skin_boosters, skincare] — only skincare
    // is comfortLevel "skincare", so the comfort filter narrows to a single
    // candidate and alternates must be backfilled from the unfiltered list.
    const result = getRecommendation(answers({ concern: 'lips', comfort: 'skincare_only', downtime: 'none' }));
    expect(result.topMatch.category.id).toBe('skincare');
    expect(result.alternates).toHaveLength(2);
    expect(result.alternates.map((c) => c.id)).toEqual(['fillers', 'skin_boosters']);
  });

  it('relaxes the downtime filter before dropping the comfort filter', () => {
    // "fine_lines" primary candidate under devices_lasers comfort is "peels"
    // (downtimeTier short). A "none" downtime tolerance excludes it, so the
    // engine should fall back to the comfort-only filtered list rather than
    // ignoring comfort entirely.
    const result = getRecommendation(answers({ concern: 'fine_lines', comfort: 'devices_lasers', downtime: 'none' }));
    expect(treatmentCategories[result.topMatch.category.id].comfortLevel).toBe('device');
  });

  it('never returns a category outside the concern candidate list, even after full fallback', () => {
    const result = getRecommendation(answers({ concern: 'jawline', comfort: 'skincare_only', downtime: 'none' }));
    // "jawline" has no skincare-comfortLevel candidates at all, so the engine
    // must fall back to the unfiltered concern list rather than crash.
    expect(['fillers', 'threads', 'rf', 'ultrasound']).toContain(result.topMatch.category.id);
  });

  it('flags an over-budget top match with a budget note', () => {
    const result = getRecommendation(answers({ concern: 'sagging_skin', comfort: 'devices_lasers', budget: 'under_500' }));
    expect(result.topMatch.category.costTier).toBeGreaterThan(1);
    expect(result.budgetNote).toMatch(/above your stated budget/i);
  });

  it('confirms a within-budget top match with a reassuring note', () => {
    const result = getRecommendation(answers({ concern: 'not_sure', comfort: 'skincare_only', budget: 'under_500' }));
    expect(result.budgetNote).toMatch(/fits within your stated budget/i);
  });

  it('includes an explanation that references the stated concern, area, and comfort', () => {
    const result = getRecommendation(
      answers({ concern: 'texture_pores', area: 'cheeks', comfort: 'devices_lasers', intensity: 'subtle' }),
    );
    expect(result.topMatch.explanation).toMatch(/texture \/ pores/i);
    expect(result.topMatch.explanation).toMatch(/cheeks/i);
    expect(result.topMatch.explanation).toMatch(/devices \/ lasers/i);
  });

  it('reports the current rules version', () => {
    const result = getRecommendation(answers());
    expect(result.rulesVersion).toBe('v1');
  });
});
