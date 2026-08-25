import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, radius, spacing } from '../../constants/theme';

type SlotId = 'baseline' | 'follow_up';

function PhotoSlotCard({
  title,
  filled,
  onAdd,
}: {
  title: string;
  filled: boolean;
  onAdd: () => void;
}) {
  return (
    <Card variant="surface" style={styles.slotCard}>
      <View style={styles.slotPlaceholder}>
        <Feather name={filled ? 'image' : 'camera'} size={24} color={filled ? colors.accent : colors.textSecondary} />
      </View>
      <ThemedText variant="body" color={colors.textPrimary} style={styles.slotTitle}>
        {title}
      </ThemedText>
      <Button
        label={filled ? 'Replace Photo' : 'Add Photo'}
        icon={filled ? 'refresh-cw' : 'plus'}
        variant="secondary"
        onPress={onAdd}
      />
    </Card>
  );
}

export default function ProgressPhotosScreen() {
  const [filled, setFilled] = useState<Record<SlotId, boolean>>({ baseline: false, follow_up: false });

  const addPhoto = (slot: SlotId) => {
    // MOCK: no camera/library integration yet — this simulates a photo
    // having been added so the surrounding UI (before/after, timeline)
    // can be previewed without wiring real device storage.
    setFilled((prev) => ({ ...prev, [slot]: true }));
  };

  const bothFilled = filled.baseline && filled.follow_up;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Progress Photos" />

        <ThemedText variant="body" color={colors.textSecondary} style={styles.intro}>
          Private tracking photos for your own history — separate from Preview and Glow, which create
          AI-generated images. These stay on this device for now.
        </ThemedText>

        <View style={styles.slotsRow}>
          <PhotoSlotCard title="Baseline" filled={filled.baseline} onAdd={() => addPhoto('baseline')} />
          <PhotoSlotCard title="Follow-Up" filled={filled.follow_up} onAdd={() => addPhoto('follow_up')} />
        </View>

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
          BEFORE / AFTER
        </ThemedText>
        {bothFilled ? (
          <Card variant="surface" style={styles.compareCard}>
            <View style={styles.compareRow}>
              <View style={styles.comparePane}>
                <Feather name="image" size={20} color={colors.accent} />
                <ThemedText variant="caption" color={colors.textSecondary}>
                  Baseline
                </ThemedText>
              </View>
              <View style={styles.compareDivider} />
              <View style={styles.comparePane}>
                <Feather name="image" size={20} color={colors.accent} />
                <ThemedText variant="caption" color={colors.textSecondary}>
                  Follow-Up
                </ThemedText>
              </View>
            </View>
          </Card>
        ) : (
          <ThemedText variant="body" color={colors.textSecondary} style={styles.compareEmpty}>
            Add both a baseline and a follow-up photo to preview a side-by-side comparison.
          </ThemedText>
        )}

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
          TIMELINE
        </ThemedText>
        {!filled.baseline && !filled.follow_up ? (
          <ThemedText variant="body" color={colors.textSecondary}>
            Your photo timeline will appear here once you add your first photo.
          </ThemedText>
        ) : (
          <>
            {filled.baseline && (
              <View style={styles.timelineRow}>
                <View style={styles.timelineDot} />
                <ThemedText variant="body" color={colors.textPrimary}>
                  Baseline photo added
                </ThemedText>
              </View>
            )}
            {filled.follow_up && (
              <View style={styles.timelineRow}>
                <View style={styles.timelineDot} />
                <ThemedText variant="body" color={colors.textPrimary}>
                  Follow-up photo added
                </ThemedText>
              </View>
            )}
          </>
        )}
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
  slotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  slotCard: {
    flex: 1,
    alignItems: 'center',
  },
  slotPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  slotTitle: {
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  compareCard: {
    marginBottom: spacing.lg,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparePane: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  compareDivider: {
    width: 1,
    height: 48,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  compareEmpty: {
    marginBottom: spacing.lg,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: spacing.sm,
  },
});
