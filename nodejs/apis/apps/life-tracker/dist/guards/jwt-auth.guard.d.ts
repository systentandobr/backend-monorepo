import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtValidatorService } from '../services/jwt-validator.service';
export declare class JwtAuthGuard implements CanActivate {
    private jwtValidatorService;
    constructor(jwtValidatorService: JwtValidatorService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
