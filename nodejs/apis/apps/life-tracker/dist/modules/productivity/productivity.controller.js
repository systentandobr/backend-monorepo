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
exports.ProductivityController = void 0;
const common_1 = require("@nestjs/common");
const productivity_service_1 = require("./productivity.service");
let ProductivityController = class ProductivityController {
    productivityService;
    constructor(productivityService) {
        this.productivityService = productivityService;
    }
    async getProductivityGoals() {
        return this.productivityService.getProductivityGoals();
    }
    async getProductivityGoal(id) {
        return this.productivityService.getProductivityGoal(id);
    }
    async createProductivityGoal(goalData) {
        return this.productivityService.createProductivityGoal(goalData);
    }
    async updateGoalProgress(id, progressData) {
        return this.productivityService.updateGoalProgress(id, progressData.progress);
    }
    async getProductivityAnalytics() {
        return this.productivityService.getProductivityAnalytics();
    }
};
exports.ProductivityController = ProductivityController;
__decorate([
    (0, common_1.Get)('goals'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductivityController.prototype, "getProductivityGoals", null);
__decorate([
    (0, common_1.Get)('goals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductivityController.prototype, "getProductivityGoal", null);
__decorate([
    (0, common_1.Post)('goals'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductivityController.prototype, "createProductivityGoal", null);
__decorate([
    (0, common_1.Put)('goals/:id/progress'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductivityController.prototype, "updateGoalProgress", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductivityController.prototype, "getProductivityAnalytics", null);
exports.ProductivityController = ProductivityController = __decorate([
    (0, common_1.Controller)('productivity'),
    __metadata("design:paramtypes", [productivity_service_1.ProductivityService])
], ProductivityController);
//# sourceMappingURL=productivity.controller.js.map