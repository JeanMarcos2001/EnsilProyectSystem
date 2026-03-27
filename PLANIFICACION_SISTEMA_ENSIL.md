# PLANIFICACION COMPLETA - SISTEMA ENSIL
## Documento Maestro de Arquitectura, Analisis y Desarrollo

Fecha de elaboracion: 26 de marzo de 2026
Elaborado por: Arquitecto de Software / Consultor Senior

---

# 1. RESUMEN EJECUTIVO DEL NEGOCIO

## 1.1 Que es ENSIL

ENSIL es un grupo empresarial educativo peruano dedicado a la venta de programas formativos de lectura rapida, comprension lectora y desarrollo cognitivo. Opera bajo multiples razones sociales y atiende a ninos (Pre-Kids, Kids), pre-lectores y adultos/jovenes (Especializacion/Profesional).

No es una escuela tradicional. Es un modelo comercial-educativo que combina:
- **CRM** (captacion de leads, origen, conversion)
- **SIS ligero** (gestion academica: programas, niveles, seguimiento psicopedagogico)
- **ERP financiero** (cuentas por cobrar, cartera, caja, planes de pago)
- **Sistema logistico** (materiales, stock, verificacion de entregas)

## 1.2 Estructura Corporativa: Empresas y Filiales

| Razon Social | RUC | Filiales |
|---|---|---|
| ENSIL INT | 20612421243 | Huancayo, Puno, Ica, Huaraz, Ayacucho |
| ENSIL EVOLUTION | 20612459313 | Juliaca (Bolivar) |
| ENSIL DE LAS AMERICAS TACNA | 20533093133 | Tacna, Cusco (Marcavalle) |
| ENSIL REVOLUTION | 20614185229 | Cusco (Magisterio) |
| ENSIL EVOLUTION | 20533093133 | Piura, Chiclayo, Cajamarca, Arequipa, San Isidro |
| SILEE | 20610010289 | Trujillo, Los Olivos |

**Total: 6 razones sociales, 16+ filiales activas en todo Peru.**

## 1.3 Como Gestionan Hoy

Actualmente la operacion se maneja con:
- **Hojas de calculo Excel** con 7 frentes operativos: matriculas, cartera, caja soles, caja dolares, caja chica, libros/materiales y personal.
- Informes semanales manuales por psicopedagogas (formatos Excel).
- Cronogramas mensuales en tablas manuales.
- Sin trazabilidad real, sin auditoria, sin control de stock centralizado.

## 1.4 Problemas y Dolores que el Sistema Debe Resolver

1. **Duplicacion y desorden de datos**: cada sede opera con su propio Excel sin estandarizacion.
2. **Sin trazabilidad**: no hay registro de quien modifico que, cuando ni por que.
3. **Mezcla de logica con datos**: el Excel mezcla reglas de negocio con resultados, causando errores de precio, planes y cuotas.
4. **Sin control financiero centralizado**: la cartera se pierde, los cierres no existen, los pagos parciales no se rastrean.
5. **Verificacion artesanal**: la entrega de materiales se marca como si/no sin proceso formal.
6. **Stock invisible**: no hay kardex, no hay transferencias entre sedes, no hay alertas de minimo.
7. **Sin permisos granulares**: todos acceden a todo o a nada.
8. **Reportes manuales**: cada reporte requiere compilacion manual desde multiples hojas.
9. **Escalabilidad nula**: con 16+ sedes, el Excel ya no sostiene la operacion.

---

# 2. MODULOS DEL SISTEMA (VALIDADOS)

## 2.1 Lista Completa de Modulos

| # | Modulo | Descripcion | Prioridad | Fase |
|---|---|---|---|---|
| 1 | **Autenticacion y Seguridad** | Login, sesion, perfil, RBAC, RLS por sede | Alta | 0 |
| 2 | **Configuracion y Catalogos** | Empresas, sedes, programas, niveles, materiales, tipos de pago, tarifarios, promociones, origenes de lead, medios de pago, tipos de comprobante | Alta | 0-1 |
| 3 | **Personas** | Titulares, alumnos/beneficiarios, deteccion de duplicados | Alta | 2 |
| 4 | **Matriculas** | Wizard progresivo, correlativo global, plan inmutable, snapshot financiero | Alta | 2 |
| 5 | **Cartera / Planes** | Cuotas programadas, seguimiento de pagos, pagos parciales (max 2), refinanciacion, estados financieros | Alta | 3 |
| 6 | **Pagos** | Registro de pagos con multiples medios, tipo de cambio, evidencia obligatoria, comprobante obligatorio | Alta | 3 |
| 7 | **Caja** | Movimientos de ingreso/egreso por sede y moneda, lotes de deposito, cierre mensual, reapertura controlada | Alta | 4 |
| 8 | **Caja Chica** | Ingresos y egresos no matriculares, categorias, cierre separado | Alta | 4 |
| 9 | **Verificacion** | Proceso de entrega de materiales, verificador, estados de verificacion, trazabilidad | Alta | 5 |
| 10 | **Stock / Logistica** | Kardex por material y sede, entradas, salidas, transferencias, mermas, ajustes, alertas de minimo | Alta | 5 |
| 11 | **Psicopedagogia** | Panel de alumnos, programacion de asesorias, seguimiento semanal por programa, cronograma mensual, exportacion | Media | 6 |
| 12 | **Personal** | Datos personales, empleados, asignaciones sede/cargo, contratos, remuneracion basica | Media | 1 |
| 13 | **Reportes** | Reportes fijos obligatorios + constructor flexible para Superadmin/Admin | Media | 7 |
| 14 | **Auditoria** | Log de eventos criticos: creacion, edicion, anulacion, cambios de estado, aprobaciones | Alta | 0 |
| 15 | **Aprobaciones** | Bandeja de solicitudes (caidas, traslados, refinanciaciones, reaperturas de caja) | Alta | 3 |

## 2.2 Dependencias entre Modulos

```
Autenticacion ──> Configuracion ──> Catalogos
                        │
                        ├──> Personas ──> Matriculas
                        │                    │
                        │                    ├──> Cartera/Planes ──> Pagos ──> Caja
                        │                    │
                        │                    ├──> Verificacion ──> Stock
                        │                    │
                        │                    └──> Psicopedagogia
                        │
                        ├──> Personal
                        │
                        └──> Reportes (consume todos los anteriores)

Auditoria: transversal a todo el sistema
Aprobaciones: transversal (caidas, traslados, refinanciaciones, reaperturas)
```

---

# 3. MODELO DE DATOS (ESQUEMA SUPABASE/POSTGRESQL)

## 3.1 Dominio Organizacional

