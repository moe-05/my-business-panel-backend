import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { DocumentTypeService } from './document-type.service';
import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';

// @UseGuards(AuthorizationGuard)
@Controller('document')
export class DocumentTypeController {
  constructor(private readonly documentTypeService: DocumentTypeService) {}

  @Get()
  getAll() {
    return this.documentTypeService.getAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.documentTypeService.getById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.documentTypeService.delete(id);
  }
}
