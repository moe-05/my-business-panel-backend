import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import { queries } from '@/queries';
import { XmlGeneratorEngine } from './engine/xml_generator.engine';

@Injectable()
export class EInvoiceService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly xmlgen: XmlGeneratorEngine,
  ) {}

  async getInvoiceByBranch(branchId: string) {
    const { rows } = await this.db.query(queries.eInvoice.getInvoicesByBranch, [
      branchId,
    ]);

    return rows;
  }

  async getInvoiceForSale(saleId: string) {
    const { rows } = await this.db.query(queries.eInvoice.getInvoiceForSale, [
      saleId,
    ]);

    return rows;
  }

  async getInvoiceById(invoiceId: string) {
    const { rows } = await this.db.query(queries.eInvoice.getInvoiceById, [
      invoiceId,
    ]);
    return rows[0];
  }

  async generateEInvoiceForSale(saleId: string) {
    const { rows: saleRows } = await this.db.query(
      queries.eInvoice.getSaleForElectronicInvoice,
      [saleId],
    );

    if (!saleRows.length) throw new BadRequestException('Venta no encontrada');

    const sale = saleRows[0];

    if (!sale.is_completed)
      throw new BadRequestException('La venta no está completada');
    if (sale.has_electronic_invoice)
      throw new BadRequestException('Esta venta ya tiene factura electrónica');

    const { rows: digitalRows } = await this.db.query(
      queries.eInvoice.getDigitalInvoice,
      [saleId],
    );
    if (!digitalRows.length)
      throw new BadRequestException(
        'La venta no tiene factura digital generada',
      );

    const { rows: items } = await this.db.query(
      queries.eInvoice.getSaleItemsForElectronicInvoice,
      [saleId],
    );

    if (!items.length) throw new BadRequestException('La venta no tiene items');

    const itemsWithoutCabys = items.filter((i) => !i.cabys_code);
    if (itemsWithoutCabys.length > 0) {
      const ids = itemsWithoutCabys.map((i) => i.product_variant_id).join(', ');
      throw new BadRequestException(
        `Los siguientes productos no tienen código CABYS asignado: ${ids}`,
      );
    }

    const consecutive = this.xmlgen.generateConsecutive(
      '01',
      sale.terminal_number ?? 1,
      sale.pos_number ?? 1,
      Number(sale.invoice_sequence) + 1,
    );

    const { key, qr } = this.xmlgen.generateClave(
      sale.issuer_identification,
      consecutive,
    );

    const eInvoice = this.xmlgen.mapSaleToEInvoice(
      sale,
      items,
      key,
      consecutive,
    );
    const p12Base64 = process.env.EINVOICE_P12_BASE64;
    const p12Pass = process.env.EINVOICE_P12_PASSWORD;

    if (!p12Base64 || !p12Pass)
      throw new Error('Variables de entorno del certificado no configuradas');

    const p12Buffer = Buffer.from(p12Base64, 'base64');
    const xmlSigned = this.xmlgen.generate(eInvoice, p12Buffer, p12Pass);
    const xmlSignedB64 = Buffer.from(xmlSigned).toString('base64');

    const { rows: invoiceRows } = await this.db.query(queries.eInvoice.create, [
      saleId,
      key,
      consecutive,
      xmlSignedB64,
    ]);

    // #5: persistir los ítems en electronic_sale_invoice_items
    const electronicInvoiceId = invoiceRows[0].electronic_sale_invoice_id;
    for (const item of items) {
      await this.db.query(queries.eInvoice.insertItem, [
        electronicInvoiceId,
        item.tenant_id,
        item.product_variant_id,
        item.sale_item_id,
        item.line_number,
        item.discount_amount ?? 0,
      ]);
    }

    await this.db.query(queries.eInvoice.markSaleAsElectronicInvoiced, [
      saleId,
    ]);

    return {
      electronicInvoiceId,
      key,
      qr,
    };
  }
}
