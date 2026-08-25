import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Screen } from '../components/layout/Screen';
import { ThemedText } from '../components/typography/ThemedText';
import { colors, spacing } from '../constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <Screen>
        <ThemedText variant="displaySmall" style={styles.title}>
          This screen doesn&apos;t exist.
        </ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText color={colors.accent}>Go to home screen</ThemedText>
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.xxl,
  },
  link: {
    marginTop: spacing.md,
  },
});
