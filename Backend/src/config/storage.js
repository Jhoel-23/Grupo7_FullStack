/**
 * Object Storage S3 compatible (Neon o R2). Firma AWS SigV4 con APIs nativas Node 20+.
 * NO entrega AWS_ACCESS_KEY_ID ni AWS_SECRET_ACCESS_KEY al navegador.
 * Solo keys generadas por el servidor; sin ACL, sin archivos locales persistentes.
 */
import { createHash, createHmac } from "node:crypto";
import { HttpError } from "../utils/HttpError.js";

const hash = value => createHash("sha256").update(value).digest("hex");
const hmac = (key, value) => createHmac("sha256", key).update(value).digest();
const bytes = value => Buffer.isBuffer(value) ? value : Buffer.from(value || "");
export function storageConfigurado(env = process.env) {
  return Boolean(env.AWS_ENDPOINT_URL_S3 && env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.S3_BUCKET);
}
export function firmarPeticion({ method, key, body, contentType, now = new Date(), env = process.env }) {
  if (!storageConfigurado(env)) throw new HttpError(503, "Object Storage no esta configurado en Render/Backend");
  if (!/^(GET|PUT|DELETE)$/.test(method) || !/^farmacia\/[a-f0-9-]+\.(png|jpg|webp)$/.test(key)) {
    throw new HttpError(400, "Clave de imagen no permitida");
  }
  if (!/^[a-z0-9][a-z0-9.\-]{2,62}$/.test(env.S3_BUCKET)) {
    throw new HttpError(503, "S3_BUCKET no es valido");
  }
  const endpoint = new URL(env.AWS_ENDPOINT_URL_S3);
  if (endpoint.protocol !== "https:" || endpoint.search || endpoint.hash || endpoint.username || endpoint.password) {
    throw new HttpError(503, "El endpoint del almacenamiento debe ser HTTPS sin usuario ni parametros");
  }
  const path = `${endpoint.pathname.replace(/\/$/, "")}/${env.S3_BUCKET}/${key}`;
  const url = new URL(endpoint.origin + path);
  const region = env.AWS_REGION || "us-east-2";
  const timestamp = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const shortDate = timestamp.slice(0, 8);
  const data = bytes(body);
  const bodyHash = hash(data);
  const headers = {
    host: url.host,
    "x-amz-content-sha256": bodyHash,
    "x-amz-date": timestamp
  };
  if (env.AWS_SESSION_TOKEN) headers["x-amz-security-token"] = env.AWS_SESSION_TOKEN;
  const signedKeys = Object.keys(headers).sort();
  const canonicalHeaders = signedKeys.map(k => `${k}:${headers[k].trim()}\n`).join("");
  const scope = `${shortDate}/${region}/s3/aws4_request`;
  const canonicalRequest = [method, url.pathname, "", canonicalHeaders, signedKeys.join(";"), bodyHash].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", timestamp, scope, hash(canonicalRequest)].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(Buffer.from(`AWS4${env.AWS_SECRET_ACCESS_KEY}`), shortDate), region), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const outHeaders = {
    "x-amz-content-sha256": bodyHash,
    "x-amz-date": timestamp,
    authorization: `AWS4-HMAC-SHA256 Credential=${env.AWS_ACCESS_KEY_ID}/${scope}, SignedHeaders=${signedKeys.join(";")}, Signature=${signature}`
  };
  if (contentType) outHeaders["content-type"] = contentType;
  if (env.AWS_SESSION_TOKEN) outHeaders["x-amz-security-token"] = env.AWS_SESSION_TOKEN;
  return { url: url.toString(), headers: outHeaders };
}
export async function objectRequest(method, key, { data, contentType, transport = fetch } = {}) {
  const payload = bytes(data);
  const signed = firmarPeticion({ method, key, body: method === "PUT" ? payload : Buffer.alloc(0), contentType });
  let response;
  try {
    response = await transport(signed.url, {
      method, headers: signed.headers,
      ...(method === "PUT" ? { body: payload } : {}),
      signal: AbortSignal.timeout(20000)
    });
  } catch {
    throw new HttpError(502, "No se pudo conectar al Object Storage");
  }
  if (!response.ok) {
    // No exponer posibles datos sensibles de un XML de error S3 al navegador.
    console.error("Error Object Storage", { method, status: response.status });
    throw new HttpError(502, "Object Storage rechazo la operacion; revisa sus credenciales y bucket");
  }
  return response;
}
