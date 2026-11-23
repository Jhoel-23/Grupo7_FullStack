import jwt from "jsonwebtoken";
export function autenticar(req,res,next){
 const bearer=req.headers.authorization || "";
 const token=bearer.startsWith("Bearer ")?bearer.slice(7):"";
 if(!token) return res.status(401).json({error:"Debe iniciar sesión"});
 try{
  const decoded=jwt.verify(token,process.env.JWT_SECRET,{algorithms:["HS256"]});
  if(!Number.isSafeInteger(decoded.id)||decoded.id<1) throw new Error("Token inválido");
  req.usuarioId=decoded.id;
  next();
 }catch{return res.status(401).json({error:"Sesión inválida o vencida"});}
}
