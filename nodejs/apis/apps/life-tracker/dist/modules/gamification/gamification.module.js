"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const gamification_controller_1 = require("./gamification.controller");
const gamification_service_1 = require("./gamification.service");
const points_service_1 = require("./points.service");
const achievement_service_1 = require("./achievement.service");
const habit_listener_1 = require("./listeners/habit.listener");
const gamification_profile_schema_1 = require("./schemas/gamification-profile.schema");
const achievement_schema_1 = require("./schemas/achievement.schema");
const user_achievement_schema_1 = require("./schemas/user-achievement.schema");
const point_transaction_schema_1 = require("./schemas/point-transaction.schema");
let GamificationModule = class GamificationModule {
};
exports.GamificationModule = GamificationModule;
exports.GamificationModule = GamificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: gamification_profile_schema_1.GamificationProfile.name, schema: gamification_profile_schema_1.GamificationProfileSchema },
                { name: achievement_schema_1.Achievement.name, schema: achievement_schema_1.AchievementSchema },
                { name: user_achievement_schema_1.UserAchievement.name, schema: user_achievement_schema_1.UserAchievementSchema },
                { name: point_transaction_schema_1.PointTransaction.name, schema: point_transaction_schema_1.PointTransactionSchema },
            ]),
        ],
        controllers: [gamification_controller_1.GamificationController],
        providers: [gamification_service_1.GamificationService, points_service_1.PointsService, achievement_service_1.AchievementService, habit_listener_1.HabitListener],
        exports: [gamification_service_1.GamificationService, points_service_1.PointsService, achievement_service_1.AchievementService],
    })
], GamificationModule);
//# sourceMappingURL=gamification.module.js.map