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
exports.LifeTrackerController = void 0;
const common_1 = require("@nestjs/common");
const life_tracker_service_1 = require("./life-tracker.service");
let LifeTrackerController = class LifeTrackerController {
    lifeTrackerService;
    constructor(lifeTrackerService) {
        this.lifeTrackerService = lifeTrackerService;
    }
    getHealth() {
        return { status: 'ok', service: 'life-tracker' };
    }
    async getIntegratedPlan() {
        return this.lifeTrackerService.getIntegratedPlan();
    }
    async getDashboardSummary() {
        return this.lifeTrackerService.getDashboardSummary();
    }
    async getCrossModuleProgress() {
        return this.lifeTrackerService.getCrossModuleProgress();
    }
};
exports.LifeTrackerController = LifeTrackerController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LifeTrackerController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('integrated-plan'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LifeTrackerController.prototype, "getIntegratedPlan", null);
__decorate([
    (0, common_1.Get)('dashboard-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LifeTrackerController.prototype, "getDashboardSummary", null);
__decorate([
    (0, common_1.Get)('cross-module-progress'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LifeTrackerController.prototype, "getCrossModuleProgress", null);
exports.LifeTrackerController = LifeTrackerController = __decorate([
    (0, common_1.Controller)('life-tracker'),
    __metadata("design:paramtypes", [life_tracker_service_1.LifeTrackerService])
], LifeTrackerController);
//# sourceMappingURL=life-tracker.controller.js.map