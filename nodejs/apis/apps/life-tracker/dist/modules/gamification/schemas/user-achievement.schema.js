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
exports.UserAchievementSchema = exports.UserAchievement = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let UserAchievement = class UserAchievement {
    userId;
    achievementId;
    unlockedAt;
    createdAt;
    updatedAt;
};
exports.UserAchievement = UserAchievement;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserAchievement.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserAchievement.prototype, "achievementId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], UserAchievement.prototype, "unlockedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], UserAchievement.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], UserAchievement.prototype, "updatedAt", void 0);
exports.UserAchievement = UserAchievement = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], UserAchievement);
exports.UserAchievementSchema = mongoose_1.SchemaFactory.createForClass(UserAchievement);
exports.UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
//# sourceMappingURL=user-achievement.schema.js.map