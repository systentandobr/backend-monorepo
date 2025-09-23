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
exports.LatestLabsSchema = exports.LatestLabs = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let LatestLabs = class LatestLabs {
    id;
    creatinina_mg_dl;
    ureia_mg_dl;
    egfr_ml_min_1_73;
    fosforo_mg_dl;
    calcio_total_mg_dl;
    calcio_ionico_mmol_l;
    sodio_mmol_l;
    potassio_mmol_l;
    hba1c_percent;
    glicose_mg_dl;
    hb_g_dl;
    ferritina_ng_ml;
    vitamina_d_25oh_ng_ml;
    pth_pg_ml;
    sangue_oculto_fezes;
    exam_date;
    createdAt;
    updatedAt;
};
exports.LatestLabs = LatestLabs;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LatestLabs.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LatestLabs.prototype, "creatinina_mg_dl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LatestLabs.prototype, "ureia_mg_dl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LatestLabs.prototype, "egfr_ml_min_1_73", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LatestLabs.prototype, "fosforo_mg_dl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LatestLabs.prototype, "calcio_total_mg_dl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LatestLabs.prototype, "calcio_ionico_mmol_l", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LatestLabs.prototype, "sodio_mmol_l", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LatestLabs.prototype, "potassio_mmol_l", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LatestLabs.prototype, "hba1c_percent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LatestLabs.prototype, "glicose_mg_dl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LatestLabs.prototype, "hb_g_dl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LatestLabs.prototype, "ferritina_ng_ml", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LatestLabs.prototype, "vitamina_d_25oh_ng_ml", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LatestLabs.prototype, "pth_pg_ml", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LatestLabs.prototype, "sangue_oculto_fezes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LatestLabs.prototype, "exam_date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LatestLabs.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LatestLabs.prototype, "updatedAt", void 0);
exports.LatestLabs = LatestLabs = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], LatestLabs);
exports.LatestLabsSchema = mongoose_1.SchemaFactory.createForClass(LatestLabs);
//# sourceMappingURL=latest-labs.schema.js.map