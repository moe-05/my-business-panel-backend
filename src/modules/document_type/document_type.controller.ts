import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { DocumentTypeService } from './document_type.service';
import { DocumentType } from './interface/document_type.interface';
import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

// @UseGuards(AuthorizationGuard)
@Controller('document')
export class DocumentTypeController {
  constructor(private readonly documentTypeService: DocumentTypeService) {}

  @Get()
  find() {
    return this.documentTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentTypeService.findById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.documentTypeService.delete(id);
  }
}
