import { Controller } from "@nestjs/common";
import { WarehouseService } from "./warehouse.service";
import { Warehouse } from "./interfaces/warehouse.interface";
import { CreateWarehouseDto } from "./dto/create_warehouse.dto";
import { AuthenticationGuard } from "@/common/guards/authentication.guard";
// import { LevelAuthorizationGuard } from "@/common/guards/level_authorization.guard";
import { UseGuards } from "@nestjs/common";
import { Body, Post } from "@nestjs/common";
import { Session } from "@/common/decorators/session.decorator";
import { IUserSession } from "@/common/interfaces/user_session.interface";

@UseGuards(AuthenticationGuard)
@Controller('warehouse')
export class WarehouseController {
    constructor(private readonly warehouseService: WarehouseService) {}

    @Post()
    createWarehouse(
        @Body() createWarehouseDto: CreateWarehouseDto, 
        @Session() userSession: IUserSession
    ): Promise<Warehouse> {
        return this.warehouseService.createWarehouse(createWarehouseDto, userSession.tenant_id);
    }
}
