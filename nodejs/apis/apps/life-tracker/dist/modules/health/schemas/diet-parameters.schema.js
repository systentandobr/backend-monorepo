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
exports.DietParametersSchema = exports.DietParameters = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let DietParameters = class DietParameters {
    id;
    protein_g_per_day_target;
    sodium_mg_per_day_max;
    phosphorus_mg_per_day_target;
    potassium_strategy;
    fiber_g_per_day_target;
    fluid_limit_ml_per_day;
    fluid_note;
    createdAt;
    updatedAt;
};
exports.DietParameters = DietParameters;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DietParameters.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], DietParameters.prototype, "protein_g_per_day_target", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DietParameters.prototype, "sodium_mg_per_day_max", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], DietParameters.prototype, "phosphorus_mg_per_day_target", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], DietParameters.prototype, "potassium_strategy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DietParameters.prototype, "fiber_g_per_day_target", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], DietParameters.prototype, "fluid_limit_ml_per_day", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DietParameters.prototype, "fluid_note", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DietParameters.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DietParameters.prototype, "updatedAt", void 0);
exports.DietParameters = DietParameters = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DietParameters);
exports.DietParametersSchema = mongoose_1.SchemaFactory.createForClass(DietParameters);
//# sourceMappingURL=diet-parameters.schema.js.map