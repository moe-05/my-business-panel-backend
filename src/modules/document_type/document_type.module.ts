import { Module } from '@nestjs/common';
import { DocumentTypeService } from './document_type.service';
import { DocumentTypeController } from './document_type.controller';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';

@Module({
  providers: [DocumentTypeService, AuthorizationGuard],
  controllers: [DocumentTypeController]
})
export class DocumentTypeModule {}
