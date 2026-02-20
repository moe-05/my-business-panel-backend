import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from '../dto/e-invoice.dto';
import { EInvoice } from '../interface/e-invoice.interface';
import { create, createCB } from 'xmlbuilder2';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class XmlGeneratorEngine {
  //Refinar el dto para asegurar que se tenga toda la información necesaria para generar la factura electrónica.
  generate(data: CreateInvoiceDto) {}

  async buildXml(content: EInvoice): Promise<void> {
    const template = path.join(
      process.cwd(),
      'src',
      'modules',
      'e-invoice',
      'templates',
    );
    const fileName = `invoice_${content.numeroConsecutivo}.xml`;
    if (!fs.existsSync(template)) {
      fs.mkdirSync(template, { recursive: true });
    }

    const writableStream = fs.createWriteStream(path.join(template, fileName));

    const xml = createCB({
      data: (chunk: any) => writableStream.write(chunk),
      end: () => writableStream.end(),
    });

    xml
      .ele('FacturaElectronica', {
        xmlns:
          'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica',
        'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
        'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
        version: '4.4',
      })
      .ele('Clave')
      .txt(content.clave)
      .up()
      .ele('CodigoActividad')
      .txt(content.codigoActividad)
      .up()
      .ele('NumeroConsecutivo')
      .txt(content.numeroConsecutivo)
      .up()
      .ele('FechaEmision')
      .txt(content.fechaEmision)
      .up();

    const emisor = xml.ele('Emisor');
    emisor.ele('Nombre').txt(content.emisor.nombre).up();
    const identEmisor = emisor.ele('Identificacion');
    identEmisor.ele('Tipo').txt(content.emisor.identificacion.tipo).up();
    identEmisor.ele('Numero').txt(content.emisor.identificacion.numero).up();
    identEmisor.up();
    const ubicacion = emisor.ele('Ubicacion');
    ubicacion.ele('Provincia').txt(content.emisor.ubicacion.provincia).up();
    ubicacion.ele('Canton').txt(content.emisor.ubicacion.canton).up();
    ubicacion.ele('Distrito').txt(content.emisor.ubicacion.distrito).up();
    ubicacion.ele('OtrasSenas').txt(content.emisor.ubicacion.otrasSenas).up();
    ubicacion.up();
    emisor.ele('CorreoElectronico').txt(content.emisor.correoElectronico).up();
    emisor.up(); 

    if (content.receptor) {
      const receptor = xml.ele('Receptor');
      receptor.ele('Nombre').txt(content.receptor.nombre).up();
      const identRec = receptor.ele('Identificacion');
      identRec.ele('Tipo').txt(content.receptor.identificacion.tipo).up();
      identRec.ele('Numero').txt(content.receptor.identificacion.numero).up();
      identRec.up();
      receptor
        .ele('CorreoElectronico')
        .txt(content.receptor.correoElectronico)
        .up();
      receptor.up();
    }

    xml.ele('CondicionVenta').txt(content.condicionVenta).up();
    if (content.plazoVenta) xml.ele('PlazoVenta').txt(content.plazoVenta).up();
    content.medioPago.forEach((medio) => xml.ele('MedioPago').txt(medio).up());

    const detalleNode = xml.ele('DetalleServicio');
    for (const line of content.detalle) {
      const linea = detalleNode.ele('LineaDetalle');
      linea.ele('NumeroLinea').txt(line.numeroLinea.toString()).up();
      if (line.partidaArancelaria)
        linea.ele('PartidaArancelaria').txt(line.partidaArancelaria).up();
      if (line.codigo) linea.ele('Codigo').txt(line.codigo).up();
      linea.ele('Cantidad').txt(line.cantidad.toFixed(3)).up();
      linea.ele('UnidadMedida').txt(line.unidadMedida).up();
      linea.ele('Detalle').txt(line.detalle).up();
      linea.ele('PrecioUnitario').txt(line.precioUnitario.toFixed(5)).up();
      linea.ele('MontoTotal').txt(line.montoTotal.toFixed(5)).up();

      if (line.descuento) {
        const desc = linea.ele('Descuento');
        desc.ele('MontoDescuento').txt(line.descuento.monto.toFixed(5)).up();
        desc.ele('NaturalezaDescuento').txt(line.descuento.naturaleza).up();
        desc.up();
      }

      linea.ele('SubTotal').txt(line.subTotal.toFixed(5)).up();

      if (line.impuestos && line.impuestos.length > 0) {
        line.impuestos.forEach((tax) => {
          const imp = linea.ele('Impuesto');
          imp.ele('Codigo').txt(tax.codigo).up();
          imp.ele('CodigoTarifa').txt(tax.codigoTarifa).up();
          imp.ele('Tarifa').txt(tax.tarifa.toFixed(2)).up();
          imp.ele('Monto').txt(tax.monto.toFixed(5)).up();
          imp.up();
        });
      }

      linea.ele('MontoTotalLinea').txt(line.montoTotalLinea.toFixed(5)).up();
      linea.up(); 
    }
    detalleNode.up();

    const res = xml.ele('ResumenFactura');
    const mon = res.ele('CodigoTipoMoneda');
    mon.ele('CodigoMoneda').txt(content.resumenFactura.codigoMoneda).up();
    mon
      .ele('TipoCambio')
      .txt(content.resumenFactura.tipoCambio.toFixed(5))
      .up();
    mon.up();

    res
      .ele('TotalServGravados')
      .txt(content.resumenFactura.totalServGravados.toFixed(5))
      .up();
    res
      .ele('TotalServExentos')
      .txt(content.resumenFactura.totalServExentos.toFixed(5))
      .up();
    res
      .ele('TotalServExonerados')
      .txt(content.resumenFactura.totalServExonerados.toFixed(5))
      .up();
    res
      .ele('TotalMercanciasGravadas')
      .txt(content.resumenFactura.totalMercanciasGravadas.toFixed(5))
      .up();
    res
      .ele('TotalMercanciasExentas')
      .txt(content.resumenFactura.totalMercanciasExentas.toFixed(5))
      .up();
    res
      .ele('TotalMercanciasExoneradas')
      .txt(content.resumenFactura.totalMercanciasExoneradas.toFixed(5))
      .up();
    res
      .ele('TotalGravados')
      .txt(content.resumenFactura.totalGravados.toFixed(5))
      .up();
    res
      .ele('TotalExentos')
      .txt(content.resumenFactura.totalExentos.toFixed(5))
      .up();
    res
      .ele('TotalExonerados')
      .txt(content.resumenFactura.totalExonerados.toFixed(5))
      .up();
    res
      .ele('TotalVenta')
      .txt(content.resumenFactura.totalVenta.toFixed(5))
      .up();
    res
      .ele('TotalDescuentos')
      .txt(content.resumenFactura.totalDescuentos.toFixed(5))
      .up();
    res
      .ele('TotalVentaNeta')
      .txt(content.resumenFactura.totalVentaNeta.toFixed(5))
      .up();
    res
      .ele('TotalImpuesto')
      .txt(content.resumenFactura.totalImpuestos.toFixed(5))
      .up();
    res
      .ele('TotalComprobante')
      .txt(content.resumenFactura.totalComprobante.toFixed(5))
      .up();
    res.up();

    xml.end();

    return new Promise((res, rej) => {
      writableStream.on('finish', res);
      writableStream.on('error', rej);
    });
  }
}
