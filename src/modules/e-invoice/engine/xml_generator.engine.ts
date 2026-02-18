import { Injectable } from "@nestjs/common";
import { CreateInvoiceDto } from "../dto/e-invoice.dto";
import { EInvoice } from "../interface/e-invoice.interface";
import { create } from "xmlbuilder2";

@Injectable()
export class XmlGeneratorEngine {
  //Refinar el dto para asegurar que se tenga toda la información necesaria para generar la factura electrónica.
  generate(data: CreateInvoiceDto) {}

  buildXml(content: EInvoice) {
    const root = create({ version: "1.0", encoding: "UTF-8" })
      .ele("FacturaElectronica", {
        // xmlns: 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica',
        // "xmlns:ds": 'http://www.w3.org/2000/09/xmldsig#',
        // 'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
        version: "4.4",
      })
      .ele('Clave').txt(content.clave).up()
      .ele('CodigoActividad').txt(content.codigoActividad).up()
      .ele("NumeroConsecutivo").txt(content.numeroConsecutivo).up()
      .ele("FechaEmision").txt(content.fechaEmision).up()

    const emisor = root.ele("Emisor")
      .ele('Nombre').txt(content.emisor.nombre).up()
      .ele("Identificacion")
        .ele("Tipo").txt(content.emisor.identificacion.tipo).up()
        .ele("Numero").txt(content.emisor.identificacion.numero).up()
      .up()
      .ele("Ubicacion")
        .ele("Provincia").txt(content.emisor.ubicacion.provincia).up()
        .ele("Canton").txt(content.emisor.ubicacion.canton).up()
        .ele("Distrito").txt(content.emisor.ubicacion.distrito).up()
        .ele("OtrasSenas").txt(content.emisor.ubicacion.otrasSenas).up()
      .up()
      .ele("CorreoElectronico").txt(content.emisor.correoElectronico).up()
    
    if (content.receptor) {
      const receptor = root.ele("Receptor")
        .ele('Nombre').txt(content.receptor.nombre).up()
        .ele('Identificacion')
          .ele("Tipo").txt(content.receptor.identificacion.tipo).up()
          .ele("Numero").txt(content.receptor.identificacion.numero).up()
        .up()
        .ele("CorreoElectronico").txt(content.receptor.correoElectronico).up()
    }
    
    const condicion = root.ele("CondicionVenta").txt(content.condicionVenta).up();
    content.medioPago.forEach(medio => {
      condicion.ele("MedioPago").txt(medio).up();
    });
    if (content.plazoVenta) {
      condicion.ele("PlazoVenta").txt(content.plazoVenta).up();
    }

    const detalle = root.ele("DetalleServicio");
    content.detalle.forEach(line => {
        detalle.ele("LineaDetalle")
        .ele("NumeroLinea").txt(line.numeroLinea.toString()).up()
        .ele("Cantidad").txt(line.cantidad.toFixed(5)).up()
        .ele("UnidadMedida").txt(line.unidadMedida).up()
        .ele("Detalle").txt(line.detalle).up()
        .ele("PrecioUnitario").txt(line.precioUnitario.toFixed(5)).up()
        .ele("MontoTotal").txt(line.montoTotal.toFixed(5)).up()
        .ele("SubTotal").txt(line.subTotal.toFixed(5)).up()
        .ele('MontoTotalLinea').txt(line.montoTotal.toFixed(5)).up();
    })

    const resumen = root.ele("ResumenFactura")
      .ele('CodigoTipoMoneda')
        .ele("CodigoMoneda").txt(content.resumenFactura.codigoMoneda).up()
        .ele("TipoCambio").txt(content.resumenFactura.tipoCambio.toFixed(5)).up()
      .up()
      .ele('TotalServGravados').txt(content.resumenFactura.totalServGravados.toFixed(5)).up()
      .ele('TotalServExentos').txt(content.resumenFactura.totalServExentos.toFixed(5)).up()
      .ele('TotalServExonerados').txt(content.resumenFactura.totalServExonerados.toFixed(5)).up()
      .ele('TotalMercanciasGravadas').txt(content.resumenFactura.totalMercanciasGravadas.toFixed(5)).up()
      .ele('TotalMercanciasExentas').txt(content.resumenFactura.totalMercanciasExentas.toFixed(5)).up()
      .ele('TotalMercanciasExoneradas').txt(content.resumenFactura.totalMercanciasExoneradas.toFixed(5)).up()
      .ele('TotalGravados').txt(content.resumenFactura.totalGravados.toFixed(5)).up()
      .ele('TotalExentos').txt(content.resumenFactura.totalExentos.toFixed(5)).up()
      .ele('TotalExonerados').txt(content.resumenFactura.totalExonerados.toFixed(5)).up()
      .ele('TotalVenta').txt(content.resumenFactura.totalVenta.toFixed(5)).up()
      .ele('TotalDescuentos').txt(content.resumenFactura.totalDescuentos.toFixed(5)).up()
      .ele('TotalVentaNeta').txt(content.resumenFactura.totalVentaNeta.toFixed(5)).up()
      .ele('TotalImpuesto').txt(content.resumenFactura.totalImpuestos.toFixed(5)).up()
      .ele('TotalComprobante').txt(content.resumenFactura.totalComprobante.toFixed(5)).up();
    
    return root.end({ prettyPrint: true });
  }

}