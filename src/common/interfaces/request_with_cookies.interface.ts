import { Request } from '@nestjs/common';

export interface IRequestWithCookies extends Request {
  cookies: Record<string, string>;
}
