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
exports.HabitsService = void 0;
const common_1 = require("@nestjs/common");
const category_schema_1 = require("./schemas/category.schema");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const habit_schema_1 = require("./schemas/habit.schema");
let HabitsService = class HabitsService {
    habitModel;
    categoryModel;
    constructor(habitModel, categoryModel) {
        this.habitModel = habitModel;
        this.categoryModel = categoryModel;
    }
    async getAllHabits() {
        try {
            const habits = await this.habitModel.find().exec();
            return {
                success: true,
                data: habits,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar hábitos',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getHabitsByDomain(domain) {
        try {
            const habits = await this.habitModel.find({ domain }).exec();
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
    async getHabitsByCategory(categoryId) {
        try {
            const habits = await this.habitModel.find({ categoryId }).exec();
            return {
                success: true,
                data: habits,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar hábitos da categoria',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getHabitsWithFilters(filters) {
        try {
            const query = {};
            if (filters.timeOfDay) {
                query.timeOfDay = filters.timeOfDay;
            }
            if (filters.categoryId) {
                query.categoryId = filters.categoryId;
            }
            if (filters.completed !== undefined) {
                query.completed = filters.completed;
            }
            const habits = await this.habitModel.find(query).exec();
            return {
                success: true,
                data: habits,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao filtrar hábitos',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async createHabit(createHabitDto) {
        try {
            const habit = new this.habitModel({
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
            const habit = await this.habitModel.findByIdAndUpdate(id, {
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
    async deleteHabit(id) {
        try {
            const habit = await this.habitModel.findByIdAndDelete(id).exec();
            if (!habit) {
                return {
                    success: false,
                    error: 'Hábito não encontrado',
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: { message: 'Hábito deletado com sucesso' },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao deletar hábito',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async toggleHabit(id) {
        try {
            const habit = await this.habitModel.findById(id).exec();
            if (!habit) {
                return {
                    success: false,
                    error: 'Hábito não encontrado',
                    timestamp: new Date().toISOString(),
                };
            }
            habit.completed = !habit.completed;
            if (habit.completed) {
                habit.streak += 1;
            }
            else {
                habit.streak = Math.max(0, habit.streak - 1);
            }
            habit.updatedAt = new Date().toISOString();
            await habit.save();
            return {
                success: true,
                data: habit,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao alternar hábito',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getHabitsStats() {
        try {
            const totalHabits = await this.habitModel.countDocuments().exec();
            const completedToday = await this.habitModel.countDocuments({
                completed: true,
                updatedAt: { $gte: new Date().toISOString().split('T')[0] }
            }).exec();
            const stats = await this.habitModel.aggregate([
                {
                    $group: {
                        _id: '$domain',
                        count: { $sum: 1 },
                        completed: { $sum: { $cond: ['$completed', 1, 0] } },
                        avgStreak: { $avg: '$streak' }
                    }
                }
            ]).exec();
            const timeOfDayStats = await this.habitModel.aggregate([
                {
                    $group: {
                        _id: '$timeOfDay',
                        count: { $sum: 1 },
                        completed: { $sum: { $cond: ['$completed', 1, 0] } }
                    }
                }
            ]).exec();
            const categoryStats = await this.habitModel.aggregate([
                {
                    $group: {
                        _id: '$categoryId',
                        count: { $sum: 1 },
                        completed: { $sum: { $cond: ['$completed', 1, 0] } }
                    }
                }
            ]).exec();
            return {
                success: true,
                data: {
                    totalHabits,
                    completedToday,
                    completionRate: totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0,
                    stats,
                    timeOfDayStats,
                    categoryStats,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar estatísticas',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getHabitsByTimeOfDay(timeOfDay) {
        try {
            const habits = await this.habitModel.find({ timeOfDay }).exec();
            return {
                success: true,
                data: habits,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar hábitos por período',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getCompletedHabits() {
        try {
            const habits = await this.habitModel.find({ completed: true }).exec();
            return {
                success: true,
                data: habits,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar hábitos completados',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getHabitsWithHighStreak(minStreak = 5) {
        try {
            const habits = await this.habitModel.find({ streak: { $gte: minStreak } }).exec();
            return {
                success: true,
                data: habits,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar hábitos com alta sequência',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async resetHabitStreak(id) {
        try {
            const habit = await this.habitModel.findByIdAndUpdate(id, {
                streak: 0,
                completed: false,
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
                error: 'Erro ao resetar sequência do hábito',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async bulkUpdateHabits(updates) {
        try {
            const results = [];
            for (const update of updates) {
                const habit = await this.habitModel.findByIdAndUpdate(update.id, {
                    ...update.updates,
                    updatedAt: new Date().toISOString(),
                }, { new: true }).exec();
                if (habit) {
                    results.push(habit);
                }
            }
            return {
                success: true,
                data: results,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao atualizar hábitos em lote',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getCategories() {
        try {
            const categories = await this.categoryModel.find().exec();
            if (categories.length === 0) {
                const mockCategories = [
                    {
                        id: 1,
                        name: 'Sa�de',
                        description: 'H�bitos relacionados � sa�de f�sica e mental',
                        icon: 'heart',
                        color: '#ef4444',
                        habits: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                    {
                        id: 2,
                        name: 'Produtividade',
                        description: 'H�bitos para melhorar a produtividade e organiza��o',
                        icon: 'target',
                        color: '#3b82f6',
                        habits: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                    {
                        id: 3,
                        name: 'Finan�as',
                        description: 'H�bitos para melhorar a sa�de financeira',
                        icon: 'dollar-sign',
                        color: '#10b981',
                        habits: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                    {
                        id: 4,
                        name: 'Bem-estar',
                        description: 'H�bitos para melhorar o bem-estar geral',
                        icon: 'sun',
                        color: '#f59e0b',
                        habits: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ];
                return {
                    success: true,
                    data: mockCategories,
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: categories,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar categorias',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async createCategory(categoryData) {
        try {
            const category = new this.categoryModel({
                ...categoryData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            const savedCategory = await category.save();
            return {
                success: true,
                data: savedCategory,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao criar categoria',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async updateCategory(id, categoryData) {
        try {
            const updatedCategory = await this.categoryModel
                .findOneAndUpdate({ id }, { ...categoryData, updatedAt: new Date().toISOString() }, { new: true })
                .exec();
            return {
                success: true,
                data: updatedCategory,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao atualizar categoria',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async deleteCategory(id) {
        try {
            await this.categoryModel.findOneAndDelete({ id }).exec();
            return {
                success: true,
                data: { message: 'Categoria deletada com sucesso' },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao deletar categoria',
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.HabitsService = HabitsService;
exports.HabitsService = HabitsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(habit_schema_1.Habit.name)),
    __param(1, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], HabitsService);
//# sourceMappingURL=habits.service.js.map