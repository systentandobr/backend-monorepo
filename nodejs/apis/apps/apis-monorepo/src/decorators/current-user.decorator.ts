import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserShape {
  id?: string;
  username?: string;
  email?: string;
  unitId?: string;
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


