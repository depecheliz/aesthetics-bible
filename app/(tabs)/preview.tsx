import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Rule } from '../../components/ui/Rule';
import { EditorialImage } from '../../components/media/EditorialImage';
import { BeforeAfterFrame } from '../../components/media/BeforeAfterFrame';
import { colors, radius, spacing } from '../../constants/theme';

type Mode = 'preview' | 'glow';

const previewGoals = [
  'Softer-Looking Lines',
  'Brighter Complexion',
  'More Even Tone',
  'Subtle Lip-Volume Look',
  'Jawline-Definition Look',
  'Refreshed Look',
];

const glowPresets = ['Natural Me', 'Polished', 'Soft Glam', 'Golden Hour', 'Studio', 'Fresh Face', 'Date Night', 'Vacation Glow'];

const myNaturalLookPrefs = [
  'Gentle skin polish',
  'Slight eye brightening',
  'Slight teeth brightening',
  'Natural makeup',
  'No intentional face reshaping',
  'Soft studio lighting',
];

const exportDestinations = ['Instagram', 'Story', 'Facebook', 'Dating', 'LinkedIn', 'Original HD'];

function IntensitySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.sliderWrap}>
      <View style={styles.sliderLabels}>
        <ThemedText variant="caption" color={colors.textSecondary}>
          SUBTLE
        </ThemedText>
        <ThemedText variant="caption" color={colors.textSecondary}>
          ENHANCED
        </ThemedText>
      </View>
      <View style={styles.sliderTrack}>
        {[0, 1, 2].map((step) => (
          <Pressable
            key={step}
            onPress={() => onChange(step)}
            accessibilityRole="button"
            accessibilityLabel={`Intensity level ${step + 1}`}
            style={styles.sliderStepHit}
          >
            <View style={[styles.sliderStep, step <= value && styles.sliderStepFilled]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function PreviewScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode === 'glow' ? 'glow' : 'preview');
  const [selectedGoal, setSelectedGoal] = useState<string>(previewGoals[0]);
  const [selectedPreset, setSelectedPreset] = useState<string>(glowPresets[0]);
  const [intensity, setIntensity] = useState(1);

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
            <ThemedText variant="displayMedium" style={styles.headline}>
              See a possibility before making a decision.
            </ThemedText>

            <EditorialImage variant="portrait" label="AI VISUALIZATION" style={styles.heroImage} />

            <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
              CHOOSE A LOOK
            </ThemedText>
            <View style={styles.goalGrid}>
              {previewGoals.map((goal) => {
                const selected = selectedGoal === goal;
                return (
                  <Pressable
                    key={goal}
                    onPress={() => setSelectedGoal(goal)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={goal}
                  >
                    <View style={[styles.goalChip, selected && styles.goalChipSelected]}>
                      <ThemedText variant="caption" color={selected ? colors.textOnIvory : colors.textPrimary}>
                        {goal}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
              INTENSITY
            </ThemedText>
            <IntensitySlider value={intensity} onChange={setIntensity} />

            <Button label="Try Preview" icon="camera" variant="secondary" disabled style={styles.tryButton} />

            <Rule style={styles.rule} />
            <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
              TODAY | MY VISUALIZATION
            </ThemedText>
            <BeforeAfterFrame />

            <ThemedText variant="caption" color={colors.textMuted} style={styles.disclaimer}>
              Preview visualizations are illustrative, not a predicted treatment outcome, diagnosis, or guarantee.
            </ThemedText>
          </>
        ) : (
          <>
            <ThemedText variant="displayMedium" style={styles.headline}>
              Your photo. Elevated.
            </ThemedText>
            <ThemedText variant="body" color={colors.textSecondary} style={styles.glowIntro}>
              Create a polished version of yourself for the photos you actually share.
            </ThemedText>

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
                    <EditorialImage variant="social" tone={selected ? 'ivory' : 'dark'} label={preset} />
                  </Pressable>
                );
              })}
            </View>

            <Button label="Try Glow" icon="sun" variant="secondary" disabled style={styles.tryButton} />

            <Rule style={styles.rule} />

            <Card variant="ivory" style={styles.lookCard}>
              <ThemedText variant="eyebrow" color={colors.accent}>
                MY LOOK
              </ThemedText>
              <ThemedText variant="displaySmall" color={colors.textOnIvory} style={styles.lookTitle}>
                My Natural Look
              </ThemedText>
              {myNaturalLookPrefs.map((pref) => (
                <ThemedText key={pref} variant="body" color={colors.textOnIvory} style={styles.lookPref}>
                  · {pref}
                </ThemedText>
              ))}
              <Button label="Apply My Look" variant="secondary" disabled style={styles.applyButton} />
            </Card>

            <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
              EXPORT TO
            </ThemedText>
            <View style={styles.exportRow}>
              {exportDestinations.map((destination) => (
                <View key={destination} style={styles.exportChip}>
                  <ThemedText variant="caption" color={colors.textSecondary}>
                    {destination}
                  </ThemedText>
                </View>
              ))}
            </View>

            <ThemedText variant="caption" color={colors.textMuted} style={styles.disclaimer}>
              Glow enhances a photo for social sharing — it is separate from Preview and is not a treatment
              visualization.
            </ThemedText>
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
  segmentedControl: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  segmentButton: {
    flex: 1,
  },
  headline: {
    marginBottom: spacing.lg,
  },
  heroImage: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  goalChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sliderWrap: {
    marginBottom: spacing.lg,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sliderTrack: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sliderStepHit: {
    flex: 1,
  },
  sliderStep: {
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  sliderStepFilled: {
    backgroundColor: colors.accent,
  },
  tryButton: {
    marginBottom: spacing.sm,
  },
  rule: {
    width: '100%',
    opacity: 0.4,
    marginVertical: spacing.lg,
  },
  disclaimer: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  glowIntro: {
    marginBottom: spacing.lg,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  presetTile: {
    width: '31%',
  },
  lookCard: {
    marginBottom: spacing.lg,
  },
  lookTitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  lookPref: {
    marginBottom: spacing.xxs,
  },
  applyButton: {
    marginTop: spacing.md,
  },
  exportRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  exportChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