### empresa
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| razon_social | text NOT NULL | Razon social legal |
| ruc | varchar(11) UNIQUE | RUC |
| estado | boolean | Activa/inactiva |
| created_at | timestamptz | Fecha creacion |
| updated_at | timestamptz | Fecha actualizacion |

### filial (sede)
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| empresa_id | uuid FK -> empresa | Empresa a la que pertenece |
| nombre | text NOT NULL | Nombre de la filial |
| ciudad | text | Ciudad |
| direccion | text | Direccion |
| telefono | text | Telefono |
| estado | boolean | Activa/inactiva |
| created_at / updated_at | timestamptz | Timestamps |

### rol
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| nombre | text UNIQUE | superadmin, administracion, filial, logistica, psicopedagogia |
| descripcion | text | Descripcion del rol |

### permiso
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| codigo | text UNIQUE | Codigo interno (ej: matricula.crear) |
| modulo | text | Modulo al que pertenece |
| descripcion | text | Descripcion legible |

### rol_permiso
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| rol_id | uuid FK -> rol | Rol |
| permiso_id | uuid FK -> permiso | Permiso asignado |

### usuario_perfil
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK (= auth.users.id) | Mismo ID de Supabase Auth |
| rol_id | uuid FK -> rol | Rol asignado |
| nombre_completo | text | Nombre visible |
| email | text | Correo |
| estado | boolean | Activo/inactivo |
| created_at / updated_at | timestamptz | Timestamps |

### usuario_filial
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| usuario_id | uuid FK -> usuario_perfil | Usuario |
| filial_id | uuid FK -> filial | Filial asignada |
| es_principal | boolean | Sede principal del usuario |

## 3.2 Dominio de Catalogos

### programa
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| nombre | text NOT NULL | Kids, Pre-Kids, Pre-lectura, Especializacion |
| alias | text | Nombres alternativos heredados |
| descripcion | text | Descripcion del programa |
| estado | boolean | Activo |

### nivel
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| programa_id | uuid FK -> programa | Programa padre |
| nombre | text | Nivel 1, Nivel 2, etc. |
| duracion_meses | int | Duracion base en meses |
| garantia_meses | int | Meses de garantia |
| orden | int | Orden secuencial |

### material
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| nombre | text NOT NULL | Nombre oficial del material |
| tipo | text | Tipo (libro, anillado, maletin, veloptico, flashcard, modulo) |
| unidad | text | Unidad de medida |
| estado | boolean | Activo |

### programa_material (receta por nivel)
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| programa_id | uuid FK | Programa |
| nivel_id | uuid FK | Nivel |
| material_id | uuid FK | Material |
| cantidad | int | Cantidad requerida |
| obligatorio | boolean | Si es obligatorio |
| etapa | int | Etapa de entrega (para Especializacion) |

### tipo_pago
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| nombre | text | Contado, Contado 2 partes, Plan 2, Plan 3, Plan 6, Plan 9 |
| codigo | text UNIQUE | contado, contado_2p, plan_2, plan_3, plan_6, plan_9 |
| cuotas | int | Numero de cuotas (0 para contado) |
| incluye_matricula | boolean | Si cobra matricula separada |
| fechas_editables | boolean | Si las fechas las pone el usuario |
| montos_editables | boolean | Si los montos los pone el usuario (solo contado 2 partes) |

### tarifario
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| programa_id | uuid FK | Programa |
| nivel_id | uuid FK | Nivel |
| tipo_pago_id | uuid FK | Tipo de pago |
| filial_id | uuid FK | Filial |
| moneda | varchar(3) | USD / PEN |
| costo_matricula | decimal(10,2) | Costo de matricula (si aplica) |
| costo_total | decimal(10,2) | Costo total del programa |
| costo_cuota | decimal(10,2) | Costo por cuota |
| vigencia_inicio | date NOT NULL | Fecha inicio vigencia |
| vigencia_fin | date | Fecha fin (null = vigente) |
| estado | boolean | Activo |
| created_by | uuid FK | Quien lo creo |
| created_at / updated_at | timestamptz | Timestamps |

**Regla de vigencia**: al crear un nuevo tarifario para el mismo combo (programa + nivel + tipo_pago + filial + moneda), el sistema cierra automaticamente el anterior poniendo vigencia_fin = dia anterior al nuevo.

### promocion
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| nombre | text NOT NULL | Nombre de la promocion |
| descripcion | text | Descripcion |
| programas_combinacion | jsonb | Combinacion de programas elegibles |
| precio_total | decimal(10,2) | Precio del paquete |
| tipo_pago_requerido | text | Solo contado |
| vigencia_inicio | date | Inicio |
| vigencia_fin | date | Fin |
| campana | text | Etiqueta de campana |
| aplica_todas_sedes | boolean | Flag global |
| estado | boolean | Activa/inactiva |
| created_by | uuid FK | Creador |

### promocion_filial
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| promocion_id | uuid FK | Promocion |
| filial_id | uuid FK | Filial especifica |

## 3.3 Dominio de Personas

### persona
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| tipo | text | titular / alumno / titular_alumno |
| nombres | text NOT NULL | Nombres |
| apellidos | text NOT NULL | Apellidos |
| tipo_documento | text | DNI, CE, pasaporte |
| numero_documento | varchar(20) UNIQUE | Numero de documento |
| fecha_nacimiento | date | Fecha nacimiento |
| telefono | text | Telefono |
| correo | text | Correo electronico |
| direccion | text | Direccion |
| estado_civil | text | Estado civil (solo titular principal) |
| estado | boolean | Activo/inactivo |
| created_at / updated_at | timestamptz | Timestamps |

### expediente
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| codigo | varchar(10) UNIQUE | Codigo de expediente (000001...) |
| titular_principal_id | uuid FK -> persona | Titular principal |
| titular_secundario_id | uuid FK -> persona | Segundo titular (opcional) |
| filial_id | uuid FK -> filial | Filial de origen |
| created_at | timestamptz | Fecha creacion |

### expediente_alumno
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| expediente_id | uuid FK | Expediente |
| alumno_id | uuid FK -> persona | Alumno |
| parentesco | text | Parentesco con titular |

## 3.4 Dominio Contractual

### matricula
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| correlativo | varchar(10) UNIQUE | Numero global (000001...) |
| expediente_id | uuid FK | Expediente |
| alumno_id | uuid FK -> persona | Alumno individual |
| programa_id | uuid FK | Programa |
| nivel_id | uuid FK | Nivel |
| filial_id | uuid FK | Filial |
| ejecutivo_id | uuid FK -> usuario_perfil | Ejecutivo RRPP |
| origen_lead | text | Origen del lead |
| fecha_matricula | date | Fecha comercial de matricula |
| fecha_registro | timestamptz | Fecha de registro en sistema (automatica) |
| estado | text | borrador, activa, pendiente_verificacion, verificada_incompleta, verificada_completa, suspendida, cancelada, caida, trasladada, finalizada |
| promocion_grupo_id | uuid FK | Grupo de promocion (si aplica) |
| observaciones | text | Observaciones |
| created_by | uuid FK | Registrador |
| created_at / updated_at | timestamptz | Timestamps |

