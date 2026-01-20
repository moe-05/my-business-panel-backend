import { IsUUID, IsNumber, IsPositive } from 'class-validator';

export class AddProductToWarehouseDto {
    @IsUUID()
    warehouse_id!: string;
    
    @IsUUID()
    product_id!: string;

    @IsNumber()
    @IsPositive()
    amount!: number;
}
