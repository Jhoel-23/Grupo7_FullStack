import "dotenv/config";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pool } from "../src/config/db.js";
const file = join(dirname(fileURLToPath(import.meta.url)), "object_storage.sql");
try {
  const sql = await readFile(file, "utf8");
  await pool.query(sql);
  console.log("Tabla farmacia_imagenes instalada (solo referencias; no archivos binarios)");
} catch (e) { console.error("Error al preparar la tabla de imagenes:", e.message); process.exitCode=1; }
finally { await pool.end(); }
