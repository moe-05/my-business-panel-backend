import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidBill extends HttpException {
  constructor() {
    super(
      { error: 'Error creating bill on db.' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    this.name = 'InvalidBillError';
  }
}
