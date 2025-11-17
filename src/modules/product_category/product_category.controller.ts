import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProductCategoryService } from './product_category.service';
import { Response } from 'express';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

// ? UseGuards(AuthorizationGuard)
@Controller('category')
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @Get()
  async getAll() {
    return this.productCategoryService.getAllCategories();
  }

  @Post()
  async createCategory(@Body() req: { name: string }) {
    return this.productCategoryService.createCategory(req.name);
  }

  @Post(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() req: { name: string },
  ) {
    return this.productCategoryService.updateCategory(id, req.name);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return this.productCategoryService.deleteCategory(id);
  }
}
