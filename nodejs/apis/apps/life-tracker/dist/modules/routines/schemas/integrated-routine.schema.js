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
exports.IntegratedRoutineSchema = exports.IntegratedRoutine = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let IntegratedRoutine = class IntegratedRoutine {
    schema_version;
    generated_at;
    locale;
    user_profile;
    domains;
    integrated_goals;
    routines;
    ui_hints;
    createdAt;
    updatedAt;
};
exports.IntegratedRoutine = IntegratedRoutine;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], IntegratedRoutine.prototype, "schema_version", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], IntegratedRoutine.prototype, "generated_at", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], IntegratedRoutine.prototype, "locale", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], IntegratedRoutine.prototype, "user_profile", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], IntegratedRoutine.prototype, "domains", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], required: true }),
    __metadata("design:type", Array)
], IntegratedRoutine.prototype, "integrated_goals", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], IntegratedRoutine.prototype, "routines", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], IntegratedRoutine.prototype, "ui_hints", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], IntegratedRoutine.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], IntegratedRoutine.prototype, "updatedAt", void 0);
exports.IntegratedRoutine = IntegratedRoutine = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], IntegratedRoutine);
exports.IntegratedRoutineSchema = mongoose_1.SchemaFactory.createForClass(IntegratedRoutine);
//# sourceMappingURL=integrated-routine.schema.js.map