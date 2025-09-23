"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGoalProgressDto = exports.CreateGoalDto = exports.CompleteHabitDto = exports.UpdateHabitDto = exports.CreateHabitDto = void 0;
class CreateHabitDto {
    name;
    icon;
    color;
    categoryId;
    description;
    target;
    timeOfDay;
    domain;
}
exports.CreateHabitDto = CreateHabitDto;
class UpdateHabitDto {
    name;
    icon;
    color;
    description;
    target;
    completed;
    timeOfDay;
}
exports.UpdateHabitDto = UpdateHabitDto;
class CompleteHabitDto {
    habitId;
    domain;
}
exports.CompleteHabitDto = CompleteHabitDto;
class CreateGoalDto {
    label;
    priority;
    domain;
}
exports.CreateGoalDto = CreateGoalDto;
class UpdateGoalProgressDto {
    goalId;
    progress;
}
exports.UpdateGoalProgressDto = UpdateGoalProgressDto;
//# sourceMappingURL=index.js.map