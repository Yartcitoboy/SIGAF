-- ============================================================
--  SEED AMPLIADO - Datos adicionales de SIGAF
--  Agrega productos, lotes, inventario y movimientos nuevos
--  para duplicar el volumen de datos de demostración.
--  Ejecutar DESPUÉS de 001_initial_schema.sql y seed.sql
-- ============================================================

-- ------------------------------------------------------------
-- CATEGORÍAS ADICIONALES
-- ------------------------------------------------------------
INSERT INTO categoria (id_categoria, nombre, descripcion) OVERRIDING SYSTEM VALUE VALUES
    (6, 'Antidiabéticos', 'Control de glicemia y diabetes'),
    (7, 'Vitaminas y Suplementos', 'Suplementos nutricionales y vitamínicos'),
    (8, 'Dermatológicos', 'Tratamientos tópicos para la piel');

-- ------------------------------------------------------------
-- PRODUCTOS ADICIONALES (del 9 al 16) - productos reales
-- ------------------------------------------------------------
INSERT INTO producto (id_producto, codigo_barras, nombre, descripcion, unidad_medida, id_categoria) OVERRIDING SYSTEM VALUE VALUES
    (9,  '7809012345678', 'Metformina 850 mg', 'Comprimidos recubiertos - Laboratorio Saval', 'Caja x 30 comp', 6),
    (10, '7810123456789', 'Atorvastatina 20 mg', 'Comprimidos - Laboratorio Chile', 'Caja x 30 comp', 3),
    (11, '7811234567890', 'Vitamina C 1000 mg', 'Comprimidos efervescentes - Laboratorio Bayer', 'Tubo x 20 comp', 7),
    (12, '7812345678901', 'Clorfenamina 4 mg', 'Comprimidos - Laboratorio Andrómaco', 'Caja x 20 comp', 4),
    (13, '7813456789012', 'Diclofenaco 50 mg', 'Comprimidos recubiertos - Laboratorio Bagó', 'Caja x 20 comp', 1),
    (14, '7814567890123', 'Enalapril 10 mg', 'Comprimidos - Laboratorio Mintlab', 'Caja x 30 comp', 3),
    (15, '7815678901234', 'Ranitidina 300 mg', 'Comprimidos - Laboratorio Chile', 'Caja x 20 comp', 5),
    (16, '7816789012345', 'Betametasona Crema 0.1%', 'Crema tópica - Laboratorio Saval', 'Pomo x 30 g', 8);

-- ------------------------------------------------------------
-- LOTES ADICIONALES (del 10 al 19)
-- Variedad de estados: vencidos, críticos, amarillos, verdes
-- Fechas de referencia: "hoy" ~ sept 2026 (coherente con el seed original)
-- ------------------------------------------------------------
INSERT INTO lote (id_lote, numero_lote, fecha_vencimiento, fecha_ingreso, id_producto) OVERRIDING SYSTEM VALUE VALUES
    -- Vencidos
    (10, 'L-2024-MET10', '2026-09-10', '2025-09-01', 9),
    (11, 'L-2024-ATO21', '2026-09-18', '2025-10-05', 10),
    -- Críticos (<30 días)
    (12, 'L-2025-VIT30', '2026-10-10', '2025-11-20', 11),
    (13, 'L-2025-CLO42', '2026-10-18', '2025-12-01', 12),
    -- Amarillos (30-90 días)
    (14, 'L-2025-DIC55', '2026-11-20', '2026-01-15', 13),
    (15, 'L-2025-ENA61', '2026-12-10', '2026-02-20', 14),
    -- Verdes (>90 días)
    (16, 'L-2026-RAN73', '2027-05-15', '2026-04-10', 15),
    (17, 'L-2026-BET80', '2027-07-01', '2026-05-05', 16),
    (18, 'L-2026-MET91', '2027-09-30', '2026-06-15', 9),
    (19, 'L-2026-ATO99', '2027-11-20', '2026-07-01', 10);

-- ------------------------------------------------------------
-- INVENTARIO ADICIONAL (del 10 al 19)
-- ------------------------------------------------------------
INSERT INTO inventario (id_inventario, id_lote, id_bodega, stock_actual, estado_semaforo) OVERRIDING SYSTEM VALUE VALUES
    (10, 10, 2, 40,  'VENCIDO'),
    (11, 11, 1, 25,  'VENCIDO'),
    (12, 12, 3, 60,  'ROJO'),
    (13, 13, 3, 85,  'ROJO'),
    (14, 14, 2, 100, 'AMARILLO'),
    (15, 15, 2, 70,  'AMARILLO'),
    (16, 16, 1, 200, 'VERDE'),
    (17, 17, 3, 95,  'VERDE'),
    (18, 18, 2, 320, 'VERDE'),
    (19, 19, 1, 150, 'VERDE');

