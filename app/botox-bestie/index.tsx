import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Rule } from '../../components/ui/Rule';
import { EditorialImage } from '../../components/media/EditorialImage';
import { campaignImages } from '../../assets/brand/campaign';
import { botoxBestieDisclaimer, botoxBestieEntries } from '../../src/domain/botoxBestie';
import { colors, radius, spacing } from '../../constants/theme';

// Native aspect ratio of the Botox Bestie portrait — kept modest in size
// (not a full-bleed hero) since Bestie stays secondary to the master brand.
const BESTIE_ASPECT_RATIO = 853 / 1844;

export default function BotoxBestieScreen() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />

        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
              BOTOX BESTIE
            </ThemedText>
            <ThemedText variant="displayMedium" style={styles.headline}>
              The aesthetics questions you actually want to ask.
            </ThemedText>
          </View>
          <EditorialImage
            variant="portrait"
            uri={campaignImages.botoxBestie}
            aspectRatio={BESTIE_ASPECT_RATIO}
            noDefault
            style={styles.headerImage}
          />
        </View>
        <Rule style={styles.headlineRule} />

        {botoxBestieEntries.map((entry) => {
          const open = openId === entry.id;
          return (
            <View key={entry.id} style={styles.entry}>
              <Pressable
                onPress={() => setOpenId(open ? null : entry.id)}
                accessibilityRole="button"
                accessibilityLabel={entry.question}
                accessibilityState={{ expanded: open }}
                style={styles.questionRow}
              >
                <ThemedText variant="bodyLarge" color={colors.textPrimary} style={styles.questionText}>
                  {entry.question}
                </ThemedText>
                <Feather name={open ? 'minus' : 'plus'} size={16} color={colors.accent} />
              </Pressable>

              {open && (
                <View style={styles.answerWrap}>
                  <View style={styles.bestieBadge}>
                    <ThemedText variant="caption" color={colors.accent} style={styles.bestieBadgeText}>
                      BESTIE
                    </ThemedText>
                  </View>
                  <ThemedText variant="body" color={colors.textSecondary} style={styles.answerText}>
                    {entry.answer}
                  </ThemedText>
                </View>
              )}
              <View style={styles.divider} />
            </View>
          );
        })}

        <ThemedText variant="caption" color={colors.textMuted} style={styles.disclaimer}>
          {botoxBestieDisclaimer}
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerImage: {
    width: 88,
  },
  eyebrow: {
    marginBottom: spacing.sm,
  },
  headline: {
    marginBottom: spacing.md,
  },
  headlineRule: {
    marginBottom: spacing.xl,
  },
  entry: {
    marginBottom: spacing.xs,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  questionText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  answerWrap: {
    paddingBottom: spacing.md,
    paddingRight: spacing.lg,
  },
  bestieBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    marginBottom: spacing.sm,
  },
  bestieBadgeText: {
    letterSpacing: 1.2,
  },
  answerText: {},
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  disclaimer: {
    marginTop: spacing.xl,
  },
});
