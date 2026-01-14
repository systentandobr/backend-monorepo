import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================================================
// DTOs PRINCIPAIS
// ============================================================================

export class IntegratedRoutineDto {
  @IsString()
  schema_version: string;

  @IsDateString()
  generated_at: string;

  @IsString()
  locale: string;

  @ValidateNested()
  @Type(() => UserProfileDto)
  user_profile: UserProfileDto;

  @ValidateNested()
  @Type(() => DomainDto)
  domains: { [domain: string]: DomainDto };

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IntegratedGoalDto)
  integrated_goals: IntegratedGoalDto[];

  @ValidateNested()
  @Type(() => RoutinesDto)
  routines: RoutinesDto;

  @ValidateNested()
  @Type(() => UIHintsDto)
  ui_hints: UIHintsDto;
}

// ============================================================================
// PERFIL DO USUÁRIO
// ============================================================================

export class UserProfileDto {
  @IsString()
  name: string;

  @IsNumber()
  age: number;

  @IsString()
  sex: string;

  @IsArray()
  @IsString({ each: true })
  notes: string[];
}

// ============================================================================
// METAS E OBJETIVOS
// ============================================================================

export class DomainGoalDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsNumber()
  priority: number;
}

export class IntegratedGoalDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  domains: string[];

  @IsString()
  description: string;

  @IsNumber()
  progress: number;

  @IsString()
  target_date: string;

  @IsArray()
  @IsString({ each: true })
  key_metrics: string[];
}

// ============================================================================
// DOMÍNIO HEALTHNESS
// ============================================================================

export class LatestLabsDto {
  @IsNumber()
  creatinina_mg_dl: number;

  @IsNumber()
  ureia_mg_dl: number;

  @IsNumber()
  egfr_ml_min_1_73: number;

  @IsNumber()
  fosforo_mg_dl: number;

  @IsNumber()
  calcio_total_mg_dl: number;

  @IsNumber()
  calcio_ionico_mmol_l: number;

  @IsNumber()
  sodio_mmol_l: number;

  @IsNumber()
  potassio_mmol_l: number;

  @IsNumber()
  hba1c_percent: number;

  @IsNumber()
  glicose_mg_dl: number;

  @IsNumber()
  hb_g_dl: number;

  @IsNumber()
  ferritina_ng_ml: number;

  @IsNumber()
  vitamina_d_25oh_ng_ml: number;

  @IsNumber()
  pth_pg_ml: number;

  @IsString()
  sangue_oculto_fezes: string;
}

export class ProteinTargetDto {
  @IsNumber()
  target_g_per_day: number;

  @IsString()
  strategy: string;
}

export class PhosphorusTargetDto {
  @IsNumber()
  target_mg_per_day: number;

  @IsString()
  strategy: string;
}

export class PotassiumStrategyDto {
  @IsString()
  approach: string;

  @IsNumber()
  @IsOptional()
  target_mg_per_day?: number;
}

export class DietParametersDto {
  @ValidateNested()
  @Type(() => ProteinTargetDto)
  protein_g_per_day_target: ProteinTargetDto;

  @IsNumber()
  sodium_mg_per_day_max: number;

  @ValidateNested()
  @Type(() => PhosphorusTargetDto)
  phosphorus_mg_per_day_target: PhosphorusTargetDto;

  @ValidateNested()
  @Type(() => PotassiumStrategyDto)
  potassium_strategy: PotassiumStrategyDto;

  @IsNumber()
  fiber_g_per_day_target: number;

  @IsNumber()
  @IsOptional()
  fluid_limit_ml_per_day?: number | null;

  @IsString()
  @IsOptional()
  fluid_note?: string;
}

export class ShoppingListDto {
  @IsArray()
  @IsString({ each: true })
  Proteinas: string[];

  @IsArray()
  @IsString({ each: true })
  Carboidratos: string[];

  @IsArray()
  @IsString({ each: true })
  Legumes_Verduras: string[];

  @IsArray()
  @IsString({ each: true })
  Frutas: string[];

  @IsArray()
  @IsString({ each: true })
  Outros: string[];
}

export class RecipeIngredientDto {
  @IsString()
  item: string;

  @IsString()
  qty: string;
}

export class RecipeDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsNumber()
  servings: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients: RecipeIngredientDto[];

  @IsArray()
  @IsString({ each: true })
  steps: string[];

  @IsString()
  renal_tip: string;
}

export class SupplementationDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  suggested_dose_ui_per_day?: number;

  @IsNumber()
  @IsOptional()
  suggested_dose_mg_elemental?: number;

  @IsString()
  @IsOptional()
  timing?: string;

  @IsBoolean()
  requires_medical_supervision: boolean;
}

// ============================================================================
// DOMÍNIO FINANCES
// ============================================================================

export class AssetDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  value: number;

  @IsNumber()
  return: number;

  @IsNumber()
  allocation: number;
}

export class PortfolioDto {
  @IsNumber()
  total_value: number;

