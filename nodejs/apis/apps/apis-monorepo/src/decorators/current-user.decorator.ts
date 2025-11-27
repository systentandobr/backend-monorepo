import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserShape {
  id?: string;
  username?: string;
  email?: string;
  unitId?: string;
  domain?: string; // Domain do usuário para multi-tenancy
  profile?: {
    unitId?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    domain?: string; // Domain pode estar no profile
    [key: string]: any;
  };
  roles?: any[];
  permissions?: string[];
  isEmailVerified?: boolean;
  isActive?: boolean;
  payload?: any;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserShape => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as CurrentUserShape;
  },
);


