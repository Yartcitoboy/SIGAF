import { 
  Categoria, 
  Producto, 
  Lote, 
  Inventario, 
  Sucursal, 
  Bodega, 
  Notificacion, 
  MovimientoInventario, 
  Usuario 
} from '../tipos/database';

export const mockFarmacia = {
  id_farmacia: 1,
  razon_social: 'Farmacia FarmaVence SpA',
  rut: '76.892.451-K',
  direccion: 'Av. Libertador Bernardo O\'Higgins 1450, Santiago',
};

export const mockSucursales: Sucursal[] = [
  { id_sucursal: 1, nombre: 'Sucursal Central (Santiago Centro)', direccion: 'Av. Libertador Bernardo O\'Higgins 1450', id_farmacia: 1 },
  { id_sucursal: 2, nombre: 'Sucursal Providencia', direccion: 'Av. Providencia 2150', id_farmacia: 1 },
  { id_sucursal: 3, nombre: 'Sucursal Maipú', direccion: 'Pajaritos 3200', id_farmacia: 1 },
];

export const mockBodegas: Bodega[] = [
  { id_bodega: 1, nombre: 'Bodega Central - Estantería A (Fríos)', ubicacion: 'Pasillo 1 - Sector Refrigerado', id_sucursal: 1 },
  { id_bodega: 2, nombre: 'Bodega Central - Estantería B (Secos)', ubicacion: 'Pasillo 2 - Nivel Medio', id_sucursal: 1 },
  { id_bodega: 3, nombre: 'Sala de Ventas - Vitrina Prioritaria', ubicacion: 'Punto de Atención al Público', id_sucursal: 1 },
];

export const mockCategorias: Categoria[] = [
  { id_categoria: 1, nombre: 'Analgésicos y Antiinflamatorios', descripcion: 'Tratamiento del dolor y la inflamación' },
  { id_categoria: 2, nombre: 'Antibióticos y Antimicrobianos', descripcion: 'Infecciones bacterianas bajo receta médica' },
  { id_categoria: 3, nombre: 'Cardiovasculares', descripcion: 'Tratamiento de hipertensión y afecciones cardíacas' },
  { id_categoria: 4, nombre: 'Antihistamínicos', descripcion: 'Tratamiento de alergias y cuadros respiratorios' },
  { id_categoria: 5, nombre: 'Gastrointestinales', descripcion: 'Protectores gástricos y digestivos' },
];

export const mockProductos: Producto[] = [
  { id_producto: 1, codigo_barras: '7801234567890', nombre: 'Paracetamol 500 mg', descripcion: 'Comprimidos - Laboratorio Chile', unidad_medida: 'Caja x 16 comp', id_categoria: 1 },
  { id_producto: 2, codigo_barras: '7802345678901', nombre: 'Amoxicilina 500 mg', descripcion: 'Cápsulas - Laboratorio Mintlab', unidad_medida: 'Caja x 21 cáps', id_categoria: 2 },
  { id_producto: 3, codigo_barras: '7803456789012', nombre: 'Losartán Potásico 50 mg', descripcion: 'Comprimidos recubiertos - Laboratorio Saval', unidad_medida: 'Caja x 30 comp', id_categoria: 3 },
  { id_producto: 4, codigo_barras: '7804567890123', nombre: 'Loratadina 10 mg', descripcion: 'Comprimidos - Laboratorio Andrómaco', unidad_medida: 'Caja x 10 comp', id_categoria: 4 },
  { id_producto: 5, codigo_barras: '7805678901234', nombre: 'Ibuprofeno 400 mg', descripcion: 'Cápsulas blandas - Laboratorio Bagó', unidad_medida: 'Caja x 20 cáps', id_categoria: 1 },
  { id_producto: 6, codigo_barras: '7806789012345', nombre: 'Omeprazol 20 mg', descripcion: 'Cápsulas gastroresistentes - Laboratorio Mintlab', unidad_medida: 'Caja x 28 cáps', id_categoria: 5 },
  { id_producto: 7, codigo_barras: '7807890123456', nombre: 'Ciprofloxacino 500 mg', descripcion: 'Comprimidos - Laboratorio Chile', unidad_medida: 'Caja x 10 comp', id_categoria: 2 },
  { id_producto: 8, codigo_barras: '7808901234567', nombre: 'Salbutamol 100 mcg', descripcion: 'Aerosol para inhalación 200 dosis - GlaxoSmithKline', unidad_medida: 'Frasco aerosol', id_categoria: 4 },
];

