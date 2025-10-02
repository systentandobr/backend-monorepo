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
exports.JwtValidatorService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const sys_seguranca_config_1 = require("../config/sys-seguranca.config");
let JwtValidatorService = class JwtValidatorService {
    httpService;
    sysSegurancaUrl;
    constructor(httpService) {
        this.httpService = httpService;
        this.sysSegurancaUrl = sys_seguranca_config_1.SysSegurancaConfig.url;
    }
    async validateToken(token) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.sysSegurancaUrl}/api/v1/auth/validate`, { accessToken: token }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': sys_seguranca_config_1.SysSegurancaConfig.apiKey,
                },
                timeout: sys_seguranca_config_1.SysSegurancaConfig.timeout,
            }));
            const responseData = response.data;
            if (!responseData.success) {
                throw new common_1.UnauthorizedException('Token inválido');
            }
            return responseData.data;
        }
        catch (error) {
            console.error('Erro ao validar token com SYS-SEGURANÇA:', error);
            if (error.response?.status === 401) {
                throw new common_1.UnauthorizedException('Token inválido ou expirado');
            }
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                throw new common_1.UnauthorizedException('Serviço de autenticação indisponível');
            }
            throw new common_1.UnauthorizedException('Erro na validação do token');
        }
    }
    async validateTokenLocally(token) {
        try {
            const { JwtService } = await Promise.resolve().then(() => require('@nestjs/jwt'));
            const jwtService = new JwtService({
                secret: sys_seguranca_config_1.JwtConfig.secret,
            });
            const payload = await jwtService.verifyAsync(token);
            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                throw new common_1.UnauthorizedException('Token expirado');
            }
            return {
                isValid: true,
                user: {
                    id: payload.sub,
                    username: payload.username,
                    email: payload.email,
                    roles: payload.roles || [],
                    permissions: payload.permissions || [],
                    isEmailVerified: payload.isEmailVerified || false,
                    isActive: payload.isActive !== false,
                },
                payload,
                expiresAt: new Date(payload.exp * 1000),
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token inválido');
        }
    }
    async validateTokenWithFallback(token) {
        try {
            return await this.validateToken(token);
        }
        catch (error) {
            console.warn('SYS-SEGURANÇA indisponível, usando validação local:', error.message);
            return await this.validateTokenLocally(token);
        }
    }
};
exports.JwtValidatorService = JwtValidatorService;
exports.JwtValidatorService = JwtValidatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], JwtValidatorService);
//# sourceMappingURL=jwt-validator.service.js.map