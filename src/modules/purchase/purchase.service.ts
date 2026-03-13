import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import Database from '@crane-technologies/database/dist/components/Database';
import { DATABASE } from '../db/db.provider';
import { purchaseQueries } from './purchase.queries';

@Injectable()
export class PurchaseService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
  ) {}

  async createPurchaseOrder(param: CreatePurchaseDto) {
    const {
      supplier_id,
      warehouse_id,
      expected_delivery_date,
      items,
      has_invoice,
      payment_condition,
    } = param;

    const result = await this.db.query(
      purchaseQueries.createPurchaseOrder,
      [
        supplier_id,
        warehouse_id,
        expected_delivery_date,
        items,
        has_invoice,
        payment_condition,
      ],
    );

    return result.rows[0];
  }

  async threeWayMatching(createPurchaseDto: any) {
    const { purchase_order_id, goods_receipt_id } = createPurchaseDto || {};

    if (!purchase_order_id || !goods_receipt_id) {
      throw new BadRequestException('purchase_order_id y goods_receipt_id son requeridos');
    }

    await this.db.query(
      purchaseQueries.threeWayMatching,
      [purchase_order_id, goods_receipt_id],
    );

    return { message: 'Three-way matching ejecutado' };
  }

 
  async registerPayment(dto: CreatePaymentDto) {
    await this.db.query('BEGIN');
    try {
      const {
        purchase_account_payable_id,
        amount_paid,
        payment_method_id,
        payment_reference,
      } = dto;

      let insertResult;
      try {
        insertResult = await this.db.query(
          purchaseQueries.insertPayment,
          [
            purchase_account_payable_id,
            amount_paid,
            payment_method_id,
            payment_reference ?? null,
          ],
        );
      } catch (e: any) {
        console.error('Error inserting payment:', e);
        throw new BadRequestException('Error al registrar el pago: ' + (e.detail || e.message));
        //TODO:separar responsabilidad de insertar pago y verificar orden para dar mensajes mas claros al usuario
    
      }

      const paymentId = insertResult.rows[0]?.purchase_order_payment_id;
      if (!paymentId) throw new Error('No se pudo obtener purchase_order_payment_id');

      const payableResult = await this.db.query(
        purchaseQueries.getUpdatedPayableById,
        [purchase_account_payable_id],
      );

      await this.db.query('COMMIT');

      return {
        payment_id: paymentId,
        purchase_account_payable: payableResult.rows[0] ?? null,
      };
    } catch (error) {
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  
  async getAllPurchaseOrders(tenantId: string) {
    const result = await this.db.query(purchaseQueries.getAllByTenant, [tenantId]);
    return result.rows;
  }


  async getPurchaseOrderById(id: string) {
    const result = await this.db.query(purchaseQueries.getById, [id]);
    return result.rows[0] ?? null;
  }

 
  async updatePurchaseOrder(id: string, updatePurchaseDto: UpdatePurchaseDto) {
    const result = await this.db.query(
      purchaseQueries.updateStatus,
      [(updatePurchaseDto as any)?.purchase_order_status_id ?? null, id],
    );
    return result.rows[0] ?? null;
  }

 
  async updateOrderStatus(orderId: string, statusId: number, tenantId: string) {
    const currentResult = await this.db.query(
      purchaseQueries.getCurrentStatusByIdAndTenant,
      [orderId, tenantId],
    );

    if (!currentResult.rows.length) {
      throw new NotFoundException('Orden no encontrada para este tenant');
    }

    const currentStatus: number = currentResult.rows[0].purchase_order_status_id;

    const allowedTransitions: Record<number, number[]> = {
      1: [2],
      2: [3],
      3: [],
      4: [],
    };

    if (currentStatus === statusId) {
      return {
        purchase_order_id: orderId,
        purchase_order_status_id: currentStatus,
        message: 'La orden ya tiene ese estado',
      };
    }

    const isAllowed = (allowedTransitions[currentStatus] || []).includes(statusId);
    if (!isAllowed) {
      throw new BadRequestException(
        `Transicion invalida: ${currentStatus} -> ${statusId}`,
      );
    }

    const updateResult = await this.db.query(
      purchaseQueries.updateOrderStatus,
      [statusId, orderId],
    );

    return updateResult.rows[0];
  }


  async getThreeWayMatching(orderId: string) {
    const result = await this.db.query(purchaseQueries.getMatchingByOrderId, [orderId]);

    if (!result.rows.length) {
      return {
        purchase_order_id: orderId,
        matching_found: false,
        message: 'No existe conciliacion three-way matching para esta orden',
      };
    }

    const row = result.rows[0];
    return {
      matching_found: true,
      matching_id: row.matching_id,
      purchase_order_id: row.purchase_order_id,
      goods_receipt_id: row.goods_receipt_id,
      supplier_invoice_id: row.supplier_invoice_id,
      amounts_matched: row.amounts_matched,
      quantities_matched: row.quantities_matched,
      is_matched: row.is_matched,
      matched_at: row.matched_at,
      amount_comparison: row.amount_comparison,
      quantity_comparison: row.quantity_comparison,
    };
  }
}