export const mockLotes: Lote[] = [
  // Lotes Vencidos (Rojo Crítico)
  { id_lote: 1, numero_lote: 'L-2023-V99', fecha_vencimiento: '2026-09-15', fecha_ingreso: '2025-09-15', id_producto: 1, dias_restantes: -12, estado_semaforo: 'VENCIDO' },
  { id_lote: 2, numero_lote: 'L-2024-AM01', fecha_vencimiento: '2026-09-22', fecha_ingreso: '2025-10-10', id_producto: 2, dias_restantes: -5, estado_semaforo: 'VENCIDO' },
  // Lotes Próximos a Vencer (Amarillo Preventivo / 30-90 días)
  { id_lote: 3, numero_lote: 'L-2024-LOS77', fecha_vencimiento: '2026-10-25', fecha_ingreso: '2025-11-01', id_producto: 3, dias_restantes: 28, estado_semaforo: 'ROJO' }, // <30 días = Rojo Alerta
  { id_lote: 4, numero_lote: 'L-2025-LOR14', fecha_vencimiento: '2026-11-15', fecha_ingreso: '2025-12-05', id_producto: 4, dias_restantes: 49, estado_semaforo: 'AMARILLO' },
  { id_lote: 5, numero_lote: 'L-2025-IBU88', fecha_vencimiento: '2026-12-01', fecha_ingreso: '2026-01-10', id_producto: 5, dias_restantes: 65, estado_semaforo: 'AMARILLO' },
  { id_lote: 6, numero_lote: 'L-2025-OME33', fecha_vencimiento: '2026-12-20', fecha_ingreso: '2026-02-15', id_producto: 6, dias_restantes: 84, estado_semaforo: 'AMARILLO' },
  // Lotes Vigentes (Verde > 90 días)
  { id_lote: 7, numero_lote: 'L-2026-PAR02', fecha_vencimiento: '2027-04-30', fecha_ingreso: '2026-04-01', id_producto: 1, dias_restantes: 215, estado_semaforo: 'VERDE' },
  { id_lote: 8, numero_lote: 'L-2026-CIP55', fecha_vencimiento: '2027-06-15', fecha_ingreso: '2026-05-10', id_producto: 7, dias_restantes: 261, estado_semaforo: 'VERDE' },
  { id_lote: 9, numero_lote: 'L-2026-SAL90', fecha_vencimiento: '2027-08-20', fecha_ingreso: '2026-06-01', id_producto: 8, dias_restantes: 327, estado_semaforo: 'VERDE' },
];

export const mockInventario: Inventario[] = [
  { id_inventario: 1, id_lote: 1, id_bodega: 2, stock_actual: 35, estado_semaforo: 'VENCIDO', lote: mockLotes[0], bodega: mockBodegas[1] },
  { id_inventario: 2, id_lote: 2, id_bodega: 1, stock_actual: 20, estado_semaforo: 'VENCIDO', lote: mockLotes[1], bodega: mockBodegas[0] },
  { id_inventario: 3, id_lote: 3, id_bodega: 3, stock_actual: 50, estado_semaforo: 'ROJO', lote: mockLotes[2], bodega: mockBodegas[2] },
  { id_inventario: 4, id_lote: 4, id_bodega: 3, stock_actual: 75, estado_semaforo: 'AMARILLO', lote: mockLotes[3], bodega: mockBodegas[2] },
  { id_inventario: 5, id_lote: 5, id_bodega: 2, stock_actual: 120, estado_semaforo: 'AMARILLO', lote: mockLotes[4], bodega: mockBodegas[1] },
  { id_inventario: 6, id_lote: 6, id_bodega: 2, stock_actual: 90, estado_semaforo: 'AMARILLO', lote: mockLotes[5], bodega: mockBodegas[1] },
  { id_inventario: 7, id_lote: 7, id_bodega: 2, stock_actual: 450, estado_semaforo: 'VERDE', lote: mockLotes[6], bodega: mockBodegas[1] },
  { id_inventario: 8, id_lote: 8, id_bodega: 1, stock_actual: 180, estado_semaforo: 'VERDE', lote: mockLotes[7], bodega: mockBodegas[0] },
  { id_inventario: 9, id_lote: 9, id_bodega: 3, stock_actual: 110, estado_semaforo: 'VERDE', lote: mockLotes[8], bodega: mockBodegas[2] },
];

