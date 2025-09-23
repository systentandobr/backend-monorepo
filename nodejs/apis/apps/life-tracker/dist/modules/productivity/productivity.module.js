"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductivityModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const productivity_controller_1 = require("./productivity.controller");
const productivity_service_1 = require("./productivity.service");
const productivity_goal_schema_1 = require("./schemas/productivity-goal.schema");
let ProductivityModule = class ProductivityModule {
};
exports.ProductivityModule = ProductivityModule;
exports.ProductivityModule = ProductivityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: productivity_goal_schema_1.ProductivityGoal.name, schema: productivity_goal_schema_1.ProductivityGoalSchema },
            ]),
        ],
        controllers: [productivity_controller_1.ProductivityController],
        providers: [productivity_service_1.ProductivityService],
        exports: [productivity_service_1.ProductivityService],
    })
], ProductivityModule);
//# sourceMappingURL=productivity.module.js.map