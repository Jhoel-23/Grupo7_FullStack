import { ingresar } from "../services/auth.service.js";
export async function login(req,res,next){
 try{
  const result=await ingresar(req.body?.correo,req.body?.password);
  if(!result) return res.status(401).json({error:"Correo o contraseña incorrectos"});
  res.json(result);
 }catch(error){next(error)}
}
