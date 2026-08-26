/**
 * Ambient module declarations for statically required image assets
 * (e.g. require('./photo.jpg')), which Metro resolves to a numeric
 * module id at runtime.
 */

declare module '*.png' {
  const value: number;
  export default value;
}

declare module '*.jpg' {
  const value: number;
  export default value;
}

declare module '*.jpeg' {
  const value: number;
  export default value;
}
