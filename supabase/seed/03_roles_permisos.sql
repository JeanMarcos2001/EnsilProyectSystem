-- Seed: Roles del sistema
INSERT INTO rol (nombre, descripcion) VALUES
  ('superadmin',      'Acceso total al sistema, todas las sedes'),
  ('administracion',  'Gestión de matrículas, cartera, reportes en sedes asignadas'),
  ('filial',          'Operaciones de matrícula y caja en su sede'),
  ('logistica',       'Stock, verificación y materiales'),
  ('psicopedagogia',  'Seguimiento académico y cronogramas');

-- Permisos por módulo
INSERT INTO permiso (codigo, modulo, descripcion) VALUES
  -- Configuración
  ('config.empresas.ver',     'configuracion', 'Ver empresas y filiales'),
  ('config.empresas.editar',  'configuracion', 'Editar empresas y filiales'),
  ('config.usuarios.ver',     'configuracion', 'Ver usuarios'),
  ('config.usuarios.crear',   'configuracion', 'Crear usuarios'),
  ('config.usuarios.editar',  'configuracion', 'Editar usuarios'),
  -- Catálogos
  ('catalogos.ver',           'catalogos', 'Ver catálogos'),
  ('catalogos.editar',        'catalogos', 'Crear y editar catálogos'),
  -- Matrículas
  ('matriculas.ver',          'matriculas', 'Ver matrículas'),
  ('matriculas.crear',        'matriculas', 'Crear matrículas'),
  ('matriculas.anular',       'matriculas', 'Anular matrículas'),
  ('matriculas.trasladar',    'matriculas', 'Solicitar traslado'),
  -- Cartera
  ('cartera.ver',             'cartera', 'Ver cartera'),
  ('cartera.pagar',           'cartera', 'Registrar pagos'),
  ('cartera.refinanciar',     'cartera', 'Solicitar refinanciación'),
  ('cartera.suspender',       'cartera', 'Suspender/caída'),
  -- Caja
  ('caja.ver',                'caja', 'Ver movimientos de caja'),
  ('caja.registrar',          'caja', 'Registrar movimientos'),
  ('caja.cerrar',             'caja', 'Cerrar caja'),
  ('caja.reabrir',            'caja', 'Solicitar reapertura de caja'),
  -- Stock
  ('stock.ver',               'stock', 'Ver stock'),
  ('stock.ingresar',          'stock', 'Ingresar stock'),
  ('stock.transferir',        'stock', 'Solicitar transferencias'),
  ('stock.ajustar',           'stock', 'Ajustes de stock'),
  -- Verificación
  ('verificacion.ver',        'verificacion', 'Ver verificaciones'),
  ('verificacion.realizar',   'verificacion', 'Realizar verificación de materiales'),
  -- Psicopedagogía
  ('psico.ver',               'psicopedagogia', 'Ver panel psicopedagógico'),
  ('psico.seguimiento',       'psicopedagogia', 'Registrar seguimiento'),
  ('psico.cronograma',        'psicopedagogia', 'Gestionar cronograma'),
  -- Personal
  ('personal.ver',            'personal', 'Ver personal'),
  ('personal.editar',         'personal', 'Editar personal'),
  -- Reportes
  ('reportes.ver',            'reportes', 'Ver reportes disponibles'),
  ('reportes.exportar',       'reportes', 'Exportar reportes'),
  ('reportes.constructor',    'reportes', 'Usar constructor de reportes'),
  -- Auditoría
  ('auditoria.ver',           'auditoria', 'Ver log de auditoría'),
  -- Aprobaciones
  ('aprobaciones.ver',        'aprobaciones', 'Ver bandeja de aprobaciones'),
  ('aprobaciones.aprobar',    'aprobaciones', 'Aprobar o rechazar solicitudes');

-- Asignar permisos a roles
-- Superadmin: todos los permisos
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT
  (SELECT id FROM rol WHERE nombre = 'superadmin'),
  id
FROM permiso;

-- Administración
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT
  (SELECT id FROM rol WHERE nombre = 'administracion'),
  id
FROM permiso
WHERE codigo IN (
  'catalogos.ver',
  'matriculas.ver','matriculas.crear','matriculas.anular','matriculas.trasladar',
  'cartera.ver','cartera.pagar','cartera.refinanciar','cartera.suspender',
  'caja.ver','caja.registrar','caja.cerrar','caja.reabrir',
  'stock.ver',
  'verificacion.ver',
  'psico.ver',
  'personal.ver',
  'reportes.ver','reportes.exportar',
  'aprobaciones.ver','aprobaciones.aprobar'
);

-- Filial
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT
  (SELECT id FROM rol WHERE nombre = 'filial'),
  id
FROM permiso
WHERE codigo IN (
  'catalogos.ver',
  'matriculas.ver','matriculas.crear',
  'cartera.ver','cartera.pagar',
  'caja.ver','caja.registrar',
  'stock.ver',
  'verificacion.ver','verificacion.realizar',
  'psico.ver',
  'reportes.ver'
);

-- Logística
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT
  (SELECT id FROM rol WHERE nombre = 'logistica'),
  id
FROM permiso
WHERE codigo IN (
  'catalogos.ver',
  'matriculas.ver',
  'stock.ver','stock.ingresar','stock.transferir','stock.ajustar',
  'verificacion.ver','verificacion.realizar',
  'reportes.ver'
);

-- Psicopedagogía
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT
  (SELECT id FROM rol WHERE nombre = 'psicopedagogia'),
  id
FROM permiso
WHERE codigo IN (
  'matriculas.ver',
  'psico.ver','psico.seguimiento','psico.cronograma',
  'reportes.ver'
);
