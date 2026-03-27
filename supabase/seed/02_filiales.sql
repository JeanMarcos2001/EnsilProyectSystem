-- Seed: Filiales ENSIL
-- Nota: los empresa_id se resuelven por razon_social

INSERT INTO filial (empresa_id, nombre, ciudad) VALUES
  -- ENSIL INT
  ((SELECT id FROM empresa WHERE ruc = '20612421243'), 'Huancayo',  'Huancayo'),
  ((SELECT id FROM empresa WHERE ruc = '20612421243'), 'Puno',      'Puno'),
  ((SELECT id FROM empresa WHERE ruc = '20612421243'), 'Ica',       'Ica'),
  ((SELECT id FROM empresa WHERE ruc = '20612421243'), 'Huaraz',    'Huaraz'),
  ((SELECT id FROM empresa WHERE ruc = '20612421243'), 'Ayacucho',  'Ayacucho'),
  -- ENSIL EVOLUTION (Juliaca)
  ((SELECT id FROM empresa WHERE ruc = '20612459313'), 'Juliaca Bolivar', 'Juliaca'),
  -- ENSIL DE LAS AMERICAS TACNA
  ((SELECT id FROM empresa WHERE ruc = '20533093133'), 'Tacna',          'Tacna'),
  ((SELECT id FROM empresa WHERE ruc = '20533093133'), 'Cusco Marcavalle','Cusco'),
  -- ENSIL EVOLUTION (otras sedes, mismo RUC 20533093133 según planificación)
  ((SELECT id FROM empresa WHERE ruc = '20533093133'), 'Piura',      'Piura'),
  ((SELECT id FROM empresa WHERE ruc = '20533093133'), 'Chiclayo',   'Chiclayo'),
  ((SELECT id FROM empresa WHERE ruc = '20533093133'), 'Cajamarca',  'Cajamarca'),
  ((SELECT id FROM empresa WHERE ruc = '20533093133'), 'Arequipa',   'Arequipa'),
  ((SELECT id FROM empresa WHERE ruc = '20533093133'), 'San Isidro', 'Lima'),
  -- ENSIL REVOLUTION
  ((SELECT id FROM empresa WHERE ruc = '20614185229'), 'Cusco Magisterio', 'Cusco'),
  -- SILEE
  ((SELECT id FROM empresa WHERE ruc = '20610010289'), 'Trujillo',  'Trujillo'),
  ((SELECT id FROM empresa WHERE ruc = '20610010289'), 'Los Olivos', 'Lima');
