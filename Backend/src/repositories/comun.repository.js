import { sql } from "../config/db.js";

export async function verificarAdministradorModulo(usuarioId, modulo) {
 return sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND modulo = ${modulo}
        AND rol = 'administrador'
      LIMIT 1
    `;
}

/**
 * Crea un usuario y le asigna el rol de cliente en UNA sentencia atómica.
 *
 * IMPORTANTE: Los INSERT de los CTE de PostgreSQL comparten la misma
 * fotografía (snapshot) de datos. Un SELECT posterior desde usuarios, dentro
 * de esta misma sentencia, no puede leer un usuario que acaba de insertar el
 * CTE "nuevo". Por eso devolvemos la fila de "seleccionado" (que proviene del
 * RETURNING del INSERT) y no hacemos JOIN final con la tabla usuarios.
 *
 * Si ya existe la cuenta con el mismo correo + DNI, puede agregarse el rol
 * del otro módulo. Si ya tiene ese rol, devuelve [] para responder HTTP 409.
 * La contraseña guardada siempre está en password_hash; nunca en password.
 */
export async function crearClienteConRol(nombre, apellido, dni, correo, hash, correoVerificacion, dniVerificacion, modulo) {
  return sql`
    WITH nuevo AS (
      INSERT INTO usuarios (nombre, apellido, dni, correo, password_hash)
      VALUES (${nombre}, ${apellido}, ${dni}, ${correo}, ${hash})
      ON CONFLICT (correo) DO NOTHING
      RETURNING id, nombre, apellido, dni, correo
    ),
    seleccionado AS (
      SELECT id, nombre, apellido, dni, correo FROM nuevo
      UNION ALL
      SELECT id, nombre, apellido, dni, correo FROM usuarios
      WHERE correo = ${correoVerificacion} AND dni = ${dniVerificacion}
      LIMIT 1
    ),
    nuevo_rol AS (
      INSERT INTO usuario_rol (id_usuario, modulo, rol)
      SELECT id, ${modulo}, 'cliente' FROM seleccionado
      ON CONFLICT (id_usuario, modulo) DO NOTHING
      RETURNING id_usuario
    )
    SELECT s.id, s.nombre, s.apellido, s.dni, s.correo
    FROM seleccionado AS s
    INNER JOIN nuevo_rol AS nr ON nr.id_usuario = s.id
  `;
}