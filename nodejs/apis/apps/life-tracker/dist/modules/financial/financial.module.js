"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const axios_1 = require("@nestjs/axios");
const financial_controller_1 = require("./financial.controller");
const financial_service_1 = require("./financial.service");
const portfolio_schema_1 = require("./schemas/portfolio.schema");
const asset_schema_1 = require("./schemas/asset.schema");
const financial_goal_schema_1 = require("./schemas/financial-goal.schema");
const jwt_validator_service_1 = require("../../services/jwt-validator.service");
let FinancialModule = class FinancialModule {
};
exports.FinancialModule = FinancialModule;
exports.FinancialModule = FinancialModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 5000,
                maxRedirects: 5,
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: portfolio_schema_1.Portfolio.name, schema: portfolio_schema_1.PortfolioSchema },
                { name: asset_schema_1.Asset.name, schema: asset_schema_1.AssetSchema },
                { name: financial_goal_schema_1.FinancialGoal.name, schema: financial_goal_schema_1.FinancialGoalSchema },
            ]),
        ],
        controllers: [financial_controller_1.FinancialController],
        providers: [financial_service_1.FinancialService, jwt_validator_service_1.JwtValidatorService],
        exports: [financial_service_1.FinancialService],
    })
], FinancialModule);
//# sourceMappingURL=financial.module.js.map