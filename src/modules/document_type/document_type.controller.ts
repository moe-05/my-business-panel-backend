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
    const documentTypes = this.documentTypeService.findAll();
    return documentTypes;
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() res: Response) {
    const documentType = this.documentTypeService.findById(id);
    if (!documentType) {
      throw new NotFoundException(`Document type with ID ${id} not found`);
    }
    return res.json({ documentType });
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Res() res: Response) {
    const documentType = this.documentTypeService.findById(id);
    if (!documentType) {
      throw new NotFoundException(`Document type with ID ${id} not found`);
    }
    const deleted = this.documentTypeService.delete(id);
    if (!deleted) {
      return res
        .json({ message: `Error deleting document type with ID ${id}` })
        .status(500);
    }
    return res
      .json({ message: `Document type with ID ${id} deleted` })
      .status(204);
  }
}
