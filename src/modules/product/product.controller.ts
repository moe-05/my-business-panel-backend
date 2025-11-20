import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Response } from 'express';
import { NewProductDto } from './dto/newProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';

// ? @UseGuards(AuthorizationGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ? Apply pagination
  @Get(':id')
  async getAllProducts(@Param('id') id: string) {
    return this.productService.getAllProducts(id);
  }

  @Post()
  async createNewProduct(@Body() req: NewProductDto) {
    return this.productService.createProduct(req);
  }

  @Post('update/:id')
  async updateProduct(@Param('id') id: string, @Body() req: UpdateProductDto) {
    return this.productService.updateProduct(req, id);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
