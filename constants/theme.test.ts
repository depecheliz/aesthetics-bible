import { theme } from './theme';

describe('theme tokens', () => {
  it('exposes the brand color palette', () => {
    expect(theme.colors.background).toBe('#0B0B0C');
    expect(theme.colors.accent).toBe('#C9A97E');
  });

  it('exposes typography roles with the brand typefaces', () => {
    expect(theme.typography.displayLarge.fontFamily).toBe('PlayfairDisplay_600SemiBold');
    expect(theme.typography.body.fontFamily).toBe('Montserrat_400Regular');
  });
});