### plan_snapshot (snapshot inmutable)
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| matricula_id | uuid FK UNIQUE | Matricula |
| tipo_pago_id | uuid FK | Tipo de pago |
| moneda | varchar(3) | USD / PEN |
| costo_matricula | decimal(10,2) | Costo matricula congelado |
| costo_total | decimal(10,2) | Costo total congelado |
| costo_cuota | decimal(10,2) | Costo cuota congelado |
| cantidad_cuotas | int | Numero de cuotas |
| version | int DEFAULT 1 | Version del plan (por refinanciacion) |
| tarifario_id_origen | uuid FK | Tarifario del que se tomo |
| created_at | timestamptz | Fecha de creacion |

### cuota
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| plan_snapshot_id | uuid FK | Plan al que pertenece |
| matricula_id | uuid FK | Matricula |
| numero | int | Numero de cuota (0 = matricula, 1..N) |
| nombre | text | Nombre descriptivo |
| monto | decimal(10,2) | Monto esperado |
| fecha_vencimiento | date | Fecha limite |
| estado | text | pendiente, parcial, pagada, vencida, refinanciada, anulada_refinanciacion, cancelada_caida, suspendida |
| version_plan | int | Version del plan |
| cuota_origen_id | uuid FK | Cuota que origino esta (refinanciacion) |
| created_by | uuid FK | Creador |
| created_at / updated_at | timestamptz | Timestamps |

### promocion_grupo
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| promocion_id | uuid FK | Promocion aplicada |
| monto_total | decimal(10,2) | Monto total de la promo |
| created_at | timestamptz | Timestamp |

## 3.5 Dominio Financiero

### pago
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| matricula_id | uuid FK | Matricula |
| monto_total | decimal(10,2) | Monto total del pago |
| fecha_pago | date | Fecha del pago |
| tipo_comprobante | text | boleta / factura |
| serie_comprobante | text | Serie |
| numero_comprobante | text | Numero |
| moneda_pago | varchar(3) | Moneda del pago |
| tipo_cambio | decimal(8,4) | TC si aplica |
| monto_moneda_original | decimal(10,2) | Monto en moneda original |
| evidencia_url | text NOT NULL | URL de evidencia (Google Drive) |
| observaciones | text | Observaciones |
| estado | text | activo, reversado |
| created_by | uuid FK | Registrador |
| filial_id | uuid FK | Filial |
| created_at | timestamptz | Timestamp |

**Constraint UNIQUE**: empresa_id + tipo_comprobante + serie_comprobante + numero_comprobante

### pago_componente (medios de pago multiples)
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| pago_id | uuid FK | Pago padre |
| medio_pago | text | efectivo, yape, transferencia, etc. |
| monto | decimal(10,2) | Monto de este componente |
| numero_operacion | text | Numero de operacion |

### pago_cuota (aplicacion del pago a cuotas)
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| pago_id | uuid FK | Pago |
| cuota_id | uuid FK | Cuota |
| monto_aplicado | decimal(10,2) | Monto aplicado a esta cuota |

### movimiento_caja
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| filial_id | uuid FK | Filial |
| tipo | text | ingreso, egreso, ajuste |
| categoria | text | matricula, deposito_cuenta, ajuste, etc. |
| moneda | varchar(3) | PEN / USD |
| monto | decimal(10,2) | Monto |
| tipo_cambio | decimal(8,4) | TC si aplica |
| pago_id | uuid FK | Pago asociado (si aplica) |
| concepto | text | Concepto |
| lote_deposito_id | uuid FK | Lote de deposito (si aplica) |
| periodo | varchar(7) | YYYY-MM |
| estado | text | activo, reversado |
| created_by | uuid FK | Registrador |
| created_at | timestamptz | Timestamp |

### cierre_caja
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| filial_id | uuid FK | Filial |
| tipo_caja | text | matriculas_pen, matriculas_usd, caja_chica |
| periodo | varchar(7) | YYYY-MM |
| estado | text | abierto, cerrado |
| cerrado_por | uuid FK | Usuario que cerro |
| fecha_cierre | timestamptz | Fecha/hora cierre |
| reabierto_por | uuid FK | Usuario que reabrio (si aplica) |
| fecha_reapertura | timestamptz | Fecha/hora reapertura |
| motivo_reapertura | text | Motivo |

### movimiento_caja_chica
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| filial_id | uuid FK | Filial |
| tipo | text | ingreso, egreso |
| categoria | text | movilidad, utiles, marketing, etc. |
| monto | decimal(10,2) | Monto |
| concepto | text | Concepto |
| evidencia_url | text | Evidencia |
| periodo | varchar(7) | YYYY-MM |
| created_by | uuid FK | Registrador |
| created_at | timestamptz | Timestamp |

## 3.6 Dominio de Verificacion y Stock

### verificacion
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| matricula_id | uuid FK | Matricula |
| verificador_id | uuid FK | Usuario verificador |
| fecha_verificacion | date | Fecha |
| estado | text | pendiente, incompleta, completa |
| observaciones | text | Observaciones |
| created_at | timestamptz | Timestamp |

### verificacion_material
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| verificacion_id | uuid FK | Verificacion |
| material_id | uuid FK | Material |
| cantidad_entregada | int | Cantidad entregada |
| entregado | boolean | Si se entrego |

### stock_sede
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| filial_id | uuid FK | Filial |
| material_id | uuid FK | Material |
| cantidad_actual | int | Stock actual |
| stock_minimo | int | Alerta de minimo |
| updated_at | timestamptz | Ultima actualizacion |

### movimiento_stock
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| filial_id | uuid FK | Filial |
| material_id | uuid FK | Material |
| tipo | text | ingreso_compra, ingreso_transferencia, salida_entrega, salida_merma, ajuste_positivo, ajuste_negativo, traslado |
| cantidad | int | Cantidad |
| referencia_id | uuid | ID de la verificacion, transferencia, etc. |
| motivo | text | Motivo |
| created_by | uuid FK | Registrador |
| created_at | timestamptz | Timestamp |

### transferencia_stock
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| filial_origen_id | uuid FK | Sede origen |
| filial_destino_id | uuid FK | Sede destino |
| estado | text | solicitada, aprobada, despachada, recepcionada, rechazada |
| solicitante_id | uuid FK | Solicitante |
| aprobador_id | uuid FK | Aprobador |
| fecha_solicitud | timestamptz | Fecha solicitud |
| fecha_despacho | timestamptz | Fecha despacho |
| fecha_recepcion | timestamptz | Fecha recepcion |

