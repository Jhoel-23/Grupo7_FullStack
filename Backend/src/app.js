import express from "express";
import cors from "cors";
import { router as auth } from "./routes/auth.routes.js";
import { router as farmacia } from "./routes/farmacia.routes.js";
import { router as banco } from "./routes/banco.routes.js";
import { router as comun } from "./routes/comun.routes.js";
import { router as seguimiento } from "./routes/seguimiento.routes.js";
import { sql } from "./config/db.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { router as imagenes } from "./routes/imagenes.routes.js";
import { router as productos } from "./routes/productos.routes.js";
export const app=express();
const origins = new Set([
  "http://localhost:5173", "http://localhost:5174",
  "http://127.0.0.1:5173", "http://127.0.0.1:5174",
  ...(process.env.ALLOWED_ORIGINS || "").split(",").map(x => x.trim().replace(/\/$/, "")).filter(Boolean)
]);
app.use(cors({ origin: (origin, callback) => callback(null, !origin || origins.has(origin)) }));
app.disable("x-powered-by");
app.use(express.json({limit:"100kb"}));
// Página principal informativa de la API para presentar el proyecto.
// El estado real de la base de datos se comprueba en GET /api/health.
app.get("/", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(200).json({
    proyecto: "Grupo 7 - FarmaSalud Perú y Banco Andino Perú",
    tipo: "API REST",
    backend: "Node.js + Express",
    hosting: "Render",
    estado: "operativo",
    base_datos: "PostgreSQL - Neon",
    imagenes: "Neon Object Storage",
    verificaciones: {
      servidor: "/api/salud",
      base_datos: "/api/health"
    }
  });
});
app.get("/api/health",async(req,res,next)=>{
 try{const r=await sql`SELECT current_database() AS database, NOW() AS fecha`;
 res.json({estado:"conectado",database:r[0].database,fecha:r[0].fecha});}
 catch(error){next(error)}
});
app.get("/api/salud",(req,res)=>res.json({ok:true,sistema:"Grupo 7 - Semana 13"}));
app.use("/api",imagenes);
app.use("/api",productos);
app.use("/api",auth);
app.use("/api",seguimiento);
app.use("/api",farmacia);
app.use("/api",banco);
app.use("/api",comun);
app.use((req,res)=>res.status(404).json({error:"Ruta no encontrada"}));
app.use(errorHandler);
