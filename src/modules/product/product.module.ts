import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';

@Module({
  providers: [ProductService, AuthorizationGuard],
  controllers: [ProductController]
})
export class ProductModule {}
