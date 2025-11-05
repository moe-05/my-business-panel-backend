import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import { DocumentTypeService } from './document_type.service';
import { DocumentType } from './interface/document_type.interface';
import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';

// @UseGuards(AuthorizationGuard)
@Controller('document')
export class DocumentTypeController {
  constructor(private readonly documentTypeService: DocumentTypeService) {}

  @Get()
  find(): DocumentType[] {
    return this.documentTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): DocumentType {
    return this.documentTypeService.findById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string): void {
    const documentType = this.documentTypeService.findById(id);
    if (!documentType) {
      throw new NotFoundException(`Document type with ID ${id} not found`);
    }
    this.documentTypeService.delete(id);
    console.log(`Document type with ID ${id} deleted`);
  }
}