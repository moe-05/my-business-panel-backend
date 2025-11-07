import { Module } from '@nestjs/common';
import { CustomerSegmentMarginService } from './customer_segment_margin.service';
import { CustomerSegmentMarginController } from './customer_segment_margin.controller';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';

@Module({
  providers: [CustomerSegmentMarginService, AuthorizationGuard],
  controllers: [CustomerSegmentMarginController],
})
export class CustomerSegmentMarginModule {}