### transferencia_stock_detalle
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| transferencia_id | uuid FK | Transferencia |
| material_id | uuid FK | Material |
| cantidad | int | Cantidad |

## 3.7 Dominio de Psicopedagogia

### reserva_asesoria
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| alumno_id | uuid FK -> persona | Alumno |
| matricula_id | uuid FK | Matricula |
| filial_id | uuid FK | Filial |
| fecha | date | Fecha de la sesion |
| hora_inicio | time | Hora |
| estado | text | reservado, confirmado, asistio, falto, no_reservo, reprogramado, cancelado_sede, cancelado_alumno |
| created_by | uuid FK | Quien reservo |
| created_at | timestamptz | Timestamp |

### seguimiento_sesion
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| reserva_id | uuid FK | Reserva de asesoria |
| alumno_id | uuid FK | Alumno |
| programa_id | uuid FK | Programa |
| nivel_id | uuid FK | Nivel (si aplica) |
| fecha_asistencia | date | Fecha real |
| -- Campos Especializacion -- | | |
| modulo_numero | int | Numero de modulo (1-20) |
| velocidad_ppm | int | Palabras por minuto |
| comprension_pct | decimal(5,2) | Porcentaje de comprension |
| -- Campos Kids -- | | |
| sesion_numero | int | Numero de sesion |
| velocidad_kids | int | Velocidad |
| comprension_kids | decimal(5,2) | Comprension |
| -- Campos Pre-Kids -- | | |
| semana_numero | int | Numero de semana |
| identifica | text | SI / NO / 50% |
| lee_solo | text | SI / NO / 50% |
| -- General -- | | |
| observaciones | text | Observaciones de la psicopedagoga |
| created_by | uuid FK | Psicopedagoga |
| created_at | timestamptz | Timestamp |

### cronograma_mensual
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| filial_id | uuid FK | Filial |
| mes | int | Mes |
| anio | int | Ano |
| titulo | text | Titulo editable (ej: "ERES ILIMITADO") |
| estado | text | borrador, publicado |
| created_by | uuid FK | Creador |

### cronograma_actividad
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| cronograma_id | uuid FK | Cronograma |
| nombre_actividad | text | Nombre (ej: "CAMPO VISUAL", "ORTOGRAFIA") |
| fecha | date | Fecha |
| hora | time | Hora |
| responsable | text | Responsable |
| observaciones | text | Notas |

## 3.8 Dominio de Personal

### empleado
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| persona_id | uuid FK -> persona | Datos personales |
| codigo_interno | varchar(10) UNIQUE | Codigo de empleado |
| fecha_ingreso_empresa | date | Fecha de ingreso |
| estado_laboral | text | activo, inactivo, cesado |
| observaciones | text | Observaciones |

### empleado_asignacion
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| empleado_id | uuid FK | Empleado |
| filial_id | uuid FK | Filial asignada |
| cargo | text | Cargo |
| area | text | Area |
| rol_sistema_id | uuid FK -> rol | Rol del sistema |
| fecha_inicio | date | Inicio |
| fecha_fin | date | Fin |
| es_principal | boolean | Asignacion principal |
| estado | boolean | Activa |

### empleado_contrato
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| empleado_id | uuid FK | Empleado |
| tipo_contrato | text | Tipo |
| fecha_inicio | date | Inicio |
| fecha_cese | date | Cese |
| full_time | boolean | Full/Part time |
| sistema_pension | text | AFP / ONP / RH |
| fondo | text | Fondo seleccionado |
| remuneracion_bruta | decimal(10,2) | Bruto |
| aporte | decimal(10,2) | Aporte |
| remuneracion_neta | decimal(10,2) | Neto |
| vacaciones_inicio | date | Inicio vacaciones |
| vacaciones_retorno | date | Retorno vacaciones |
| estado | text | vigente, cerrado, renovado |

## 3.9 Dominio Transversal

### auditoria_evento
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| usuario_id | uuid FK | Usuario |
| accion | text | crear, editar, eliminar, cambio_estado, aprobar, reversar |
| entidad | text | Tabla afectada |
| entidad_id | uuid | ID del registro |
| datos_antes | jsonb | Estado anterior |
| datos_despues | jsonb | Estado posterior |
| ip | text | IP del usuario |
| created_at | timestamptz | Timestamp |

### solicitud_aprobacion
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid PK | Identificador |
| tipo | text | caida, traslado, refinanciacion, reapertura_caja |
| referencia_id | uuid | ID del registro afectado |
| motivo | text | Motivo |
| comentario | text | Comentario libre |
| solicitante_id | uuid FK | Solicitante |
| aprobador_id | uuid FK | Aprobador |
| estado | text | pendiente, aprobada, rechazada |
| fecha_solicitud | timestamptz | Fecha solicitud |
| fecha_resolucion | timestamptz | Fecha resolucion |

## 3.10 Consideraciones Multi-Tenant

El sistema ENSIL opera con **multi-tenancy por filial** usando Row Level Security (RLS) de PostgreSQL/Supabase:

- Cada usuario tiene una o mas filiales asignadas via `usuario_filial`.
- Las politicas RLS filtran por `filial_id` en las tablas sensibles.
- El Superadmin ve todo (bypass de RLS o politica permisiva).
- Administracion ve segun las sedes que tenga habilitadas.
- Filial, Logistica y Psicopedagogia ven solo su sede.
- Los comprobantes son unicos por empresa (no por filial).
- Los cierres de caja son por filial + tipo_caja + moneda + periodo.

---

# 4. STACK TECNOLOGICO RECOMENDADO

## 4.1 Stack Principal (Validado)

| Capa | Tecnologia | Justificacion |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | SSR, file-based routing, Server Components, Server Actions. Ideal para app multi-pagina con formularios complejos. |
| **Base de datos** | Supabase (PostgreSQL) | Auth integrado, RLS nativo, real-time opcional, storage para evidencias, API REST automatica, funciones SQL/RPC. Sin necesidad de backend propio en esta fase. |
| **UI Framework** | React 18+ | Ecosistema maduro, compatible con todas las librerias seleccionadas. |
| **Lenguaje** | TypeScript | Tipado estricto, reduce errores, mejora mantenibilidad. |

## 4.2 Librerias UI y Componentes

