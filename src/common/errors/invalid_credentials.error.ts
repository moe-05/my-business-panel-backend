import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsError extends HttpException {
  constructor(username: string) {
    super(
      { error: `User with username '${username}' not found.` },
      HttpStatus.UNAUTHORIZED,
    );
    this.name = 'InvalidCredentialsError';
  }
}
