/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequestWithCookies } from '../interfaces/request_with_cookies.interface';
import { IUserSession } from '../interfaces/user_session.interface';

export const Session = createParamDecorator((ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest() as IRequestWithCookies;
  if (!request.user) {
    throw new Error('User not found in request');
  }
  return request.user as IUserSession;
});
