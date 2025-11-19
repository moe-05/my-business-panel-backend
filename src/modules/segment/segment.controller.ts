import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SegmentService } from './segment.service';
import { NewSegmentDto } from './dto/newSegment.dto';

@Controller('segment')
export class SegmentController {
  constructor(private readonly segmentService: SegmentService) {}

  @Get()
  async getSegments() {
    return this.segmentService.getSegments();
  }

  @Post()
  async newSegment(@Body() req: NewSegmentDto) {
    return this.segmentService.newSegment(req);
  }

  @Delete(':id')
  async deleteSegment(@Param('id') id: number) {
    return this.segmentService.deleteSegment(id);
  }
}
