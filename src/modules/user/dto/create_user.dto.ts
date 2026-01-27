import { NewEmployeeDto } from '@/modules/employee/dto/newEmployeeDto.dto';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

const passwordRegexp =
  /^(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9!@#$%^&*()_+\-=[\]{};:'"<>,./?\\|]+$/;

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  tenant_id!: string; // ? Maybe change to fetch from state, and switch to enum

  @IsNumber()
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

  @IsObject()
  @Type(() => NewEmployeeDto)
  employeeInfo!: NewEmployeeDto;
}
