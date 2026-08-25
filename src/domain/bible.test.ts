import {
  bibleConcerns,
  bibleTreatments,
  filterBibleTreatmentsByCategory,
  getBibleTreatmentById,
  searchBibleTreatments,
} from './bible';

describe('searchBibleTreatments', () => {
  it('returns all treatments for an empty query', () => {
    expect(searchBibleTreatments('')).toHaveLength(bibleTreatments.length);
  });

  it('matches by name', () => {
    const results = searchBibleTreatments('sofwave');
    expect(results.map((t) => t.id)).toEqual(['sofwave']);
  });

  it('matches by alias, case-insensitively', () => {
    const results = searchBibleTreatments('MORPHEUS8');
    expect(results.map((t) => t.id)).toContain('rf_microneedling');
  });

  it('matches by parent category name', () => {
    const results = searchBibleTreatments('neuromodulator');
    // "Neuromodulator" appears in aliases for both botox and dysport
    expect(results.map((t) => t.id).sort()).toEqual(['botox', 'dysport']);
  });

  it('returns no results for a non-matching query', () => {
    expect(searchBibleTreatments('zzzznotreal')).toHaveLength(0);
  });
});

describe('filterBibleTreatmentsByCategory', () => {
  it('returns everything for "all"', () => {
    expect(filterBibleTreatmentsByCategory('all')).toHaveLength(bibleTreatments.length);
  });

  it('filters to a single category', () => {
    const results = filterBibleTreatmentsByCategory('tox');
    expect(results.map((t) => t.id).sort()).toEqual(['botox', 'dysport']);
  });
});

describe('getBibleTreatmentById', () => {
  it('resolves a direct named Bible entry', () => {
    const treatment = getBibleTreatmentById('sculptra');
    expect(treatment?.name).toBe('Sculptra');
  });

  it('falls back to a generic recommendation category when there is no named entry', () => {
    // "peels" is a recommendation category with no dedicated named Bible
    // entry — Learn More from the Result screen must still resolve it.
    const treatment = getBibleTreatmentById('peels');
    expect(treatment?.name).toBe('Peels');
    expect(treatment?.categoryId).toBe('peels');
  });

  it('returns undefined for an unknown id', () => {
    expect(getBibleTreatmentById('not-a-real-id')).toBeUndefined();
  });
});

describe('bibleConcerns', () => {
  it('defines exactly the 7 curated browsing concerns', () => {
    expect(bibleConcerns.map((c) => c.id).sort()).toEqual(
      ['fine_lines', 'jawline', 'pigmentation', 'sagging_skin', 'texture_pores', 'under_eye', 'volume_loss'].sort(),
    );
  });

  it('every concern links to at least one related treatment', () => {
    for (const concern of bibleConcerns) {
      expect(concern.relatedTreatments.length).toBeGreaterThan(0);
    }
  });

  it('applies the Bible-specific label override for skin laxity', () => {
    const saggingSkin = bibleConcerns.find((c) => c.id === 'sagging_skin');
    expect(saggingSkin?.name).toBe('Skin laxity');
  });
});
