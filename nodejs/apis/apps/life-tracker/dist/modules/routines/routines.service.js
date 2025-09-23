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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutinesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const routine_schema_1 = require("./schemas/routine.schema");
const integrated_routine_schema_1 = require("./schemas/integrated-routine.schema");
let RoutinesService = class RoutinesService {
    routineModel;
    integratedRoutineModel;
    constructor(routineModel, integratedRoutineModel) {
        this.routineModel = routineModel;
        this.integratedRoutineModel = integratedRoutineModel;
    }
    async getIntegratedPlan() {
        try {
            const plan = await this.integratedRoutineModel.findOne().exec();
            if (!plan) {
                return {
                    success: false,
                    error: 'Plano integrado não encontrado',
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: plan,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar plano integrado',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getHabitsByDomain(domain) {
        try {
            const habits = await this.routineModel.find({ domain }).exec();
            return {
                success: true,
                data: habits,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar hábitos do domínio',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getIntegratedGoals() {
        try {
            const plan = await this.integratedRoutineModel.findOne().exec();
            if (!plan) {
                return {
                    success: false,
                    error: 'Metas integradas não encontradas',
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: plan.integrated_goals || [],
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar metas integradas',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async createHabit(createHabitDto) {
        try {
            const habit = new this.routineModel({
                ...createHabitDto,
                streak: 0,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            const savedHabit = await habit.save();
            return {
                success: true,
                data: savedHabit,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao criar hábito',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async updateHabit(id, updateHabitDto) {
        try {
            const habit = await this.routineModel.findByIdAndUpdate(id, {
                ...updateHabitDto,
                updatedAt: new Date().toISOString(),
            }, { new: true }).exec();
            if (!habit) {
                return {
                    success: false,
                    error: 'Hábito não encontrado',
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: habit,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao atualizar hábito',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async completeHabit(completeHabitDto) {
        try {
            const habit = await this.routineModel.findOneAndUpdate({
                id: completeHabitDto.habitId,
                domain: completeHabitDto.domain
            }, {
                completed: true,
                streak: { $inc: 1 },
                updatedAt: new Date().toISOString(),
            }, { new: true }).exec();
            if (!habit) {
                return {
                    success: false,
                    error: 'Hábito não encontrado',
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: habit,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao completar hábito',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async updateIntegratedGoalProgress(goalId, progress) {
        try {
            const result = await this.integratedRoutineModel.updateOne({ 'integrated_goals.id': goalId }, { $set: { 'integrated_goals.$.progress': progress } }).exec();
            if (result.modifiedCount === 0) {
                return {
                    success: false,
                    error: 'Meta integrada não encontrada',
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: { goalId, progress },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao atualizar progresso da meta',
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.RoutinesService = RoutinesService;
exports.RoutinesService = RoutinesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(routine_schema_1.Routine.name)),
    __param(1, (0, mongoose_1.InjectModel)(integrated_routine_schema_1.IntegratedRoutine.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], RoutinesService);
//# sourceMappingURL=routines.service.js.map