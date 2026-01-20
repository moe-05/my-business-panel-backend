# Request de Prueba para endpoints

## Customers

### Creacion de un cliente (POST /)

Parametro opcional birthday

```json
{
  "tenant_id": "4b8a99e8-804c-42bd-912e-9e35cb82c2e1",
  "first_name": "Roberto",
  "last_name": "Urdaneta",
  "document_type_id": 1,
  "document_number": "22222222",
  "email": "robertou@gmail.com",
  "phone": "04449494949",
  "birthdate": "2001-01-10",
  "address": "Timboktu"
}
```

### Actualizacion de los datos de un ciente

La request solo va a contener los campos que se van a modificar

```json
{
  "first_name": "Roberta",
  "last_name": "De Morales",
  "address": "Ayacucho"
}
```

### Lista de gets disponibles para los customers (GET)

```js
// Obtener los clientes de una empresa ==> /customers/<tenant_id>

// Obtener customer por id ==> /customers/<tenant_customer_id>

// Obtener customer por documento ==> /customers/doc/<document_number>
```

### Eliminar customers de la base de datos (DELETE)

```js
// Para eliminar un customer ==> /customers/<customer_id>
```

## Productos

### Insercion de productos (POST /)

```json
{
  "products": [
    {
      "tenant_id": "480a6a01-589e-4734-a27a-c07237fd3fbb",
      "sku": "MMM-MMM",
      "product_name": "Producto M",
      "product_category_id": 1,
      "unit_price": 20
    },
    {
      "tenant_id": "480a6a01-589e-4734-a27a-c07237fd3fbb",
      "sku": "NNN-NNN",
      "product_name": "Producto N",
      "product_description": "Producto N de prueba para verificacion.",
      "product_category_id": 2,
      "unit_price": 30
    },
    {
      "tenant_id": "480a6a01-589e-4734-a27a-c07237fd3fbb",
      "sku": "OOO-OOO",
      "product_name": "Producto O",
      "product_category_id": 2,
      "unit_price": 50
    }
  ]
}
```

### Actualizacion de un producto (PATCH /:product_id)

Recibe un body parcial de la request para crear un producto

```json
{
  "sku": "NUEVO-SKU",
  "product_name": "Nuevo nombre del producto",
  "unit_price": 5
}
```

### Lista de gets disponibles para productos (GET)

```js
// Obtener producto por sku --> /product/sku/<sku_producto>

// Obtener productos de una empresa --> /product/<tenant_id>
```

### Borrar producto (DELETE)

```js
// Borrar producto --> /product/<product_id>
```

## Ventas

### Creacion de una venta (POST /sale)

Se recomienda antes de probar agregar o quitar productos, al igual que los pagos para que los cambios sean mas notables dentro de la base de datos.

```json
{
  "branch_id": "c361017d-b048-4027-b2eb-177d06aa3a37",
  "currency_id": 2,
  "tenant_id": "4b8a99e8-804c-42bd-912e-9e35cb82c2e1",
  "tenant_customer_id": "fad1e3a3-7452-41a8-96b4-6def19f2745d",
  "total_amount": 11000,
  "subtotal_amount": 8900,
  "tax_amount": 1900,
  "is_completed": true,
  "items": [
    {
      "tenant_id": "4b8a99e8-804c-42bd-912e-9e35cb82c2e1",
      "product_id": "2fae8cc3-5359-4bf2-9dc2-c60f60958131",
      "quantity": 4,
      "unit_price": 850,
      "total_price": 3400.0
    },
    {
      "tenant_id": "4b8a99e8-804c-42bd-912e-9e35cb82c2e1",
      "product_id": "e929e2db-2790-470b-a049-defb36bb358c",
      "quantity": 42,
      "unit_price": 179.99,
      "total_price": 7600
    }
  ],
  "payments": [
    {
      "tenant_customer_id": "fad1e3a3-7452-41a8-96b4-6def19f2745d",
      "payment_method_id": 1,
      "payment_amount": 5500,
      "payment_date": "2025-11-12",
      "currency_id": 1,
      "verified": true
    },
    {
      "tenant_customer_id": "fad1e3a3-7452-41a8-96b4-6def19f2745d",
      "payment_method_id": 2,
      "payment_amount": 5500,
      "payment_date": "2025-11-12",
      "currency_id": 1,
      "verified": true
    }
  ]
}
```

