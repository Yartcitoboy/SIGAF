-- Mismas condiciones y permisos; Auth se evalúa una vez por consulta.
BEGIN;
ALTER POLICY lectura_perfiles ON public.perfil USING ((SELECT auth.uid()) IS NOT NULL);
ALTER POLICY lectura_usuarios ON public.usuario USING (id_usuario=(SELECT auth.uid()) OR sigaf_privado.rol_actual()='ADMIN');
ALTER POLICY lectura_alertas ON public.notificacion USING (id_usuario=(SELECT auth.uid()) OR sigaf_privado.rol_actual()='ADMIN');
ALTER POLICY atender_alerta ON public.notificacion USING (id_usuario=(SELECT auth.uid()) OR sigaf_privado.rol_actual()='ADMIN')
 WITH CHECK (estado='LEIDO' AND (id_usuario=(SELECT auth.uid()) OR sigaf_privado.rol_actual()='ADMIN'));
ALTER POLICY registrar_reporte ON public.reporte WITH CHECK (sigaf_privado.rol_actual()='ADMIN' AND id_usuario=(SELECT auth.uid()));
ALTER POLICY preferencia_lectura ON public.preferencia_usuario USING (id_usuario=(SELECT auth.uid()) AND sigaf_privado.rol_actual() IS NOT NULL);
ALTER POLICY preferencia_alta ON public.preferencia_usuario WITH CHECK (id_usuario=(SELECT auth.uid()) AND sigaf_privado.rol_actual() IS NOT NULL);
ALTER POLICY preferencia_cambio ON public.preferencia_usuario USING (id_usuario=(SELECT auth.uid()) AND sigaf_privado.rol_actual() IS NOT NULL)
 WITH CHECK (id_usuario=(SELECT auth.uid()) AND sigaf_privado.rol_actual() IS NOT NULL);
COMMIT;
