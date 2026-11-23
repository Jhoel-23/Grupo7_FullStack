# Base de datos del Grupo 7 — orden Semana 13

- `schema_demo_grupo7.sql`: copia del SQL de Grupo 7 **solo para base vacía de pruebas**; incluye usuarios y operaciones de demostración.
- `migracion_semana13.sql`: añade `password_hash`, `modificado_por`, `pedido_estados` y la función `pagar_delivery()` con trazabilidad. No hace DROP de las tablas del proyecto.
- `init.js`: comprueba la conexión y aplica la migración; con `--demo` puede instalar primero la base académica si no hay tablas.

**Probar siempre primero en una rama de Neon.** La migración cambia contraseñas de ejemplo a bcrypt y pone la columna antigua en NULL; es una modificación real de los datos y no debe aplicarse sin copia/entorno de pruebas.
