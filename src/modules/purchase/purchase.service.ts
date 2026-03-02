import { Inject, Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { StateService } from '../state/state.service';
import Database from '@crane-technologies/database/dist/components/Database';
import { DATABASE } from '../db/db.provider';

@Injectable()
export class PurchaseService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly state: StateService,
  ) {}

  //TODO: esta funcion debe llamar a la base de datos para crear una orden de compra.
  async createPurchaseOrder(param: CreatePurchaseDto) {
    try {
      // 1. desestructuramos el DTO para obtener los datos necesarios para crear la orden de compra
      const {
        supplier_id,
        warehouse_id,
        expected_delivery_date,
        items,
        has_invoice,
        payment_condition,
      } = param;

      // 2. insercion de la orden de compra en la base de datos
      const result = await this.db.query(
        'SELECT create_purchase_order($1, $2, $3, $4, $5, $6)',
        [
          supplier_id,
          warehouse_id,
          expected_delivery_date,
          items,
          has_invoice,
          payment_condition,
        ],
      );

      //3. retornamos el resultado de la consulta
      return result.rows[0];
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw new Error('Failed to create purchase order');
    }
  }

  //TODO: tras haber recibido la mercancia y pagado la totalidad de la factura, se debe ejecutar esta funci
  async threeWayMatching(createPurchaseDto: CreatePurchaseDto) {
    return 'This action performs three-way matching for a purchase';
  }

  async getAllPurchaseOrders() {
    return `This action returns all purchase`;
  }

  async getPurchaseOrderById(id: number) {
    return `This action returns a #${id} purchase`;
  }

  async updatePurchaseOrder(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    return `This action updates a #${id} purchase`;
  }
}
