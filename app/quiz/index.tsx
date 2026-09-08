import { useEffect, useRef, useState } from 'react';
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
import { analytics } from '../../lib/services/analyticsClient';
import { colors, spacing } from '../../constants/theme';

function stepNumber(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export default function QuizScreen() {
  const { quizAnswers, setAnswer, setResult } = useAppState();
  const [stepIndex, setStepIndex] = useState(0);
  const hasTrackedStart = useRef(false);

  useEffect(() => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      analytics.track('quiz_started');
    }
  }, []);

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
    analytics.track('quiz_completed');
    router.push('/quiz/analyzing');
  };

  return (
    <Screen>
      <ScreenHeader onBack={handleBack} />
      <View style={styles.progressWrap}>
        <ProgressBar current={stepIndex + 1} total={quizQuestions.length} />
        <ThemedText variant="numberLabel" color={colors.textSecondary} style={styles.stepLabel}>
          {stepNumber(stepIndex + 1)} / {stepNumber(quizQuestions.length)}
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText variant="displayLarge" style={styles.title}>
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
    marginBottom: spacing.xl,
  },
  stepLabel: {
    marginTop: spacing.sm,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xl,
  },
  footer: {
    paddingVertical: spacing.md,
  },
});
