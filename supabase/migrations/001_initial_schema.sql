-- ============================================================
--  MODELO DE DATOS - SIGAF / SIGAC
--  Sistema Inteligente de Gestion y Alerta de Caducidad
--  Motor: PostgreSQL (Supabase)
--  Basado en el ERS y los Casos de Uso (Entrega Fase 1)
--  Migracion inicial: 13 tablas + indices + funciones RPC
-- ============================================================

-- ------------------------------------------------------------
-- 1. SEGURIDAD Y ORGANIZACION
-- ------------------------------------------------------------

CREATE TABLE perfil (
    id_perfil     SERIAL PRIMARY KEY,
    nombre        VARCHAR(50)  NOT NULL,        -- ADMIN, BODEGUERO, AUXILIAR
    descripcion   VARCHAR(200)
);

CREATE TABLE farmacia (
    id_farmacia   SERIAL PRIMARY KEY,
    razon_social  VARCHAR(150) NOT NULL,
    rut           VARCHAR(15)  NOT NULL UNIQUE,
    direccion     VARCHAR(200)
);

CREATE TABLE sucursal (
    id_sucursal   SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    direccion     VARCHAR(200),
    id_farmacia   INT NOT NULL REFERENCES farmacia(id_farmacia)
);

CREATE TABLE bodega (
    id_bodega     SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    ubicacion     VARCHAR(150),
    id_sucursal   INT NOT NULL REFERENCES sucursal(id_sucursal)
);

