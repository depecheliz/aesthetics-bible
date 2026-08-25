import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { OptionRow } from '../../components/quiz/OptionRow';
import { quizQuestions, type QuizAnswers } from '../../src/domain/quiz';
import { getRecommendation } from '../../src/domain/recommendation';
import { useAppState } from '../../lib/state/AppStateContext';
import { colors, spacing } from '../../constants/theme';

export default function QuizScreen() {
  const { quizAnswers, setAnswer, setResult } = useAppState();
  const [stepIndex, setStepIndex] = useState(0);

  const question = quizQuestions[stepIndex];
  const isLastStep = stepIndex === quizQuestions.length - 1;
  const selectedValue = quizAnswers[question.id];

  const handleBack = () => {
    if (stepIndex === 0) {
      router.back();
      return;
    }
    setStepIndex((prev) => prev - 1);
  };

  const handleContinue = () => {
    if (!isLastStep) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    const answers = quizAnswers as QuizAnswers;
    const result = getRecommendation(answers);
    setResult(result);
    router.push('/quiz/result');
  };

  return (
    <Screen>
      <ScreenHeader onBack={handleBack} />
      <View style={styles.progressWrap}>
        <ProgressBar current={stepIndex + 1} total={quizQuestions.length} />
        <ThemedText variant="caption" color={colors.textSecondary} style={styles.stepLabel}>
          QUESTION {stepIndex + 1} OF {quizQuestions.length}
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText variant="displaySmall" style={styles.title}>
          {question.title}
        </ThemedText>

        {question.options.map((option) => (
          <OptionRow
            key={option.value}
            label={option.label}
            selected={selectedValue === option.value}
            onPress={() => setAnswer(question.id, option.value)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={isLastStep ? 'See My Top Match' : 'Continue'}
          icon="arrow-right"
          onPress={handleContinue}
          disabled={!selectedValue}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressWrap: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  stepLabel: {
    marginTop: spacing.xs,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.md,
  },
});
