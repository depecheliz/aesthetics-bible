import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, radius, spacing } from '../../constants/theme';

type Mode = 'preview' | 'glow';

const glowPresets = ['Natural Me', 'Polished', 'Date Night', 'Soft Glam', 'Golden Hour', 'Studio'];

export default function PreviewScreen() {
  const [mode, setMode] = useState<Mode>('preview');

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          PREVIEW
        </ThemedText>
        <ThemedText variant="displaySmall" style={styles.title}>
          Explore a look before you commit.
        </ThemedText>

        <View style={styles.segmentedControl}>
          <Button
            label="Preview"
            variant={mode === 'preview' ? 'primary' : 'ghost'}
            fullWidth={false}
            style={styles.segmentButton}
            onPress={() => setMode('preview')}
          />
          <Button
            label="Glow"
            variant={mode === 'glow' ? 'primary' : 'ghost'}
            fullWidth={false}
            style={styles.segmentButton}
            onPress={() => setMode('glow')}
          />
        </View>

        {mode === 'preview' ? (
          <Card variant="surface" style={styles.demoCard}>
            <View style={styles.samplePlaceholder}>
              <Feather name="image" size={28} color={colors.textSecondary} />
              <ThemedText variant="caption" color={colors.textSecondary} style={styles.sampleLabel}>
                AI VISUALIZATION — SAMPLE
              </ThemedText>
            </View>
            <ThemedText variant="body" color={colors.textSecondary} style={styles.demoBody}>
              Preview generates a visualization of an aesthetic look based on your photo. This is a
              sample of the experience — it is not a predicted treatment outcome, diagnosis, or
              guarantee.
            </ThemedText>
            <Button label="Try Preview" icon="camera" variant="secondary" disabled />
          </Card>
        ) : (
          <Card variant="surface" style={styles.demoCard}>
            <ThemedText variant="body" color={colors.textSecondary} style={styles.demoBody}>
              Glow enhances a photo for social sharing — lighting, gentle smoothing, and polish. It is
              separate from Preview and is not a treatment visualization.
            </ThemedText>
            <View style={styles.presetGrid}>
              {glowPresets.map((preset) => (
                <View key={preset} style={styles.presetChip}>
                  <ThemedText variant="caption" color={colors.textPrimary}>
                    {preset}
                  </ThemedText>
                </View>
              ))}
            </View>
            <Button label="Try Glow" icon="sun" variant="secondary" disabled />
          </Card>
        )}
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
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.lg,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  segmentButton: {
    flex: 1,
  },
  demoCard: {
    alignItems: 'stretch',
  },
  samplePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  sampleLabel: {
    marginTop: spacing.xs,
    letterSpacing: 1,
  },
  demoBody: {
    marginBottom: spacing.md,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  presetChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
