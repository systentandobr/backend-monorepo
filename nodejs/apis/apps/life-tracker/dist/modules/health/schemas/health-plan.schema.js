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
exports.HealthPlanSchema = exports.HealthPlan = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let HealthPlan = class HealthPlan {
    id;
    name;
    description;
    meal_plan_week;
    routines;
    notes_for_doctor_review;
    createdAt;
    updatedAt;
};
exports.HealthPlan = HealthPlan;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], HealthPlan.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], HealthPlan.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], HealthPlan.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], HealthPlan.prototype, "meal_plan_week", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array }),
    __metadata("design:type", Array)
], HealthPlan.prototype, "routines", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array }),
    __metadata("design:type", Array)
], HealthPlan.prototype, "notes_for_doctor_review", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], HealthPlan.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], HealthPlan.prototype, "updatedAt", void 0);
exports.HealthPlan = HealthPlan = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], HealthPlan);
exports.HealthPlanSchema = mongoose_1.SchemaFactory.createForClass(HealthPlan);
//# sourceMappingURL=health-plan.schema.js.map