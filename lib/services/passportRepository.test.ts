import { supabasePassportRepository } from './passportRepository';

jest.mock('./supabaseClient', () => ({ supabase: { from: jest.fn() } }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { supabase } = require('./supabaseClient');

describe('supabasePassportRepository', () => {
  afterEach(() => jest.clearAllMocks());

  it('list() maps snake_case rows to PassportEntry and scopes by user_id', async () => {
    const order = jest.fn(async () => ({
      data: [
        {
          id: 'entry-1',
          treatment: 'Botox',
          entry_date: '2026-01-01',
          provider: 'Studio',
          cost: 400,
          product: 'Botox',
          amount_units: '20 units',
          area: 'Forehead',
          notes: 'Great result',
          satisfaction: 5,
          would_do_again: true,
        },
      ],
      error: null,
    }));
    const eq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ eq }));
    supabase.from.mockReturnValue({ select });

    const entries = await supabasePassportRepository.list('user-1');

    expect(supabase.from).toHaveBeenCalledWith('passport_entries');
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(entries).toEqual([
      {
        id: 'entry-1',
        treatment: 'Botox',
        date: '2026-01-01',
        provider: 'Studio',
        cost: 400,
        product: 'Botox',
        amountUnits: '20 units',
        area: 'Forehead',
        notes: 'Great result',
        satisfaction: 5,
        wouldDoAgain: true,
        photos: {},
      },
    ]);
  });

  it('list() throws on a Supabase error rather than silently returning an empty list', async () => {
    const order = jest.fn(async () => ({ data: null, error: new Error('RLS denied') }));
    supabase.from.mockReturnValue({ select: () => ({ eq: () => ({ order }) }) });

    await expect(supabasePassportRepository.list('user-1')).rejects.toThrow('RLS denied');
  });

  it('create() inserts with the client-supplied id as the primary key', async () => {
    const single = jest.fn(async () => ({
      data: {
        id: 'client-generated-id',
        treatment: 'Botox',
        entry_date: '2026-01-01',
        provider: '',
        cost: 0,
        product: '',
        amount_units: '',
        area: '',
        notes: '',
        satisfaction: 4,
        would_do_again: true,
      },
      error: null,
    }));
    const select = jest.fn(() => ({ single }));
    const insert = jest.fn(() => ({ select }));
    supabase.from.mockReturnValue({ insert });

    const entry = await supabasePassportRepository.create('user-1', 'client-generated-id', {
      treatment: 'Botox',
      date: '2026-01-01',
      provider: '',
      cost: 0,
      product: '',
      amountUnits: '',
      area: '',
      notes: '',
      satisfaction: 4,
      wouldDoAgain: true,
    });

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ id: 'client-generated-id', user_id: 'user-1' }));
    expect(entry.id).toBe('client-generated-id');
  });
});
