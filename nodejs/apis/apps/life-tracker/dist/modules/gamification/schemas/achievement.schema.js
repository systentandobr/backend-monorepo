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
exports.AchievementSchema = exports.Achievement = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Achievement = class Achievement {
    achievementId;
    name;
    description;
    icon;
    criteria;
    createdAt;
    updatedAt;
};
exports.Achievement = Achievement;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Achievement.prototype, "achievementId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Achievement.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Achievement.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Achievement.prototype, "icon", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            criteriaType: { type: String, enum: ['STREAK', 'POINTS', 'HABIT_COUNT', 'ROUTINE_COUNT'], required: true },
            value: { type: Number, required: true }
        },
        required: true
    }),
    __metadata("design:type", Object)
], Achievement.prototype, "criteria", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Achievement.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Achievement.prototype, "updatedAt", void 0);
exports.Achievement = Achievement = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Achievement);
exports.AchievementSchema = mongoose_1.SchemaFactory.createForClass(Achievement);
//# sourceMappingURL=achievement.schema.js.map