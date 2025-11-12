export interface Item {
  tenant_id: string;
  sale_id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface FullItem extends Item {
  sale_item_id: string;
  sale_id: string;
}
