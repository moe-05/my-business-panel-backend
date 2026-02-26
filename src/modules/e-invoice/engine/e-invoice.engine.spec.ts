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

  it('should generate a valid XML', async () => {
    const start = performance.now();
    const docType = '01';
    const pos = 1;
    const terminal = 1;
    const invoiceNumber = 1;

    const consecutive = engine.generateConsecutive(
      docType,
      terminal,
      pos,
      invoiceNumber,
    );

    expect(consecutive).toHaveLength(20);

    const issuerId = '3101234567';
    const key = engine.generateClave(issuerId, consecutive, '1');
    console.log('NumeroConsecutivo, ', consecutive);
    console.log('Clave, ', key);

    expect(key).toHaveLength(50);
    expect(key.includes(consecutive)).toBeTruthy();
    const mock: EInvoice = {
      clave: key,
      codigoActividad: '722001',
      numeroConsecutivo: consecutive,
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
          codigo: "",
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
          codigo: "",
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

    await engine.buildXml(mock);
    const end = performance.now();
    console.log(`XML generation took ${(end - start).toFixed(2)} ms`);

    const filePath = path.join(
      process.cwd(),
      'src',
      'modules',
      'e-invoice',
      'templates',
      `invoice_${mock.numeroConsecutivo}.xml`,
    );

    // if (!fs.existsSync(filePath)) {
    //   fs.mkdirSync(filePath, { recursive: true });
    // }

    expect(fs.existsSync(filePath)).toBeTruthy();
    const generatedXml = fs.readFileSync(filePath, 'utf-8');
    // expect(generatedXml).toContain(
    //   '<Clave>50602011800310123556700100001010000000001100000001</Clave>',
    // );
    expect(generatedXml).toContain('<Nombre>Empresa de Prueba S.A.</Nombre>');

    console.log('XML generated successfully at:', filePath);
  });
});
