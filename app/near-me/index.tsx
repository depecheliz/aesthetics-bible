import { ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Card } from '../../components/ui/Card';
import type { ProviderResult } from '../../lib/services/places';
import { colors, spacing } from '../../constants/theme';

// Static sample data standing in for a future Google Places integration.
const sampleProviders: ProviderResult[] = [
  {
    id: 'sample-1',
    name: 'Ivory & Ash Aesthetics Studio',
    rating: 4.9,
    reviewCount: 214,
    distanceMeters: 1200,
    address: '128 Wren Street',
  },
  {
    id: 'sample-2',
    name: 'The Skin Atelier',
    rating: 4.8,
    reviewCount: 156,
    distanceMeters: 2400,
    address: '44 Camden Row',
  },
  {
    id: 'sample-3',
    name: 'Maison Derma Clinic',
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

export default function NearMeScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />

        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          NEAR ME
        </ThemedText>
        <ThemedText variant="displaySmall" style={styles.title}>
          Providers Worth Exploring
        </ThemedText>
        <ThemedText variant="caption" color={colors.textSecondary} style={styles.caption}>
          Sample results — live search coming soon.
        </ThemedText>

        {sampleProviders.map((provider) => (
          <Card key={provider.id} variant="surface" style={styles.providerCard}>
            <ThemedText variant="bodyLarge" color={colors.textPrimary} style={styles.providerName}>
              {provider.name}
            </ThemedText>
            <View style={styles.metaRow}>
              <Feather name="star" size={14} color={colors.accent} style={styles.metaIcon} />
              <ThemedText variant="caption" color={colors.textSecondary}>
                {provider.rating?.toFixed(1)} ({provider.reviewCount} reviews) · {formatDistance(provider.distanceMeters)}
              </ThemedText>
            </View>
            <View style={styles.metaRow}>
              <Feather name="map-pin" size={14} color={colors.textSecondary} style={styles.metaIcon} />
              <ThemedText variant="caption" color={colors.textSecondary}>
                {provider.address}
              </ThemedText>
            </View>
          </Card>
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
  providerCard: {
    marginBottom: spacing.sm,
  },
  providerName: {
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  metaIcon: {
    marginRight: spacing.xs,
  },
});
