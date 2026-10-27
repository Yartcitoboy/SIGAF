-- Aplicar después de 001-004. No crea cuentas ni existencias ficticias.
BEGIN;
CREATE TABLE public.opcion_formulario (
 tipo text NOT NULL CHECK (tipo IN ('presentacion','vida_util','cantidad')),
 valor text NOT NULL, etiqueta text NOT NULL, orden int NOT NULL DEFAULT 0,
 activo boolean NOT NULL DEFAULT true, PRIMARY KEY(tipo,valor)
);
CREATE TABLE public.preferencia_usuario (
 id_usuario uuid PRIMARY KEY REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
 tema text NOT NULL DEFAULT 'claro' CHECK (tema IN ('claro','oscuro')),
 actualizado timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.opcion_formulario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferencia_usuario ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.opcion_formulario, public.preferencia_usuario FROM anon, authenticated;
GRANT SELECT ON public.opcion_formulario TO authenticated;
GRANT SELECT,INSERT,UPDATE ON public.preferencia_usuario TO authenticated;
GRANT ALL ON public.opcion_formulario,public.preferencia_usuario TO service_role;
CREATE POLICY opciones_lectura ON public.opcion_formulario FOR SELECT TO authenticated USING(public.rol_actual() IS NOT NULL);
CREATE POLICY preferencia_lectura ON public.preferencia_usuario FOR SELECT TO authenticated USING(id_usuario=auth.uid() AND public.rol_actual() IS NOT NULL);
CREATE POLICY preferencia_alta ON public.preferencia_usuario FOR INSERT TO authenticated WITH CHECK(id_usuario=auth.uid() AND public.rol_actual() IS NOT NULL);
CREATE POLICY preferencia_cambio ON public.preferencia_usuario FOR UPDATE TO authenticated USING(id_usuario=auth.uid() AND public.rol_actual() IS NOT NULL) WITH CHECK(id_usuario=auth.uid() AND public.rol_actual() IS NOT NULL);
CREATE FUNCTION public.actualizar_fecha_preferencia() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.actualizado=now(); RETURN NEW; END $$;
CREATE TRIGGER preferencia_actualizada BEFORE UPDATE ON public.preferencia_usuario FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_preferencia();
INSERT INTO public.opcion_formulario(tipo,valor,etiqueta,orden) VALUES
 ('presentacion','Unidad','Unidad',1),('presentacion','Caja','Caja',2),('presentacion','Blíster','Blíster',3),('presentacion','Frasco','Frasco',4),('presentacion','Tubo','Tubo',5),('presentacion','Ampolla','Ampolla',6),('presentacion','Vial','Vial',7),('presentacion','Sobre','Sobre',8),('presentacion','Inhalador','Inhalador',9),('presentacion','Gotas','Gotas',10),
 ('vida_util','6','6 meses',1),('vida_util','12','1 año (12 meses)',2),('vida_util','18','18 meses',3),('vida_util','24','2 años (24 meses)',4),('vida_util','36','3 años (36 meses)',5),('vida_util','48','4 años (48 meses)',6),('vida_util','60','5 años (60 meses)',7),
 ('cantidad','1','1',1),('cantidad','5','5',2),('cantidad','10','10',3),('cantidad','20','20',4),('cantidad','30','30',5),('cantidad','50','50',6),('cantidad','100','100',7),('cantidad','200','200',8),('cantidad','500','500',9),('cantidad','1000','1.000',10);
CREATE OR REPLACE FUNCTION public.contexto_sigaf() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF public.rol_actual() IS NULL THEN RAISE EXCEPTION 'Se requiere una cuenta SIGAF activa'; END IF;
 RETURN jsonb_build_object('hoy',public.hoy_chile(),'ahora',now(),'tema',coalesce((SELECT tema FROM public.preferencia_usuario WHERE id_usuario=auth.uid()),'claro'),
 'opciones',(SELECT coalesce(jsonb_agg(jsonb_build_object('tipo',tipo,'valor',valor,'etiqueta',etiqueta) ORDER BY tipo,orden),'[]'::jsonb) FROM public.opcion_formulario WHERE activo));
END $$;
REVOKE ALL ON FUNCTION public.contexto_sigaf() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.contexto_sigaf() TO authenticated;
COMMIT;
