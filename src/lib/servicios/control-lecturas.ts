// Estado efímero de una única instancia de lector; no guarda productos.
export class ControlLecturas {
  private secuencia = 0;
  private enVuelo: string | null = null;
  private ultimo = { codigo: "", instante: -Infinity };
  iniciar(codigo: string, ahora = Date.now()) {
    if (
      this.enVuelo === codigo ||
      (this.ultimo.codigo === codigo && ahora - this.ultimo.instante < 700)
    )
      return null;
    this.ultimo = { codigo, instante: ahora };
    this.enVuelo = codigo;
    return ++this.secuencia;
  }
  vigente(id: number) {
    return id === this.secuencia;
  }
  terminar(id: number) {
    if (this.vigente(id)) this.enVuelo = null;
  }
  cancelar() {
    this.secuencia++;
    this.enVuelo = null;
    this.ultimo = { codigo: "", instante: -Infinity };
  }
}
