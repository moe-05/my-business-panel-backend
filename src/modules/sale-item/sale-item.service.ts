import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { FullItem, Item } from './interface/sale-item.interface';
import { bulkItems, queries } from '@/queries';

@Injectable()
export class SaleItemService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getAllItems(): Promise<FullItem[]> {
    const items = await this.db.query(queries.items.getItems);
    return items.rows;
  }

  async getItemById(id: string): Promise<FullItem | null> {
    const item = await this.db.query(queries.items.getItemById, [id]);
    return item.rows[0] || null;
  }

  async deleteItem(id: string): Promise<boolean> {
    const result = await this.db.query(queries.items.delete, [id]);
    return result ? true : false;
  }

  async bulkInsert(items: Item[], saleId: string) {
    console.log('Bulk inserting items for sale:', saleId);
    if (!Array.isArray(items) || items.length === 0) return [];

    const val: any[] = [];
    const placeholders: string[] = [];
    let i = 1;

    const tuples = bulkItems.length;

    items.forEach((item) => {
      const rowPlaceholder = [];

      for (let a = 0; a < tuples; a++) {
        rowPlaceholder.push(`$${i++}`);
      }

      placeholders.push(`(${rowPlaceholder.join(',')})`);

      bulkItems.forEach((key) => {
        if (key === 'sale_id') {
          val.push(saleId);
        } else {
          val.push(item[key as keyof Item]);
        }
      });
    });

    console.log(placeholders, val);
    const q = `
      INSERT INTO pos_module.sale_item (sale_id, tenant_id, product_id, quantity, unit_price, total_price)
      VALUES ${placeholders.join(',')}
    `;

    const res = await this.db.query(q, val);
    return res;
  }
}
