import "dotenv/config";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import bcrypt from "bcryptjs";
import {pool} from "../src/config/db.js";
const folder=path.dirname(fileURLToPath(import.meta.url));
async function main(){
 const conn=await pool.connect();
 try{
  const existe=await conn.query("SELECT to_regclass('public.usuarios') AS tabla");
  if(!existe.rows[0].tabla){
   if(!process.argv.includes('--demo')){
    throw new Error('Base vacía. Para instalar los datos ACADÉMICOS de ejemplo use npm run db:demo. Para conservar su BD actual, revise DATABASE_URL.');
   }
   console.log('Instalando la base ACADÉMICA de prueba...');
   await conn.query(await readFile(path.join(folder,'schema_demo_grupo7.sql'),'utf8'));
  }
  // El script de migración tiene su propia transacción.
  await conn.query(await readFile(path.join(folder,'migracion_semana13.sql'),'utf8'));
  // Cambiar a bcrypt en cada cuenta conservando sus contraseñas de demostración.
  const r=await conn.query("SELECT id,password FROM usuarios WHERE password_hash IS NULL AND password IS NOT NULL AND password <> ''");
  for(const u of r.rows){
   const hash=await bcrypt.hash(u.password,12);
   await conn.query('UPDATE usuarios SET password_hash=$1, password=NULL WHERE id=$2 AND password_hash IS NULL',[hash,u.id]);
  }
  console.log(`Migración completada. Contraseñas migradas: ${r.rowCount}.`);
 }finally{conn.release();await pool.end()}
}
main().catch(e=>{console.error('Error migrando:',e.message);process.exitCode=1;pool.end().catch(()=>{});});
