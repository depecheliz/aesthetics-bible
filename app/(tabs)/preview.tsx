import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, radius, spacing } from '../../constants/theme';

type Mode = 'preview' | 'glow';

const previewExamples = ['Softer-looking lines', 'Brighter complexion', 'Subtle lip-volume look', 'Jawline-definition look'];

const glowPresets = ['Natural Me', 'Polished', 'Soft Glam', 'Golden Hour', 'Studio', 'Fresh Face'];

export default function PreviewScreen() {
  const [mode, setMode] = useState<Mode>('preview');
  const [selectedExample, setSelectedExample] = useState<string>(previewExamples[0]);
  const [selectedPreset, setSelectedPreset] = useState<string>(glowPresets[0]);

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          PREVIEW
        </ThemedText>
        <ThemedText variant="displaySmall" style={styles.title}>
          {mode === 'preview' ? 'Explore an aesthetic look.' : 'Create your polished social look.'}
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
          <>
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
            </Card>

            <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
              EXAMPLES TO EXPLORE
            </ThemedText>
            <View style={styles.exampleGrid}>
              {previewExamples.map((example) => {
                const selected = selectedExample === example;
                return (
                  <Pressable
                    key={example}
                    onPress={() => setSelectedExample(example)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={example}
                  >
                    <View style={[styles.exampleChip, selected && styles.exampleChipSelected]}>
                      <ThemedText variant="caption" color={selected ? colors.textOnIvory : colors.textPrimary}>
                        {example}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Button label="Try Preview" icon="camera" variant="secondary" disabled style={styles.tryButton} />
          </>
        ) : (
          <>
            <Card variant="surface" style={styles.demoCard}>
              <ThemedText variant="body" color={colors.textSecondary} style={styles.demoBody}>
                Glow enhances a photo for social sharing — lighting, gentle smoothing, and polish. It is
                separate from Preview and is not a treatment visualization.
              </ThemedText>
            </Card>

            <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
              PRESETS
            </ThemedText>
            <View style={styles.presetGrid}>
              {glowPresets.map((preset) => {
                const selected = selectedPreset === preset;
                return (
                  <Pressable
                    key={preset}
                    onPress={() => setSelectedPreset(preset)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={preset}
                    style={styles.presetTile}
                  >
                    <Card variant={selected ? 'ivory' : 'outline'} style={styles.presetCard}>
                      <Feather name="sun" size={18} color={selected ? colors.accent : colors.textSecondary} />
                      <ThemedText
                        variant="caption"
                        color={selected ? colors.textOnIvory : colors.textPrimary}
                        style={styles.presetLabel}
                      >
                        {preset}
                      </ThemedText>
                    </Card>
                  </Pressable>
                );
              })}
            </View>

            <Button label="Try Glow" icon="sun" variant="secondary" disabled style={styles.tryButton} />
            <Button label="Save My Look" icon="bookmark" variant="ghost" disabled />
          </>
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
    marginBottom: spacing.lg,
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
  demoBody: {},
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  exampleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  exampleChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exampleChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  presetTile: {
    width: '31%',
  },
  presetCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  presetLabel: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  tryButton: {
    marginBottom: spacing.sm,
  },
});
