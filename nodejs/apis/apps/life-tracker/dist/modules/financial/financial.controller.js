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
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
let FinancialController = class FinancialController {
    financialService;
    constructor(financialService) {
        this.financialService = financialService;
    }
    async getPortfolio(req) {
        return this.financialService.getPortfolio(req.user.id);
    }
    async getPortfolioRiskAnalysis(req) {
        return this.financialService.getPortfolioRiskAnalysis(req.user.id);
    }
    async addAsset(req, assetData) {
        return this.financialService.addAsset(req.user.id, assetData);
    }
    async updateAsset(req, assetId, assetData) {
        return this.financialService.updateAsset(req.user.id, assetId, assetData);
    }
    async removeAsset(req, assetId) {
        return this.financialService.removeAsset(req.user.id, assetId);
    }
    async getFinancialGoals(req) {
        return this.financialService.getFinancialGoals(req.user.id);
    }
    async getFinancialGoal(req, id) {
        return this.financialService.getFinancialGoal(req.user.id, id);
    }
    async createFinancialGoal(req, goalData) {
        return this.financialService.createFinancialGoal(req.user.id, goalData);
    }
    async updateFinancialGoal(req, id, goalData) {
        return this.financialService.updateFinancialGoal(req.user.id, id, goalData);
    }
    async deleteFinancialGoal(req, id) {
        return this.financialService.deleteFinancialGoal(req.user.id, id);
    }
    async getMarketData(req, requestData) {
        return this.financialService.getMarketData(requestData.symbols);
    }
    async getPriceHistory(req, symbol, period) {
        return this.financialService.getPriceHistory(symbol, period || '1m');
    }
};
exports.FinancialController = FinancialController;
__decorate([
    (0, common_1.Get)('portfolio'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getPortfolio", null);
__decorate([
    (0, common_1.Get)('portfolio/risk-analysis'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getPortfolioRiskAnalysis", null);
__decorate([
    (0, common_1.Post)('portfolio/assets'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "addAsset", null);
__decorate([
    (0, common_1.Patch)('portfolio/assets/:assetId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('assetId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "updateAsset", null);
__decorate([
    (0, common_1.Delete)('portfolio/assets/:assetId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "removeAsset", null);
__decorate([
    (0, common_1.Get)('goals'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getFinancialGoals", null);
__decorate([
    (0, common_1.Get)('goals/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getFinancialGoal", null);
__decorate([
    (0, common_1.Post)('goals'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "createFinancialGoal", null);
__decorate([
    (0, common_1.Patch)('goals/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "updateFinancialGoal", null);
__decorate([
    (0, common_1.Delete)('goals/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "deleteFinancialGoal", null);
__decorate([
    (0, common_1.Post)('market-data'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getMarketData", null);
__decorate([
    (0, common_1.Get)('price-history/:symbol'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('symbol')),
    __param(2, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getPriceHistory", null);
exports.FinancialController = FinancialController = __decorate([
    (0, common_1.Controller)('financial'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [financial_service_1.FinancialService])
], FinancialController);
//# sourceMappingURL=financial.controller.js.map