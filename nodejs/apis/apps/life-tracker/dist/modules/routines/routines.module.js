"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutinesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const routines_controller_1 = require("./routines.controller");
const routines_service_1 = require("./routines.service");
const integrated_routine_schema_1 = require("./schemas/integrated-routine.schema");
const daily_routine_schema_1 = require("./schemas/daily-routine.schema");
const routine_schema_1 = require("./schemas/routine.schema");
let RoutinesModule = class RoutinesModule {
};
exports.RoutinesModule = RoutinesModule;
exports.RoutinesModule = RoutinesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: integrated_routine_schema_1.IntegratedRoutine.name, schema: integrated_routine_schema_1.IntegratedRoutineSchema },
                { name: daily_routine_schema_1.DailyRoutine.name, schema: daily_routine_schema_1.DailyRoutineSchema },
                { name: routine_schema_1.Routine.name, schema: routine_schema_1.RoutineSchema },
            ]),
        ],
        controllers: [routines_controller_1.RoutinesController],
        providers: [routines_service_1.RoutinesService],
        exports: [routines_service_1.RoutinesService],
    })
], RoutinesModule);
//# sourceMappingURL=routines.module.js.map