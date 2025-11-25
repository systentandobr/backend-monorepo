import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtValidatorService } from '../services/jwt-validator.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UnitScopeGuard } from '../guards/unit-scope.guard';
import { UnitIdInterceptor } from '../interceptors/unit-id.interceptor';

@Global()
@Module({
  imports: [HttpModule],
  providers: [JwtValidatorService, JwtAuthGuard, UnitScopeGuard, UnitIdInterceptor],
  exports: [JwtValidatorService, JwtAuthGuard, UnitScopeGuard, UnitIdInterceptor],
})
export class AuthSharedModule {}

