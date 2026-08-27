/**
 * Centralized app configuration: feature flags and quotas.
 *
 * Values here are placeholders for the V1 workspace scaffold. Real values
 * (and server-verified enforcement) come later — per CLAUDE.md, quotas
 * must be server-verifiable and must never be enforced client-side only.
 *
 * Public runtime environment values (Supabase URL/key, etc.) live in
 * lib/env.ts, not here.
 */

export const featureFlags = {
  previewEnabled: true,
  glowEnabled: true,
  nearMeEnabled: true,
  askTheBibleEnabled: false,
} as const;

export const freeQuotas = {
  previewGenerationsPerMonth: 3,
  glowGenerationsPerMonth: 3,
} as const;

export const premiumEntitlements = {
  monthlyPriceUsd: 14.99,
  annualPriceUsd: 99,
  heroOffer: 'annual',
} as const;
