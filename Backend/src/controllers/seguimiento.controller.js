import { consultar } from "../services/seguimiento.service.js";
export async function seguimiento(req,res,next){
 try{const result=await consultar(req.params.codigo,req.usuarioId);
  if(result.error) return res.status(result.status).json({error:result.error});
  res.json(result);
 }catch(error){next(error)}
}
