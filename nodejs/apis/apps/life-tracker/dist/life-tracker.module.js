"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifeTrackerModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const life_tracker_controller_1 = require("./life-tracker.controller");
const life_tracker_service_1 = require("./life-tracker.service");
const routines_module_1 = require("./modules/routines/routines.module");
const habits_module_1 = require("./modules/habits/habits.module");
const health_module_1 = require("./modules/health/health.module");
const financial_module_1 = require("./modules/financial/financial.module");
const business_module_1 = require("./modules/business/business.module");
const productivity_module_1 = require("./modules/productivity/productivity.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const gamification_module_1 = require("./modules/gamification/gamification.module");
let LifeTrackerModule = class LifeTrackerModule {
};
exports.LifeTrackerModule = LifeTrackerModule;
exports.LifeTrackerModule = LifeTrackerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ envFilePath: `.env` }),
            mongoose_1.MongooseModule.forRoot(`mongodb+srv://${encodeURIComponent(process.env.USER_DB)}:${encodeURIComponent(process.env.PASS_DB)}@${process.env.HOST_DB}/life-tracker`),
            routines_module_1.RoutinesModule,
            habits_module_1.HabitsModule,
            health_module_1.HealthModule,
            financial_module_1.FinancialModule,
            business_module_1.BusinessModule,
            productivity_module_1.ProductivityModule,
            analytics_module_1.AnalyticsModule,
            gamification_module_1.GamificationModule,
        ],
        controllers: [life_tracker_controller_1.LifeTrackerController],
        providers: [life_tracker_service_1.LifeTrackerService],
        exports: [life_tracker_service_1.LifeTrackerService],
    })
], LifeTrackerModule);
//# sourceMappingURL=life-tracker.module.js.map