### Lista de gets disponibles para las ventas

```js
// Obtener las ventas realizadas por branch --> /sale/<branch_id>
```

## Facturas

### Lista de gets disponibles para las facturas (GET)

```js
// Obtener facturas de una empresa --> /bill/<tenant_id>

// Obtener las facturas de un cliente --> /bill?id=<tenant_id>&doc=<document_cliente>

// Obtener detalles de una factura --> /bill/details/<bill_id>
```

### Eliminar una factura (DELETE)

```js
//Para eliminar una factura ==> /bill/<bill_id>
```

## Retornos

### Creacion de un retorno (POST /returns)

```json
{
  "bill_id": "dd051432-24b8-4a33-aa91-ce87f2116664",
  "tenant_customer_id": "fad1e3a3-7452-41a8-96b4-6def19f2745d",
  "total_refund_amount": 360,
  "refund_method": 2,
  "return_status_id": 1,
  "return_date": "2025-12-07",
  "return_products": [
    {
      "quantity": 2,
      "unit_price": 179.99,
      "total_price": 360,
      "sale_item_id": "331c94e7-ff95-45ee-9efc-ccd307eb4806"
    }
  ]
}
```

## Promociones

### Creacion de promociones (POST /promos)

Esta request tiene un parametro opcional llamado `promotion_description`, a continuacion un ejemplo sin el parametro opcional:

```json
// Sin parametro opcional promotion_description
{
  "tenant_id": "4b8a99e8-804c-42bd-912e-9e35cb82c2e1",
  "promotion_name": "Tenemos 2x1",
  "promotion_code": "TIENDA2X1",
  "promotion_type_id": 3,
  "customer_segment_id": 2,
  "promotion_start_date": "2025-12-12",
  "promotion_end_date": "2025-12-17",
  "is_active": false,
  "rules": {
    "buy_quantity": 1,
    "get_quantity": 2
  }
}
```

Ahora con dicho parametro opcional:

```json
// Con parametro opcional promotion_description
{
  "tenant_id": "4b8a99e8-804c-42bd-912e-9e35cb82c2e1",
  "promotion_name": "Tenemos 2x1",
  "promotion_code": "TIENDA2X1",
  "promotion_description": "Llevate 2 productos por el precio de 1!",
  "promotion_type_id": 3,
  "customer_segment_id": 2,
  "promotion_start_date": "2025-12-12",
  "promotion_end_date": "2025-12-17",
  "is_active": false,
  "rules": {
    "buy_quantity": 1,
    "get_quantity": 2
  }
}
```

### Actualizacion de una promocion (PATCH /:promo_id)

Este recibe un body incompleto que contiene los mismos campos que la request para crear una promo:

```json
// Para actualizar o modificar solo campos de la promocion
{
  "promotion_name": "new_name",
  "customer_segment_id": 1,
  "promotion_end_date": "2025-12-15"
}
```

```json
// Para modificar las reglas de la promocion
{
  "rules": {
    "get_quantity": 3
  }
}
```

```json
// Para modificar toda la promocion (con reglas incluidas)

{
  "promotion_name": "new_name",
  "customer_segment_id": 1,
  "promotion_end_date": "2025-12-15",
  "rules": {
    "get_quantity": 3
  }
}
```

### Lista de gets disponibles para las promociones (GET)

```js
// Obtener info de la promocion --> /promos/info/<promo_id>

// Obtener promos por empresa --> /promos/<tenant_id>

// Obtener tipos de promociones --> /promos
```

### Borrar promocion (DELETE)

```js
// Eliminar promocion --> /promos/<promo_id>
```

## Loyalty Program

### Creacion de un programa de lealtad (POST /loyal-program)

Parametro opcional: minimum_purchase_for_points

```json
{
  "tenant_id": "4b8a99e8-804c-42bd-912e-9e35cb82c2e1",
  "points_per_dollar": 10,
  "points_per_currency_unit": 2,
  "minimum_purchase_for_points": 100
}
```

### Actualizacion de un programa (PATCH)

Al igual que las veces anteriores el body solo tendra los campos que se requieran cambiar:

```js
{
  "poinst_per_dollar": 7
}
```

### Lista de gets disponibles para los programas de lealtad (GET)

```js
// Obtener info de un programa --> /loyal-program/program/<program_id>

// Obtener lista de programas de una empresa --> /loyal-program/<tenant_id>
```

