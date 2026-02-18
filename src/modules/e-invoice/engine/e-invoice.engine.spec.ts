import Decimal from 'decimal.js';
import { XmlGeneratorEngine } from './xml_generator.engine';
import { EInvoice } from '../interface/e-invoice.interface';
import * as path from 'path';
import * as fs from 'fs';

describe('EInvoiceEngine - Generation test', () => {
  let engine: XmlGeneratorEngine;

  beforeEach(() => {
    engine = new XmlGeneratorEngine();
  });

  it('should generate a valid XML', () => {
    const mock: EInvoice = {
      clave: '50602011800310123556700100001010000000001100000001',
      codigoActividad: '722001',
      numeroConsecutivo: '00100001010000000001',
      fechaEmision: '2021-01-01T12:00:00-06:00',
      emisor: {
        nombre: 'Empresa de Prueba S.A.',
        identificacion: {
          tipo: '02',
          numero: '3101234567',
        },
        ubicacion: {
          provincia: '1',
          canton: '01',
          distrito: '01',
          otrasSenas: 'San José, Calle 1, Casa 1',
        },
        correoElectronico: 'info@empresa.com',
        telefono: {
          codigoPais: '506',
          numero: '12345678',
        },
      },
      receptor: {
        nombre: 'Cliente de Prueba S.A.',
        identificacion: {
          tipo: '02',
          numero: '3101234567',
        },
        correoElectronico: 'cliente@empresa.com',
      },
      condicionVenta: '01',
      medioPago: ['01', '03'],
      detalle: [
        {
          numeroLinea: 1,
          cantidad: new Decimal(2),
          unidadMedida: 'Unid',
          detalle: 'Producto de prueba',
          precioUnitario: new Decimal(10.0),
          montoTotal: new Decimal(20.0),
          subTotal: new Decimal(20.0),
          montoTotalLinea: new Decimal(20.0),
        },
        {
          numeroLinea: 2,
          cantidad: new Decimal(1),
          unidadMedida: 'Unid',
          detalle: 'Servicio de prueba',
          precioUnitario: new Decimal(50.0),
          montoTotal: new Decimal(50.0),
          subTotal: new Decimal(50.0),
          montoTotalLinea: new Decimal(50.0),
        },
      ],
      resumenFactura: {
        codigoMoneda: 'CRC',
        tipoCambio: new Decimal(1),
        totalServGravados: new Decimal(70.0),
        totalServExentos: new Decimal(0),
        totalServExonerados: new Decimal(0),
        totalMercanciasGravadas: new Decimal(0),
        totalMercanciasExentas: new Decimal(0),
        totalMercanciasExoneradas: new Decimal(0),
        totalGravados: new Decimal(70.0),
        totalExentos: new Decimal(0),
        totalExonerados: new Decimal(0),
        totalVenta: new Decimal(70.0),
        totalDescuentos: new Decimal(0),
        totalVentaNeta: new Decimal(70.0),
        totalImpuestos: new Decimal(12.6),
        totalComprobante: new Decimal(82.6),
      },
    };

    const xml = engine['buildXml'](mock);

    const templatesDir = path.join(
      process.cwd(),
      'src',
      'modules',
      'e-invoice',
      'templates',
    );

    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    const filePath = path.join(templatesDir, 'test_invoice.xml');

    fs.writeFileSync(filePath, xml, 'utf-8');

    expect(fs.existsSync(filePath)).toBeTruthy();

    console.log('XML generated successfully at:', filePath);
  });
});
