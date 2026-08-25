import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, spacing } from '../../constants/theme';

const quickActions: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  href: '/bible' | '/preview' | '/passport';
}[] = [
  { label: 'Explore The Bible', icon: 'book-open', href: '/bible' },
  { label: 'Preview My Look', icon: 'camera', href: '/preview' },
  { label: 'My Aesthetics Passport', icon: 'briefcase', href: '/passport' },
];

export default function HomeScreen() {
  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          THE AESTHETICS BIBLE
        </ThemedText>
        <ThemedText variant="displayLarge" style={styles.headline}>
          See your possibilities.{'\n'}Discover your options.{'\n'}Plan your aesthetic journey.
        </ThemedText>

        <Button
          label="Build My Aesthetics Plan"
          icon="arrow-right"
          onPress={() => router.push('/quiz')}
          style={styles.primaryCta}
        />

        <Card variant="outline" style={styles.introCard}>
          <ThemedText variant="bodyLarge" color={colors.textPrimary}>
            The Aesthetics Bible helps you understand your options, visualize possibilities,
            organize your aesthetics journey, and remember what you&apos;ve done — all in one place.
          </ThemedText>
        </Card>

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
          QUICK ACTIONS
        </ThemedText>
        <View style={styles.quickActions}>
          {quickActions.map((action) => (
            <Card key={action.href} variant="surface" style={styles.quickActionCard}>
              <Button
                label={action.label}
                icon={action.icon}
                variant="ghost"
                fullWidth={false}
                onPress={() => router.push(action.href)}
                style={styles.quickActionButton}
              />
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  eyebrow: {
    marginBottom: spacing.md,
  },
  headline: {
    marginBottom: spacing.xl,
  },
  primaryCta: {
    marginBottom: spacing.xl,
  },
  introCard: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  quickActions: {
    gap: spacing.sm,
  },
  quickActionCard: {
    padding: spacing.xs,
  },
  quickActionButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.sm,
  },
});