### Borrar un programa de lealtad (DELETE)

```js
// Para eliminar un programa --> /loyal-program/<program_id>
```

## Employee

### Crear un empleado junto con su contrato (POST /employee)

LLama a una transaccion que se encarga de crear al empleado y al contrato.

```json
{
  "user_id": "2aff0b87-f505-4de8-a551-fd6d067bf087",
  "tenant_id": "a685d8c2-acba-469f-bd16-3200ab7e8b6d",
  "first_name": "Sujeto",
  "last_name": "Prueba",
  "doc_number": "123456789",
  "phone": "020202020202",
  "email": "gerente@gmail.com",
  "schedule_id": 2,
  "contractData": {
    "start_date": "2026-02-01",
    "end_date": "2028-02-01",
    "hours": 8,
    "base_salary": 3700.00,
    "duties": "Manejo de la sucursal principal, supervision de los empleados y gestionamiento de productos de la misma sucursal."
  }
}
```

### Obtener los empleados de un tenant (GET /employee/:tenant-id)

Devuelve una lista con todos los empleados pertenecientes a la empresa

```json
// GET /employee/<tenant_id> ==> devuelve:

[
  {
    "employee_id": "a402167d-bd42-475a-ae37-653770355eca",
    "user_id": "2aff0b87-f505-4de8-a551-fd6d067bf087",
    "first_name": "Sujeto",
    "last_name": "Prueba",
    "doc_number": "123456789",
    "phone": "020202020202",
    "email": "gerente@gmail.com",
    "contract_id": "d6b02417-eb50-4655-828c-541b6cac6df1",
    "schedule_id": 2,
    "is_active": true,
    "created_at": "2026-01-12T21:05:55.962Z",
    "updated_at": "2026-01-12T21:05:55.962Z",
    "tenant_id": "a685d8c2-acba-469f-bd16-3200ab7e8b6d"
  }
]
```

### Ver detalles de un empleado (GET /employee/detail/:id)

Devuelve todos los detalles del empleado

```json
// Ejemplo de lo que devuelve el endpoint

{
  "first_name": "Alberto",
  "last_name": "Simanca",
  "doc_number": "123456789",
  "phone": "020202020202",
  "email": "albertosimanca@gmail.com",
  "is_active": true,
  "start_date": "2026-02-01T04:00:00.000Z",
  "end_date": "2028-02-01T04:00:00.000Z",
  "hours": 8,
  "base_salary": "3700.00",
  "duties": "Manejo de la sucursal principal, supervision de los empleados y gestionamiento de productos de la misma sucursal."
}
```

### Actualizacion de la informacion personal de un empleado (PATCH /employee/:employee_id)

Actualiza los datos del empleado

```json
// Body para la actualizacion

{
  "user_id": "2aff0b87-f505-4de8-a551-fd6d067bf087",
  "tenant_id": "a685d8c2-acba-469f-bd16-3200ab7e8b6d",
  "first_name": "Alberto",
  "last_name": "Simanca",
  "doc_number": "123456789",
  "phone": "020202020202",
  "email": "albertosimanca@gmail.com",
  "schedule_id": 2
}
```

### Marcar empleado como no activo (PATCH /employee/deactivate/:employee_id)

Marca como inactivo a un empleado de la empresa

```json
// Desactivar empleado (Soft Delete) ==> /employee/deactivate/<employee_id>

//Retorna:
{
  "message": "Employee with id: a402167d-bd42-475a-ae37-653770355eca deactivated successfully."
}
```

### Eliminar un empleado (DELETE)

```json
// Borrar empleado ==> /employee/<employee_id>

//Retorna:

{
  "message": "Employee with id: a402167d-bd42-475a-ae37-653770355eca deleted successfully."
}
```
## Contrato

### Obtener la informacion de un contrato (GET /contract/:contract_id)

Obtiene la informacion de solo el contrato

```json
// /contract/<contract_id>

//Retorna:

{
  "contract_id": "d6b02417-eb50-4655-828c-541b6cac6df1",
  "start_date": "2026-02-01T04:00:00.000Z",
  "end_date": "2028-02-01T04:00:00.000Z",
  "hours": 8,
  "base_salary": "3700.00",
  "duties": "Manejo de la sucursal principal, supervision de los empleados y gestionamiento de productos de la misma sucursal."
}
```

### Actualizar los terminos de un contrato (PATCH)

