import { Module } from '@nestjs/common';
import { DocumentTypeService } from './document_type.service';
import { DocumentTypeController } from './document_type.controller';

@Module({
  providers: [DocumentTypeService],
  controllers: [DocumentTypeController],
})
export class DocumentTypeModule {}
