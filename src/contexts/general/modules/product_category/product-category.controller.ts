import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
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

  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body() req: { name: string }) {
    return this.productCategoryService.updateCategory(id, req.name);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return this.productCategoryService.deleteCategory(id);
  }
}
