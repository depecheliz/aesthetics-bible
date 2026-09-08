/**
 * UUID-v4-shaped random id without relying on `crypto.randomUUID()`, which
 * isn't reliably available in Hermes/React Native without an extra
 * polyfill. Mirrors the generator already used in AppStateContext for the
 * same reason — kept here as a shared util so new code doesn't have to
 * reach for `crypto.randomUUID()` by habit.
 */
export function randomId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
