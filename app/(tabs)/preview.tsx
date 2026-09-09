import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Rule } from '../../components/ui/Rule';
import { EditorialImage } from '../../components/media/EditorialImage';
import { BeforeAfterSlider } from '../../components/media/BeforeAfterSlider';
import { campaignImages } from '../../assets/brand/campaign';
import { useEntitlement } from '../../lib/state/EntitlementContext';
import { useOptionalAuth } from '../../lib/state/AuthContext';
import { analytics } from '../../lib/services/analyticsClient';
import { pickAndCompressPhoto } from '../../lib/services/imagePicker';
import {
  requestPreviewGeneration,
  getPreviewGenerationsUsedThisMonth,
  reportPreviewGeneration,
} from '../../lib/services/previewGeneration';
import { isPreviewGenerationLive, previewNotLiveMessage } from '../../lib/services/previewProviderStatus';
import { checkPreviewEligibility } from '../../src/domain/previewEligibility';
import { colors, radius, spacing } from '../../constants/theme';

// Native aspect ratio (width/height) of the pre-composed before/after
// visualization asset — rendered at its own ratio so the baked-in
// "TODAY / MY VISUALIZATION" labels and monogram are never cropped.
const VISUALIZATION_ASPECT_RATIO = 853 / 1844;

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

type GenerationState =
  | { phase: 'idle' }
  | { phase: 'working' }
  | { phase: 'result'; generationId: string; resultStoragePath: string }
  | { phase: 'error'; message: string };

