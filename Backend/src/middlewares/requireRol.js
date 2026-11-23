import { query } from "../config/db.js";
export const requireRol=(modulo,roles)=>async(req,res,next)=>{
 try{
  const r=await query('SELECT rol FROM usuario_rol WHERE id_usuario=$1 AND modulo=$2',[req.usuarioId,modulo]);
  if(!r.rows.some(x=>roles.includes(x.rol))) return res.status(403).json({error:"No tiene permisos para esta operación"});
  next();
 }catch(error){next(error)}
};
