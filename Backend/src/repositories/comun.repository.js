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

export async function crearClienteConRol(nombre, apellido, dni, correo, hash, correoVerificacion, dniVerificacion, modulo) {
 return sql`
      WITH nuevo AS (
        INSERT INTO usuarios (
          nombre,
          apellido,
          dni,
          correo,
          password_hash
        )
        VALUES (
          ${nombre},
          ${apellido},
          ${dni},
          ${correo},
          ${hash}
        )
        ON CONFLICT (correo) DO NOTHING
        RETURNING id
      ),
      seleccionado AS (
        SELECT id FROM nuevo
        UNION ALL
        SELECT id
        FROM usuarios
        WHERE correo = ${correoVerificacion}
          AND dni = ${dniVerificacion}
        LIMIT 1
      ),
      nuevo_rol AS (
        INSERT INTO usuario_rol (
          id_usuario,
          modulo,
          rol
        )
        SELECT id, ${modulo}, 'cliente'
        FROM seleccionado
        ON CONFLICT (id_usuario, modulo) DO NOTHING
        RETURNING id_usuario
      )
      SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.dni,
        u.correo
      FROM usuarios u
      INNER JOIN nuevo_rol nr ON nr.id_usuario = u.id
    `;
}
