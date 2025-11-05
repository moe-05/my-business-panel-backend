import { Injectable } from '@nestjs/common';
import { ProductCategory } from './interface/product_category.interface';

@Injectable()
export class ProductCategoryService {
  //Change this when we have the db working
  private readonly categories: ProductCategory[] = [
    {
      product_category_id: 1,
      category_name: 'Electronics',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      product_category_id: 2,
      category_name: 'Books',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
}
