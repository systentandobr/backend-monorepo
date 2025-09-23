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
exports.FinancialController = void 0;
const common_1 = require("@nestjs/common");
const financial_service_1 = require("./financial.service");
let FinancialController = class FinancialController {
    financialService;
    constructor(financialService) {
        this.financialService = financialService;
    }
    async getPortfolio() {
        return this.financialService.getPortfolio();
    }
    async getPortfolioSummary() {
        return this.financialService.getPortfolioSummary();
    }
    async getPortfolioRiskAnalysis() {
        return this.financialService.getPortfolioRiskAnalysis();
    }
    async getAssets() {
        return this.financialService.getAssets();
    }
    async getAsset(id) {
        return this.financialService.getAsset(id);
    }
    async getFinancialGoals() {
        return this.financialService.getFinancialGoals();
    }
    async getFinancialGoal(id) {
        return this.financialService.getFinancialGoal(id);
    }
    async createFinancialGoal(goalData) {
        return this.financialService.createFinancialGoal(goalData);
    }
    async updateFinancialGoal(id, goalData) {
        return this.financialService.updateFinancialGoal(id, goalData);
    }
    async getFinancialAnalytics() {
        return this.financialService.getFinancialAnalytics();
    }
};
exports.FinancialController = FinancialController;
__decorate([
    (0, common_1.Get)('portfolio'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getPortfolio", null);
__decorate([
    (0, common_1.Get)('portfolio/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getPortfolioSummary", null);
__decorate([
    (0, common_1.Get)('portfolio/risk-analysis'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getPortfolioRiskAnalysis", null);
__decorate([
    (0, common_1.Get)('assets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getAssets", null);
__decorate([
    (0, common_1.Get)('assets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getAsset", null);
__decorate([
    (0, common_1.Get)('goals'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getFinancialGoals", null);
__decorate([
    (0, common_1.Get)('goals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getFinancialGoal", null);
__decorate([
    (0, common_1.Post)('goals'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "createFinancialGoal", null);
__decorate([
    (0, common_1.Put)('goals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "updateFinancialGoal", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getFinancialAnalytics", null);
exports.FinancialController = FinancialController = __decorate([
    (0, common_1.Controller)('financial'),
    __metadata("design:paramtypes", [financial_service_1.FinancialService])
], FinancialController);
//# sourceMappingURL=financial.controller.js.map