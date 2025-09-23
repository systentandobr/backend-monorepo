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
exports.DailyRoutineSchema = exports.DailyRoutine = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let DailyRoutine = class DailyRoutine {
    time;
    activity;
    domain;
    completed;
    completedAt;
    createdAt;
    updatedAt;
};
exports.DailyRoutine = DailyRoutine;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DailyRoutine.prototype, "time", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DailyRoutine.prototype, "activity", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DailyRoutine.prototype, "domain", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], DailyRoutine.prototype, "completed", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], DailyRoutine.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], DailyRoutine.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], DailyRoutine.prototype, "updatedAt", void 0);
exports.DailyRoutine = DailyRoutine = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DailyRoutine);
exports.DailyRoutineSchema = mongoose_1.SchemaFactory.createForClass(DailyRoutine);
//# sourceMappingURL=daily-routine.schema.js.map