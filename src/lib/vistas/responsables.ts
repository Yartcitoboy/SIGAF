export interface ResponsableVisible {
  id_usuario: string;
  nombre: string;
}
export function nombreResponsable(
  id: string,
  directorio: readonly ResponsableVisible[] = [],
  actual?: ResponsableVisible,
) {
  const persona =
    directorio.find((u) => u.id_usuario === id) ??
    (actual?.id_usuario === id ? actual : undefined);
  return persona?.nombre?.trim() || `ID …${id.slice(-8)}`;
}
