import test from "node:test";
import assert from "node:assert/strict";
import { firmarPeticion, storageConfigurado } from "../src/config/storage.js";

const env = {
  AWS_ENDPOINT_URL_S3: "https://s3.example.test",
  AWS_REGION: "us-east-2",
  AWS_ACCESS_KEY_ID: "TESTACCESS",
  AWS_SECRET_ACCESS_KEY: "TESTSECRET",
  S3_BUCKET: "grupo7-imagenes"
};

test("Object Storage no se anuncia como configurado sin credenciales", () => {
  assert.equal(storageConfigurado({}), false);
  assert.equal(storageConfigurado(env), true);
});

test("La subida se firma sin incluir secretos en el resultado", () => {
  const signed = firmarPeticion({ method: "PUT", key: "farmacia/12345678-1234-1234-1234-123456789abc.png",
    body: Buffer.from("hola"), contentType: "image/png", now: new Date("2026-11-20T12:00:00.000Z"), env });
  assert.equal(signed.url, "https://s3.example.test/grupo7-imagenes/farmacia/12345678-1234-1234-1234-123456789abc.png");
  assert.match(signed.headers.authorization, /^AWS4-HMAC-SHA256 Credential=TESTACCESS\/20261120\/us-east-2\/s3\/aws4_request,/);
  assert.match(signed.headers.authorization, /Signature=[a-f0-9]{64}$/);
  assert.equal(signed.headers["content-type"], "image/png");
  assert.ok(!JSON.stringify(signed).includes("TESTSECRET"));
});

test("No admite rutas arbitrarias ni protocolos inseguros", () => {
  assert.throws(() => firmarPeticion({ method: "GET", key: "../../.env", env }), /no permitida/);
  assert.throws(() => firmarPeticion({ method: "GET", key: "farmacia/12345678-1234-1234-1234-123456789abc.png", env: {...env,AWS_ENDPOINT_URL_S3:"http://inseguro.example.test"} }), /HTTPS/);
});
