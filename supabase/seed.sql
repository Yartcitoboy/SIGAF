-- ============================================================
--  SEED - Datos iniciales de SIGAF
--  Replica los datos de demostración (farmacia FarmaVence).
--  Ejecutar DESPUÉS de 001_initial_schema.sql
-- ============================================================

-- Limpieza previa (por si se re-ejecuta). Respeta el orden inverso de dependencias.
TRUNCATE TABLE notificacion, movimiento_inventario, merma, inventario, lote,
               producto, categoria, bodega, sucursal, usuario, farmacia, perfil
RESTART IDENTITY CASCADE;

-- ------------------------------------------------------------
-- 1. PERFILES
-- ------------------------------------------------------------
INSERT INTO perfil (id_perfil, nombre, descripcion) OVERRIDING SYSTEM VALUE VALUES
    (1, 'ADMIN', 'Acceso total y configuración'),
    (2, 'BODEGUERO', 'Gestión de lotes y recepción'),
    (3, 'AUXILIAR', 'Consulta de stock y FEFO');

-- ------------------------------------------------------------
-- 2. FARMACIA
-- ------------------------------------------------------------
INSERT INTO farmacia (id_farmacia, razon_social, rut, direccion) OVERRIDING SYSTEM VALUE VALUES
    (1, 'Farmacia FarmaVence SpA', '76.892.451-K', 'Av. Libertador Bernardo O''Higgins 1450, Santiago');

-- ------------------------------------------------------------
-- 3. SUCURSALES
-- ------------------------------------------------------------
INSERT INTO sucursal (id_sucursal, nombre, direccion, id_farmacia) OVERRIDING SYSTEM VALUE VALUES
    (1, 'Sucursal Central (Santiago Centro)', 'Av. Libertador Bernardo O''Higgins 1450', 1),
    (2, 'Sucursal Providencia', 'Av. Providencia 2150', 1),
    (3, 'Sucursal Maipú', 'Pajaritos 3200', 1);

-- ------------------------------------------------------------
-- 4. BODEGAS
-- ------------------------------------------------------------
INSERT INTO bodega (id_bodega, nombre, ubicacion, id_sucursal) OVERRIDING SYSTEM VALUE VALUES
    (1, 'Bodega Central - Estantería A (Fríos)', 'Pasillo 1 - Sector Refrigerado', 1),
    (2, 'Bodega Central - Estantería B (Secos)', 'Pasillo 2 - Nivel Medio', 1),
    (3, 'Sala de Ventas - Vitrina Prioritaria', 'Punto de Atención al Público', 1);

-- ------------------------------------------------------------
-- 5. USUARIOS (UUID fijos para mantener las referencias)
-- ------------------------------------------------------------
-- NOTA: password_hash de ejemplo. En producción se gestiona con Supabase Auth.
INSERT INTO usuario (id_usuario, nombre, email, password_hash, id_perfil, id_sucursal, activo) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Carlos Carrasco (Administrador)', 'admin@farmavence.cl', '$2a$10$demohashadmin', 1, 1, TRUE),
    ('00000000-0000-0000-0000-000000000002', 'Rodrigo Méndez (Encargado Bodega)', 'bodega@farmavence.cl', '$2a$10$demohashbodega', 2, 1, TRUE),
    ('00000000-0000-0000-0000-000000000003', 'Camila Soto (Auxiliar Farmacia)', 'cajero@farmavence.cl', '$2a$10$demohashcajero', 3, 1, TRUE);

-- ------------------------------------------------------------
-- 6. CATEGORÍAS
-- ------------------------------------------------------------
INSERT INTO categoria (id_categoria, nombre, descripcion) OVERRIDING SYSTEM VALUE VALUES
    (1, 'Analgésicos y Antiinflamatorios', 'Tratamiento del dolor y la inflamación'),
    (2, 'Antibióticos y Antimicrobianos', 'Infecciones bacterianas bajo receta médica'),
    (3, 'Cardiovasculares', 'Tratamiento de hipertensión y afecciones cardíacas'),
    (4, 'Antihistamínicos', 'Tratamiento de alergias y cuadros respiratorios'),
    (5, 'Gastrointestinales', 'Protectores gástricos y digestivos');

