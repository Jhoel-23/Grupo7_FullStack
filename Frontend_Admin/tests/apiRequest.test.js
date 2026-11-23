import test from "node:test";
import assert from "node:assert/strict";
import { apiRequest } from "../src/api/client.js";

test("La API recibe JSON y adjunta el token", async () => {
  const anterior = globalThis.fetch;
  try {
    globalThis.fetch = async (url, opciones) => {
      assert.equal(url, "/api/banco/mis-cuentas");
      assert.equal(opciones.headers.Authorization, "Bearer prueba");
      return { ok: true, text: async () => JSON.stringify({ cuentas: [] }) };
    };
    assert.deepEqual(await apiRequest("/banco/mis-cuentas", { token: "prueba" }), { cuentas: [] });
  } finally { globalThis.fetch = anterior; }
});

test("La API explica el error 401", async () => {
  const anterior = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, status: 401, text: async () => JSON.stringify({ error: "Debe iniciar sesión" }) });
    await assert.rejects(() => apiRequest("/banco/mis-cuentas"), /Debe iniciar sesión/);
  } finally { globalThis.fetch = anterior; }
});
