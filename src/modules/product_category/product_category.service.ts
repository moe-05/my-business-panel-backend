import { Inject, Injectable } from '@nestjs/common';
import { ProductCategory } from './interface/product_category.interface';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { queries } from '@/queries';

@Injectable()
export class ProductCategoryService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getAllCategories() {
    const categories = await this.db.query(queries.p_category.all);
    return categories.rows;
  }

  async getCategoryById(id: string) {
    const category = await this.db.query(queries.p_category.byId, [id]);
    return category.rows[0];
  }

  async createCategory(name: string) {
    const created = await this.db.query(queries.p_category.create, [name]);
    return created.rows[0];
  }

  async updateCategory(id: string, newName: string) {
    const updated = await this.db.query(queries.p_category.update, [
      newName,
      id,
    ]);
    return updated.rows[0];
  }

  async deleteCategory(id: string) {
    const del = await this.db.query(queries.p_category.delete, [id]);
    return del.rows;
  }
}
