import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import { bulkProducts, queries } from '@/queries';
import {
  NewProductDto,
  ProductInsert,
  ProductInsertDto,
} from './dto/newProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { Product } from './interface/product.interface';

@Injectable()
export class ProductService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getAllProducts(tenantId: string): Promise<Product[]> {
    const products = await this.db.query(queries.products.getAll, [tenantId]);
    return products.rows;
  }

  async getProductBySku(sku: string): Promise<Product> {
    const product = await this.db.query(queries.products.getBySku, [sku]);
    return product.rows[0];
  }

  async createProduct(data: ProductInsertDto) {
    const { products } = data;

    const insertData = this.bulkInsertProducts(products);

    const newProducts = await this.db.query(
      insertData.query,
      insertData.values,
    );

    return {
      message: 'Products created successfully!',
      product: newProducts.rows,
    };
  }

  bulkInsertProducts(products: ProductInsert[]): {
    query: string;
    values: any[];
  } {
    if (!Array.isArray(products) || products.length === 0)
      return { query: '', values: [] };

    const values: any[] = [];
    const placeholders: string[] = [];
    let index = 1;

    const tuples = bulkProducts.length;

    products.forEach((p) => {
      const rowPlaceholder = [];

      for (let i = 0; i < tuples; i++) {
        rowPlaceholder.push(`$${index++}`);
      }
      placeholders.push(`(${rowPlaceholder.join(', ')})`);

      bulkProducts.forEach((k) => {
        const valInsert = p[k as keyof ProductInsert];

        values.push(valInsert === undefined ? null : valInsert);
      });
    });

    const query = `
        INSERT INTO core.product (${bulkProducts.join(', ')})
        VALUES ${placeholders.join(', ')}
        RETURNING product_id
      `;

    console.log('Bulk insert', query, values);
    return { query, values };
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
      return { message: 'Product updated successfully!', product: res.rows[0] };
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
