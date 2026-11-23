import test from "node:test";
import assert from "node:assert/strict";
import { idValido } from "../src/utils/HttpError.js";

test("Identificador positivo de pedido", () => {
  assert.equal(idValido("15"), true);
  assert.equal(idValido("0"), false);
  assert.equal(idValido("abc"), false);
});
