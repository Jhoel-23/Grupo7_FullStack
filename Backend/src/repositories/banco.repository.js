import { sql } from "../config/db.js";

export async function verificarRolCliente(usuarioId) {
 return sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND modulo = 'banco'
        AND rol = 'cliente'
      LIMIT 1
    `;
}

export async function buscarCuentaAhorros(usuarioId) {
 return sql`
      SELECT id
      FROM cuentas
      WHERE id_usuario = ${usuarioId}
        AND tipo = 'ahorros'
      LIMIT 1
    `;
}

export async function crearCuentaAhorros(usuarioId) {
 return sql`
      WITH siguiente AS (
        SELECT nextval(
          pg_get_serial_sequence('public.cuentas', 'id')
        ) AS nuevo_id
      )
      INSERT INTO cuentas (
        id,
        id_usuario,
        numero,
        tipo,
        saldo
      )
      SELECT
        nuevo_id,
        ${usuarioId},
        '001-' || LPAD(nuevo_id::text, 7, '0'),
        'ahorros',
        0
      FROM siguiente
      RETURNING id, id_usuario, numero, tipo, saldo
    `;
}

export async function verificarRolCajero(usuarioId) {
 return sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND modulo = 'banco'
        AND rol = 'empleado'
      LIMIT 1
    `;
}

export async function registrarDepositoAtomico(montoActualizacion, numero, montoOperacion) {
 return sql`
      WITH cuenta_actualizada AS (
        UPDATE cuentas
        SET saldo = saldo + ${montoActualizacion}::numeric
        WHERE numero = ${numero}
        RETURNING id, numero, saldo
      ),
      operacion_creada AS (
        INSERT INTO operaciones (
          id_cuenta,
          tipo,
          monto,
          referencia
        )
        SELECT
          id,
          'deposito',
          ${montoOperacion}::numeric,
          'VENTANILLA'
        FROM cuenta_actualizada
        RETURNING id, id_cuenta, tipo, monto, fecha
      )
      SELECT
        o.id,
        o.tipo,
        o.monto,
        o.fecha,
        c.numero,
        c.saldo
      FROM operacion_creada o
      INNER JOIN cuenta_actualizada c
        ON o.id_cuenta = c.id
    `;
}

export async function verificarClienteCuentas(usuarioId) {
 return sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND modulo = 'banco'
        AND rol = 'cliente'
      LIMIT 1
    `;
}

export async function listarCuentasDeUsuario(usuarioId) {
 return sql`
      SELECT id, numero, tipo, saldo
      FROM cuentas
      WHERE id_usuario = ${usuarioId}
      ORDER BY id
    `;
}

export async function listarMovimientosDeUsuario(usuarioId) {
 return sql`
      SELECT
        o.id,
        o.id_cuenta,
        o.tipo,
        o.monto,
        o.referencia,
        o.fecha,
        c.numero
      FROM operaciones o
      INNER JOIN cuentas c ON o.id_cuenta = c.id
      WHERE c.id_usuario = ${usuarioId}
      ORDER BY o.fecha DESC, o.id DESC
    `;
}

export async function verificarCajeroOperaciones(usuarioId) {
 return sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND modulo = 'banco'
        AND rol = 'empleado'
      LIMIT 1
    `;
}

export async function listarOperacionesPorDia(fecha) {
 return sql`
      SELECT
        o.id,
        o.tipo,
        o.monto,
        o.referencia,
        o.fecha,
        c.numero,
        u.nombre,
        u.apellido
      FROM operaciones o
      INNER JOIN cuentas c
        ON c.id = o.id_cuenta
      INNER JOIN usuarios u
        ON u.id = c.id_usuario
      WHERE (o.fecha AT TIME ZONE 'America/Lima')::date
        = ${fecha}::date
      ORDER BY o.fecha DESC, o.id DESC
    `;
}

export async function resumenOperacionesPorDia(fecha) {
 return sql`
      SELECT
        COUNT(*)::integer AS cantidad,
        COALESCE(SUM(monto) FILTER (
          WHERE tipo = 'deposito'
        ), 0) AS depositos,
        COALESCE(SUM(monto) FILTER (
          WHERE tipo = 'pago'
        ), 0) AS pagos,
        COALESCE(SUM(monto) FILTER (
          WHERE tipo = 'abono'
        ), 0) AS abonos
      FROM operaciones
      WHERE (fecha AT TIME ZONE 'America/Lima')::date
        = ${fecha}::date
    `;
}

export async function verificarAdministradorBanco(usuarioId) {
 return sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND modulo = 'banco'
        AND rol = 'administrador'
      LIMIT 1
    `;
}

export async function listarClientesBanco() {
 return sql`
      SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.dni,
        u.correo
      FROM usuarios u
      INNER JOIN usuario_rol r
        ON r.id_usuario = u.id
      WHERE r.modulo = 'banco'
        AND r.rol = 'cliente'
      ORDER BY u.id
    `;
}

export async function listarCuentasBanco() {
 return sql`
      SELECT
        c.id,
        c.id_usuario,
        c.numero,
        c.tipo,
        c.saldo,
        u.nombre,
        u.apellido,
        u.correo
      FROM cuentas c
      INNER JOIN usuarios u
        ON u.id = c.id_usuario
      ORDER BY c.id
    `;
}

export async function listarOperacionesBanco() {
 return sql`
      SELECT
        o.id,
        o.tipo,
        o.monto,
        o.referencia,
        o.fecha,
        c.numero,
        u.nombre,
        u.apellido
      FROM operaciones o
      INNER JOIN cuentas c
        ON c.id = o.id_cuenta
      INNER JOIN usuarios u
        ON u.id = c.id_usuario
      ORDER BY o.fecha DESC, o.id DESC
    `;
}

export async function resumenGeneralBanco() {
 return sql`
      SELECT
        COUNT(*)::integer AS cantidad_operaciones,
        COALESCE(
          SUM(monto) FILTER (WHERE tipo = 'deposito'),
          0
        ) AS depositos,
        COALESCE(
          SUM(monto) FILTER (WHERE tipo = 'pago'),
          0
        ) AS pagos,
        COALESCE(
          SUM(monto) FILTER (WHERE tipo = 'abono'),
          0
        ) AS abonos
      FROM operaciones
    `;
}

export async function verificarAdministradorEditar(usuarioId) {
 return sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND modulo = 'banco'
        AND rol = 'administrador'
      LIMIT 1
    `;
}

export async function actualizarDatosCliente(nombre, apellido, usuarioId, idCliente) {
 return sql`
      UPDATE usuarios
      SET
        nombre = ${nombre},
        apellido = ${apellido}
      WHERE id = ${usuarioId}
        AND EXISTS (
          SELECT 1
          FROM usuario_rol
          WHERE id_usuario = ${idCliente}
            AND modulo = 'banco'
            AND rol = 'cliente'
        )
      RETURNING
        id,
        nombre,
        apellido,
        dni,
        correo
    `;
}
