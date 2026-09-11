import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { useAppState } from '../../lib/state/AppStateContext';
import { showAlert } from '../../lib/utils/crossPlatformAlert';
import type { SatisfactionRating } from '../../src/domain/passport';
import { colors, radius, spacing } from '../../constants/theme';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddPassportEntryScreen() {
  const insets = useSafeAreaInsets();
  const { addPassportEntry } = useAppState();

  const [treatment, setTreatment] = useState('');
  const [date, setDate] = useState(todayIso());
  const [provider, setProvider] = useState('');
  const [cost, setCost] = useState('');
  const [product, setProduct] = useState('');
  const [amountUnits, setAmountUnits] = useState('');
  const [area, setArea] = useState('');
  const [notes, setNotes] = useState('');
  const [satisfaction, setSatisfaction] = useState<SatisfactionRating>(4);
  const [wouldDoAgain, setWouldDoAgain] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canSave = treatment.trim().length > 0 && !isSaving;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await addPassportEntry({
        treatment: treatment.trim(),
        date,
        provider: provider.trim(),
        cost: Number.parseFloat(cost) || 0,
        product: product.trim(),
        amountUnits: amountUnits.trim(),
        area: area.trim(),
        notes: notes.trim(),
        satisfaction,
        wouldDoAgain: wouldDoAgain ?? true,
      });
      router.back();
    } catch {
      setIsSaving(false);
      showAlert('Save Failed', 'This treatment could not be saved. Please check your connection and try again.');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <ScreenHeader title="Log a Treatment" />

          <FormField label="Treatment" value={treatment} onChangeText={setTreatment} placeholder="e.g. Botox" />
          <FormField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
          <FormField label="Provider" value={provider} onChangeText={setProvider} placeholder="e.g. Ivory & Ash Studio" />
          <FormField label="Cost" value={cost} onChangeText={setCost} placeholder="0" keyboardType="numeric" />
          <FormField label="Product" value={product} onChangeText={setProduct} placeholder="e.g. Botox, Juvéderm" />
          <FormField
            label="Amount / Units"
            value={amountUnits}
            onChangeText={setAmountUnits}
            placeholder="e.g. 20 units, 1 syringe"
          />
          <FormField label="Area" value={area} onChangeText={setArea} placeholder="e.g. Forehead, cheeks" />
          <FormField label="Notes" value={notes} onChangeText={setNotes} placeholder="How did it go?" multiline />

          <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.label}>
            SATISFACTION
          </ThemedText>
          <View style={styles.starsRow}>
            {([1, 2, 3, 4, 5] as SatisfactionRating[]).map((value) => (
              <Pressable
                key={value}
                onPress={() => setSatisfaction(value)}
                accessibilityRole="button"
                accessibilityLabel={`${value} star${value > 1 ? 's' : ''}`}
                hitSlop={8}
              >
                <Feather
                  name="star"
                  size={26}
                  color={value <= satisfaction ? colors.accent : colors.border}
                  style={styles.star}
                />
              </Pressable>
            ))}
          </View>

          <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.label}>
            WOULD YOU DO IT AGAIN?
          </ThemedText>
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setWouldDoAgain(true)}
              accessibilityRole="button"
              accessibilityLabel="Yes"
              style={[styles.toggleButton, wouldDoAgain === true && styles.toggleButtonSelected]}
            >
              <ThemedText variant="body" color={wouldDoAgain === true ? colors.textOnIvory : colors.textPrimary}>
                Yes
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setWouldDoAgain(false)}
              accessibilityRole="button"
              accessibilityLabel="No"
              style={[styles.toggleButton, wouldDoAgain === false && styles.toggleButtonSelected]}
            >
              <ThemedText variant="body" color={wouldDoAgain === false ? colors.textOnIvory : colors.textPrimary}>
                No
              </ThemedText>
            </Pressable>
          </View>

          <Button
            label="Save to My Passport"
            onPress={handleSave}
            disabled={!canSave}
            loading={isSaving}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  label: {
    marginBottom: spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  star: {
    marginRight: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  toggleButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButtonSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  saveButton: {
    marginTop: spacing.xs,
  },
});
