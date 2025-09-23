"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const health_controller_1 = require("./health.controller");
const health_service_1 = require("./health.service");
const health_plan_schema_1 = require("./schemas/health-plan.schema");
const latest_labs_schema_1 = require("./schemas/latest-labs.schema");
const diet_parameters_schema_1 = require("./schemas/diet-parameters.schema");
const recipe_schema_1 = require("./schemas/recipe.schema");
let HealthModule = class HealthModule {
};
exports.HealthModule = HealthModule;
exports.HealthModule = HealthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: health_plan_schema_1.HealthPlan.name, schema: health_plan_schema_1.HealthPlanSchema },
                { name: latest_labs_schema_1.LatestLabs.name, schema: latest_labs_schema_1.LatestLabsSchema },
                { name: diet_parameters_schema_1.DietParameters.name, schema: diet_parameters_schema_1.DietParametersSchema },
                { name: recipe_schema_1.Recipe.name, schema: recipe_schema_1.RecipeSchema },
            ]),
        ],
        controllers: [health_controller_1.HealthController],
        providers: [health_service_1.HealthService],
        exports: [health_service_1.HealthService],
    })
], HealthModule);
//# sourceMappingURL=health.module.js.map