export declare class IntegratedRoutineDto {
    schema_version: string;
    generated_at: string;
    locale: string;
    user_profile: UserProfileDto;
    domains: {
        [domain: string]: DomainDto;
    };
    integrated_goals: IntegratedGoalDto[];
    routines: RoutinesDto;
    ui_hints: UIHintsDto;
}
export declare class UserProfileDto {
    name: string;
    age: number;
    sex: string;
    notes: string[];
}
export declare class DomainGoalDto {
    id: string;
    label: string;
    priority: number;
}
export declare class IntegratedGoalDto {
    id: string;
    name: string;
    domains: string[];
    description: string;
    progress: number;
    target_date: string;
    key_metrics: string[];
}
export declare class LatestLabsDto {
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
export declare class ProteinTargetDto {
    target_g_per_day: number;
    strategy: string;
}
export declare class PhosphorusTargetDto {
    target_mg_per_day: number;
    strategy: string;
}
export declare class PotassiumStrategyDto {
    approach: string;
    target_mg_per_day?: number;
}
export declare class DietParametersDto {
    protein_g_per_day_target: ProteinTargetDto;
    sodium_mg_per_day_max: number;
    phosphorus_mg_per_day_target: PhosphorusTargetDto;
    potassium_strategy: PotassiumStrategyDto;
    fiber_g_per_day_target: number;
    fluid_limit_ml_per_day?: number | null;
    fluid_note?: string;
}
export declare class ShoppingListDto {
    Proteinas: string[];
    Carboidratos: string[];
    Legumes_Verduras: string[];
    Frutas: string[];
    Outros: string[];
}
export declare class RecipeIngredientDto {
    item: string;
    qty: string;
}
export declare class RecipeDto {
    id: string;
    title: string;
    servings: number;
    ingredients: RecipeIngredientDto[];
    steps: string[];
    renal_tip: string;
}
export declare class SupplementationDto {
    name: string;
    suggested_dose_ui_per_day?: number;
    suggested_dose_mg_elemental?: number;
    timing?: string;
    requires_medical_supervision: boolean;
}
export declare class AssetDto {
    id: string;
    name: string;
    value: number;
    return: number;
    allocation: number;
}
export declare class PortfolioDto {
    total_value: number;
    total_return: number;
    assets: AssetDto[];
}
export declare class FinancialGoalDto {
    id: string;
    name: string;
    target: number;
    current: number;
    deadline: string;
}
export declare class BusinessOpportunityDto {
    id: string;
    title: string;
    description: string;
    investment: number;
    potential_return: number;
    risk: string;
    timeline: string;
}
export declare class BusinessProjectDto {
    id: string;
    name: string;
    status: string;
    progress: number;
    deadline: string;
}
export declare class GameMilestoneDto {
    tile: number;
    label: string;
}
export declare class GameBoardDto {
    rows: number;
    cols: number;
    milestones: GameMilestoneDto[];
}
export declare class ScoringRuleDto {
    action: string;
    points: number;
    desc: string;
}
export declare class GameDto {
    board: GameBoardDto;
    scoring_rules: ScoringRuleDto[];
    weekly_goal_points: number;
}
export declare class DailyRoutineDto {
    time: string;
    activity: string;
    domain?: string;
}
export declare class RoutinesDto {
    daily_schedule: DailyRoutineDto[];
}
export declare class MealPlanDto {
    days: string[];
    meals: string[];
    plan: {
        [day: string]: {
            [meal: string]: string;
        };
    };
}
export declare enum TimeOfDay {
    MORNING = "morning",
    AFTERNOON = "afternoon",
    EVENING = "evening",
    ALL = "all"
}
export declare class HabitDto {
    id: string;
    name: string;
    icon: string;
    color?: string;
    categoryId: number;
    description?: string;
    target?: string;
    streak: number;
    completed: boolean;
    timeOfDay?: TimeOfDay;
    createdAt: string;
    updatedAt: string;
    domain?: string;
}
export declare class UIHintsDto {
    colors: {
        [domain: string]: string;
    };
    icons: {
        [domain: string]: string;
    };
}
export declare class DomainDto {
    goals: DomainGoalDto[];
    habits: HabitDto[];
    game?: GameDto;
    meal_plan_week?: MealPlanDto;
    routines?: RoutinesDto;
    latest_labs?: LatestLabsDto;
    diet_parameters?: DietParametersDto;
    shopping_list?: ShoppingListDto;
    recipes?: RecipeDto[];
    supplementation?: SupplementationDto[];
    notes_for_doctor_review?: string[];
    portfolio?: PortfolioDto;
    financial_goals?: FinancialGoalDto[];
    opportunities?: BusinessOpportunityDto[];
    business_plan_progress?: {
        [key: string]: number;
    };
    projects?: BusinessProjectDto[];
}
export declare class CreateHabitDto {
    name: string;
    icon: string;
    color?: string;
    categoryId: number;
    description?: string;
    target?: string;
    timeOfDay?: TimeOfDay;
    domain?: string;
}
export declare class UpdateHabitDto {
    name?: string;
    icon?: string;
    color?: string;
    categoryId?: number;
    description?: string;
    target?: string;
    timeOfDay?: TimeOfDay;
    domain?: string;
    completed?: boolean;
    streak?: number;
}
export declare class CreateCategoryDto {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    habits?: string[];
}
export declare class UpdateCategoryDto {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    habits?: string[];
}
