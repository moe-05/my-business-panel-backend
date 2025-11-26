import { Module } from '@nestjs/common';
import { AppController } from '@/app/app.controller';
import { AppService } from '@/app/app.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { ClientModule } from '@/modules/client/client.module';
import { DocumentTypeModule } from '@/modules/document_type/document_type.module';
import { DbModule } from '@/modules/db/db.module';
import { TenantModule } from '@/modules/tenant/tenant.module';
import { ProductCategoryModule } from '@/modules/product_category/product_category.module';
import { CustomerSegmentMarginModule } from '@/modules/customer_segment_margin/customer_segment_margin.module';
import { StripeModule } from '@/modules/stripe/stripe.module';
import { ProductModule } from '@/modules/product/product.module';
import { CustomerPaymentModule } from '@/modules/customer_payment/customer_payment.module';
import { SaleModule } from '@/modules/sale/sale.module';
import { SaleItemModule } from '@/modules/sale-item/sale-item.module';
import { BillModule } from '@/modules/bill/bill.module';
import { PromosModule } from '@/modules/promos/promos.module';
import { SegmentModule } from '@/modules/segment/segment.module';
import { ReturnsModule } from '@/modules/returns/returns.module';
import { BranchModule } from '@/modules/branch/branch.module';
require('dotenv').config();

@Module({
  imports: [
    AuthModule,
    ClientModule,
    DocumentTypeModule,
    DbModule,
    TenantModule,
    ProductCategoryModule,
    CustomerSegmentMarginModule,
    ProductModule,
    CustomerPaymentModule,
    StripeModule.forRoot(process.env.STRIPE_API_KEY || '', {
      apiVersion: '2025-10-29.clover',
    }),
    SaleModule,
    SaleItemModule,
    BillModule,
    PromosModule,
    SegmentModule,
    ReturnsModule
    BranchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
