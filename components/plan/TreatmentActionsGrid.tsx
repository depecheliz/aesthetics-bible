import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../ui/Button';
import { useAppState } from '../../lib/state/AppStateContext';
import { useRequireAuth } from '../../lib/state/useRequireAuth';
import type { TreatmentCategoryId } from '../../src/domain/recommendation';
import { spacing } from '../../constants/theme';

type TreatmentActionsGridProps = {
  categoryId: TreatmentCategoryId;
  /**
   * "result": Learn / Preview / Find Near Me / Save — used on the quiz
   * Result screen, where saving to the plan is still the point.
   * "plan": Learn / Compare / Preview / Find Near Me — used on the Plan
   * tab, where the item is already saved and Compare is more useful.
   */
  mode?: 'result' | 'plan';
  compareWithCategoryId?: TreatmentCategoryId;
};

/**
 * The treatment quick-action row shown wherever a matched category is
 * presented — Result screen and Plan tab. Kept as one component so the
 * actions behave identically everywhere they appear.
 */
export function TreatmentActionsGrid({ categoryId, mode = 'result', compareWithCategoryId }: TreatmentActionsGridProps) {
  const { savePlanItem, isPlanItemSaved } = useAppState();
  const requireAuth = useRequireAuth();
  const saved = isPlanItemSaved(categoryId);

  const learnButton = (
    <Button
      key="learn"
      label="Learn More"
      icon="book-open"
      variant="secondary"
      fullWidth={false}
      style={styles.button}
      onPress={() => router.push(`/bible/${categoryId}`)}
    />
  );

  const previewButton = (
    <Button
      key="preview"
      label="Preview"
      icon="camera"
      variant="secondary"
      fullWidth={false}
      style={styles.button}
      onPress={() => router.push('/preview')}
    />
  );

  const findNearMeButton = (
    <Button
      key="near-me"
      label="Find Near Me"
      icon="map-pin"
      variant="secondary"
      fullWidth={false}
      style={styles.button}
      onPress={() => router.push('/near-me')}
    />
  );

  const saveButton = (
    <Button
      key="save"
      label={saved ? 'Saved' : 'Save to My Plan'}
      icon={saved ? 'check' : 'bookmark'}
      variant={saved ? 'ghost' : 'secondary'}
      fullWidth={false}
      style={styles.button}
      onPress={() => (saved ? undefined : requireAuth(() => savePlanItem(categoryId)))}
    />
  );

  const compareButton = (
    <Button
      key="compare"
      label="Compare"
      icon="bar-chart-2"
      variant="secondary"
      fullWidth={false}
      style={styles.button}
      onPress={() => {
        if (compareWithCategoryId) {
          router.push(`/compare?a=${categoryId}&b=${compareWithCategoryId}`);
        }
      }}
      disabled={!compareWithCategoryId}
    />
  );

  const buttons = mode === 'plan' ? [learnButton, compareButton, previewButton, findNearMeButton] : [learnButton, previewButton, findNearMeButton, saveButton];

  return <View style={styles.grid}>{buttons}</View>;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    width: '48%',
    marginBottom: spacing.sm,
  },
});