  @IsNumber()
  total_return: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetDto)
  assets: AssetDto[];
}

export class FinancialGoalDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  target: number;

  @IsNumber()
  current: number;

  @IsString()
  deadline: string;
}

// ============================================================================
// DOMÍNIO BUSINESS
// ============================================================================

export class BusinessOpportunityDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  investment: number;

  @IsNumber()
  potential_return: number;

  @IsString()
  risk: string;

  @IsString()
  timeline: string;
}

export class BusinessProjectDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  status: string;

  @IsNumber()
  progress: number;

  @IsString()
  deadline: string;
}

// ============================================================================
// SISTEMA DE JOGOS
// ============================================================================

export class GameMilestoneDto {
  @IsNumber()
  tile: number;

  @IsString()
  label: string;
}

export class GameBoardDto {
  @IsNumber()
  rows: number;

  @IsNumber()
  cols: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameMilestoneDto)
  milestones: GameMilestoneDto[];
}

export class ScoringRuleDto {
  @IsString()
  action: string;

  @IsNumber()
  points: number;

  @IsString()
  desc: string;
}

export class GameDto {
  @ValidateNested()
  @Type(() => GameBoardDto)
  board: GameBoardDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoringRuleDto)
  scoring_rules: ScoringRuleDto[];

  @IsNumber()
  weekly_goal_points: number;
}

// ============================================================================
// ROTINAS E AGENDAMENTO
// ============================================================================

export class DailyRoutineDto {
  @IsString()
  time: string;

  @IsString()
  activity: string;

  @IsString()
  @IsOptional()
  domain?: string;
}

export class RoutinesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DailyRoutineDto)
  daily_schedule: DailyRoutineDto[];
}

export class MealPlanDto {
  @IsArray()
  @IsString({ each: true })
  days: string[];

  @IsArray()
  @IsString({ each: true })
  meals: string[];

  @IsArray()
  plan: { [day: string]: { [meal: string]: string } };
}

// ============================================================================
// HÁBITOS
// ============================================================================

export enum TimeOfDay {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  ALL = 'all',
}

export class HabitDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  icon: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  categoryId: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  target?: string;

  @IsNumber()
  streak: number;

  @IsBoolean()
  completed: boolean;

  @IsEnum(TimeOfDay)
  @IsOptional()
  timeOfDay?: TimeOfDay;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;

  @IsString()
  @IsOptional()
  domain?: string;
}

// ============================================================================
// DICAS DE UI
// ============================================================================

export class UIHintsDto {
  @IsArray()
  colors: { [domain: string]: string };

  @IsArray()
  icons: { [domain: string]: string };
}

// ============================================================================
// DOMÍNIO COMPLETO
// ============================================================================

export class DomainDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DomainGoalDto)
  goals: DomainGoalDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HabitDto)
  habits: HabitDto[];

  @ValidateNested()
  @Type(() => GameDto)
  @IsOptional()
  game?: GameDto;

  @ValidateNested()
  @Type(() => MealPlanDto)
  @IsOptional()
  meal_plan_week?: MealPlanDto;

  @ValidateNested()
  @Type(() => RoutinesDto)
  @IsOptional()
  routines?: RoutinesDto;

  @ValidateNested()
  @Type(() => LatestLabsDto)
  @IsOptional()
  latest_labs?: LatestLabsDto;

  @ValidateNested()
  @Type(() => DietParametersDto)
  @IsOptional()
  diet_parameters?: DietParametersDto;

  @ValidateNested()
  @Type(() => ShoppingListDto)
  @IsOptional()
  shopping_list?: ShoppingListDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeDto)
  @IsOptional()
  recipes?: RecipeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplementationDto)
  @IsOptional()
  supplementation?: SupplementationDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notes_for_doctor_review?: string[];

  @ValidateNested()
  @Type(() => PortfolioDto)
  @IsOptional()
  portfolio?: PortfolioDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinancialGoalDto)
  @IsOptional()
  financial_goals?: FinancialGoalDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessOpportunityDto)
  @IsOptional()
  opportunities?: BusinessOpportunityDto[];

  @IsArray()
  @IsOptional()
  business_plan_progress?: { [key: string]: number };

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessProjectDto)
  @IsOptional()
  projects?: BusinessProjectDto[];
}

// ============================================================================
// DTOs PARA OPERAÇÕES CRUD
// ============================================================================

export class CreateHabitDto {
  @IsString()
  name: string;

  @IsString()
  icon: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  categoryId: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  target?: string;

  @IsEnum(TimeOfDay)
  @IsOptional()
  timeOfDay?: TimeOfDay;

  @IsString()
  @IsOptional()
  domain?: string;
}

export class UpdateHabitDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  target?: string;

  @IsEnum(TimeOfDay)
  @IsOptional()
  timeOfDay?: TimeOfDay;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsNumber()
  @IsOptional()
  streak?: number;
}

export class CreateCategoryDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  habits?: string[];
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  habits?: string[];
}