| Categoria | Libreria | Justificacion |
|---|---|---|
| **Componentes base** | shadcn/ui | Componentes headless + Tailwind. No es dependencia, se copia al proyecto. Maximo control de diseno. |
| **CSS** | Tailwind CSS 3+ | Utility-first, consistente con shadcn/ui, rapido para prototipar. |
| **Iconos** | @tabler/icons-react | Iconografia consistente, gran variedad, estilo limpio que encaja con el diseno definido. |
| **Tipografia** | Plus Jakarta Sans (Google Fonts) | Neutral, altamente legible, tecnica, perfecta para dashboard administrativo. |

## 4.3 Estado, Formularios y Validaciones

| Categoria | Libreria | Justificacion |
|---|---|---|
| **Formularios** | React Hook Form | Performante, minima re-renderizacion, excelente para formularios complejos como el wizard de matricula. |
| **Validacion** | Zod | Validacion declarativa con TypeScript. Schemas reutilizables entre frontend y servidor. |
| **Estado servidor** | TanStack Query (React Query) | Cache, invalidacion, optimistic updates. Para todo lo que viene de Supabase. |
| **Estado local** | Zustand (si necesario) | Solo para estado global inevitable (usuario actual, sede actual, tema). Evitar estado global innecesario. |

## 4.4 Reportes y Exportacion

| Categoria | Libreria | Justificacion |
|---|---|---|
| **Tablas** | TanStack Table | Sorting, filtering, pagination server-side. Para todas las tablas del sistema. |
| **Graficos** | Recharts | Ligero, declarativo, suficiente para dashboards KPI. |
| **Export Excel** | xlsx (SheetJS) | Exportacion de reportes a Excel. |
| **Export PDF** | @react-pdf/renderer | Generacion de PDFs para cronogramas y reportes. |

## 4.5 Almacenamiento de Evidencias

| Servicio | Uso |
|---|---|
| **Google Drive** (API) | Almacenamiento de vouchers, fotos de pago, contratos. Organizacion por filial/ano/mes/tipo. |
| **Supabase Storage** | Alternativa para archivos internos del sistema si Drive no es viable para alguna funcionalidad. |

## 4.6 Despliegue

| Componente | Plataforma |
|---|---|
| **Frontend** | Vercel (recomendado para Next.js) o cPanel con build estatico |
| **Base de datos** | Supabase Cloud (plan gratuito o Pro) |
| **DNS / Dominio** | Segun preferencia del cliente |

---

# 5. ESTRUCTURA DE PROYECTO

## 5.1 Arbol de Carpetas Recomendado

