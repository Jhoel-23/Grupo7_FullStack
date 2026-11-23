import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as usuarios from "../repositories/usuarios.repository.js";
export async function ingresar(correo,password){
 if(typeof correo!=="string"||typeof password!=="string") return null;
 const usuario=await usuarios.buscarPorCorreo(correo.trim());
 if(!usuario?.password_hash || !(await bcrypt.compare(password,usuario.password_hash))) return null;
 const roles=await usuarios.rolesDeUsuario(usuario.id);
 const token=jwt.sign({id:usuario.id},process.env.JWT_SECRET,{algorithm:"HS256",expiresIn:"2h"});
 return {id:usuario.id,nombre:`${usuario.nombre} ${usuario.apellido}`,correo:usuario.correo,roles,token};
}
