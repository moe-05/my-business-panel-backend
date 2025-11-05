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

@Module({
  imports: [
    AuthModule,
    ClientModule,
    DocumentTypeModule,
    DbModule,
    TenantModule,
    ProductCategoryModule,
    CustomerSegmentMarginModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