export default function PreviewScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode === 'glow' ? 'glow' : 'preview');
  const [selectedGoal, setSelectedGoal] = useState<string>(previewGoals[0]);
  const [selectedPreset, setSelectedPreset] = useState<string>(glowPresets[0]);
  const [intensity, setIntensity] = useState(1);
  const [generation, setGeneration] = useState<GenerationState>({ phase: 'idle' });
  const [usedThisMonth, setUsedThisMonth] = useState(0);

  const { isPremium } = useEntitlement();
  const auth = useOptionalAuth();
  const userId = auth?.user?.id ?? null;

  useEffect(() => {
    if (isPremium && isPreviewGenerationLive) {
      getPreviewGenerationsUsedThisMonth().then(setUsedThisMonth);
    }
  }, [isPremium]);

  const eligibility = checkPreviewEligibility({ isPremium, isLive: isPreviewGenerationLive, usedThisMonth });

  const handleTryPreview = useCallback(async () => {
    if (!isPremium) {
      router.push('/paywall');
      return;
    }
    if (!isPreviewGenerationLive) {
      setGeneration({ phase: 'error', message: previewNotLiveMessage });
      return;
    }
    if (eligibility.allowed === false && eligibility.reason === 'quota_exceeded') {
      setGeneration({
        phase: 'error',
        message: "You've used all 10 Preview generations included this month. Your allowance renews next month.",
      });
      return;
    }
    if (!userId) {
      setGeneration({ phase: 'error', message: 'Please sign in to use AI Preview.' });
      return;
    }

    analytics.track('preview_started');
    setGeneration({ phase: 'working' });

    const picked = await pickAndCompressPhoto();
    if (picked.status === 'cancelled') {
      setGeneration({ phase: 'idle' });
      return;
    }
    if (picked.status === 'permission_denied') {
      setGeneration({ phase: 'error', message: 'Photo library access is needed to try Preview.' });
      return;
    }

    const outcome = await requestPreviewGeneration({
      userId,
      sourcePhotoUri: picked.photo.uri,
      visualizationGoal: selectedGoal,
      intensity: intensity === 0 ? 'subtle' : intensity === 1 ? 'moderate' : 'enhanced',
    });

    if (outcome.status === 'failure') {
      analytics.track('preview_failed');
      setGeneration({ phase: 'error', message: outcome.message });
      return;
    }

    analytics.track('preview_generated');
    setGeneration({ phase: 'result', generationId: outcome.generationId, resultStoragePath: outcome.resultStoragePath });
    setUsedThisMonth((count) => count + 1);
  }, [isPremium, eligibility, userId, selectedGoal, intensity]);

  const handleReport = useCallback(async () => {
    if (generation.phase !== 'result') return;
    try {
      await reportPreviewGeneration(generation.generationId, 'user_flagged');
      setGeneration({ phase: 'idle' });
    } catch {
      // Report failure shouldn't trap the user — they can still leave the screen.
    }
  }, [generation]);

  const tryButtonLabel = generation.phase === 'working' ? 'Generating…' : 'Try Preview';

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

            <EditorialImage
              variant="portrait"
              uri={campaignImages.previewHeroCrop}
              label="AI VISUALIZATION"
              style={styles.heroImage}
            />

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

            {isPremium && isPreviewGenerationLive && (
              <ThemedText variant="caption" color={colors.textSecondary} style={styles.quotaLabel}>
                {usedThisMonth} of 10 visualizations used this month
              </ThemedText>
            )}

            <Button
              label={tryButtonLabel}
              icon="camera"
              variant="secondary"
              loading={generation.phase === 'working'}
              onPress={handleTryPreview}
              style={styles.tryButton}
            />

            {generation.phase === 'error' && (
              <ThemedText variant="caption" color={colors.accent} style={styles.statusText}>
                {generation.message}
              </ThemedText>
            )}

            {generation.phase === 'result' && (
              <View style={styles.resultRow}>
                {/* TEMPORARY PLACEHOLDER IMAGES: campaignImages.previewHero
                    (before) and campaignImages.previewVisualization (after)
                    stand in until the real photo the user uploaded and the
                    real generated result (from Supabase Storage) are wired
                    in as the slider's images — that wiring depends on the
                    provider benchmark and is out of scope for this
                    presentation-only component. */}
                <BeforeAfterSlider
                  beforeImage={campaignImages.previewHero}
                  afterImage={campaignImages.previewVisualization}
                  style={styles.resultSlider}
                />
                <ThemedText variant="caption" color={colors.textSecondary} style={styles.statusText}>
                  Your visualization is ready.
                </ThemedText>
                <Button label="Report this image" variant="ghost" fullWidth={false} onPress={handleReport} />
              </View>
            )}

            <Rule style={styles.rule} />
            <EditorialImage
              variant="portrait"
              uri={campaignImages.previewVisualization}
              aspectRatio={VISUALIZATION_ASPECT_RATIO}
              noDefault
              style={styles.visualizationImage}
            />

            <ThemedText variant="caption" color={colors.textMuted} style={styles.disclaimer}>
              Preview visualizations are illustrative, not a predicted treatment outcome, diagnosis, or guarantee.
            </ThemedText>
          </>
        ) : (
          <>
            <ThemedText variant="displayMedium" style={styles.headline}>
              Your photo. Elevated.
            </ThemedText>
            <View style={styles.comingSoonBanner}>
              <ThemedText variant="eyebrow" color={colors.textMuted}>
                COMING SOON
              </ThemedText>
              <ThemedText variant="caption" color={colors.textSecondary} style={styles.comingSoonBody}>
                Glow isn&rsquo;t built yet and isn&rsquo;t included with your Aesthetics Bible Premium
                subscription today.
              </ThemedText>
            </View>
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

            <Button label="Coming Soon" icon="sun" variant="secondary" disabled style={styles.tryButton} />

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
              <Button label="Coming Soon" variant="secondary" disabled style={styles.applyButton} />
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
  quotaLabel: {
    marginBottom: spacing.sm,
  },
  tryButton: {
    marginBottom: spacing.sm,
  },
  statusText: {
    marginBottom: spacing.sm,
  },
  resultRow: {
    marginBottom: spacing.sm,
  },
  resultSlider: {
    marginBottom: spacing.sm,
  },
  rule: {
    width: '100%',
    opacity: 0.4,
    marginVertical: spacing.lg,
  },
  visualizationImage: {
    alignSelf: 'center',
    maxWidth: 320,
  },
  disclaimer: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  comingSoonBanner: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  comingSoonBody: {
    marginTop: spacing.xxs,
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
