"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifeTrackerService = void 0;
const common_1 = require("@nestjs/common");
let LifeTrackerService = class LifeTrackerService {
    async getIntegratedPlan() {
        return {
            success: true,
            data: {
                schema_version: '1.0.0',
                generated_at: new Date().toISOString(),
                locale: 'pt-BR',
            }
        };
    }
    async getDashboardSummary() {
        return {
            success: true,
            data: {
                total_habits: 0,
                completed_today: 0,
                weekly_progress: 0,
            }
        };
    }
    async getCrossModuleProgress() {
        return {
            success: true,
            data: {
                healthness: { progress: 0, goals: [] },
                finances: { progress: 0, goals: [] },
                business: { progress: 0, goals: [] },
                productivity: { progress: 0, goals: [] },
            }
        };
    }
};
exports.LifeTrackerService = LifeTrackerService;
exports.LifeTrackerService = LifeTrackerService = __decorate([
    (0, common_1.Injectable)()
], LifeTrackerService);
//# sourceMappingURL=life-tracker.service.js.map