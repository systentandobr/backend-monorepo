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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_validator_service_1 = require("../services/jwt-validator.service");
let JwtAuthGuard = class JwtAuthGuard {
    jwtValidatorService;
    constructor(jwtValidatorService) {
        this.jwtValidatorService = jwtValidatorService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Token de acesso não fornecido');
        }
        try {
            const validationResult = await this.jwtValidatorService.validateTokenWithFallback(token);
            if (!validationResult.isValid) {
                throw new common_1.UnauthorizedException('Token inválido');
            }
            request.user = {
                id: validationResult.user.id,
                username: validationResult.user.username,
                email: validationResult.user.email,
                roles: validationResult.user.roles,
                permissions: validationResult.user.permissions,
                isEmailVerified: validationResult.user.isEmailVerified,
                isActive: validationResult.user.isActive,
            };
            return true;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Erro na validação do token');
        }
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_validator_service_1.JwtValidatorService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map