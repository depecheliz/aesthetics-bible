import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { ThemedText } from '../typography/ThemedText';
import { Card } from '../ui/Card';
import { Rule } from '../ui/Rule';
import { Button } from '../ui/Button';
import { Monogram } from '../brand/Monogram';
import { colors, spacing } from '../../constants/theme';

type ShareCardProps = {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  ctaLabel?: string;
  onShare?: () => void;
  disabled?: boolean;
};

/**
 * Reusable frame for future shareable moments (Aesthetics Profile Card,
 * Aesthetics Wrapped, Progress Story, Wishlist, ...). Architecture only —
 * no real export/share pipeline wired up yet.
 */
export function ShareCard({ eyebrow, title, children, ctaLabel = 'Save & Share', onShare, disabled = true }: ShareCardProps) {
  return (
    <Card variant="ivory" style={styles.card}>
      <View style={styles.headerRow}>
        <ThemedText variant="eyebrow" color={colors.accent}>
          {eyebrow}
        </ThemedText>
        <Monogram size="sm" tone="ivory" />
      </View>
      <ThemedText variant="displaySmall" color={colors.textOnIvory} style={styles.title}>
        {title}
      </ThemedText>
      <Rule color={colors.rule} style={styles.rule} />
      {children}
      <Button
        label={ctaLabel}
        icon="share"
        variant="secondary"
        onPress={onShare}
        disabled={disabled || !onShare}
        style={styles.button}
      />
    </Card>
  );
}

export function ShareCardStatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <ThemedText variant="body" color={colors.textOnIvory}>
        {label}
      </ThemedText>
      <ThemedText variant="bodyLarge" color={colors.textOnIvory}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    marginTop: spacing.xs,
  },
  rule: {
    marginVertical: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  button: {
    marginTop: spacing.md,
  },
});
