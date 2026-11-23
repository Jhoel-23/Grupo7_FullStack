import "dotenv/config";
import { app } from "./app.js";
if(!process.env.JWT_SECRET || process.env.JWT_SECRET.length<32){
 throw new Error("Configure JWT_SECRET con al menos 32 caracteres");
}
const puerto=Number(process.env.PORT || 3000);
app.listen(puerto, "0.0.0.0", () => console.log(`Grupo 7 API escuchando en puerto ${puerto}`));
