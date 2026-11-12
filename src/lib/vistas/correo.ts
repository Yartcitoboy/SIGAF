export function errorCorreoReal(valor: string): string | null {
  const email = valor.trim().toLowerCase();
  if (
    email.length > 150 ||
    !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,63}$/.test(
      email,
    ) ||
    /\.\.|^\.|\.@/.test(email)
  )
    return "Escribe una dirección de correo válida.";
  const dominio = email.split("@")[1];
  if (
    ["local.com", "example.com", "example.org", "example.net"].includes(
      dominio,
    ) ||
    /(^|\.)(local|localhost|invalid|test|example)$/.test(dominio)
  )
    return "Usa un Gmail existente o un correo institucional real. Las direcciones de prueba no reciben alertas.";
  return null;
}
