import { ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { EditorialImage } from '../../components/media/EditorialImage';
import { useAppState } from '../../lib/state/AppStateContext';
import type { ProviderResult } from '../../lib/services/places';
import { showAlert } from '../../lib/utils/crossPlatformAlert';
import { colors, spacing } from '../../constants/theme';

// Static sample data standing in for a future Google Places integration.
// Shaped to match ProviderResult so the UI doesn't change when it's wired up.
const sampleProviders: ProviderResult[] = [
  {
    id: 'sample-1',
    name: 'Ivory & Ash Aesthetics Studio',
    category: 'Medical Spa',
    rating: 4.9,
    reviewCount: 214,
    distanceMeters: 1200,
    address: '128 Wren Street',
  },
  {
    id: 'sample-2',
    name: 'The Skin Atelier',
    category: 'Dermatology Clinic',
    rating: 4.8,
    reviewCount: 156,
    distanceMeters: 2400,
    address: '44 Camden Row',
  },
  {
    id: 'sample-3',
    name: 'Maison Derma Clinic',
    category: 'Aesthetics Clinic',
    rating: 4.7,
    reviewCount: 98,
    distanceMeters: 3100,
    address: '9 Belgrave Court',
  },
];

function formatDistance(meters: number | null): string {
  if (meters === null) return '';
  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
}

function ProviderRow({ provider }: { provider: ProviderResult }) {
  const { savedProviderIds, toggleSavedProvider } = useAppState();
  const saved = savedProviderIds.includes(provider.id);

  return (
    <View style={styles.row}>
      <View style={styles.thumbnail}>
        <EditorialImage variant="skin-detail" compact />
      </View>

      <View style={styles.body}>
        <ThemedText variant="bodyLarge" color={colors.textPrimary}>
          {provider.name}
        </ThemedText>
        <ThemedText variant="caption" color={colors.textSecondary} style={styles.metaLine}>
          {provider.rating?.toFixed(1)} ★ · {provider.reviewCount} Google reviews
        </ThemedText>
        <ThemedText variant="caption" color={colors.textSecondary} style={styles.metaLine}>
          {formatDistance(provider.distanceMeters)} · {provider.category}
        </ThemedText>
        <ThemedText variant="caption" color={colors.textMuted} style={styles.metaLine}>
          {provider.address}
        </ThemedText>

        <View style={styles.actionsRow}>
          <Button
            label="View"
            variant="secondary"
            fullWidth={false}
            style={styles.actionButton}
            onPress={() => showAlert(provider.name, 'A full provider profile will be available in a future update.')}
          />
          <Button
            label={saved ? 'Saved' : 'Save'}
            icon={saved ? 'check' : undefined}
            variant={saved ? 'ghost' : 'secondary'}
            fullWidth={false}
            style={styles.actionButton}
            onPress={() => toggleSavedProvider(provider.id)}
          />
          <Button
            label="Directions"
            variant="secondary"
            fullWidth={false}
            style={styles.actionButton}
            onPress={() => showAlert('Directions', 'Directions will open in your maps app in a future update.')}
          />
        </View>
      </View>
    </View>
  );
}

export default function NearMeScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />

        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          NEAR ME
        </ThemedText>
        <ThemedText variant="displayMedium" style={styles.title}>
          Providers Worth Exploring
        </ThemedText>
        <ThemedText variant="caption" color={colors.textSecondary} style={styles.caption}>
          Sample results — live search coming soon.
        </ThemedText>

        {sampleProviders.map((provider, index) => (
          <View key={provider.id}>
            <ProviderRow provider={provider} />
            {index < sampleProviders.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  eyebrow: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
  caption: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  thumbnail: {
    width: 72,
  },
  body: {
    flex: 1,
  },
  metaLine: {
    marginTop: spacing.xxs,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
