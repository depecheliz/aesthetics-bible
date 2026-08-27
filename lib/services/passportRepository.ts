/**
 * Persistence for Aesthetics Passport treatment entries. Photo fields are
 * intentionally not persisted yet — Phase 1 has no photo storage; the
 * existing local `photos` flags stay UI-only until that phase.
 */

import { supabase } from './supabaseClient';
import type { NewPassportEntryInput, PassportEntry } from '../../src/domain/passport';

export interface PassportRepository {
  list(userId: string): Promise<PassportEntry[]>;
  /**
   * `id` is generated client-side (see AppStateContext) and used as the
   * row's primary key, so the locally displayed entry and the persisted
   * row always share one id — no post-save id-swap in local state.
   */
  create(userId: string, id: string, input: NewPassportEntryInput): Promise<PassportEntry>;
}

type Row = {
  id: string;
  treatment: string;
  entry_date: string;
  provider: string;
  cost: number;
  product: string;
  amount_units: string;
  area: string;
  notes: string;
  satisfaction: number;
  would_do_again: boolean;
};

function toPassportEntry(row: Row): PassportEntry {
  return {
    id: row.id,
    treatment: row.treatment,
    date: row.entry_date,
    provider: row.provider,
    cost: row.cost,
    product: row.product,
    amountUnits: row.amount_units,
    area: row.area,
    notes: row.notes,
    satisfaction: row.satisfaction as PassportEntry['satisfaction'],
    wouldDoAgain: row.would_do_again,
    photos: {},
  };
}

const SELECT_COLUMNS = 'id, treatment, entry_date, provider, cost, product, amount_units, area, notes, satisfaction, would_do_again';

export const supabasePassportRepository: PassportRepository = {
  async list(userId) {
    const { data, error } = await supabase
      .from('passport_entries')
      .select(SELECT_COLUMNS)
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toPassportEntry);
  },

  async create(userId, id, input) {
    const { data, error } = await supabase
      .from('passport_entries')
      .insert({
        id,
        user_id: userId,
        treatment: input.treatment,
        entry_date: input.date,
        provider: input.provider,
        cost: input.cost,
        product: input.product,
        amount_units: input.amountUnits,
        area: input.area,
        notes: input.notes,
        satisfaction: input.satisfaction,
        would_do_again: input.wouldDoAgain,
      })
      .select(SELECT_COLUMNS)
      .single();

    if (error) throw error;
    return toPassportEntry(data);
  },
};
