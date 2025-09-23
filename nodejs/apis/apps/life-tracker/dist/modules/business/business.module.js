"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const business_controller_1 = require("./business.controller");
const business_service_1 = require("./business.service");
const business_opportunity_schema_1 = require("./schemas/business-opportunity.schema");
const business_project_schema_1 = require("./schemas/business-project.schema");
let BusinessModule = class BusinessModule {
};
exports.BusinessModule = BusinessModule;
exports.BusinessModule = BusinessModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: business_opportunity_schema_1.BusinessOpportunity.name, schema: business_opportunity_schema_1.BusinessOpportunitySchema },
                { name: business_project_schema_1.BusinessProject.name, schema: business_project_schema_1.BusinessProjectSchema },
            ]),
        ],
        controllers: [business_controller_1.BusinessController],
        providers: [business_service_1.BusinessService],
        exports: [business_service_1.BusinessService],
    })
], BusinessModule);
//# sourceMappingURL=business.module.js.map