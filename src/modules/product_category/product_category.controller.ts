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
@Controller('product-category')
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @Get()
  async getAll() {
    try {
      const categories = await this.productCategoryService.getAllCategories();
      return categories;
    } catch (error) {
      throw new Error('Error fetching categories');
    }
  }

  @Post()
  async createCategory(@Body() req: { name: string }, @Res() res: Response) {
    try {
      const createdCategory = await this.productCategoryService.createCategory(
        req.name,
      );
      return res.status(201).json(createdCategory);
    } catch (error) {
      return res.status(500).json({ error: 'Error creating category' });
    }
  }

  @Post(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() req: { name: string },
    @Res() res: Response,
  ) {
    try {
      const updatedCategory = await this.productCategoryService.updateCategory(
        id,
        req.name,
      );
      return res.status(200).json(updatedCategory);
    } catch (error) {
      return res.status(500).json({ error: 'Error updating category' });
    }
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string, @Res() res: Response) {
    try {
      const deletedCategory =
        await this.productCategoryService.deleteCategory(id);
      if (deletedCategory.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Error deleting category' });
    }
  }
}
