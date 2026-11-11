"use client";

export default function ErrorGlobal({ retry }: { retry: () => void }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: "#000020", color: "#f4f6fa", fontFamily: "system-ui, sans-serif" }}>
        <title>SIGAF · Recuperar la aplicación</title>
        <main role="alert" style={{ maxWidth: 560, margin: "12vh auto", padding: 24 }}>
          <h1>No se pudo abrir SIGAF</h1>
          <p>Puedes volver a intentarlo. Antes de repetir una recepción o salida, comprueba si quedó registrada.</p>
          <button onClick={() => retry()} style={{ padding: "12px 20px", background: "#9ce0db", color: "#000020", border: 0, borderRadius: 8, cursor: "pointer" }}>Volver a intentar</button>
          <p><a href="/login" style={{ color: "#9ce0db" }}>Ir al inicio de sesión</a></p>
        </main>
      </body>
    </html>
  );
}
