import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class NewTenantDto {
  @IsString()
  tenant_name!: string;

  @IsString()
  contact_email!: string;

  @IsOptional()
  @IsBoolean()
  is_subscribed?: boolean;
}
