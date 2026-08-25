export type Nullable<T> = T | null;

export type AsyncResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type Entitlement = 'free' | 'premium';
