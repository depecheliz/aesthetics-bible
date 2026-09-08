import { ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
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

// HONEST COMING SOON: photo storage (camera/library capture, upload, Supabase
// Storage) is explicitly out of P0 scope — see BUILD_STATUS.md. This screen
// previously simulated a photo being added by flipping local state with no
// real photo ever touched. That is no longer acceptable inside a paid
// feature, so every stage now shows a plain "coming soon" state instead of
// pretending to work. Nothing here is tappable into a fake success.
function PhotoStageRow({ label }: { label: string }) {
  return (
    <View style={styles.stageRow}>
      <View style={styles.stageImageWrap}>
        <EditorialImage variant="skin-detail" label="COMING SOON" style={styles.stageImage} />
      </View>
      <View style={styles.stageMeta}>
        <ThemedText variant="bodyLarge" color={colors.textPrimary}>
          {label}
        </ThemedText>
        <ThemedText variant="caption" color={colors.textSecondary}>
          Photo tracking isn&rsquo;t available yet.
        </ThemedText>
      </View>
    </View>
  );
}

export default function ProgressPhotosScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Progress Photos" />

        <ThemedText variant="body" color={colors.textSecondary} style={styles.intro}>
          Private tracking photos for your own history — separate from Preview, which creates
          AI-generated images. This feature is coming soon.
        </ThemedText>

        <Rule style={styles.rule} />

        {stages.map((stage) => (
          <PhotoStageRow key={stage.id} label={stage.label} />
        ))}

        <Rule style={styles.rule} />

        <View style={styles.storyRow}>
          <Feather name="film" size={16} color={colors.textMuted} style={styles.storyIcon} />
          <View style={styles.storyText}>
            <ThemedText variant="bodyLarge" color={colors.textPrimary}>
              Create Progress Story
            </ThemedText>
            <ThemedText variant="caption" color={colors.textSecondary}>
              Coming soon.
            </ThemedText>
          </View>
        </View>

        <ThemedText variant="caption" color={colors.textMuted} style={styles.footnote}>
          Photos stay private unless you explicitly choose to create and export a share image, once
          this feature ships.
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
