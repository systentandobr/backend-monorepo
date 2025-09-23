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
exports.GamificationProfileSchema = exports.GamificationProfile = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let GamificationProfile = class GamificationProfile {
    userId;
    totalPoints;
    level;
    pointsToNextLevel;
    createdAt;
    updatedAt;
};
exports.GamificationProfile = GamificationProfile;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], GamificationProfile.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], GamificationProfile.prototype, "totalPoints", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1 }),
    __metadata("design:type", Number)
], GamificationProfile.prototype, "level", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 100 }),
    __metadata("design:type", Number)
], GamificationProfile.prototype, "pointsToNextLevel", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], GamificationProfile.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], GamificationProfile.prototype, "updatedAt", void 0);
exports.GamificationProfile = GamificationProfile = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], GamificationProfile);
exports.GamificationProfileSchema = mongoose_1.SchemaFactory.createForClass(GamificationProfile);
//# sourceMappingURL=gamification-profile.schema.js.map