```
system-ensil/
├── .claude/                      # Configuracion de agente IA
│   └── settings.json
├── docs/                         # Documentacion tecnica del proyecto
│   ├── 01-reglas-negocio.md
│   ├── 02-modulos-sistema.md
│   ├── 03-estados-y-maquinas.md
│   ├── 04-permisos-matriz.md
│   ├── 05-diseno-ui.md
│   ├── 06-migracion-inicial.md
│   ├── 07-catalogos-maestros.md
│   ├── 08-roadmap-desarrollo.md
│   └── decisions/                # Decisiones tecnicas con justificacion
├── supabase/
│   ├── migrations/               # Migraciones SQL ordenadas
│   │   ├── 001_empresas_filiales.sql
│   │   ├── 002_roles_permisos.sql
│   │   ├── 003_usuarios.sql
│   │   ├── 004_personas_expedientes.sql
│   │   ├── 005_programas_catalogos.sql
│   │   ├── 006_matriculas_planes.sql
│   │   ├── 007_pagos_caja.sql
│   │   ├── 008_verificacion_stock.sql
│   │   ├── 009_psicopedagogia.sql
│   │   ├── 010_personal.sql
│   │   └── 011_auditoria_solicitudes.sql
│   └── seed/                     # Seeds de datos iniciales
│       ├── 01_empresas.sql
│       ├── 02_filiales.sql
│       ├── 03_roles_permisos.sql
│       ├── 04_programas_niveles.sql
│       ├── 05_materiales.sql
│       ├── 06_tipos_pago.sql
│       └── 07_catalogos_operativos.sql
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Grupo de rutas de autenticacion
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/          # Grupo de rutas del sistema
│   │   │   ├── layout.tsx        # AppShell con sidebar
│   │   │   ├── page.tsx          # Dashboard principal
│   │   │   ├── configuracion/
│   │   │   ├── catalogos/
│   │   │   │   ├── programas/
│   │   │   │   ├── niveles/
│   │   │   │   ├── materiales/
│   │   │   │   ├── tipos-pago/
│   │   │   │   ├── tarifarios/
│   │   │   │   ├── promociones/
│   │   │   │   └── origenes-lead/
│   │   │   ├── matriculas/
│   │   │   │   ├── page.tsx      # Lista de matriculas
│   │   │   │   ├── nueva/        # Wizard de nueva matricula
│   │   │   │   └── [id]/         # Detalle de matricula
│   │   │   ├── cartera/
│   │   │   ├── caja/
│   │   │   ├── caja-chica/
│   │   │   ├── stock/
│   │   │   ├── verificacion/
│   │   │   ├── psicopedagogia/
│   │   │   │   ├── alumnos/
│   │   │   │   ├── programacion/
│   │   │   │   ├── seguimiento/
│   │   │   │   └── cronogramas/
│   │   │   ├── personal/
│   │   │   ├── reportes/
│   │   │   ├── auditoria/
│   │   │   └── aprobaciones/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── features/                 # Logica por dominio (Screaming Architecture)
│   │   ├── auth/
│   │   │   ├── queries.ts        # Consultas Supabase
│   │   │   ├── actions.ts        # Server Actions
│   │   │   ├── hooks.ts          # Hooks de React
│   │   │   └── types.ts          # Tipos del dominio
│   │   ├── matriculas/
│   │   │   ├── queries.ts
│   │   │   ├── actions.ts
│   │   │   ├── hooks.ts
│   │   │   ├── types.ts
│   │   │   ├── schemas.ts        # Schemas Zod
│   │   │   └── rules.ts          # Reglas de negocio
│   │   ├── cartera/
│   │   ├── pagos/
│   │   ├── caja/
│   │   ├── stock/
│   │   ├── verificacion/
│   │   ├── psicopedagogia/
│   │   ├── personal/
│   │   ├── catalogos/
│   │   ├── reportes/
│   │   └── auditoria/
│   ├── components/               # Componentes compartidos
│   │   ├── ui/                   # Componentes shadcn/ui base
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── drawer.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── app-shell.tsx
│   │   │   ├── sidebar-primary.tsx
│   │   │   ├── sidebar-secondary.tsx
│   │   │   ├── topbar.tsx
│   │   │   └── page-header.tsx
│   │   └── shared/
│   │       ├── search-box.tsx
│   │       ├── empty-state.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── data-table.tsx
│   │       └── file-upload.tsx
│   ├── lib/                      # Utilidades y configuracion
│   │   ├── supabase/
│   │   │   ├── client.ts         # Cliente browser
│   │   │   ├── server.ts         # Cliente server
│   │   │   └── admin.ts          # Cliente admin (si necesario)
│   │   ├── auth/
│   │   │   ├── get-user.ts
│   │   │   ├── get-role.ts
│   │   │   ├── get-filiales.ts
│   │   │   └── has-permission.ts
│   │   ├── utils.ts              # Utilidades generales
│   │   └── constants.ts          # Constantes del sistema
│   └── types/                    # Tipos globales
│       ├── database.ts           # Tipos generados de Supabase
│       └── enums.ts              # Enums del sistema
├── public/
│   └── fonts/
├── CLAUDE.md                     # Contexto para agente IA
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## 5.2 Convenciones de Nombrado

| Elemento | Convencion | Ejemplo |
|---|---|---|
| Carpetas | kebab-case | `caja-chica/`, `tipos-pago/` |
| Componentes | PascalCase | `AppShell.tsx`, `DataTable.tsx` |
| Funciones | camelCase | `getMatricula()`, `hasPermission()` |
| Variables | camelCase | `currentUser`, `isPaid` |
| Tipos/Interfaces | PascalCase | `Matricula`, `PlanSnapshot` |
| Tablas SQL | snake_case | `plan_snapshot`, `movimiento_caja` |
| Archivos de logica | camelCase | `queries.ts`, `actions.ts` |
| Booleanos | prefijo intencional | `isPaid`, `canEdit`, `hasPendingDebt` |
| Codigo | Ingles | Variables, funciones, tipos |
| Comentarios | Espanol | Documentacion interna |

---

# 6. PLAN DE DESARROLLO POR FASES

## Sprint 0 - Infraestructura y Fundamentos (7 dias)

**Objetivo**: Base solida para que todo lo demas se construya correctamente.

| Dia | Bloque | Tareas |
|---|---|---|
| 1 | Infraestructura | Estructura de carpetas, /docs, CLAUDE.md, README tecnico |
| 2 | Base de datos (1) | Migraciones: empresas, filiales, roles, permisos, usuarios |
| 3 | Base de datos (2) | Migraciones: personas, programas, catalogos. Seeds base |
| 4 | Seguridad | Auth con Supabase, perfil/rol/sede actual, hasPermission, RLS minimo |
| 5 | Design System | Plus Jakarta Sans, Tabler Icons, tokens, AppShell, doble sidebar, componentes base |
| 6 | Navegacion | Paginas vacias navegables, proteccion de rutas por rol |
| 7 | Cierre | Limpieza, revision, checklist de Sprint 0 |

**Criterio de terminado**: Login funcional, navegacion por rol, seeds cargados, doble sidebar operativa.

## Sprint 1 - Catalogos Maestros (5-7 dias)

**Objetivo**: CRUD completo de todos los catalogos que alimentan el sistema.

- Gestion de programas y niveles
- Gestion de materiales y recetas
- Gestion de tipos de pago
- Gestion de tarifarios con vigencia por sede
- Gestion de promociones con sedes y vigencia
- Gestion de origenes de lead, medios de pago, tipos de comprobante
- Catalogo de metas por programa

**Por que primero**: Sin catalogos, la matricula no puede funcionar.

## Sprint 2 - Matriculas (7-10 dias)

**Objetivo**: Wizard progresivo completo de matricula.

- Seleccion de ejecutivo
- Paso 1: Titulares (principal + secundario, con opcion titular=alumno)
- Paso 2: Beneficiarios/alumnos (dinamicos, agregar/quitar)
- Paso 3: Programa + tipo de pago por alumno, deteccion de promos, agrupacion 2x1
- Paso 4: Verificar datos (resumen) + Guardar
- Generacion de correlativo global
- Snapshot inmutable de plan
- Generacion automatica de cuotas
- Pago contado en el acto (con evidencia y comprobante)
- Registro automatico en caja
- Lista de matriculas con filtros y estados

**Por que ahora**: La matricula es el corazon del sistema. Todo lo demas depende de ella.

## Sprint 3 - Cartera, Pagos y Aprobaciones (7-10 dias)

**Objetivo**: Gestion completa de planes activos y cobros.

- Panel de cartera con cuotas por colores (pendiente, parcial, vencida, pagada)
- Registro de pago (automatico a cuota mas antigua + manual)
- Pagos parciales (max 2 por cuota)
- Refinanciacion (versionado de plan, alertas a superadmin)
- Suspension, cancelacion y logica de "caido"
- Bandeja de aprobaciones (caidas, traslados, refinanciaciones)
- Tipo de cambio en pagos en soles
- Evidencia y comprobante obligatorios

## Sprint 4 - Caja y Caja Chica (5 dias)

**Objetivo**: Control financiero por sede.

- Movimientos de caja por sede y moneda
- Egresos (depositos a cuenta ENSIL)
- Lotes de deposito
- Caja chica (ingresos/egresos con categorias)
- Cierre mensual por sede + tipo_caja + moneda
- Reapertura controlada (solo superadmin)
- Ajustes y reversas

## Sprint 5 - Stock y Verificacion (7 dias)

**Objetivo**: Control logistico completo.

- Kardex por material y sede
- Stock actual con alertas de minimo
- Ingresos de stock (compra, produccion, transferencia)
- Salidas de stock (entrega por matricula, merma)
- Ajustes con motivo
- Transferencias entre sedes (solicitud, aprobacion, despacho, recepcion)
- Verificacion de matricula (proceso, verificador, materiales, descuento de stock)

## Sprint 6 - Psicopedagogia (7 dias)

**Objetivo**: Modulo completo de seguimiento academico.

- Panel de alumnos con filtros
- Programacion de asesorias semanales (desde filial)
- Vista de psicopedagogia: reservas, estados (reservo/falto/no reservo/asistio)
- Seguimiento por sesion segun programa (campos diferenciados: PPM/comprension para Especializacion, sesion/velocidad/comprension para Kids, semana/identifica/lee_solo para Pre-Kids)
- Cronograma mensual de actividades (titulo editable, actividades, exportable)
- Exportacion de reportes semanales

## Sprint 7 - Reportes, Auditoria y Pulido (7-10 dias)

**Objetivo**: Reportes operativos y refinamiento.

- Reportes fijos obligatorios (comerciales, cartera, caja, verificacion, stock, personal, auditoria)
- Constructor flexible para Superadmin/Administracion
- Exportacion a Excel y PDF
- Dashboards KPI por rol
- Auditoria visible (cambios criticos, caidas, refinanciaciones, reaperturas)
- Pulido de UX, estados vacios, mensajes de error, responsive

---

# 7. IDENTIDAD VISUAL

## 7.1 Direccion Madre

> "Workspace administrativo premium, de estetica minimalista y silenciosa, con navegacion lateral de dos niveles, superficies limpias, densidad controlada y componentes funcionales sobrios."

El sistema debe verse como una herramienta de trabajo seria, tipo Notion / Linear / Stripe Dashboard. No como un dashboard generico con gradientes y decoracion innecesaria.

## 7.2 Paleta de Colores

### Colores Base del Sistema
| Token | Hex | Uso |
|---|---|---|
| App Background | `#F4F5F7` | Fondo general de la aplicacion |
| Surface | `#FFFFFF` | Paneles, cards, sidebar |
| Surface Muted | `#F8F9FB` | Bloques resaltados, filas alternas |
| Border | `#E7E9EE` | Bordes de cards, inputs, divisores |
| Text Primary | `#1F2430` | Titulos, texto principal |
| Text Secondary | `#667085` | Labels, metadatos |
| Text Muted | `#98A2B3` | Textos de ayuda, placeholders |
| Primary Accent | `#4F46E5` | Accion principal, links, item activo |
| Active Tint | `#EEF2FF` | Fondo del item activo en sidebar |

