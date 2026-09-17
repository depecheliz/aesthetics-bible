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
   * "result": Learn / Preview / Save — used on the quiz Result screen,
   * where saving to the plan is still the point.
   * "plan": Learn / Compare / Preview — used on the Plan tab, where the
   * item is already saved and Compare is more useful.
   * ("Find Near Me" is hidden from this grid for this release — see the
   * comment above where it used to be built.)
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

  // "Find Near Me" launch entry point hidden for this release — the
  // /near-me route and its implementation are untouched; only this grid's
  // button into it is removed.

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

  const buttons = mode === 'plan' ? [learnButton, compareButton, previewButton] : [learnButton, previewButton, saveButton];

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
