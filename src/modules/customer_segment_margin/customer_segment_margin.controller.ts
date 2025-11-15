import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CustomerSegmentMarginService } from './customer_segment_margin.service';
import { NewMarginDto } from './dto/newMargin.dto';
import { Response } from 'express';
import { UpdateMarginDto } from './dto/updateMargin.dto';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

// ? UseGuards(AuthorizationGuard)
//Lets try to think about a better name for the route
@Controller('margin')
export class CustomerSegmentMarginController {
  constructor(private readonly csegmentService: CustomerSegmentMarginService) {}

  //Tomorrow ill optimize this endpoint
  @Get()
  async getMarginsInfo(@Res() res: Response) {
    return this.csegmentService.getMarginInfo();
  }

  @Post()
  async createNewMargin(@Body() req: NewMarginDto, @Res() res: Response) {
    return this.csegmentService.createMargins(req);
  }

  @Post(':id')
  async updateMargin(
    @Param('id') id: string,
    @Body() req: UpdateMarginDto,
    @Res() res: Response,
  ) {
    return this.csegmentService.updateMargins(id, req);
  }

  @Delete(':id')
  async deleteMargin(@Param('id') id: string, @Res() res: Response) {
    return this.csegmentService.deleteMargin(id);
  }
}