### Colores de Estado
| Estado | Color | Uso |
|---|---|---|
| Pagado / Completo | Verde suave (chip) | `#ECFDF3` fondo, `#027A48` texto |
| Pendiente | Amarillo suave | `#FFFAEB` fondo, `#B54708` texto |
| Vencido / Error | Rojo suave | `#FEF3F2` fondo, `#B42318` texto |
| Parcial | Azul suave | `#EFF8FF` fondo, `#175CD3` texto |
| Suspendido | Gris | `#F2F4F7` fondo, `#344054` texto |
| Caido | Rojo oscuro | `#FEE4E2` fondo, `#912018` texto |

## 7.3 Layout del Sistema

```
+--+----------+----------------------------------------+
|  |          |  Topbar (titulo pagina, breadcrumb,    |
|  | Sidebar  |  acciones rapidas, perfil)             |
|S |Secondary |----------------------------------------+
|i |          |                                        |
|d | - Logo   |     Area de contenido principal        |
|e | - Search |                                        |
|b | - Menu   |     - Filtros                          |
|a |   items  |     - Tablas / Cards / Formularios     |
|r | - CTA    |     - Paneles secundarios              |
|  | - Prefs  |                                        |
|P | - Perfil |                                        |
|r |          |                                        |
|i |          |                                        |
+--+----------+----------------------------------------+
```

### Sidebar Primaria (64-76px)
- Solo iconos centrados
- Navegacion estructural del sistema
- Avatar/perfil al pie
- Estados activos con fondo suave

### Sidebar Secundaria (240-300px)
- Nombre del modulo
- Buscador rapido
- Items textuales con iconos
- Secciones agrupadas
- Tarjeta contextual (si aplica)
- Preferencias y perfil

## 7.4 Especificaciones de Componentes

### Tipografia (Plus Jakarta Sans)
| Elemento | Tamano | Peso |
|---|---|---|
| Titulo de pagina | 28-32px | 700 |
| Titulo de card | 16-20px | 600 |
| Texto principal | 14-15px | 400 |
| Metadatos | 12-13px | 400 |
| Labels secundarios | 11-12px | 500 |
| Cifras KPI | 24-28px | 700 |

### Radios de Borde
| Elemento | Radio |
|---|---|
| Elementos pequenos | 8px |
| Botones / Inputs | 10-12px |
| Cards estandar | 14-16px |
| Paneles mayores | 18-22px |
| Modales grandes | 24px |

### Botones
| Tipo | Estilo | Altura |
|---|---|---|
| Primario | Solido, contraste alto | 40px |
| Secundario | Borde fino, fondo blanco | 40px |
| Ghost | Sin contenedor | 36px |
| CTA | Solido destacado | 44px |
| Compacto | Para toolbars | 32-36px |

### Inputs
| Propiedad | Valor |
|---|---|
| Altura | 40-44px |
| Radio | 10-12px |
| Padding horizontal | 12-14px |
| Borde | 1px gris sutil |
| Icono | Alineado a la izquierda |
| Focus | Borde levemente mas notorio, halo minimo |

### Espaciado
| Token | Valor | Uso |
|---|---|---|
| micro | 4px | Microajuste |
| xs | 8px | Detalle interno |
| sm | 12px | Separacion corta |
| base | 16px | Espacio base |
| md | 20px | Grupo medio |
| lg | 24px | Bloque estandar |
| xl | 32px | Separacion grande |
| 2xl | 40px | Seccion principal |

---

# 8. RIESGOS Y CONSIDERACIONES

## 8.1 Riesgos Criticos

| Riesgo | Impacto | Mitigacion |
|---|---|---|
| **Reglas de negocio incompletas** | Retrabajo en BD, backend y pantallas | Cerrar catalogo maestro, precios y estados ANTES de codificar cada modulo |
| **Snapshot de plan mal implementado** | Errores financieros irreversibles | El plan se congela al guardar. Nunca se recalcula retroactivamente. |
| **Multi-tenancy deficiente** | Fugas de datos entre sedes | RLS desde Sprint 0. Probar accesos por rol. Nunca confiar solo en frontend. |
| **Escalabilidad del wizard** | UX deteriorado con muchos alumnos | Disenar wizard progresivo, guardar borradores, no cargar todo en memoria. |
| **Google Drive como storage** | Dependencia externa, limites de API | Evaluar Supabase Storage como alternativa o fallback. |

## 8.2 Decisiones Arquitectonicas Importantes

### DECISION 1: Supabase sin API propia
**Razon**: En esta fase, Supabase provee autenticacion, base de datos, RLS y storage suficientes. Crear un backend separado anade complejidad innecesaria.
**Riesgo**: Si la logica de negocio crece mucho, puede necesitarse Edge Functions o un backend dedicado.

### DECISION 2: Screaming Architecture por dominio
**Razon**: El sistema tiene dominios claros (matriculas, pagos, cartera, stock, etc.). Organizar por dominio hace que la estructura "grite" que hace el sistema.
**Impacto**: Cada desarrollador o agente IA sabe donde buscar la logica de cada funcionalidad.

### DECISION 3: Plan inmutable con versionado
**Razon**: El plan financiero NO se puede modificar despues de confirmado. Si hay refinanciacion, se crea una nueva version.
**Impacto**: Integridad financiera. Los numeros historicos nunca cambian.

### DECISION 4: Pagos como eventos, no como ediciones
**Razon**: Un pago es un hecho que ocurrio. No se edita, se reversa y se crea uno nuevo.
**Impacto**: Auditoria limpia. La caja siempre cuadra.

