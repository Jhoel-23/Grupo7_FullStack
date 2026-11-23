import "dotenv/config";
import pg from "pg";
if (!process.env.DATABASE_URL) throw new Error("Configure DATABASE_URL en el backend/.env");
export const pool = new pg.Pool({connectionString:process.env.DATABASE_URL, max:8, idleTimeoutMillis:30000});
export const query=(text,params=[])=>pool.query(text,params);
// sql`... ${valor} ...` convierte cada valor en un parámetro $1, $2... de pg.
export const sql=async(strings,...values)=>{
 if(!Array.isArray(strings)||!Object.prototype.hasOwnProperty.call(strings,'raw')) throw new Error("Usar sql con plantilla etiquetada");
 let statement=strings[0];
 for(let i=0;i<values.length;i++) statement += `$${i+1}`+strings[i+1];
 const result=await pool.query(statement,values);
 return result.rows;
};
