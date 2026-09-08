import {
  bibleCategoryFilters,
  bibleConcerns,
  bibleCoreProviderQuestions,
  bibleSpecificProviderQuestions,
  bibleTreatments,
  filterBibleTreatmentsByCategory,
  findComparableCategoryId,
  findComparableTreatmentId,
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
    // "Neuromodulator" appears in aliases for all four tox-category brands
    expect(results.map((t) => t.id).sort()).toEqual(['botox', 'daxxify', 'dysport', 'xeomin']);
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
    expect(results.map((t) => t.id).sort()).toEqual(['botox', 'daxxify', 'dysport', 'xeomin']);
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

describe('findComparableCategoryId', () => {
  it('finds another category from a shared concern candidate list', () => {
    // "ultrasound" and "rf" both appear under sagging_skin's candidates.
    expect(findComparableCategoryId('ultrasound')).toBeDefined();
    expect(findComparableCategoryId('ultrasound')).not.toBe('ultrasound');
  });

  it('returns a defined pairing for every category used in the Bible', () => {
    for (const categoryId of bibleCategoryFilters) {
      expect(findComparableCategoryId(categoryId)).toBeDefined();
    }
  });
});

describe('manuscript content expansion', () => {
  it('grew the library from 10 to 28 named treatments', () => {
    expect(bibleTreatments).toHaveLength(28);
  });

  it('populated the three categories that previously had zero named treatments', () => {
    expect(filterBibleTreatmentsByCategory('peels')).toHaveLength(1);
    expect(filterBibleTreatmentsByCategory('threads')).toHaveLength(3);
    expect(filterBibleTreatmentsByCategory('skincare')).toHaveLength(4);
  });

  it('gives every treatment a stage, primary layers, and the seven manuscript-derived fields', () => {
    for (const treatment of bibleTreatments) {
      expect(['preserve', 'restore', 'rebuild']).toContain(treatment.stage);
      expect(treatment.primaryLayers.length).toBeGreaterThan(0);
      expect(treatment.whatItDoesNotAddress.length).toBeGreaterThan(0);
      expect(treatment.discomfort.length).toBeGreaterThan(0);
      expect(treatment.repeatFrequency.length).toBeGreaterThan(0);
      expect(treatment.valueSummary.length).toBeGreaterThan(0);
      expect(treatment.whoShouldSkip.length).toBeGreaterThan(0);
    }
  });

  it('differentiates the four neuromodulator brands by repeat frequency, per the manuscript', () => {
    const daxxify = bibleTreatments.find((t) => t.id === 'daxxify');
    const botox = bibleTreatments.find((t) => t.id === 'botox');
    expect(daxxify?.repeatFrequency).not.toBe(botox?.repeatFrequency);
  });
});

describe('findComparableTreatmentId', () => {
  it('pairs a treatment with another named treatment in the same category', () => {
    expect(findComparableTreatmentId('botox')).toBe('dysport');
    expect(['sculptra'].includes(findComparableTreatmentId('radiesse') ?? '')).toBe(true);
  });

  it('returns undefined for a treatment with no other named treatment in its category', () => {
    expect(findComparableTreatmentId('fillers')).toBeUndefined();
    expect(findComparableTreatmentId('microneedling')).toBeUndefined();
  });
});

describe('provider questions', () => {
  it('exposes the five manuscript core questions', () => {
    expect(bibleCoreProviderQuestions).toHaveLength(5);
  });

  it('only adds treatment-specific questions where the manuscript supports them', () => {
    expect(bibleSpecificProviderQuestions.botox?.length).toBeGreaterThan(0);
    expect(bibleSpecificProviderQuestions.sofwave).toBeUndefined();
  });
});