### DECISION 5: Stock completo desde MVP
**Razon**: El cliente escogio opcion C. Esto requiere kardex, transferencias, alertas y trazabilidad desde el dia 1.
**Impacto**: Mayor complejidad en Sprint 5, pero evita parches futuros.

### DECISION 6: Reportes hibridos (fijos + constructor)
**Razon**: Los reportes fijos cubren la operacion diaria. El constructor flexible es solo para Superadmin y Administracion.
**Impacto**: Balance entre utilidad inmediata y escalabilidad.

## 8.3 Huecos Menores Pendientes (no bloqueantes)

Estos puntos pueden resolverse durante el desarrollo sin bloquear:

1. Confirmar si Pre-lectura lleva maletin.
2. Politica exacta de devolucion para estado "caido" (de momento solo comentario + aprobacion).
3. Diseno visual high-fidelity final (el design brief esta cerrado, falta aterrizarlo en componentes).
4. Generacion documental avanzada (contratos, fichas) se posterga a post-MVP.
5. Integracion contable futura queda fuera del alcance actual.

---

# APENDICE A: CATALOGO MAESTRO DE PROGRAMAS Y PRECIOS BASE

## Programas y Niveles

| Programa | Nivel | Duracion | Garantia | Total Max |
|---|---|---|---|---|
| Pre-Kids | Nivel 1 | 3 meses | 1 mes | 4 meses |
| Pre-Kids | Nivel 2 | 3 meses | 1 mes | 4 meses |
| Kids | Nivel 1 | 3 meses | 1 mes | 4 meses |
| Kids | Nivel 2 | 3 meses | 1 mes | 4 meses |
| Kids | Nivel 3 | 3 meses | 1 mes | 4 meses |
| Pre-lectura | Nivel unico | 3 meses | 1 mes | 4 meses |
| Especializacion | Paquete unico | 6 meses | 6 meses | 12 meses |

## Tipos de Pago por Programa

| Programa | Tipos de Pago Permitidos |
|---|---|
| Pre-Kids | Contado, Contado 2 partes, Plan 2 |
| Kids | Contado, Contado 2 partes, Plan 2 |
| Pre-lectura | Contado, Contado 2 partes, Plan 2 |
| Especializacion | Contado, Contado 2 partes, Plan 3, Plan 6, Plan 9 |

## Precios Base (USD) - Tarifario Inicial

### Pre-Kids / Kids / Pre-lectura
| Tipo Pago | Costo Total | Matricula | Cuota | Cuotas |
|---|---|---|---|---|
| Contado | 500 | - | 500 | 1 |
| Contado 2 partes | 500 | - | variable | 2 |
| Plan 2 | 600 | 300 | 300 | 1 + matricula |

### Especializacion
| Tipo Pago | Costo Total | Matricula | Cuota | Cuotas |
|---|---|---|---|---|
| Contado | 1,000 | - | 1,000 | 1 |
| Contado 2 partes | 1,000 | - | variable | 2 |
| Plan 3 | 1,200 | 300 | 300 | 3 + matricula |
| Plan 6 | 1,400 | 200 | 200 | 6 + matricula |
| Plan 9 | 1,500 | 150 | 150 | 9 + matricula |

## Promociones MVP

| Promocion | Programas | Precio | Condicion |
|---|---|---|---|
| 2 Kids x 700 | Kids + Kids | 700 USD | Solo contado |
| 2 Pre-Kids x 700 | Pre-Kids + Pre-Kids | 700 USD | Solo contado |
| Pre-Kids + Kids x 700 | Pre-Kids + Kids | 700 USD | Solo contado |
| 2 Especializacion x 1700 | Especializacion + Especializacion | 1,700 USD | Solo contado |

---

# APENDICE B: MATERIALES POR PROGRAMA

### Pre-Kids Nivel 1
- Cuaderno de Diversion N1
- Lecturas de Comprension N1
- Flashcards N1

### Pre-Kids Nivel 2
- Cuaderno de Diversion N2
- Lecturas de Comprension N2
- Flashcards N2

### Kids Nivel 1
- Anillado Kids 1
- Paquete 8 libros Kids 1
- Maletin

### Kids Nivel 2
- Anillado Kids 2
- Paquete 8 libros Kids 2
- Maletin
- Veloptico Kids

### Kids Nivel 3
- Anillado Kids 3
- Paquete 8 libros Kids 3
- Maletin
- Veloptico Kids

### Pre-lectura
- Anillado Pre-lectura

### Especializacion (paquete unico, para las 4 etapas)
- Veloptico 1
- Veloptico 2
- Veloptico 3
- Modulos PRO 1ra etapa
- Modulos PRO 2da etapa
- Modulos PRO 3ra etapa
- Modulos PRO 4ta etapa
- Lectura progresiva
- Gimnasia ocular
- Maletin

---

# APENDICE C: ROLES Y PERMISOS (MATRIZ RESUMEN)

| Accion | Superadmin | Administracion | Filial | Logistica | Psicopedagogia |
|---|---|---|---|---|---|
| Gestionar usuarios/roles | SI | No* | No | No | No |
| Gestionar empresas/sedes | SI | Parcial | No | No | No |
| Gestionar catalogos | SI | SI | No | Lectura | Lectura |
| Gestionar tarifarios/promos | SI | SI | No | No | No |
| Crear matricula | SI | SI | SI | No | No |
| Confirmar matricula | SI | SI | SI | No | No |
| Editar matricula confirmada | SI | SI | Parcial | No | No |
| Aprobar caida/traslado | SI | SI | No | No | No |
| Ver cartera | SI | SI | Solo sede | No | Lectura |
| Registrar pago | SI | SI | SI | No | No |
| Crear refinanciacion | SI | SI | Solicitud | No | No |
| Cerrar caja | SI | SI | No | No | No |
| Reabrir caja | SI | No** | No | No | No |
| Ejecutar verificacion | SI | SI | SI | SI*** | No |
| Gestionar stock | SI | SI | No | SI | No |
| Seguimiento psicopedagogico | SI | Parcial | No | No | SI |
| Gestionar personal | SI | SI | No | No | No |
| Generar/exportar reportes | SI | SI | No | No | No |
| Ver auditoria | SI | Parcial | No | No | No |

\* Administracion puede recibir este permiso por configuracion especial.
\*\* Administracion puede recibir reapertura por permiso especial.
\*\*\* Logistica solo ejecuta la parte de materiales/entrega, no datos financieros.

---

*Este documento constituye la fuente de verdad para el desarrollo del Sistema ENSIL. Toda implementacion debe respetar las reglas, estructuras y decisiones aqui documentadas. Los huecos menores identificados deben resolverse antes de cerrar el modulo correspondiente, pero no bloquean el inicio del desarrollo.*
