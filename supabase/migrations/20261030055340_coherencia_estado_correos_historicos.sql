BEGIN;
-- Mantener el historial, reflejando que la cola antigua se archivó sin reenviarla.
UPDATE public.notificacion n SET estado_correo='REVISION',error_correo=c.error
FROM public.correo_resumen c
WHERE c.id_envio=n.id_envio AND c.fecha_resumen IS NULL AND c.estado='REVISION'
AND n.estado_correo IN('PENDIENTE','ERROR','PROCESANDO');
COMMIT;
