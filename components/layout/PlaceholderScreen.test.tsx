import { render, screen } from '@testing-library/react-native';
import { PlaceholderScreen } from './PlaceholderScreen';

describe('PlaceholderScreen', () => {
  it('renders the given title and description', async () => {
    await render(<PlaceholderScreen title="Home" description="Welcome" />);

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Welcome')).toBeTruthy();
  });
});
