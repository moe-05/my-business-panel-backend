import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { CustomerSegmentMarginService } from './customer_segment_margin.service';
import { NewMarginDto } from './dto/newMargin.dto';
import { Response } from 'express';
import { UpdateMarginDto } from './dto/updateMargin.dto';

//Lets try to think about a better name for the route
@Controller('customer-segment-margin')
export class CustomerSegmentMarginController {
  constructor(private readonly csegmentService: CustomerSegmentMarginService) {}

  //Tomorrow ill optimize this endpoint
  @Get()
  async getMarginsInfo(@Res() res: Response) {
    try {
      const margins = await this.csegmentService.getMarginInfo();
      return res.status(200).json(margins);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Error fetching margin information' });
    }
  }

  @Post()
  async createNewMargin(@Body() req: NewMarginDto, @Res() res: Response) {
    try {
      await this.csegmentService.createMargins(req);
      res.status(201).json({ message: 'Margin created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error creating margin' });
    }
  }

  @Post(':id')
  async updateMargin(
    @Param('id') id: string,
    @Body() req: UpdateMarginDto,
    @Res() res: Response,
  ) {
    try {
      const up = await this.csegmentService.updateMargins(id, req);
      if (up.length === 0) {
        return res.status(404).json({ error: 'Margin not found' });
      }
      return res.status(200).json({ message: 'Margin updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Error updating margin' });
    }
  }

  @Delete(':id')
  async deleteMargin(@Param('id') id: string, @Res() res: Response) {
    try {
      const deleted = await this.csegmentService.deleteMargin(id);

      if (deleted.rows.length === 0) {
        return res.status(404).json({ error: 'Margin not found' });
      }

      return res.status(200).json({ message: 'Margin deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Error deleting margin' });
    }
  }
}