-- ------------------------------------------------------------
-- 7. PRODUCTOS
-- ------------------------------------------------------------
INSERT INTO producto (id_producto, codigo_barras, nombre, descripcion, unidad_medida, id_categoria) OVERRIDING SYSTEM VALUE VALUES
    (1, '7801234567890', 'Paracetamol 500 mg', 'Comprimidos - Laboratorio Chile', 'Caja x 16 comp', 1),
    (2, '7802345678901', 'Amoxicilina 500 mg', 'Cápsulas - Laboratorio Mintlab', 'Caja x 21 cáps', 2),
    (3, '7803456789012', 'Losartán Potásico 50 mg', 'Comprimidos recubiertos - Laboratorio Saval', 'Caja x 30 comp', 3),
    (4, '7804567890123', 'Loratadina 10 mg', 'Comprimidos - Laboratorio Andrómaco', 'Caja x 10 comp', 4),
    (5, '7805678901234', 'Ibuprofeno 400 mg', 'Cápsulas blandas - Laboratorio Bagó', 'Caja x 20 cáps', 1),
    (6, '7806789012345', 'Omeprazol 20 mg', 'Cápsulas gastroresistentes - Laboratorio Mintlab', 'Caja x 28 cáps', 5),
    (7, '7807890123456', 'Ciprofloxacino 500 mg', 'Comprimidos - Laboratorio Chile', 'Caja x 10 comp', 2),
    (8, '7808901234567', 'Salbutamol 100 mcg', 'Aerosol para inhalación 200 dosis - GlaxoSmithKline', 'Frasco aerosol', 4);

-- ------------------------------------------------------------
-- 8. LOTES
-- ------------------------------------------------------------
INSERT INTO lote (id_lote, numero_lote, fecha_vencimiento, fecha_ingreso, id_producto) OVERRIDING SYSTEM VALUE VALUES
    (1, 'L-2023-V99', '2026-09-15', '2025-09-15', 1),
    (2, 'L-2024-AM01', '2026-09-22', '2025-10-10', 2),
    (3, 'L-2024-LOS77', '2026-10-25', '2025-11-01', 3),
    (4, 'L-2025-LOR14', '2026-11-15', '2025-12-05', 4),
    (5, 'L-2025-IBU88', '2026-12-01', '2026-01-10', 5),
    (6, 'L-2025-OME33', '2026-12-20', '2026-02-15', 6),
    (7, 'L-2026-PAR02', '2027-04-30', '2026-04-01', 1),
    (8, 'L-2026-CIP55', '2027-06-15', '2026-05-10', 7),
    (9, 'L-2026-SAL90', '2027-08-20', '2026-06-01', 8);

-- ------------------------------------------------------------
-- 9. INVENTARIO (stock por lote y bodega)
-- ------------------------------------------------------------
INSERT INTO inventario (id_inventario, id_lote, id_bodega, stock_actual, estado_semaforo) OVERRIDING SYSTEM VALUE VALUES
    (1, 1, 2, 35, 'VENCIDO'),
    (2, 2, 1, 20, 'VENCIDO'),
    (3, 3, 3, 50, 'ROJO'),
    (4, 4, 3, 75, 'AMARILLO'),
    (5, 5, 2, 120, 'AMARILLO'),
    (6, 6, 2, 90, 'AMARILLO'),
    (7, 7, 2, 450, 'VERDE'),
    (8, 8, 1, 180, 'VERDE'),
    (9, 9, 3, 110, 'VERDE');

