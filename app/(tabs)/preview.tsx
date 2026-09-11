import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Rule } from '../../components/ui/Rule';
import { EditorialImage } from '../../components/media/EditorialImage';
import { PreviewResult } from '../../components/media/PreviewResult';
import { randomId } from '../../lib/utils/randomId';
import { previewGoalInstructions } from '../../supabase/functions/_shared/previewGoals';
import { campaignImages } from '../../assets/brand/campaign';
import { useEntitlement } from '../../lib/state/EntitlementContext';
import { useOptionalAuth } from '../../lib/state/AuthContext';
import { analytics } from '../../lib/services/analyticsClient';
import { pickAndCompressPhoto } from '../../lib/services/imagePicker';
import {
  requestPreviewGeneration,
  getPreviewGenerationsUsedThisMonth,
  reportPreviewGeneration,
  listSavedPreviews,
  deleteSavedPreview,
  type SavedPreview,
  type PreviewGenerationRequest,
} from '../../lib/services/previewGeneration';
import {
  isPreviewGenerationLive,
  previewNotLiveMessage,
} from '../../lib/services/previewProviderStatus';
import { checkPreviewEligibility } from '../../src/domain/previewEligibility';
import { colors, radius, spacing } from '../../constants/theme';

// Native aspect ratio (width/height) of the pre-composed before/after
// visualization asset — rendered at its own ratio so the baked-in
// "TODAY / MY VISUALIZATION" labels and monogram are never cropped.
const VISUALIZATION_ASPECT_RATIO = 853 / 1844;

type Mode = 'preview' | 'glow';

const previewGoals = Object.keys(previewGoalInstructions);

const glowPresets = [
  'Natural Me',
  'Polished',
  'Soft Glam',
  'Golden Hour',
  'Studio',
  'Fresh Face',
  'Date Night',
  'Vacation Glow',
];

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
  | { phase: 'result'; preview: SavedPreview }
  | { phase: 'error'; message: string };

