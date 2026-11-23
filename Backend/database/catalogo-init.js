import "dotenv/config";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../src/config/db.js";

// No automatizar migraciones en producción sin respaldo y autorización explícita.
if (process.env.CONFIRMAR_MIGRACION !== "SI") {
  console.error("Migración NO ejecutada. Revisa el SQL, realiza un respaldo y confirma con CONFIRMAR_MIGRACION=SI.");
  process.exit(1);
}
try {
  const sql = await readFile(join(dirname(fileURLToPath(import.meta.url)),"catalogo_medicamentos.sql"),"utf8");
  await pool.query(sql);
  console.log("Migración de catálogo aplicada: tablas y columnas agregadas sin eliminar pedidos anteriores.");
} catch (error) {
  console.error("No se aplicó la migración:", error.message);
  process.exitCode = 1;
} finally { await pool.end(); }
