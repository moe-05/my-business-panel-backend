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
  @Get()
  async getAllProducts(@Res() res: Response) {
    try {
      const products = await this.productService.getAllProducts();
      return res.json(products).status(200);
    } catch (error) {
      throw new InternalServerErrorException('Error fetching products from db');
    }
  }

  @Post()
  async createNewProduct(@Body() req: NewProductDto, @Res() res: Response) {
    try {
      const product = await this.productService.createProduct(req);
      if (!product) {
        throw new InternalServerErrorException('Something went wrong.');
      }

      return res.json({ message: 'Product created successfully!' });
    } catch (error) {
      throw new InternalServerErrorException('Error creating the product');
    }
  }

  @Post("update/:id")
  async updateProduct(@Param("id") id: string, @Body() req: UpdateProductDto, @Res() res: Response) {
    try {
      const update = await this.productService.updateProduct(req, id)
      return res.json({ message: "Product updated successfully!", product: update })
    } catch (error) {
      throw new InternalServerErrorException("Error updating the product")
    }
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string, @Res() res: Response) {
    try {
      const deleted = await this.productService.deleteProduct(id);
      if (!deleted) {
        throw new InternalServerErrorException('Error deleting Product');
      }

      return res.json({ message: `Product with id ${id} deleted` });
    } catch (error) {
      throw new InternalServerErrorException(error, 'Error deleting Product');
    }
  }
}
