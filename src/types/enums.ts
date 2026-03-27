// Roles del sistema
export type RolNombre = "superadmin" | "administracion" | "filial" | "logistica" | "psicopedagogia"

// Estados de matrícula
export type EstadoMatricula = "activa" | "suspendida" | "caida" | "trasladada" | "completada" | "anulada"

// Estados de cuota
export type EstadoCuota = "pendiente" | "parcial" | "pagada" | "vencida" | "condonada"

// Estados de pago
export type EstadoPago = "activo" | "reversado"

// Monedas
export type Moneda = "PEN" | "USD"

// Medios de pago
export type MedioPago = "efectivo" | "yape" | "plin" | "transferencia" | "deposito" | "tarjeta" | "otros"

// Tipos de comprobante
export type TipoComprobante = "boleta" | "factura" | "ninguno"

// Estados de verificación
export type EstadoVerificacion = "pendiente" | "incompleta" | "completa"

// Tipos de movimiento de stock
export type TipoMovimientoStock =
  | "ingreso_compra"
  | "ingreso_transferencia"
  | "salida_entrega"
  | "salida_merma"
  | "ajuste_positivo"
  | "ajuste_negativo"
  | "traslado"

// Estados de transferencia de stock
export type EstadoTransferencia = "solicitada" | "aprobada" | "despachada" | "recepcionada" | "rechazada"

// Estados de reserva de asesoría
export type EstadoReserva =
  | "reservado"
  | "confirmado"
  | "asistio"
  | "falto"
  | "no_reservo"
  | "reprogramado"
  | "cancelado_sede"
  | "cancelado_alumno"

// Tipos de solicitud de aprobación
export type TipoSolicitud = "caida" | "traslado" | "refinanciacion" | "reapertura_caja"

// Estados de solicitud
export type EstadoSolicitud = "pendiente" | "aprobada" | "rechazada"

// Tipos de acción de auditoría
export type AccionAuditoria =
  | "crear"
  | "editar"
  | "eliminar"
  | "cambio_estado"
  | "aprobar"
  | "reversar"

// Tipos de contrato
export type TipoContrato = "indefinido" | "determinado" | "por_obra" | "practicas"

// Sistemas de pensión
export type SistemaPension = "AFP" | "ONP" | "RH"

// Estado laboral
export type EstadoLaboral = "activo" | "inactivo" | "cesado"
