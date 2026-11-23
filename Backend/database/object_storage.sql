-- Ejecutar SOLO en la rama de pruebas de Neon. Guarda referencias; las imagenes estan en Object Storage.
BEGIN;
CREATE TABLE IF NOT EXISTS public.farmacia_imagenes (
  id BIGSERIAL PRIMARY KEY,
  objeto_key TEXT NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  mime_type VARCHAR(32) NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/webp')),
  tamano_bytes INTEGER NOT NULL CHECK (tamano_bytes > 0 AND tamano_bytes <= 5242880),
  usuario_id INTEGER NOT NULL REFERENCES public.usuarios(id),
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMIT;
