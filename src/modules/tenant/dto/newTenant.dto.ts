import { IsBoolean, IsString } from 'class-validator';

export class NewTenantDto {
  @IsString()
  tenant_name!: string;

  @IsString()
  contact_email!: string;

  @IsBoolean()
  is_subscribed!: boolean;
}
