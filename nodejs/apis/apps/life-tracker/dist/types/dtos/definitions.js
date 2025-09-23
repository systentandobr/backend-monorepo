"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategoryDto = exports.CreateCategoryDto = exports.UpdateHabitDto = exports.CreateHabitDto = exports.DomainDto = exports.UIHintsDto = exports.HabitDto = exports.TimeOfDay = exports.MealPlanDto = exports.RoutinesDto = exports.DailyRoutineDto = exports.GameDto = exports.ScoringRuleDto = exports.GameBoardDto = exports.GameMilestoneDto = exports.BusinessProjectDto = exports.BusinessOpportunityDto = exports.FinancialGoalDto = exports.PortfolioDto = exports.AssetDto = exports.SupplementationDto = exports.RecipeDto = exports.RecipeIngredientDto = exports.ShoppingListDto = exports.DietParametersDto = exports.PotassiumStrategyDto = exports.PhosphorusTargetDto = exports.ProteinTargetDto = exports.LatestLabsDto = exports.IntegratedGoalDto = exports.DomainGoalDto = exports.UserProfileDto = exports.IntegratedRoutineDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class IntegratedRoutineDto {
    schema_version;
    generated_at;
    locale;
    user_profile;
    domains;
    integrated_goals;
    routines;
    ui_hints;
}
exports.IntegratedRoutineDto = IntegratedRoutineDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntegratedRoutineDto.prototype, "schema_version", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], IntegratedRoutineDto.prototype, "generated_at", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntegratedRoutineDto.prototype, "locale", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UserProfileDto),
    __metadata("design:type", UserProfileDto)
], IntegratedRoutineDto.prototype, "user_profile", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DomainDto),
    __metadata("design:type", Object)
], IntegratedRoutineDto.prototype, "domains", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => IntegratedGoalDto),
    __metadata("design:type", Array)
], IntegratedRoutineDto.prototype, "integrated_goals", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RoutinesDto),
    __metadata("design:type", RoutinesDto)
], IntegratedRoutineDto.prototype, "routines", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UIHintsDto),
    __metadata("design:type", UIHintsDto)
], IntegratedRoutineDto.prototype, "ui_hints", void 0);
class UserProfileDto {
    name;
    age;
    sex;
    notes;
}
exports.UserProfileDto = UserProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserProfileDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "sex", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UserProfileDto.prototype, "notes", void 0);
class DomainGoalDto {
    id;
    label;
    priority;
}
exports.DomainGoalDto = DomainGoalDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DomainGoalDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DomainGoalDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DomainGoalDto.prototype, "priority", void 0);
class IntegratedGoalDto {
    id;
    name;
    domains;
    description;
    progress;
    target_date;
    key_metrics;
}
exports.IntegratedGoalDto = IntegratedGoalDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntegratedGoalDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntegratedGoalDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], IntegratedGoalDto.prototype, "domains", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntegratedGoalDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IntegratedGoalDto.prototype, "progress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntegratedGoalDto.prototype, "target_date", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], IntegratedGoalDto.prototype, "key_metrics", void 0);
class LatestLabsDto {
    creatinina_mg_dl;
    ureia_mg_dl;
    egfr_ml_min_1_73;
    fosforo_mg_dl;
    calcio_total_mg_dl;
    calcio_ionico_mmol_l;
    sodio_mmol_l;
    potassio_mmol_l;
    hba1c_percent;
    glicose_mg_dl;
    hb_g_dl;
    ferritina_ng_ml;
    vitamina_d_25oh_ng_ml;
    pth_pg_ml;
    sangue_oculto_fezes;
}
exports.LatestLabsDto = LatestLabsDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LatestLabsDto.prototype, "creatinina_mg_dl", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LatestLabsDto.prototype, "ureia_mg_dl", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LatestLabsDto.prototype, "egfr_ml_min_1_73", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LatestLabsDto.prototype, "fosforo_mg_dl", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LatestLabsDto.prototype, "calcio_total_mg_dl", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LatestLabsDto.prototype, "calcio_ionico_mmol_l", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LatestLabsDto.prototype, "sodio_mmol_l", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LatestLabsDto.prototype, "potassio_mmol_l", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LatestLabsDto.prototype, "hba1c_percent", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LatestLabsDto.prototype, "glicose_mg_dl", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LatestLabsDto.prototype, "hb_g_dl", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LatestLabsDto.prototype, "ferritina_ng_ml", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LatestLabsDto.prototype, "vitamina_d_25oh_ng_ml", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LatestLabsDto.prototype, "pth_pg_ml", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LatestLabsDto.prototype, "sangue_oculto_fezes", void 0);
class ProteinTargetDto {
    target_g_per_day;
    strategy;
}
exports.ProteinTargetDto = ProteinTargetDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProteinTargetDto.prototype, "target_g_per_day", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProteinTargetDto.prototype, "strategy", void 0);
class PhosphorusTargetDto {
    target_mg_per_day;
    strategy;
}
exports.PhosphorusTargetDto = PhosphorusTargetDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PhosphorusTargetDto.prototype, "target_mg_per_day", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PhosphorusTargetDto.prototype, "strategy", void 0);
class PotassiumStrategyDto {
    approach;
    target_mg_per_day;
}
exports.PotassiumStrategyDto = PotassiumStrategyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PotassiumStrategyDto.prototype, "approach", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PotassiumStrategyDto.prototype, "target_mg_per_day", void 0);
class DietParametersDto {
    protein_g_per_day_target;
    sodium_mg_per_day_max;
    phosphorus_mg_per_day_target;
    potassium_strategy;
    fiber_g_per_day_target;
    fluid_limit_ml_per_day;
    fluid_note;
}
exports.DietParametersDto = DietParametersDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ProteinTargetDto),
    __metadata("design:type", ProteinTargetDto)
], DietParametersDto.prototype, "protein_g_per_day_target", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DietParametersDto.prototype, "sodium_mg_per_day_max", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PhosphorusTargetDto),
    __metadata("design:type", PhosphorusTargetDto)
], DietParametersDto.prototype, "phosphorus_mg_per_day_target", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PotassiumStrategyDto),
    __metadata("design:type", PotassiumStrategyDto)
], DietParametersDto.prototype, "potassium_strategy", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DietParametersDto.prototype, "fiber_g_per_day_target", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], DietParametersDto.prototype, "fluid_limit_ml_per_day", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DietParametersDto.prototype, "fluid_note", void 0);
class ShoppingListDto {
    Proteinas;
    Carboidratos;
    Legumes_Verduras;
    Frutas;
    Outros;
}
exports.ShoppingListDto = ShoppingListDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ShoppingListDto.prototype, "Proteinas", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ShoppingListDto.prototype, "Carboidratos", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ShoppingListDto.prototype, "Legumes_Verduras", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ShoppingListDto.prototype, "Frutas", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ShoppingListDto.prototype, "Outros", void 0);
class RecipeIngredientDto {
    item;
    qty;
}
exports.RecipeIngredientDto = RecipeIngredientDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecipeIngredientDto.prototype, "item", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecipeIngredientDto.prototype, "qty", void 0);
class RecipeDto {
    id;
    title;
    servings;
    ingredients;
    steps;
    renal_tip;
}
exports.RecipeDto = RecipeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecipeDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecipeDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecipeDto.prototype, "servings", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RecipeIngredientDto),
    __metadata("design:type", Array)
], RecipeDto.prototype, "ingredients", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RecipeDto.prototype, "steps", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecipeDto.prototype, "renal_tip", void 0);
class SupplementationDto {
    name;
    suggested_dose_ui_per_day;
    suggested_dose_mg_elemental;
    timing;
    requires_medical_supervision;
}
exports.SupplementationDto = SupplementationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SupplementationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SupplementationDto.prototype, "suggested_dose_ui_per_day", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SupplementationDto.prototype, "suggested_dose_mg_elemental", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SupplementationDto.prototype, "timing", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SupplementationDto.prototype, "requires_medical_supervision", void 0);
class AssetDto {
    id;
    name;
    value;
    return;
    allocation;
}
exports.AssetDto = AssetDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssetDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssetDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AssetDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AssetDto.prototype, "return", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AssetDto.prototype, "allocation", void 0);
class PortfolioDto {
    total_value;
    total_return;
    assets;
}
exports.PortfolioDto = PortfolioDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PortfolioDto.prototype, "total_value", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PortfolioDto.prototype, "total_return", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AssetDto),
    __metadata("design:type", Array)
], PortfolioDto.prototype, "assets", void 0);
class FinancialGoalDto {
    id;
    name;
    target;
    current;
    deadline;
}
exports.FinancialGoalDto = FinancialGoalDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinancialGoalDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinancialGoalDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FinancialGoalDto.prototype, "target", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FinancialGoalDto.prototype, "current", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinancialGoalDto.prototype, "deadline", void 0);
class BusinessOpportunityDto {
    id;
    title;
    description;
    investment;
    potential_return;
    risk;
    timeline;
}
exports.BusinessOpportunityDto = BusinessOpportunityDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOpportunityDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOpportunityDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOpportunityDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BusinessOpportunityDto.prototype, "investment", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BusinessOpportunityDto.prototype, "potential_return", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOpportunityDto.prototype, "risk", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOpportunityDto.prototype, "timeline", void 0);
class BusinessProjectDto {
    id;
    name;
    status;
    progress;
    deadline;
}
exports.BusinessProjectDto = BusinessProjectDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessProjectDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessProjectDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessProjectDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BusinessProjectDto.prototype, "progress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessProjectDto.prototype, "deadline", void 0);
class GameMilestoneDto {
    tile;
    label;
}
exports.GameMilestoneDto = GameMilestoneDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameMilestoneDto.prototype, "tile", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GameMilestoneDto.prototype, "label", void 0);
class GameBoardDto {
    rows;
    cols;
    milestones;
}
exports.GameBoardDto = GameBoardDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameBoardDto.prototype, "rows", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameBoardDto.prototype, "cols", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GameMilestoneDto),
    __metadata("design:type", Array)
], GameBoardDto.prototype, "milestones", void 0);
class ScoringRuleDto {
    action;
    points;
    desc;
}
exports.ScoringRuleDto = ScoringRuleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScoringRuleDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ScoringRuleDto.prototype, "points", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScoringRuleDto.prototype, "desc", void 0);
class GameDto {
    board;
    scoring_rules;
    weekly_goal_points;
}
exports.GameDto = GameDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GameBoardDto),
    __metadata("design:type", GameBoardDto)
], GameDto.prototype, "board", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ScoringRuleDto),
    __metadata("design:type", Array)
], GameDto.prototype, "scoring_rules", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameDto.prototype, "weekly_goal_points", void 0);
class DailyRoutineDto {
    time;
    activity;
    domain;
}
exports.DailyRoutineDto = DailyRoutineDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DailyRoutineDto.prototype, "time", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DailyRoutineDto.prototype, "activity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DailyRoutineDto.prototype, "domain", void 0);
class RoutinesDto {
    daily_schedule;
}
exports.RoutinesDto = RoutinesDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DailyRoutineDto),
    __metadata("design:type", Array)
], RoutinesDto.prototype, "daily_schedule", void 0);
class MealPlanDto {
    days;
    meals;
    plan;
}
exports.MealPlanDto = MealPlanDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], MealPlanDto.prototype, "days", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], MealPlanDto.prototype, "meals", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Object)
], MealPlanDto.prototype, "plan", void 0);
var TimeOfDay;
(function (TimeOfDay) {
    TimeOfDay["MORNING"] = "morning";
    TimeOfDay["AFTERNOON"] = "afternoon";
    TimeOfDay["EVENING"] = "evening";
    TimeOfDay["ALL"] = "all";
})(TimeOfDay || (exports.TimeOfDay = TimeOfDay = {}));
class HabitDto {
    id;
    name;
    icon;
    color;
    categoryId;
    description;
    target;
    streak;
    completed;
    timeOfDay;
    createdAt;
    updatedAt;
    domain;
}
exports.HabitDto = HabitDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HabitDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HabitDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HabitDto.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], HabitDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], HabitDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], HabitDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], HabitDto.prototype, "target", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], HabitDto.prototype, "streak", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], HabitDto.prototype, "completed", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TimeOfDay),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], HabitDto.prototype, "timeOfDay", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], HabitDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], HabitDto.prototype, "updatedAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], HabitDto.prototype, "domain", void 0);
class UIHintsDto {
    colors;
    icons;
}
exports.UIHintsDto = UIHintsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Object)
], UIHintsDto.prototype, "colors", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Object)
], UIHintsDto.prototype, "icons", void 0);
class DomainDto {
    goals;
    habits;
    game;
    meal_plan_week;
    routines;
    latest_labs;
    diet_parameters;
    shopping_list;
    recipes;
    supplementation;
    notes_for_doctor_review;
    portfolio;
    financial_goals;
    opportunities;
    business_plan_progress;
    projects;
}
exports.DomainDto = DomainDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DomainGoalDto),
    __metadata("design:type", Array)
], DomainDto.prototype, "goals", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => HabitDto),
    __metadata("design:type", Array)
], DomainDto.prototype, "habits", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GameDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", GameDto)
], DomainDto.prototype, "game", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MealPlanDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", MealPlanDto)
], DomainDto.prototype, "meal_plan_week", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RoutinesDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", RoutinesDto)
], DomainDto.prototype, "routines", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LatestLabsDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", LatestLabsDto)
], DomainDto.prototype, "latest_labs", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DietParametersDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", DietParametersDto)
], DomainDto.prototype, "diet_parameters", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ShoppingListDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ShoppingListDto)
], DomainDto.prototype, "shopping_list", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RecipeDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], DomainDto.prototype, "recipes", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SupplementationDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], DomainDto.prototype, "supplementation", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], DomainDto.prototype, "notes_for_doctor_review", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PortfolioDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", PortfolioDto)
], DomainDto.prototype, "portfolio", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FinancialGoalDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], DomainDto.prototype, "financial_goals", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BusinessOpportunityDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], DomainDto.prototype, "opportunities", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], DomainDto.prototype, "business_plan_progress", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BusinessProjectDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], DomainDto.prototype, "projects", void 0);
class CreateHabitDto {
    name;
    icon;
    color;
    categoryId;
    description;
    target;
    timeOfDay;
    domain;
}
exports.CreateHabitDto = CreateHabitDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHabitDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHabitDto.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHabitDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateHabitDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHabitDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHabitDto.prototype, "target", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TimeOfDay),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHabitDto.prototype, "timeOfDay", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHabitDto.prototype, "domain", void 0);
class UpdateHabitDto {
    name;
    icon;
    color;
    categoryId;
    description;
    target;
    timeOfDay;
    domain;
    completed;
    streak;
}
exports.UpdateHabitDto = UpdateHabitDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateHabitDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateHabitDto.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateHabitDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateHabitDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateHabitDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateHabitDto.prototype, "target", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TimeOfDay),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateHabitDto.prototype, "timeOfDay", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateHabitDto.prototype, "domain", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateHabitDto.prototype, "completed", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateHabitDto.prototype, "streak", void 0);
class CreateCategoryDto {
    id;
    name;
    description;
    icon;
    color;
    habits;
}
exports.CreateCategoryDto = CreateCategoryDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCategoryDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateCategoryDto.prototype, "habits", void 0);
class UpdateCategoryDto {
    name;
    description;
    icon;
    color;
    habits;
}
exports.UpdateCategoryDto = UpdateCategoryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCategoryDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCategoryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCategoryDto.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCategoryDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateCategoryDto.prototype, "habits", void 0);
//# sourceMappingURL=definitions.js.map