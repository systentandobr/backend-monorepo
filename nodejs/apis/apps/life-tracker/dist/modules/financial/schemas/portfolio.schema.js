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
exports.PortfolioSchema = exports.Portfolio = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Portfolio = class Portfolio {
    userId;
    totalValue;
    totalInvested;
    assets;
    lastUpdated;
};
exports.Portfolio = Portfolio;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Portfolio.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Portfolio.prototype, "totalValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Portfolio.prototype, "totalInvested", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{
                id: String,
                symbol: String,
                name: String,
                quantity: Number,
                averagePrice: Number,
                currentPrice: Number,
                lastUpdated: Date,
            }], default: [] }),
    __metadata("design:type", Array)
], Portfolio.prototype, "assets", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Portfolio.prototype, "lastUpdated", void 0);
exports.Portfolio = Portfolio = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Portfolio);
exports.PortfolioSchema = mongoose_1.SchemaFactory.createForClass(Portfolio);
//# sourceMappingURL=portfolio.schema.js.map