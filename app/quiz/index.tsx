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

function stepNumber(n:number){return n<10?`0${n}`:String(n);}
export default function QuizScreen(){
 const {quizAnswers,setAnswer,setResult}=useAppState();
 const [stepIndex,setStepIndex]=useState(0); const tracked=useRef(false);
 useEffect(()=>{if(!tracked.current){tracked.current=true;analytics.track('quiz_started');}},[]);
 const q=quizQuestions[stepIndex]; const last=stepIndex===quizQuestions.length-1;
 const current=quizAnswers[q.id as keyof QuizAnswers];

 const selected=(value:string)=>Array.isArray(current)?current.includes(value as never):current===value;
 const valid=()=>{if(!q.required)return true; return Array.isArray(current)?current.length>0:Boolean(current);};
 const choose=(value:string)=>{
   if(q.selection==='single'){setAnswer(q.id as keyof QuizAnswers,value as never);return;}
   const arr=(Array.isArray(current)?current:[]) as string[];
   const exists=arr.includes(value);
   if(exists){setAnswer(q.id as keyof QuizAnswers,arr.filter(x=>x!==value) as never);return;}
   if(q.maxSelections && arr.length>=q.maxSelections)return;
   setAnswer(q.id as keyof QuizAnswers,[...arr,value] as never);
 };
 const back=()=>stepIndex===0?router.back():setStepIndex(x=>x-1);
 const next=()=>{
   if(!valid())return;
   if(!last){setStepIndex(x=>x+1);return;}
   const a:QuizAnswers={
    concerns:quizAnswers.concerns??[],areas:quizAnswers.areas??[],intensity:quizAnswers.intensity!,
    downtime:quizAnswers.downtime!,comfort:quizAnswers.comfort!,budget:quizAnswers.budget!,
    priorities:quizAnswers.priorities??[],ageRange:quizAnswers.ageRange,
   };
   setResult(getRecommendation(a)); analytics.track('quiz_completed'); router.push('/quiz/analyzing');
 };
 return <Screen>
  <ScreenHeader onBack={back}/>
  <View style={styles.progress}><ProgressBar current={stepIndex+1} total={quizQuestions.length}/>
   <ThemedText variant="numberLabel" color={colors.textSecondary} style={styles.step}>{stepNumber(stepIndex+1)} / {stepNumber(quizQuestions.length)}</ThemedText>
  </View>
  <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
   <ThemedText variant="displayLarge" style={styles.title}>{q.title}</ThemedText>
   {'helper' in q && q.helper ? <ThemedText variant="body" color={colors.textSecondary} style={styles.helper}>{q.helper}</ThemedText>:null}
   {q.options.map(o=><OptionRow key={o.value} label={o.label} selected={selected(o.value)} onPress={()=>choose(o.value)} multiSelect={q.selection==='multi'}/>)}
  </ScrollView>
  <View style={styles.footer}>
   {q.skippable && !current ? <ThemedText variant="caption" color={colors.textSecondary} style={styles.optional}>You can skip this question.</ThemedText>:null}
   <Button label={last?'See My Aestella Profile':'Continue'} icon="arrow-right" onPress={next} disabled={!valid()}/>
  </View>
 </Screen>;
}
const styles=StyleSheet.create({
 progress:{marginTop:spacing.sm,marginBottom:spacing.xl},step:{marginTop:spacing.sm},content:{paddingBottom:spacing.xl},
 title:{marginBottom:spacing.xs},helper:{marginBottom:spacing.lg,maxWidth:420},footer:{paddingVertical:spacing.md},
 optional:{textAlign:'center',marginBottom:spacing.sm},
});
