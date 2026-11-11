# Catálogo completado para la presentación — 10 de noviembre de 2026

El usuario autorizó completar código, presentación y categoría de las fichas importadas, con presentaciones inventadas pero coherentes para mostrar la web. Se actualizaron 198 registros de public.producto en Supabase; el catálogo conserva sus 221 productos.

## Qué cambió

- Código interno único INT-ISP- seguido del ID con seis dígitos. Ejemplo: INT-ISP-000115 para AARBILOL. No son códigos EAN/GTIN asignados por un fabricante y no coinciden necesariamente con el código impreso en una caja real.
- Presentación de referencia identificada con (ref.) en la propia tabla. Se respetó la forma indicada en el nombre: comprimidos, cápsulas, jarabe/suspensión/solución oral, gotas, perfusión, inyectable o gel. Los contenidos se eligieron para la demostración, no se verificaron en el envase ni en una autorización sanitaria.
- Categoría operativa según principio activo, usando las categorías ya existentes del sistema. No se añadieron categorías ni columnas. Las asociaciones son una clasificación de inventario; no equivalen a una validación clínica o farmacéutica de las combinaciones.
- Se añadió a la descripción una nota de presentación referencial y código interno, conservando la descripción previa.

| Categoría asignada | Fichas |
|---|---:|
| Analgésicos y Antiinflamatorios | 50 |
| Antibióticos y Antimicrobianos | 24 |
| Cardiovasculares | 25 |
| Antihistamínicos | 49 |
| Gastrointestinales | 25 |
| Antidiabéticos | 25 |

## Ejemplos de la captura

| Medicamento | Código | Presentación referencial | Categoría |
|---|---|---|---|
| AARBILOL / losartán 50 mg | INT-ISP-000115 | Caja x 30 comp. (ref.) | Cardiovasculares |
| Ácido acetilsalicílico / paracetamol / cafeína | INT-ISP-000190 | Caja x 20 comp. (ref.) | Analgésicos y Antiinflamatorios |
| Amoxicilina / ácido clavulánico, polvo para suspensión oral | INT-ISP-000017 | Frasco x 100 mL (ref.) | Antibióticos y Antimicrobianos |
| ACTRONRA / ibuprofeno, cápsulas blandas | INT-ISP-000066 | Caja x 20 capsulas (ref.) | Analgésicos y Antiinflamatorios |
| ACUPARA / paracetamol, perfusión | INT-ISP-000191 | Frasco x 100 mL (ref.) | Analgésicos y Antiinflamatorios |
| AERIUS / desloratadina, jarabe | INT-ISP-000092 | Frasco x 100 mL (ref.) | Antihistamínicos |

No se cambió la concentración incluida en el nombre. Las dosis, usos o instrucciones de tratamiento no se deducen de estas presentaciones.

## Conservación y aplicación

Se conservaron IDs, nombre oficial, principio activo, registro, titular, fuente y fechas ISP. No se hicieron cambios en los 23 productos que ya tenían datos, incluidos los seis productos DEMO creados para el video. No se tocaron lotes, cantidades, costos, bodegas, movimientos, usuarios o permisos. Las fichas actualizadas no tenían lotes asociados al aplicar la carga.

El archivo supabase/datos-demostracion/completar-catalogo-2026-11-10.sql contiene el estado anterior y el nuevo por ID. La aplicación es transaccional, admite repetición sin duplicar notas y se detiene si detecta una edición concurrente. También se detiene si pretende asignar una presentación estimada a una ficha que ya tiene lotes. No es una migración de esquema ni un generador de datos locales.

Antes de usar estas fichas para operaciones reales, confirmar contenido del envase y sustituir la presentación referencial por la real, retirando su nota. Si se usa el lector de cajas comerciales, asociar el código verdadero del envase. Los códigos INT-ISP sirven para búsqueda interna o etiquetas internas, no para adivinar equivalencias con códigos comerciales.

## Verificaciones

Cero códigos vacíos, cero presentaciones vacías y cero fichas en la categoría genérica Catálogo ISP. Las huellas de lotes, inventarios, movimientos y bodegas coinciden con las tomadas antes de esta actualización. Pasaron las 89 pruebas automáticas; la nueva prueba comprueba los 198 cambios, conservación de identidad, repetición exacta y rechazo de sobreescrituras de fichas editadas posteriormente. No se modificó código de la web ni se instalaron dependencias.

La verificación visual en Productos mostró los códigos INT-ISP, las presentaciones (ref.) y las categorías específicas en las mismas primeras filas de la captura del usuario. Se dejó abierta la pestaña y se guardó una captura del catálogo actualizado. No se guardaron ediciones ni se registraron movimientos durante esa comprobación.

Referencias de categorías: índice ATC/DDD del WHO Collaborating Centre / FHI para [losartán](https://atcddd.fhi.no/atc_ddd_index/?code=C09CA01&showdescription=no), [cetirizina y levocetirizina](https://atcddd.fhi.no/atc_ddd_index/?code=R06AE&showdescription=no), [metformina](https://atcddd.fhi.no/atc_ddd_index/?code=A10BA02&showdescription=no), [amoxicilina](https://atcddd.fhi.no/atc_ddd_index/?code=J01CA04&showdescription=no) y [esomeprazol](https://atcddd.fhi.no/atc_ddd_index/?code=A02BC05&showdescription=no). Estas referencias respaldan las familias generales, no los contenidos de envase estimados.