CREATE TABLE usuario (
    id_usuario    UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- vinculado a auth.users de Supabase
    nombre        VARCHAR(120) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,                       -- Bcrypt (RNF seguridad)
    id_perfil     INT  NOT NULL REFERENCES perfil(id_perfil),
    id_sucursal   INT  REFERENCES sucursal(id_sucursal),
    activo        BOOLEAN NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- 2. PRODUCTOS
-- ------------------------------------------------------------

CREATE TABLE categoria (
    id_categoria  SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    descripcion   VARCHAR(200)
);

CREATE TABLE producto (
    id_producto   SERIAL PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE,
    nombre        VARCHAR(150) NOT NULL,
    descripcion   VARCHAR(250),
    unidad_medida VARCHAR(30),          -- comprimido, mL, caja, unidad
    id_categoria  INT NOT NULL REFERENCES categoria(id_categoria)
);

-- ------------------------------------------------------------
-- 3. INVENTARIO Y FEFO
-- ------------------------------------------------------------

CREATE TABLE lote (
    id_lote           SERIAL PRIMARY KEY,
    numero_lote       VARCHAR(50) NOT NULL,
    fecha_vencimiento DATE NOT NULL,          -- clave del FEFO
    fecha_ingreso     DATE NOT NULL DEFAULT CURRENT_DATE,
    id_producto       INT NOT NULL REFERENCES producto(id_producto)
);

CREATE TABLE inventario (
    id_inventario   SERIAL PRIMARY KEY,
    id_lote         INT NOT NULL REFERENCES lote(id_lote),
    id_bodega       INT NOT NULL REFERENCES bodega(id_bodega),
    stock_actual    INT NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    estado_semaforo VARCHAR(15) DEFAULT 'VERDE'   -- VERDE, AMARILLO, ROJO, VENCIDO
);

CREATE TABLE movimiento_inventario (
    id_movimiento   SERIAL PRIMARY KEY,
    id_inventario   INT  NOT NULL REFERENCES inventario(id_inventario),
    id_usuario      UUID NOT NULL REFERENCES usuario(id_usuario),
    tipo_movimiento VARCHAR(20) NOT NULL
        CHECK (tipo_movimiento IN ('ENTRADA', 'SALIDA', 'AJUSTE', 'MERMA', 'TRASLADO')),
    cantidad        INT NOT NULL,
    fecha           TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE merma (
    id_merma      SERIAL PRIMARY KEY,
    id_inventario INT  NOT NULL REFERENCES inventario(id_inventario),
    id_usuario    UUID NOT NULL REFERENCES usuario(id_usuario),
    motivo        VARCHAR(100) NOT NULL,      -- VENCIMIENTO, DETERIORO, DEVOLUCION
    cantidad      INT NOT NULL,
    fecha_baja    DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ------------------------------------------------------------
-- 4. ALERTAS Y REPORTES
-- ------------------------------------------------------------

CREATE TABLE notificacion (
    id_notificacion SERIAL PRIMARY KEY,
    id_usuario      UUID NOT NULL REFERENCES usuario(id_usuario),
    tipo            VARCHAR(30)               -- CADUCIDAD, STOCK, SISTEMA
        CHECK (tipo IN ('CADUCIDAD', 'STOCK', 'SISTEMA')),
    mensaje         TEXT,
    fecha_envio     TIMESTAMP NOT NULL DEFAULT now(),
    estado          VARCHAR(20) DEFAULT 'ENVIADO'   -- ENVIADO, PENDIENTE, ERROR, LEIDO
        CHECK (estado IN ('ENVIADO', 'PENDIENTE', 'ERROR', 'LEIDO'))
);

CREATE TABLE reporte (
    id_reporte       SERIAL PRIMARY KEY,
    id_usuario       UUID NOT NULL REFERENCES usuario(id_usuario),
    tipo             VARCHAR(30),             -- MERMAS, ROTACION, INVENTARIO
    formato          VARCHAR(10),             -- PDF, XLS
    fecha_generacion TIMESTAMP NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 5. INDICES (rendimiento < 2 seg y soporte FEFO)
-- ------------------------------------------------------------

CREATE INDEX idx_lote_vencimiento  ON lote(fecha_vencimiento);
CREATE INDEX idx_lote_producto     ON lote(id_producto);
CREATE INDEX idx_inv_lote          ON inventario(id_lote);
CREATE INDEX idx_inv_bodega        ON inventario(id_bodega);
CREATE INDEX idx_prod_codigo       ON producto(codigo_barras);
CREATE INDEX idx_mov_inventario    ON movimiento_inventario(id_inventario);

-- ------------------------------------------------------------
-- 6. FUNCION FEFO (lote a despachar primero por producto/bodega)
--    First Expired, First Out: entrega el lote con vencimiento
--    mas proximo que aun tenga stock y no este vencido.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_fefo_siguiente_lote(
    p_id_producto INT,
    p_id_bodega   INT
)
RETURNS TABLE (
    id_inventario     INT,
    id_lote           INT,
    numero_lote       VARCHAR,
    fecha_vencimiento DATE,
    stock_actual      INT
)
LANGUAGE sql
AS $$
    SELECT i.id_inventario, l.id_lote, l.numero_lote,
           l.fecha_vencimiento, i.stock_actual
    FROM inventario i
    JOIN lote l ON l.id_lote = i.id_lote
    WHERE l.id_producto = p_id_producto
      AND i.id_bodega   = p_id_bodega
      AND i.stock_actual > 0
      AND l.fecha_vencimiento >= CURRENT_DATE   -- bloqueo sanitario: no despacha vencidos
    ORDER BY l.fecha_vencimiento ASC            -- el que vence primero, sale primero
    LIMIT 1;
$$;

-- ------------------------------------------------------------
-- 7. FUNCION SEMAFORO (clasifica estado por dias a vencer)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_estado_semaforo(p_fecha_venc DATE)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
    dias INT;
BEGIN
    dias := p_fecha_venc - CURRENT_DATE;
    IF dias < 0 THEN
        RETURN 'VENCIDO';
    ELSIF dias <= 7 THEN
        RETURN 'ROJO';
    ELSIF dias <= 30 THEN
        RETURN 'AMARILLO';
    ELSE
        RETURN 'VERDE';
    END IF;
END;
$$;
