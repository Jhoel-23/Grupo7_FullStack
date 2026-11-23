-- Grupo 7: ampliación segura para la Semana 13. NO elimina tablas ni saldos.
BEGIN;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE public.pedidos_delivery_farmacia ADD COLUMN IF NOT EXISTS modificado_por INTEGER REFERENCES public.usuarios(id);
CREATE TABLE IF NOT EXISTS public.pedido_estados (
 id BIGSERIAL PRIMARY KEY,
 pedido_id INTEGER NOT NULL REFERENCES public.pedidos_delivery_farmacia(id) ON DELETE CASCADE,
 estado_anterior VARCHAR(30),
 estado VARCHAR(30) NOT NULL,
 actor_usuario_id INTEGER REFERENCES public.usuarios(id),
 detalle VARCHAR(200),
 fecha TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pedido_estados_pedido_fecha ON public.pedido_estados(pedido_id,fecha,id);
-- Primer historial para registros existentes: no inventamos quién realizó cambios antiguos.
INSERT INTO public.pedido_estados(pedido_id,estado,detalle,fecha)
 SELECT p.id,p.estado,'Estado encontrado al activar la trazabilidad',NOW()
 FROM public.pedidos_delivery_farmacia p
 WHERE NOT EXISTS(SELECT 1 FROM public.pedido_estados h WHERE h.pedido_id=p.id);
CREATE OR REPLACE FUNCTION public.guardar_cambio_estado_grupo7() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='INSERT' THEN
   INSERT INTO public.pedido_estados(pedido_id,estado,actor_usuario_id,detalle)
   VALUES(NEW.id,NEW.estado,NEW.id_usuario,'Pedido registrado');
 ELSIF NEW.estado IS DISTINCT FROM OLD.estado THEN
   INSERT INTO public.pedido_estados(pedido_id,estado_anterior,estado,actor_usuario_id,detalle)
   VALUES(NEW.id,OLD.estado,NEW.estado,COALESCE(NEW.modificado_por,NEW.id_usuario),
    CASE NEW.estado WHEN 'pagado' THEN 'Pago bancario confirmado'
     WHEN 'despachado' THEN 'Despacho confirmado' ELSE 'Cambio de estado' END);
 END IF;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tr_pedidos_grupo7_historico ON public.pedidos_delivery_farmacia;
CREATE TRIGGER tr_pedidos_grupo7_historico AFTER INSERT OR UPDATE OF estado
 ON public.pedidos_delivery_farmacia FOR EACH ROW EXECUTE FUNCTION public.guardar_cambio_estado_grupo7();
-- Se conserva la función original de pago atómico; ahora indica el actor del cambio.
CREATE OR REPLACE FUNCTION public.pagar_delivery(p_pedido_id integer, p_usuario_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_pedido RECORD;
    v_cliente RECORD;
    v_empresa RECORD;
    v_operacion_id INTEGER;
    v_abono_id INTEGER;
BEGIN
    SELECT p.id, p.codigo, p.total, p.estado
    INTO v_pedido
    FROM pedidos_delivery_farmacia p
    WHERE p.id = p_pedido_id
      AND p.id_usuario = p_usuario_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido no encontrado';
    END IF;

    IF v_pedido.estado <> 'pendiente' THEN
        RAISE EXCEPTION 'Este pedido ya fue procesado';
    END IF;

    SELECT c.id, c.numero, c.saldo
    INTO v_cliente
    FROM cuentas c
    WHERE c.id_usuario = p_usuario_id
      AND c.tipo = 'ahorros'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Debe abrir una cuenta de ahorros';
    END IF;

    SELECT c.id, c.numero, c.saldo
    INTO v_empresa
    FROM cuentas c
    WHERE c.numero = '002-0000123'
      AND c.tipo = 'empresa'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La cuenta empresarial no existe';
    END IF;

    IF v_cliente.saldo < v_pedido.total THEN
        RAISE EXCEPTION 'Saldo insuficiente. Debe depositar dinero';
    END IF;

    UPDATE cuentas
    SET saldo = saldo - v_pedido.total
    WHERE id = v_cliente.id;

    UPDATE cuentas
    SET saldo = saldo + v_pedido.total
    WHERE id = v_empresa.id;

    INSERT INTO operaciones (
        id_cuenta,
        tipo,
        monto,
        referencia
    )
    VALUES (
        v_cliente.id,
        'pago',
        v_pedido.total,
        v_pedido.codigo
    )
    RETURNING id INTO v_operacion_id;

    INSERT INTO operaciones (
        id_cuenta,
        tipo,
        monto,
        referencia
    )
    VALUES (
        v_empresa.id,
        'abono',
        v_pedido.total,
        v_pedido.codigo
    )
    RETURNING id INTO v_abono_id;

    UPDATE pedidos_delivery_farmacia
    SET estado = 'pagado',
        id_operacion = v_operacion_id,
        modificado_por = p_usuario_id
    WHERE id = v_pedido.id;

    RETURN jsonb_build_object(
        'codigo', v_pedido.codigo,
        'estado', 'pagado',
        'monto', v_pedido.total,
        'id_operacion', v_operacion_id,
        'id_abono', v_abono_id,
        'cuenta_cliente', v_cliente.numero,
        'cuenta_empresa', v_empresa.numero,
        'saldo_cliente', v_cliente.saldo - v_pedido.total,
        'saldo_empresa', v_empresa.saldo + v_pedido.total
    );
END;
$$;


COMMIT;
