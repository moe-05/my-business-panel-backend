import { Module } from '@nestjs/common';
import { CustomerSegmentMarginService } from './customer_segment_margin.service';
import { CustomerSegmentMarginController } from './customer_segment_margin.controller';

@Module({
  providers: [CustomerSegmentMarginService],
  controllers: [CustomerSegmentMarginController],
})
export class CustomerSegmentMarginModule {}
