import { IsString, IsNotEmpty } from 'class-validator';

export class CreateWarehouseDto {
    @IsString()
    @IsNotEmpty()
    warehouse_name!: string;

    @IsString()
    @IsNotEmpty()
    warehouse_address!: string;
}