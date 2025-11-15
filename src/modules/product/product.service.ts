import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { queries } from '@/queries';
import { NewProductDto } from './dto/newProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { Product } from './interface/product.interface';

@Injectable()
export class ProductService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getAllProducts(): Promise<Product[]> {
    const products = await this.db.query(queries.products.getAll);
    return products.rows;
  }

  async createProduct(data: NewProductDto) {
    const {
      tenant_id,
      sku,
      product_name,
      product_description,
      product_category_id,
      unit_price,
    } = data;

    const newProduct = await this.db.query(queries.products.create, [
      tenant_id,
      sku,
      product_name,
      product_description,
      product_category_id,
      unit_price,
    ]);

    return { message: "Product created successfully!" };
  }

  async updateProduct(data: UpdateProductDto, productId: string) {
    const { ...updates } = data;

    const updateKeys = Object.keys(updates).filter(
      (key) => updates[key as keyof typeof updates] !== undefined,
    );

    if (updateKeys.length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    let setClause: string[] = [];
    let paramsArray: any[] = [];
    let index = 1;

    for (const key of updateKeys) {
      const validKey = key as keyof typeof updates;
      setClause.push(`"${key}" = $${index}`);
      paramsArray.push(updates[validKey]);
      index++;
    }

    paramsArray.push(productId);

    const setString = setClause.join(', ');

    const queryString = `
          UPDATE core.product
          SET ${setString}
          WHERE product_id = $${index}
          RETURNING *
        `;

    try {
      const res = await this.db.query(queryString, paramsArray);
      return { message: "Product updated successfully!", product: res.rows[0] };
    } catch (error) {
      console.error('Error updating product:', error);
      throw new InternalServerErrorException(error);
    }
  }

  async deleteProduct(productId: string) {
    const deleted = await this.db.query(queries.products.delete, [productId]);
    return { message: `Product with id ${productId} deleted` };
  }
}
