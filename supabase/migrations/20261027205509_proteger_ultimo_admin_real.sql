-- Un responsable histórico sin Auth no puede evitar la protección del último Admin real.
BEGIN;
CREATE OR REPLACE FUNCTION public.proteger_ultimo_admin() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(7342003);
 IF OLD.activo AND EXISTS(SELECT 1 FROM public.perfil WHERE id_perfil=OLD.id_perfil AND nombre='ADMIN')
 AND (TG_OP='DELETE' OR NOT NEW.activo OR NOT EXISTS(SELECT 1 FROM public.perfil WHERE id_perfil=NEW.id_perfil AND nombre='ADMIN'))
 AND NOT EXISTS(
  SELECT 1 FROM public.usuario u JOIN public.perfil p USING(id_perfil) JOIN auth.users a ON a.id=u.id_usuario
  WHERE p.nombre='ADMIN' AND u.activo AND u.id_usuario<>OLD.id_usuario
  AND a.deleted_at IS NULL AND NOT coalesce(a.is_anonymous,false) AND a.email_confirmed_at IS NOT NULL
 ) THEN RAISE EXCEPTION 'Debe permanecer al menos una cuenta administradora activa vinculada a Auth'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.proteger_ultimo_admin() FROM PUBLIC,anon,authenticated;
COMMIT;
