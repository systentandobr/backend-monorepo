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
exports.GameSchema = exports.Game = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Game = class Game {
    board;
    scoring_rules;
    weekly_goal_points;
    isActive;
    createdAt;
    updatedAt;
};
exports.Game = Game;
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], Game.prototype, "board", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], required: true }),
    __metadata("design:type", Array)
], Game.prototype, "scoring_rules", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 100 }),
    __metadata("design:type", Number)
], Game.prototype, "weekly_goal_points", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], Game.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Game.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Game.prototype, "updatedAt", void 0);
exports.Game = Game = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Game);
exports.GameSchema = mongoose_1.SchemaFactory.createForClass(Game);
//# sourceMappingURL=game.schema.js.map