-- ------------------------------------------------------------
-- 10. MOVIMIENTOS DE INVENTARIO
-- ------------------------------------------------------------
INSERT INTO movimiento_inventario (id_movimiento, id_inventario, id_usuario, tipo_movimiento, cantidad, fecha) OVERRIDING SYSTEM VALUE VALUES
    (1, 7, '00000000-0000-0000-0000-000000000002', 'ENTRADA', 450, '2026-09-24 10:30:00'),
    (2, 3, '00000000-0000-0000-0000-000000000003', 'SALIDA', 2, '2026-09-26 15:45:00'),
    (3, 1, '00000000-0000-0000-0000-000000000001', 'MERMA', 35, '2026-09-26 18:20:00'),
    (4, 4, '00000000-0000-0000-0000-000000000001', 'TRASLADO', 30, '2026-09-25 11:15:00');

-- ------------------------------------------------------------
-- 11. MERMA (baja del lote vencido)
-- ------------------------------------------------------------
INSERT INTO merma (id_merma, id_inventario, id_usuario, motivo, cantidad, fecha_baja) OVERRIDING SYSTEM VALUE VALUES
    (1, 1, '00000000-0000-0000-0000-000000000001', 'VENCIMIENTO', 35, '2026-09-26');

-- ------------------------------------------------------------
-- 12. NOTIFICACIONES
-- ------------------------------------------------------------
INSERT INTO notificacion (id_notificacion, id_usuario, tipo, mensaje, fecha_envio, estado) OVERRIDING SYSTEM VALUE VALUES
    (1, '00000000-0000-0000-0000-000000000001', 'CADUCIDAD', 'LOTE VENCIDO: Paracetamol 500mg (L-2023-V99) caducó el 15/09/2026. Requiere retiro inmediato a mermas.', '2026-09-26 00:00:00', 'PENDIENTE'),
    (2, '00000000-0000-0000-0000-000000000001', 'CADUCIDAD', 'LOTE VENCIDO: Amoxicilina 500mg (L-2024-AM01) caducó el 22/09/2026. Dispensación bloqueada.', '2026-09-26 00:00:00', 'PENDIENTE'),
    (3, '00000000-0000-0000-0000-000000000001', 'CADUCIDAD', 'ALERTA PREVENTIVA: Losartán 50mg vence en 28 días (L-2024-LOS77). Priorizar salida por FEFO.', '2026-09-26 00:00:00', 'LEIDO'),
    (4, '00000000-0000-0000-0000-000000000001', 'CADUCIDAD', 'AVISO AMARILLO: Loratadina 10mg vence en 49 días (L-2025-LOR14). Stock: 75 unidades.', '2026-09-25 00:00:00', 'LEIDO');

-- ------------------------------------------------------------
-- Ajuste de secuencias (para que los próximos INSERT con SERIAL
-- continúen desde el último id insertado).
-- ------------------------------------------------------------
SELECT setval('perfil_id_perfil_seq', (SELECT MAX(id_perfil) FROM perfil));
SELECT setval('farmacia_id_farmacia_seq', (SELECT MAX(id_farmacia) FROM farmacia));
SELECT setval('sucursal_id_sucursal_seq', (SELECT MAX(id_sucursal) FROM sucursal));
SELECT setval('bodega_id_bodega_seq', (SELECT MAX(id_bodega) FROM bodega));
SELECT setval('categoria_id_categoria_seq', (SELECT MAX(id_categoria) FROM categoria));
SELECT setval('producto_id_producto_seq', (SELECT MAX(id_producto) FROM producto));
SELECT setval('lote_id_lote_seq', (SELECT MAX(id_lote) FROM lote));
SELECT setval('inventario_id_inventario_seq', (SELECT MAX(id_inventario) FROM inventario));
SELECT setval('movimiento_inventario_id_movimiento_seq', (SELECT MAX(id_movimiento) FROM movimiento_inventario));
SELECT setval('merma_id_merma_seq', (SELECT MAX(id_merma) FROM merma));
SELECT setval('notificacion_id_notificacion_seq', (SELECT MAX(id_notificacion) FROM notificacion));