// Unimos producto con lote en la data mock
mockLotes.forEach((l) => {
  l.producto = mockProductos.find((p) => p.id_producto === l.id_producto);
});

export const mockUsuarios: Usuario[] = [
  { id_usuario: 'usr-001', nombre: 'Carlos Carrasco (Administrador)', email: 'admin@farmavence.cl', id_perfil: 1, id_sucursal: 1, activo: true, perfil: { id_perfil: 1, nombre: 'ADMIN', descripcion: 'Acceso total y configuración' } },
  { id_usuario: 'usr-002', nombre: 'Rodrigo Méndez (Encargado Bodega)', email: 'bodega@farmavence.cl', id_perfil: 2, id_sucursal: 1, activo: true, perfil: { id_perfil: 2, nombre: 'BODEGUERO', descripcion: 'Gestión de lotes y recepción' } },
  { id_usuario: 'usr-003', nombre: 'Camila Soto (Auxiliar Farmacia)', email: 'cajero@farmavence.cl', id_perfil: 3, id_sucursal: 1, activo: true, perfil: { id_perfil: 3, nombre: 'AUXILIAR', descripcion: 'Consulta de stock y FEFO' } },
];

export const mockNotificaciones: Notificacion[] = [
  { id_notificacion: 1, id_usuario: 'usr-001', tipo: 'CADUCIDAD', mensaje: 'LOTE VENCIDO: Paracetamol 500mg (L-2023-V99) caducó el 15/09/2026. Requiere retiro inmediato a mermas.', fecha_envio: '2026-09-26 00:00:00', estado: 'PENDIENTE', lote_afectado: 'L-2023-V99' },
  { id_notificacion: 2, id_usuario: 'usr-001', tipo: 'CADUCIDAD', mensaje: 'LOTE VENCIDO: Amoxicilina 500mg (L-2024-AM01) caducó el 22/09/2026. Dispensación bloqueada.', fecha_envio: '2026-09-26 00:00:00', estado: 'PENDIENTE', lote_afectado: 'L-2024-AM01' },
  { id_notificacion: 3, id_usuario: 'usr-001', tipo: 'CADUCIDAD', mensaje: 'ALERTA PREVENTIVA: Losartán 50mg vence en 28 días (L-2024-LOS77). Priorizar salida por FEFO.', fecha_envio: '2026-09-26 00:00:00', estado: 'LEIDO', lote_afectado: 'L-2024-LOS77' },
  { id_notificacion: 4, id_usuario: 'usr-001', tipo: 'CADUCIDAD', mensaje: 'AVISO AMARILLO: Loratadina 10mg vence en 49 días (L-2025-LOR14). Stock: 75 unidades.', fecha_envio: '2026-09-25 00:00:00', estado: 'LEIDO', lote_afectado: 'L-2025-LOR14' },
];

export const mockMovimientos: MovimientoInventario[] = [
  { id_movimiento: 1, id_inventario: 7, id_usuario: 'usr-002', tipo_movimiento: 'ENTRADA', cantidad: 450, fecha: '2026-09-24 10:30:00', motivo: 'Recepción pedido Proveedor Lab Chile' },
  { id_movimiento: 2, id_inventario: 3, id_usuario: 'usr-003', tipo_movimiento: 'SALIDA', cantidad: 2, fecha: '2026-09-26 15:45:00', motivo: 'Dispensación con receta FEFO' },
  { id_movimiento: 3, id_inventario: 1, id_usuario: 'usr-001', tipo_movimiento: 'MERMA', cantidad: 35, fecha: '2026-09-26 18:20:00', motivo: 'Baja preventiva por fecha de caducidad superada' },
  { id_movimiento: 4, id_inventario: 4, id_usuario: 'usr-001', tipo_movimiento: 'TRASLADO', cantidad: 30, fecha: '2026-09-25 11:15:00', motivo: 'Traslado a Sucursal Providencia para acelerar rotación' },
];

// Métricas calculadas para el Dashboard (Enfoque Sanitario y Operativo)
export const mockDashboardKpis = {
  totalUnidadesStock: 1130,
  totalLotesRegistrados: 9,
  lotesVencidos: 2, // Rojo oscuro
  lotesCriticos: 1, // Rojo (<30 días)
  lotesAmarillos: 3, // Preventivos (30-90 días)
  lotesVerdes: 3, // Vigentes (>90 días)
  porcentajeCumplimientoFEFO: 96.8, // KPI de seguridad sanitaria
  alertasActivasSinLeer: 2,
};