-- ------------------------------------------------------------
-- MOVIMIENTOS ADICIONALES (del 5 al 10)
-- ------------------------------------------------------------
INSERT INTO movimiento_inventario (id_movimiento, id_inventario, id_usuario, tipo_movimiento, cantidad, fecha) OVERRIDING SYSTEM VALUE VALUES
    (5,  16, '00000000-0000-0000-0000-000000000002', 'ENTRADA',  200, '2026-09-20 09:15:00'),
    (6,  18, '00000000-0000-0000-0000-000000000002', 'ENTRADA',  320, '2026-09-21 10:40:00'),
    (7,  12, '00000000-0000-0000-0000-000000000003', 'SALIDA',   5,   '2026-09-26 12:10:00'),
    (8,  10, '00000000-0000-0000-0000-000000000001', 'MERMA',    40,  '2026-09-26 17:00:00'),
    (9,  11, '00000000-0000-0000-0000-000000000001', 'MERMA',    25,  '2026-09-26 17:05:00'),
    (10, 15, '00000000-0000-0000-0000-000000000001', 'TRASLADO', 20,  '2026-09-25 14:30:00');

-- ------------------------------------------------------------
-- MERMAS ADICIONALES (del 2 al 3)
-- ------------------------------------------------------------
INSERT INTO merma (id_merma, id_inventario, id_usuario, motivo, cantidad, fecha_baja) OVERRIDING SYSTEM VALUE VALUES
    (2, 10, '00000000-0000-0000-0000-000000000001', 'VENCIMIENTO', 40, '2026-09-26'),
    (3, 11, '00000000-0000-0000-0000-000000000001', 'VENCIMIENTO', 25, '2026-09-26');

-- ------------------------------------------------------------
-- NOTIFICACIONES ADICIONALES (del 5 al 8)
-- ------------------------------------------------------------
INSERT INTO notificacion (id_notificacion, id_usuario, tipo, mensaje, fecha_envio, estado) OVERRIDING SYSTEM VALUE VALUES
    (5, '00000000-0000-0000-0000-000000000001', 'CADUCIDAD', 'LOTE VENCIDO: Metformina 850mg (L-2024-MET10) caducó el 10/09/2026. Retiro urgente a mermas.', '2026-09-26 00:00:00', 'PENDIENTE'),
    (6, '00000000-0000-0000-0000-000000000001', 'CADUCIDAD', 'LOTE VENCIDO: Atorvastatina 20mg (L-2024-ATO21) caducó el 18/09/2026. Dispensación bloqueada.', '2026-09-26 00:00:00', 'PENDIENTE'),
    (7, '00000000-0000-0000-0000-000000000001', 'CADUCIDAD', 'ALERTA CRÍTICA: Vitamina C 1000mg vence en 14 días (L-2025-VIT30). Priorizar salida FEFO.', '2026-09-26 00:00:00', 'LEIDO'),
    (8, '00000000-0000-0000-0000-000000000001', 'STOCK', 'STOCK BAJO: Clorfenamina 4mg con rotación lenta próxima a vencer (L-2025-CLO42).', '2026-09-25 00:00:00', 'LEIDO');

-- ------------------------------------------------------------
-- Ajuste de secuencias para que los próximos INSERT continúen bien
-- ------------------------------------------------------------
SELECT setval('categoria_id_categoria_seq', (SELECT MAX(id_categoria) FROM categoria));
SELECT setval('producto_id_producto_seq', (SELECT MAX(id_producto) FROM producto));
SELECT setval('lote_id_lote_seq', (SELECT MAX(id_lote) FROM lote));
SELECT setval('inventario_id_inventario_seq', (SELECT MAX(id_inventario) FROM inventario));
SELECT setval('movimiento_inventario_id_movimiento_seq', (SELECT MAX(id_movimiento) FROM movimiento_inventario));
SELECT setval('merma_id_merma_seq', (SELECT MAX(id_merma) FROM merma));
SELECT setval('notificacion_id_notificacion_seq', (SELECT MAX(id_notificacion) FROM notificacion));
