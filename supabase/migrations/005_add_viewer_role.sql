-- Neue Rolle ohne Schreibrechte (muss vor 006 in separatem Schritt laufen)
alter type public.app_role add value if not exists 'viewer';