export default function PreviewScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode === 'glow' ? 'glow' : 'preview');
  const [selectedGoal, setSelectedGoal] = useState<string>(previewGoals[0]);
  const [selectedPreset, setSelectedPreset] = useState<string>(glowPresets[0]);
  const [intensity, setIntensity] = useState(1);
  const [generation, setGeneration] = useState<GenerationState>({ phase: 'idle' });
  const [usedThisMonth, setUsedThisMonth] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedPreview[]>([]);
  const [notice, setNotice] = useState('');
  const pending = useRef<PreviewGenerationRequest | null>(null);
  const active = useRef(false);
  const sessionEpoch = useRef(0);
  const busy = useRef(false);
  const abort = useRef<AbortController | null>(null);

  const { isPremium } = useEntitlement();
  const auth = useOptionalAuth();
  const userId = auth?.user?.id ?? null;

  const refreshHistory = useCallback(async () => {
    if (!userId) return;
    const epoch = sessionEpoch.current;
    try {
      const [saved, count] = await Promise.all([
        listSavedPreviews(),
        getPreviewGenerationsUsedThisMonth(),
      ]);
      if (active.current && epoch === sessionEpoch.current) {
        setHistory(saved);
        setUsedThisMonth(count);
        setNotice('');
      }
    } catch {
      if (active.current && epoch === sessionEpoch.current)
        setNotice('Could not refresh saved previews. Please try again.');
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      active.current = true;
      sessionEpoch.current += 1;
      setGeneration({ phase: 'idle' });
      setPhoto(null);
      setHistory([]);
      setUsedThisMonth(0);
      setNotice('');
      pending.current = null;
      if (isPreviewGenerationLive) void refreshHistory();
      return () => {
        active.current = false;
        sessionEpoch.current += 1;
        abort.current?.abort();
        busy.current = false;
        pending.current = null;
      };
    }, [refreshHistory]),
  );

  const eligibility = checkPreviewEligibility({
    isPremium,
    isLive: isPreviewGenerationLive,
    usedThisMonth,
  });
  const choosePhoto = async () => {
    if (busy.current) return;
    const epoch = sessionEpoch.current;
    try {
      const picked = await pickAndCompressPhoto();
      if (!active.current || epoch !== sessionEpoch.current) return;
      if (picked.status === 'picked') {
        setPhoto(picked.photo.uri);
        pending.current = null;
        setGeneration({ phase: 'idle' });
      } else if (picked.status === 'permission_denied')
        setNotice('Photo library access is needed to choose a photo.');
    } catch {
      if (active.current) setNotice('Could not open this photo. Please try another image.');
    }
  };
  const handleTryPreview = useCallback(async () => {
    if (busy.current) return;
    if (!userId) {
      setGeneration({ phase: 'error', message: 'Please sign in to use AI Preview.' });
      return;
    }
    if (!isPreviewGenerationLive) {
      setGeneration({ phase: 'error', message: previewNotLiveMessage });
      return;
    }
    if (!isPremium) {
      router.push('/paywall');
      return;
    }
    if (!photo) {
      setGeneration({ phase: 'error', message: 'Choose a photo first.' });
      return;
    }
    if (!pending.current && !eligibility.allowed) {
      setGeneration({ phase: 'error', message: 'You have used your monthly Preview allowance.' });
      return;
    }
    const request =
      pending.current ??
      ({
        userId,
        requestId: randomId(),
        sourcePhotoUri: photo,
        visualizationGoal: selectedGoal,
        intensity: intensity === 0 ? 'subtle' : intensity === 1 ? 'moderate' : 'enhanced',
      } as PreviewGenerationRequest);
    pending.current = request;
    busy.current = true;
    const controller = new AbortController();
    abort.current = controller;
    setGeneration({ phase: 'working' });
    setNotice('');
    analytics.track('preview_started');
    const outcome = await requestPreviewGeneration(request, controller.signal);
    if (!active.current || controller.signal.aborted || abort.current !== controller) return;
    busy.current = false;
    if (outcome.status === 'failure') {
      analytics.track('preview_failed');
      setGeneration({ phase: 'error', message: outcome.message });
      return;
    }
    analytics.track('preview_generated');
    setGeneration({
      phase: 'result',
      preview: {
        id: outcome.generationId,
        result_storage_path: outcome.resultStoragePath,
        source_storage_path: userId + '/' + request.requestId + '.jpg',
        visualization_goal: request.visualizationGoal,
        intensity: request.intensity,
        created_at: new Date().toISOString(),
      },
    });
    pending.current = null;
    await refreshHistory();
  }, [isPremium, eligibility, userId, selectedGoal, intensity, photo, refreshHistory]);

  const handleReport = useCallback(async () => {
    if (generation.phase !== 'result') return;
    try {
      await reportPreviewGeneration(generation.preview.id, 'user_flagged');
      if (active.current) setNotice('Your report was submitted.');
    } catch {
      if (active.current) setNotice('Could not submit the report. Please retry.');
    }
  }, [generation]);

  const tryButtonLabel =
    generation.phase === 'working'
      ? 'Creating your personalized preview…'
      : generation.phase === 'error'
        ? 'Retry Preview'
        : 'Generate Preview';

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
              uri={photo ? { uri: photo } : campaignImages.previewHeroCrop}
              label={photo ? 'YOUR PHOTO' : 'ILLUSTRATIVE EXAMPLE'}
              style={styles.heroImage}
              noDefault
            />

            <Button
              label={photo ? 'Choose another photo' : 'Choose photo'}
              icon="camera"
              variant="secondary"
              disabled={generation.phase === 'working'}
              onPress={choosePhoto}
            />
            <ThemedText variant="caption">
              Generate sends your photo securely to our image provider and saves the photo and
              preview privately to your account. Use a photo you have permission to edit.
            </ThemedText>
            {!userId && (
              <Button
                label="Sign in for Preview"
                variant="ghost"
                onPress={() => router.push('/auth/sign-in')}
              />
            )}
            <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
              CHOOSE A LOOK
            </ThemedText>
            <View style={styles.goalGrid}>
              {previewGoals.map((goal) => {
                const selected = selectedGoal === goal;
                return (
                  <Pressable
                    key={goal}
                    disabled={generation.phase === 'working'}
                    onPress={() => {
                      setSelectedGoal(goal);
                      pending.current = null;
                      setGeneration({ phase: 'idle' });
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={goal}
                  >
                    <View style={[styles.goalChip, selected && styles.goalChipSelected]}>
                      <ThemedText
                        variant="caption"
                        color={selected ? colors.textOnIvory : colors.textPrimary}
                      >
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
            <IntensitySlider
              value={intensity}
              onChange={(value) => {
                if (generation.phase !== 'working') {
                  setIntensity(value);
                  pending.current = null;
                  setGeneration({ phase: 'idle' });
                }
              }}
            />

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
              onPress={() => {
                void handleTryPreview();
              }}
              style={styles.tryButton}
            />

            {generation.phase === 'working' && (
              <>
                <ThemedText variant="caption">
                  This can take up to two minutes. Your preview is saved only after generation
                  succeeds.
                </ThemedText>
                <Button
                  label="Stop waiting"
                  variant="ghost"
                  onPress={() => {
                    abort.current?.abort();
                    busy.current = false;
                    setGeneration({
                      phase: 'error',
                      message:
                        'Stopped waiting. A request already received by the server may finish and use one preview. Refresh saved previews or retry to recover it.',
                    });
                  }}
                />
              </>
            )}
            {!!notice && (
              <ThemedText accessibilityRole="alert" variant="caption">
                {notice}
              </ThemedText>
            )}
            {generation.phase === 'error' && (
              <ThemedText variant="caption" color={colors.accent} style={styles.statusText}>
                {generation.message}
              </ThemedText>
            )}

            {generation.phase === 'result' && (
              <View style={styles.resultRow}>
                <PreviewResult key={generation.preview.id} preview={generation.preview} />
                <Button
                  label="Delete saved images"
                  variant="ghost"
                  onPress={async () => {
                    try {
                      await deleteSavedPreview(generation.preview.id);
                      if (active.current) {
                        setGeneration({ phase: 'idle' });
                        setPhoto(null);
                      }
                      await refreshHistory();
                    } catch {
                      if (active.current) setNotice('Could not delete images. Please retry.');
                    }
                  }}
                />
                <Button
                  label="Report this image"
                  variant="ghost"
                  fullWidth={false}
                  onPress={handleReport}
                />
              </View>
            )}

            {userId && (
              <View>
                <ThemedText variant="eyebrow">SAVED PREVIEWS</ThemedText>
                <Button label="Refresh saved previews" variant="ghost" onPress={refreshHistory} />
                {history.length === 0 && (
                  <ThemedText variant="caption">Your saved previews will appear here.</ThemedText>
                )}
                {history.map((item) => (
                  <Button
                    key={item.id}
                    label={
                      item.visualization_goal +
                      ' · ' +
                      new Date(item.created_at).toLocaleDateString()
                    }
                    variant="ghost"
                    disabled={generation.phase === 'working'}
                    onPress={() => setGeneration({ phase: 'result', preview: item })}
                  />
                ))}
              </View>
            )}
            <Rule style={styles.rule} />
            <EditorialImage
              variant="portrait"
              uri={campaignImages.previewVisualization}
              label="ILLUSTRATIVE EXAMPLE"
              aspectRatio={VISUALIZATION_ASPECT_RATIO}
              noDefault
              style={styles.visualizationImage}
            />

            <ThemedText variant="caption" color={colors.textMuted} style={styles.disclaimer}>
              Preview visualizations are illustrative, not a predicted treatment outcome, diagnosis,
              or guarantee.
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
              <ThemedText
                variant="caption"
                color={colors.textSecondary}
                style={styles.comingSoonBody}
              >
                Glow isn&rsquo;t built yet and isn&rsquo;t included with your Aesthetics Bible
                Premium subscription today.
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
                    <EditorialImage
                      variant="social"
                      tone={selected ? 'ivory' : 'dark'}
                      label={preset}
                    />
                  </Pressable>
                );
              })}
            </View>

            <Button
              label="Coming Soon"
              icon="sun"
              variant="secondary"
              disabled
              style={styles.tryButton}
            />

            <Rule style={styles.rule} />

            <Card variant="ivory" style={styles.lookCard}>
              <ThemedText variant="eyebrow" color={colors.accent}>
                MY LOOK
              </ThemedText>
              <ThemedText
                variant="displaySmall"
                color={colors.textOnIvory}
                style={styles.lookTitle}
              >
                My Natural Look
              </ThemedText>
              {myNaturalLookPrefs.map((pref) => (
                <ThemedText
                  key={pref}
                  variant="body"
                  color={colors.textOnIvory}
                  style={styles.lookPref}
                >
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
              Glow enhances a photo for social sharing — it is separate from Preview and is not a
              treatment visualization.
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
    width: '30%',
    flexGrow: 1,
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
