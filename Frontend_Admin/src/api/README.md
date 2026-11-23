# API HTTP del Grupo 7

- `client.js`: `fetch`, JSON, token y manejo centralizado de errores.
- `auth.api.js`: inicio de sesión.
- `banco.api.js`: cuentas, depósitos, operaciones y administración bancaria.
- `farmacia.api.js`: pedidos, pagos, despachos, cobros y seguimiento.
- `usuarios.api.js`: alta de clientes por personal autorizado.
- `grupo7.api.js`: exportaciones compatibles con las pantallas del proyecto.

React **no** lee `DATABASE_URL`; Vite usa su `proxy /api` al backend Express.
