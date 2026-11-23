-- Grupo 7 / FarmaSalud. Migración ADITIVA. Revisar respaldos y rama antes de ejecutar.
-- NO borra pedidos anteriores, cuentas, pagos, usuarios ni fotografías.
BEGIN;

-- Tabla que contiene solamente REFERENCIAS: los bytes están en Neon Object Storage.
CREATE TABLE IF NOT EXISTS public.farmacia_imagenes (
  id BIGSERIAL PRIMARY KEY,
  objeto_key TEXT NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  mime_type VARCHAR(32) NOT NULL CHECK (mime_type IN ('image/png','image/jpeg','image/webp')),
  tamano_bytes INTEGER NOT NULL CHECK (tamano_bytes > 0 AND tamano_bytes <= 5242880),
  usuario_id INTEGER NOT NULL REFERENCES public.usuarios(id),
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.farmacia_productos (
  id BIGSERIAL PRIMARY KEY,
  sku VARCHAR(40) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  precio NUMERIC(12,2) NOT NULL CHECK (precio > 0 AND precio <= 999999.99),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  imagen_id BIGINT REFERENCES public.farmacia_imagenes(id) ON DELETE SET NULL,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_farmacia_productos_activos ON public.farmacia_productos(activo, nombre);

ALTER TABLE public.pedidos_delivery_farmacia
  ADD COLUMN IF NOT EXISTS modificado_por INTEGER REFERENCES public.usuarios(id),
  ADD COLUMN IF NOT EXISTS producto_id BIGINT REFERENCES public.farmacia_productos(id),
  ADD COLUMN IF NOT EXISTS cantidad INTEGER,
  ADD COLUMN IF NOT EXISTS precio_unitario NUMERIC(12,2);

-- Los pedidos previos son históricos: sin producto_id ni cantidad vinculados.
-- No se les cambia el total, el estado ni su comprobante bancario.
CREATE INDEX IF NOT EXISTS idx_pedidos_farmacia_producto ON public.pedidos_delivery_farmacia(producto_id);

-- Producto conocido de la versión anterior. Inactivo y sin stock hasta que
-- el administrador confirme las existencias y lo habilite (evita stock inventado).
INSERT INTO public.farmacia_productos (sku,nombre,descripcion,precio,stock,activo)
VALUES ('PARA500X20','Paracetamol 500 mg x 20','Registro recuperado del ejemplo original. Confirmar existencias y fotografía antes de activar.',24.50,0,FALSE)
ON CONFLICT (sku) DO NOTHING;

COMMIT;
