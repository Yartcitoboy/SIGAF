/**
 * Definición de tipos de TypeScript basados en el Modelo de Datos SIGAF (13 entidades)
 * Motor: PostgreSQL sobre Supabase
 */

export type EstadoSemaforo = 'VERDE' | 'AMARILLO' | 'ROJO' | 'VENCIDO';
export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';
export type MotivoMerma = 'VENCIMIENTO' | 'DETERIORO' | 'DEVOLUCION';
export type TipoNotificacion = 'CADUCIDAD' | 'STOCK' | 'SISTEMA';
export type EstadoNotificacion = 'ENVIADO' | 'PENDIENTE' | 'ERROR' | 'LEIDO';
export type TipoReporte = 'MERMAS' | 'ROTACION' | 'INVENTARIO';
export type FormatoReporte = 'PDF' | 'XLS';
export type RolPerfil = 'ADMIN' | 'BODEGUERO' | 'AUXILIAR';

export interface Perfil {
  id_perfil: number;
  nombre: RolPerfil | string;
  descripcion: string | null;
}

export interface Usuario {
  id_usuario: string; // UUID
  nombre: string;
  email: string;
  password_hash?: string;
  id_perfil: number;
  id_sucursal: number | null;
  activo: boolean;
  perfil?: Perfil;
  sucursal?: Sucursal;
}

export interface Farmacia {
  id_farmacia: number;
  razon_social: string;
  rut: string;
  direccion: string | null;
}

export interface Sucursal {
  id_sucursal: number;
  nombre: string;
  direccion: string | null;
  id_farmacia: number;
  farmacia?: Farmacia;
}

export interface Bodega {
  id_bodega: number;
  nombre: string;
  ubicacion: string | null;
  id_sucursal: number;
  sucursal?: Sucursal;
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
}

export interface Producto {
  id_producto: number;
  codigo_barras: string | null;
  nombre: string;
  descripcion: string | null;
  unidad_medida: string | null;
  id_categoria: number;
  categoria?: Categoria;
}

export interface Lote {
  id_lote: number;
  numero_lote: string;
  fecha_vencimiento: string; // DATE (YYYY-MM-DD)
  fecha_ingreso: string; // DATE (YYYY-MM-DD)
  id_producto: number;
  producto?: Producto;
}

export interface Inventario {
  id_inventario: number;
  id_lote: number;
  id_bodega: number;
  stock_actual: number;
  estado_semaforo: EstadoSemaforo | string | null;
  lote?: Lote;
  bodega?: Bodega;
}

export interface MovimientoInventario {
  id_movimiento: number;
  id_inventario: number;
  id_usuario: string; // UUID
  tipo_movimiento: TipoMovimiento | string;
  cantidad: number;
  fecha: string; // TIMESTAMP
  inventario?: Inventario;
  usuario?: Usuario;
}

export interface Merma {
  id_merma: number;
  id_inventario: number;
  id_usuario: string; // UUID
  motivo: MotivoMerma | string;
  cantidad: number;
  fecha_baja: string; // DATE
  inventario?: Inventario;
  usuario?: Usuario;
}

export interface Notificacion {
  id_notificacion: number;
  id_usuario: string; // UUID
  tipo: TipoNotificacion | string | null;
  mensaje: string | null;
  fecha_envio: string; // TIMESTAMP
  estado: EstadoNotificacion | string | null;
}

export interface Reporte {
  id_reporte: number;
  id_usuario: string; // UUID
  tipo: TipoReporte | string | null;
  formato: FormatoReporte | string | null;
  fecha_generacion: string; // TIMESTAMP
}
