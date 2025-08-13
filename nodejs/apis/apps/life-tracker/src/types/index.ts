/**
 * Tipos compartilhados para o Life Tracker API
 */

// Tipo básico de hábito
export interface Habit {
  id: string;
  name: string;
  icon: string;
  color?: string;
  categoryId: number;
  description?: string;
  target?: string;
  streak: number;
  completed: boolean;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'all';
  createdAt: string;
  updatedAt: string;
  domain?: string;
}

// Tipo para meta de domínio
export interface DomainGoal {
  id: string;
  label: string;
  priority: number;
}

// Tipo para meta integrada
export interface IntegratedGoal {
  id: string;
  name: string;
  domains: string[];
  description: string;
  progress: number;
  target_date: string;
  key_metrics: string[];
}

// Tipo para jogo/tabuleiro
export interface GameBoard {
  rows: number;
  cols: number;
  milestones: {
    tile: number;
    label: string;
  }[];
}

// Tipo para regras de pontuação
export interface ScoringRule {
  action: string;
  points: number;
  desc: string;
}

// Tipo para jogo completo
export interface Game {
  board: GameBoard;
  scoring_rules: ScoringRule[];
  weekly_goal_points: number;
}

// Tipo para plano de refeições
export interface MealPlan {
  days: string[];
  meals: string[];
  plan: {
    [day: string]: {
      [meal: string]: string;
    };
  };
}

// Tipo para rotina diária
export interface DailyRoutine {
  time: string;
  activity: string;
  domain?: string;
}

// Tipo para exames laboratoriais
export interface LatestLabs {
  creatinina_mg_dl: number;
  ureia_mg_dl: number;
  egfr_ml_min_1_73: number;
  fosforo_mg_dl: number;
  calcio_total_mg_dl: number;
  calcio_ionico_mmol_l: number;
  sodio_mmol_l: number;
  potassio_mmol_l: number;
  hba1c_percent: number;
  glicose_mg_dl: number;
  hb_g_dl: number;
  ferritina_ng_ml: number;
  vitamina_d_25oh_ng_ml: number;
  pth_pg_ml: number;
  sangue_oculto_fezes: string;
}

// Tipo para parâmetros dietéticos
export interface ProteinTarget {
  min: number;
  max: number;
  note: string;
}

export interface PhosphorusTarget {
  max: number;
  note: string;
}

export interface PotassiumStrategy {
  restriction: string;
  techniques: string[];
  avoid_examples: string[];
}

export interface DietParameters {
  protein_g_per_day_target: ProteinTarget;
  sodium_mg_per_day_max: number;
  phosphorus_mg_per_day_target: PhosphorusTarget;
  potassium_strategy: PotassiumStrategy;
  fiber_g_per_day_target: number;
  fluid_limit_ml_per_day: number | null;
  fluid_note: string;
}

// Tipo para lista de compras
export interface ShoppingList {
  Proteinas: string[];
  Carboidratos: string[];
  Legumes_Verduras: string[];
  Frutas: string[];
  Outros: string[];
}

// Tipo para ingrediente de receita
export interface RecipeIngredient {
  item: string;
  qty: string;
}

// Tipo para receita
export interface Recipe {
  id: string;
  title: string;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  renal_tip: string;
}

// Tipo para suplementação
export interface Supplementation {
  name: string;
  suggested_dose_ui_per_day?: number;
  suggested_dose_mg_elemental?: number;
  timing?: string;
  requires_medical_supervision: boolean;
}

// Tipo para ativo financeiro
export interface Asset {
  id: string;
  name: string;
  value: number;
  return: number;
  allocation: number;
}

// Tipo para portfólio financeiro
export interface Portfolio {
  total_value: number;
  total_return: number;
  assets: Asset[];
}

// Tipo para meta financeira
export interface FinancialGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

// Tipo para oportunidade de negócio
export interface BusinessOpportunity {
  id: string;
  title: string;
  description: string;
  investment: number;
  potential_return: number;
  risk: string;
  timeline: string;
}

// Tipo para projeto de negócio
export interface BusinessProject {
  id: string;
  name: string;
  status: string;
  progress: number;
  deadline: string;
}

// Tipo para perfil do usuário
export interface UserProfile {
  name: string;
  age: number;
  sex: string;
  notes: string[];
}

// Tipo para domínio
export interface Domain {
  goals: DomainGoal[];
  habits: Habit[];
  game?: Game;
  meal_plan_week?: MealPlan;
  routines?: {
    daily_schedule: DailyRoutine[];
  };
  latest_labs?: LatestLabs;
  diet_parameters?: DietParameters;
  shopping_list?: ShoppingList;
  recipes?: Recipe[];
  supplementation?: Supplementation[];
  notes_for_doctor_review?: string[];
  portfolio?: Portfolio;
  financial_goals?: FinancialGoal[];
  opportunities?: BusinessOpportunity[];
  business_plan_progress?: {
    [key: string]: number;
  };
  projects?: BusinessProject[];
}

// Tipo para rotina integrada completa
export interface IntegratedRoutine {
  schema_version: string;
  generated_at: string;
  locale: string;
  user_profile: UserProfile;
  domains: {
    [domain: string]: Domain;
  };
  integrated_goals: IntegratedGoal[];
  routines: {
    daily_schedule: DailyRoutine[];
  };
  ui_hints: {
    colors: {
      [domain: string]: string;
    };
    icons: {
      [domain: string]: string;
    };
  };
}

// DTOs para requisições
export class CreateHabitDto {
  name: string;
  icon: string;
  color?: string;
  categoryId: number;
  description?: string;
  target?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'all';
  domain?: string;
}

export class UpdateHabitDto {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
  target?: string;
  completed?: boolean;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'all';
}

export class CompleteHabitDto {
  habitId: string;
  domain: string;
}

export class CreateGoalDto {
  label: string;
  priority: number;
  domain: string;
}

export class UpdateGoalProgressDto {
  goalId: string;
  progress: number;
}

// Respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface DashboardSummary {
  total_habits: number;
  completed_today: number;
  weekly_progress: number;
  healthness_progress: number;
  finances_progress: number;
  business_progress: number;
  productivity_progress: number;
}

export interface CrossModuleProgress {
  healthness: { progress: number; goals: DomainGoal[] };
  finances: { progress: number; goals: DomainGoal[] };
  business: { progress: number; goals: DomainGoal[] };
  productivity: { progress: number; goals: DomainGoal[] };
} 