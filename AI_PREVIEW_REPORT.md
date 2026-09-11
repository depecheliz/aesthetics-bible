# AI Preview audit — 2026-09-11

Scope: V1 Preview only. Audit completed before implementation. The working tree already contains unrelated changes, including edits to the Preview screen; those are preserved.

1. **What already works:** Expo library picker/compression; Supabase auth; source upload service; private bucket/owner RLS migrations; successful-generation ledger and monthly count RPC; report/account-deletion functions; PanResponder comparison component; analytics call sites (vendor is a no-op).
2. **Partially implemented:** generate-preview authenticates, checks the existing entitlement boundary and quota, then would store output and insert a success row. None of this proves deployment. Client uploads and invokes but does not validate responses or resolve image URLs.
3. **Mocked/placeholder:** provider always throws; launch gate is false; result comparison incorrectly uses campaign photos. Marketing examples are static. Glow is explicitly unfinished and outside this change.
4. **Missing:** actual provider adapter, treatment-specific instructions/intensity, real result images, history, photo deletion, refreshable signed URLs, bounded errors/retry, concurrent quota protection.
5. **End-to-end blockers:** no production provider selected; benchmark outputs contain only .gitkeep; BUILD_STATUS reports paused Supabase and unapplied Preview migrations/functions (live state unverified). Server provider/entitlement configuration and launch verification remain required. Local benchmark .env exists; its presence does not prove a valid credential or authorize choosing a model.

Security findings before changes: buckets and history have owner policies; no provider secret appears in the inspected client integration. Non-atomic quota check permits concurrent overuse. Unvalidated client response can appear successful. Raw server exceptions can expose internal details. Failed uploads/generations can leave retained source files. Slider labels are opposite their visible image layers. No individual deletion/history flow exists.

Implementation and validation results will be recorded below.
