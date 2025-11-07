import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidTenantError extends HttpException {
  constructor(tenant: string) {
    super(
      { error: `role with uuid'${tenant}' doesn't exist.` },
      HttpStatus.UNAUTHORIZED,
    );
    this.name = 'InvalidTenantError';
  }
}
