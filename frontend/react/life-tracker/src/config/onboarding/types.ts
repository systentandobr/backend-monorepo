import { LucideIcon } from 'lucide-react';

export type QuestionType = 'welcome' | 'single' | 'multiselect' | 'timeRange' | 'sliders' | 'profile' | 'mindsetScale' | 'actionCommitment';

export type Option = {
  id: string;
  text: string;
  description?: string;
  visualIndicator?: 'triangle';
};

export type TimePickerConfig = {
  label: string;
  key: string;
  defaultValue: string;
};

export type SliderConfig = {
  label?: string;
  key: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  formatLabel: (value: number) => string;
};

export type MindsetScaleConfig = {
  statement: string;
  key: string;
  leftLabel: string;
  rightLabel: string;
};

export type ActionCommitmentConfig = {
  title: string;
  description: string;
  actionKey: string;
  defaultAction: string;
  timeframeKey: string;
  defaultTimeframe: string;
};

export type QuestionData = {
  title?: string;
  question?: string;
  description?: string;
  options?: Option[];
  minSelections?: number;
  timePickers?: TimePickerConfig[];
  sliders?: SliderConfig[];
  mindsetScales?: MindsetScaleConfig[];
  actionCommitment?: ActionCommitmentConfig;
};

export type NextQuestionsFunction = (answers: AnswersType) => string[];

export type QuestionDefinition = {
  type: QuestionType;
  answerKey?: string | string[];
  icon: LucideIcon;
  data: QuestionData;
  nextQuestions: string[] | NextQuestionsFunction;
};

export type QuestionConfig = {
  [key: string]: QuestionDefinition;
};

export type AnswersType = {
  concentration?: string;
  lifestyle?: string;
  energy?: string;
  wakeupTime?: string;
  sleepTime?: string;
  personalInterests?: string[];
  financialGoals?: string[];
  riskTolerance?: string;
  investmentHorizon?: string;
  currentInvestments?: string[];
  monthlyIncome?: number;
  monthlySavings?: number;
  lifeGoals?: string[];
  businessInterests?: string[];
  learningAreas?: string[];
  entrepreneurProfile?: string;
  timeAvailability?: number;
  investmentCapacity?: string;
  // Mindset properties
  consistencyMindset?: number;
  fearlessMindset?: number;
  selfCompetitionMindset?: number;
  challengesMindset?: number;
  failureViewMindset?: number;
  progressReflectionMindset?: number;
  listeningMindset?: number;
  uncertaintyMindset?: number;
  // Commitment properties
  dailyHabitCommitment?: string;
  dailyHabitTimeframe?: string;
  financialHabitCommitment?: string;
  financialHabitTimeframe?: string;
  learningHabitCommitment?: string;
  learningHabitTimeframe?: string;
  businessHabitCommitment?: string;
  businessHabitTimeframe?: string;
  comfortZoneChallenge?: string;
  comfortZoneTimeframe?: string;
  procrastinationChallenge?: string;
  dailyReflection?: string;
  [key: string]: any;
};