```json
{
  "start_date": "2026-02-01",
  "end_date": "2028-02-01",
  "hours": 8,
  "base_salary": 4900.00,
  "duties": "Gerente general de la marca"
}

// Devuelve
{
  "message": "Contract updated successfully",
  "contract": {
    "contract_id": "id del contrato"
  }
}
```
## Clocking

### Clock In
Registro de la hora de entrada de un empleado

```json
{
  "employeeId": "c8caabb1-19ee-4427-8a4e-7927e48363e5", //Cambiar el id a uno que sea valido
  "branchId": "2f0b1b55-5d97-48b0-b6c5-f41290c45cdc"
}
```
### Clock Out
Registra la hora de salida de un empleado

```json
{
  "employeeId": "c8caabb1-19ee-4427-8a4e-7927e48363e5" //Cambiar el id a uno que sea valido
}
```

## Payroll (Corrida de nomina) (/payroll)

### Creacion de la nomina (POST /create)

```json
{
  "tenantId": "af00e3e6-43d0-4ff5-91a7-0da1b84621a5",
  "branchId": "845699c4-b3aa-4e21-8993-e0934df045e7",
  "periodStart": "2026-01-01",
  "periodEnd": "2026-02-01"
}

//Retorna:

{
  "paysheet_id": "<uuid>"
}
```

### Calculo de la nomina (POST /process)

Ejecuta la calculadora de la nomina y se encarga de cerrar la nomina una vez finalizado el proceso

```json
{
  "paysheetId": "<uuid>",
  "branchId": "<uuid>",
  "tenantId": "<uuid>"
}

//Retorna las deducciones totales, el neto total pagado y las ganancias totales de la nomina
{
  "totals": {}
}
```

## Conceptos (/concept)

Los conceptos son los valores de deduccion o ganancia aplicados a cada empleado, estos son creados por el Tenant. El backend unicamente toma los valores guardados en base de datos para realizar los calculos apropiados.

### Obtener conceptos por Tenant (GET /:tenantId)

```json
// Retorna los conceptos generados por el tenant.

//Url ==> http://localhost:3000/concept/<tenantId>
```

### Crear un concepto (POST /)

```json
{
  "tenantId": "<uuid>",
  "name": "Concepto de Prueba",
  "type": "earning", // "earning" | "deduction"
  "calcMethod": "fixed", // "fixed" | "deduction" | "formula" | "manual"
  "isTaxable": false,
  "baseValue": 0.00 //Siempre que un calculo sea de tipo Fixed, este campo sera 0 dado que es un ingreso fijo.
}
```

### Actualizacion de un concepto (PATCH /:conceptId)

```json
{
  "name": "Prueba",
  "type": "earning", // "earning" | "deduction"
  "calcMethod": "percentage", // "fixed" | "deduction" | "formula" | "manual"
  "isTaxable": false,
  "baseValue": 0.10 //Siempre que un calculo sea de tipo Fixed, este campo sera 0 dado que es un ingreso fijo.
}
```

### Desactivar un concepto (PATCH /:conceptId/soft-delete)

Cambia el campo del concepto is_active a false

### Eliminar un concepto (DELETE /:conceptId)

Borra de la base de datos un concepto

## Paysheet / Nomina (/paysheet)

### Filtracion de nomina por Periodo (GET /find)
Encuentra todas las nominas de una sucursal especifica dentro de un intervalo de tiempo determinado

Url: http://localhost:3000/paysheet/find?branchId=:branchId&start=2026-01-01&end=2026-03-01

### Obtener nominas de un tenant (GET /tenant/:tenantId)
Retorna todas las nominas pertenecientes a un tenant especifico

### Obtener nominas de una sucursal (GET /branch/:branchId)
Retorna todas las nominas pertenecientes a una sucursal especifica

### Obtener nomina especifica (GET /:paysheetId)
Retorna una nomina

### Obtener los detalles de una nomina (GET /:paysheetId/details)
Retorna los detalles de la nomina especifica

## Movimientos de nomina (/movements)
Entiendase por movimientos, la cantidad que se le dedujo o agrego al pago de cada empleado

### Obtener todos los movimientos de una nomina (GET /paysheet/:paysheetId)

Retorna todos los movimientos de una nomina en especifico

### Obtener los movimientos de nomina para un empleado (GET /detail/:detailId)

Retorna todos los movimientos de un empleado en especifico