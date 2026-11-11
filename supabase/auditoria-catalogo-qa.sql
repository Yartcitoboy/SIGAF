-- SOLO LECTURA. No corrige ni inventa códigos. Ejecutar en el proyecto correcto.
SELECT id_producto, nombre, registro_isp,
  CASE WHEN nullif(trim(codigo_barras),'') IS NULL THEN 'SIN CODIGO' ELSE 'REVISAR CONTRA ENVASE' END AS codigo,
  CASE WHEN nullif(trim(unidad_medida),'') IS NULL THEN 'COMPLETAR ANTES DE RECEPCION' ELSE 'REGISTRADA' END AS presentacion
FROM public.producto
WHERE nullif(trim(codigo_barras),'') IS NULL
   OR nullif(trim(unidad_medida),'') IS NULL
   OR nullif(trim(registro_isp),'') IS NULL
ORDER BY id_producto;

SELECT lpad(codigo_barras,14,'0') AS gtin_normalizado, count(*) AS fichas
FROM public.producto
WHERE codigo_barras ~ '^[0-9]+$' AND length(codigo_barras) IN (8,12,13,14)
GROUP BY lpad(codigo_barras,14,'0') HAVING count(*)>1;
