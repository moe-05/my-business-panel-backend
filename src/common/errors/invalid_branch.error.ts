import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidBranchError extends HttpException {
  constructor() {
    super(
      { error: 'Error: Invalid branch provided.' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    this.name = 'InvalidBranchError';
  }
}
