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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const health_service_1 = require("./health.service");
let HealthController = class HealthController {
    healthService;
    constructor(healthService) {
        this.healthService = healthService;
    }
    async loadHealthPlan() {
        return this.healthService.loadHealthPlan();
    }
    async updateHealthProgress(progressData) {
        return this.healthService.updateHealthProgress(progressData);
    }
    async markMeal(mealData) {
        return this.healthService.markMeal(mealData);
    }
    async getLatestLabs() {
        return this.healthService.getLatestLabs();
    }
    async getDietParameters() {
        return this.healthService.getDietParameters();
    }
    async getRecipes() {
        return this.healthService.getRecipes();
    }
    async getRecipe(id) {
        return this.healthService.getRecipe(id);
    }
    async getSupplementation() {
        return this.healthService.getSupplementation();
    }
    async getShoppingList() {
        return this.healthService.getShoppingList();
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)('analytics/load'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "loadHealthPlan", null);
__decorate([
    (0, common_1.Post)('analytics/progress'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "updateHealthProgress", null);
__decorate([
    (0, common_1.Post)('analytics/meals/mark'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "markMeal", null);
__decorate([
    (0, common_1.Get)('labs/latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getLatestLabs", null);
__decorate([
    (0, common_1.Get)('diet/parameters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getDietParameters", null);
__decorate([
    (0, common_1.Get)('recipes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getRecipes", null);
__decorate([
    (0, common_1.Get)('recipes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getRecipe", null);
__decorate([
    (0, common_1.Get)('supplementation'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getSupplementation", null);
__decorate([
    (0, common_1.Get)('shopping-list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getShoppingList", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [health_service_1.HealthService])
], HealthController);
//# sourceMappingURL=health.controller.js.map