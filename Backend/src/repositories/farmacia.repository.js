import { sql } from "../config/db.js";

export async function verificarClienteFarmacia(usuarioId) {
 return sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND modulo = 'farmacia'
        AND rol = 'cliente'
      LIMIT 1
    `;
}

export async function listarRolesParaPago(usuarioId) {
 return sql`
      SELECT modulo, rol
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND (
          (modulo = 'farmacia' AND rol = 'cliente')
          OR
          (modulo = 'banco' AND rol = 'cliente')
        )
    `;
}

export async function procesarPagoBancario(pedidoId, usuarioId) {
 return sql`
      SELECT pagar_delivery(
        ${pedidoId},
        ${usuarioId}
      ) AS pago
    `;
}

export async function buscarPedidoPendiente(usuarioId) {
 return sql`
      SELECT id, codigo, producto, producto_id, cantidad, precio_unitario, direccion, total, estado
      FROM pedidos_delivery_farmacia
      WHERE id_usuario = ${usuarioId}
        AND estado = 'pendiente'
      ORDER BY id DESC
      LIMIT 1
    `;
}

export async function verificarAdminCobros(usuarioId) {
 return sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND modulo = 'farmacia'
        AND rol = 'administrador'
      LIMIT 1
    `;
}

export async function listarCuentasEmpresa(usuarioId) {
 return sql`
      SELECT id, numero, tipo, saldo
      FROM cuentas
      WHERE id_usuario = ${usuarioId}
        AND tipo = 'empresa'
      ORDER BY id
    `;
}

export async function listarAbonosEmpresa(usuarioId) {
 return sql`
      SELECT
        o.id,
        o.tipo,
        o.monto,
        o.referencia,
        o.fecha,
        c.numero
      FROM operaciones o
      INNER JOIN cuentas c ON c.id = o.id_cuenta
      WHERE c.id_usuario = ${usuarioId}
        AND c.tipo = 'empresa'
        AND o.tipo = 'abono'
      ORDER BY o.fecha DESC, o.id DESC
    `;
}

export async function resumenCobrosDiarios(usuarioId) {
 return sql`
      SELECT
        (o.fecha AT TIME ZONE 'America/Lima')::date
          AS fecha,
        COUNT(*)::integer AS cantidad,
        SUM(o.monto) AS total
      FROM operaciones o
      INNER JOIN cuentas c ON c.id = o.id_cuenta
      WHERE c.id_usuario = ${usuarioId}
        AND c.tipo = 'empresa'
        AND o.tipo = 'abono'
      GROUP BY (o.fecha AT TIME ZONE 'America/Lima')::date
      ORDER BY fecha DESC
    `;
}

export async function verificarEmpleadoDespacho(usuarioId) {
 return sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND modulo = 'farmacia'
        AND rol = 'empleado'
      LIMIT 1
    `;
}

export async function listarPedidosParaDespacho() {
 return sql`
      SELECT
        p.id,
        p.codigo,
        p.producto,
        p.cantidad,
        p.precio_unitario,
        p.direccion,
        p.total,
        p.estado,
        p.id_operacion,
        u.nombre,
        u.apellido
      FROM pedidos_delivery_farmacia p
      INNER JOIN usuarios u
        ON u.id = p.id_usuario
      WHERE p.estado IN ('pagado', 'despachado')
      ORDER BY p.id DESC
    `;
}

export async function verificarEmpleadoDespachar(usuarioId) {
 return sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND modulo = 'farmacia'
        AND rol = 'empleado'
      LIMIT 1
    `;
}

export async function despacharSiPagado(usuarioId, pedidoId) {
 return sql`
      UPDATE pedidos_delivery_farmacia
      SET estado = 'despachado', modificado_por = ${usuarioId}
      WHERE id = ${pedidoId}
        AND estado = 'pagado'
        AND id_operacion IS NOT NULL
      RETURNING
        id,
        codigo,
        producto,
        total,
        estado,
        id_operacion
    `;
}

export async function verificarAdministradorPedidos(usuarioId) {
 return sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND modulo = 'farmacia'
        AND rol = 'administrador'
      LIMIT 1
    `;
}

export async function listarPedidosAdministracion() {
 return sql`
      SELECT
        p.id,
        p.codigo,
        p.producto,
        p.cantidad,
        p.precio_unitario,
        p.direccion,
        p.total,
        p.estado,
        p.id_operacion,
        u.nombre,
        u.apellido,
        u.correo
      FROM pedidos_delivery_farmacia p
      INNER JOIN usuarios u
        ON p.id_usuario = u.id
      ORDER BY p.id DESC
    `;
}

export async function verificarAdministradorModificar(usuarioId) {
 return sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND modulo = 'farmacia'
        AND rol = 'administrador'
      LIMIT 1
    `;
}

export async function actualizarDireccionPendiente(direccion, usuarioId, pedidoId) {
 return sql`
      UPDATE pedidos_delivery_farmacia
      SET direccion = ${direccion}, modificado_por = ${usuarioId}
      WHERE id = ${pedidoId}
        AND estado = 'pendiente'
      RETURNING
        id,
        codigo,
        producto,
        direccion,
        total,
        estado
    `;
}
