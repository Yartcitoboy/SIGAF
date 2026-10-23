BEGIN;
CREATE FUNCTION public.proteger_ultimo_admin() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(7342003);
 IF OLD.activo AND EXISTS(SELECT 1 FROM public.perfil WHERE id_perfil=OLD.id_perfil AND nombre='ADMIN')
 AND (TG_OP='DELETE' OR NOT NEW.activo OR NOT EXISTS(SELECT 1 FROM public.perfil WHERE id_perfil=NEW.id_perfil AND nombre='ADMIN'))
 AND NOT EXISTS(SELECT 1 FROM public.usuario u JOIN public.perfil p USING(id_perfil) WHERE p.nombre='ADMIN' AND u.activo AND u.id_usuario<>OLD.id_usuario)
 THEN RAISE EXCEPTION 'Debe permanecer al menos una cuenta administradora activa'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER proteger_ultimo_admin BEFORE UPDATE OR DELETE ON public.usuario FOR EACH ROW EXECUTE FUNCTION public.proteger_ultimo_admin();
COMMIT;
