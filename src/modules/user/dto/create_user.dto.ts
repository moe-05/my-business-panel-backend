import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

const passwordRegexp =
  /^(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9!@#$%^&*()_+\-=[\]{};:'"<>,./?\\|]+$/;

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  tenant_id!: string; // ? Maybe change to fetch from state, and switch to enum

  @IsString()
  @IsNotEmpty()
  role_id!: number; // ? Maybe change to fetch from state, and switch to enum

  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 32)
  @Matches(passwordRegexp, {
    message: 'password is too weak, it must contain a number',
  })
  password!: string;
}
