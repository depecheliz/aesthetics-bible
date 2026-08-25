import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { Rule } from '../../components/ui/Rule';
import { EditorialImage } from '../../components/media/EditorialImage';
import { colors, spacing } from '../../constants/theme';

type StageId = 'baseline' | 'two_weeks' | 'one_month' | 'three_months';

const stages: { id: StageId; label: string }[] = [
  { id: 'baseline', label: 'Baseline' },
  { id: 'two_weeks', label: '2 Weeks' },
  { id: 'one_month', label: '1 Month' },
  { id: 'three_months', label: '3 Months' },
];

function PhotoStageRow({
  label,
  filled,
  onAdd,
}: {
  label: string;
  filled: boolean;
  onAdd: () => void;
}) {
  return (
    <View style={styles.stageRow}>
      <View style={styles.stageImageWrap}>
        <EditorialImage
          variant="skin-detail"
          label={filled ? undefined : 'ADD PHOTO'}
          style={styles.stageImage}
        />
      </View>
      <View style={styles.stageMeta}>
        <ThemedText variant="bodyLarge" color={colors.textPrimary}>
          {label}
        </ThemedText>
        <Button
          label={filled ? 'Replace' : 'Add Photo'}
          icon={filled ? 'refresh-cw' : 'plus'}
          variant="ghost"
          fullWidth={false}
          onPress={onAdd}
        />
      </View>
    </View>
  );
}

export default function ProgressPhotosScreen() {
  const [filled, setFilled] = useState<Record<StageId, boolean>>({
    baseline: false,
    two_weeks: false,
    one_month: false,
    three_months: false,
  });

  const addPhoto = (stage: StageId) => {
    // MOCK: no camera/library integration yet — this simulates a photo
    // having been added so the surrounding UI (comparison, progress
    // story) can be previewed without wiring real device storage.
    setFilled((prev) => ({ ...prev, [stage]: true }));
  };

  const filledCount = Object.values(filled).filter(Boolean).length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Progress Photos" />

        <ThemedText variant="body" color={colors.textSecondary} style={styles.intro}>
          Private tracking photos for your own history — separate from Preview and Glow, which
          create AI-generated images. These stay on this device for now.
        </ThemedText>

        <Rule style={styles.rule} />

        {stages.map((stage) => (
          <PhotoStageRow
            key={stage.id}
            label={stage.label}
            filled={filled[stage.id]}
            onAdd={() => addPhoto(stage.id)}
          />
        ))}

        <Rule style={styles.rule} />

        <View style={styles.storyRow}>
          <Feather name="film" size={16} color={colors.textMuted} style={styles.storyIcon} />
          <View style={styles.storyText}>
            <ThemedText variant="bodyLarge" color={colors.textPrimary}>
              Create Progress Story
            </ThemedText>
            <ThemedText variant="caption" color={colors.textSecondary}>
              {filledCount >= 2
                ? 'Turn your photos into a private "Then → Now" story.'
                : 'Add at least two photos to unlock a shareable story.'}
            </ThemedText>
          </View>
          <Button label="Create" variant="secondary" fullWidth={false} disabled={filledCount < 2} />
        </View>

        <ThemedText variant="caption" color={colors.textMuted} style={styles.footnote}>
          Photos stay private unless you explicitly choose to create and export a share image.
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  intro: {
    marginBottom: spacing.lg,
  },
  rule: {
    width: '100%',
    opacity: 0.4,
    marginBottom: spacing.sm,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  stageImageWrap: {
    width: 72,
  },
  stageImage: {},
  stageMeta: {
    flex: 1,
  },
  storyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  storyIcon: {
    marginTop: 2,
  },
  storyText: {
    flex: 1,
  },
  footnote: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
