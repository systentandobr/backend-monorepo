"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabitsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const habits_controller_1 = require("./habits.controller");
const habits_service_1 = require("./habits.service");
const habit_schema_1 = require("./schemas/habit.schema");
const category_schema_1 = require("./schemas/category.schema");
let HabitsModule = class HabitsModule {
};
exports.HabitsModule = HabitsModule;
exports.HabitsModule = HabitsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: habit_schema_1.Habit.name, schema: habit_schema_1.HabitSchema },
                { name: category_schema_1.Category.name, schema: category_schema_1.CategorySchema },
            ]),
        ],
        controllers: [habits_controller_1.HabitsController],
        providers: [habits_service_1.HabitsService],
        exports: [habits_service_1.HabitsService],
    })
], HabitsModule);
//# sourceMappingURL=habits.module.js.map