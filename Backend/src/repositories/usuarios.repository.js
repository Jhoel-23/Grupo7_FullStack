import { query } from "../config/db.js";
export async function buscarPorCorreo(correo){
 const r=await query('SELECT id,nombre,apellido,correo,password_hash FROM usuarios WHERE lower(correo)=lower($1) LIMIT 1',[correo]);
 return r.rows[0];
}
export async function rolesDeUsuario(id){
 const r=await query('SELECT modulo,rol FROM usuario_rol WHERE id_usuario=$1 ORDER BY modulo',[id]);
 return r.rows;
}
