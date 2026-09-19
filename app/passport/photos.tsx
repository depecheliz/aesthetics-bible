import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Rule } from '../../components/ui/Rule';
import { colors, radius, spacing } from '../../constants/theme';

const stages = [
  {
    label: 'BEFORE',
    timing: 'Before treatment',
    image: require('../../assets/brand/passport/passport-demo-before.jpg'),
  },
  {
    label: 'FOLLOW-UP',
    timing: 'Early results',
    image: require('../../assets/brand/passport/passport-demo-follow-up.jpg'),
  },
  {
    label: 'LATEST',
    timing: 'Latest results',
    image: require('../../assets/brand/passport/passport-demo-latest.jpg'),
  },
] as const;

function SampleStage({
  label,
  timing,
  image,
}: {
  label: string;
  timing: string;
  image: number;
}) {
  return (
    <View style={styles.stage}>
      <Image source={image} style={styles.stageImage} resizeMode="cover" />
      <ThemedText variant="eyebrow" color={colors.textPrimary} style={styles.stageLabel}>
        {label}
      </ThemedText>
      <ThemedText variant="caption" color={colors.textSecondary}>
        {timing}
      </ThemedText>
    </View>
  );
}

export default function ProgressPhotosScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Progress Photos" />

        <ThemedText variant="bodyLarge" color={colors.textPrimary} style={styles.heading}>
          See your aesthetic journey unfold over time.
        </ThemedText>
        <ThemedText variant="body" color={colors.textSecondary} style={styles.intro}>
          Keep private photos from before treatment through your latest results—all in one place.
        </ThemedText>

        <Rule style={styles.rule} />

        <ThemedText variant="eyebrow" color={colors.textSecondary}>
          SAMPLE PROGRESS JOURNEY
        </ThemedText>
        <ThemedText variant="caption" color={colors.textSecondary} style={styles.sampleIntro}>
          See how Aestella helps you track results over time.
        </ThemedText>

        <View style={styles.stageGrid}>
          {stages.map((stage) => (
            <SampleStage key={stage.label} {...stage} />
          ))}
        </View>

        <View style={styles.noteCard}>
          <ThemedText variant="bodyLarge" color={colors.textPrimary}>
            Your photos. Your timeline.
          </ThemedText>
          <ThemedText variant="body" color={colors.textSecondary} style={styles.noteText}>
            Progress photos are designed to connect to the treatments in your Passport, so your history and visual results stay together.
          </ThemedText>
        </View>

        <ThemedText variant="caption" color={colors.textMuted} style={styles.footnote}>
          Your progress photos stay private unless you choose to share or export them.
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  heading: {
    marginBottom: spacing.xs,
  },
  intro: {
    marginBottom: spacing.lg,
  },
  rule: {
    width: '100%',
    opacity: 0.4,
    marginBottom: spacing.lg,
  },
  sampleIntro: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  stageGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  stage: {
    flex: 1,
    minWidth: 0,
  },
  stageImage: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  stageLabel: {
    marginBottom: 2,
  },
  noteCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  noteText: {
    marginTop: spacing.xs,
  },
  footnote: {
    marginBottom: spacing.xl,
  },
});
