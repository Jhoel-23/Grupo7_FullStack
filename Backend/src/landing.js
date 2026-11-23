/*
 * Pantalla informativa pública del backend.
 * La información de estado se consulta directamente en /api/salud y /api/health.
 * No hay credenciales ni información privada en esta pantalla.
 */
import { randomBytes } from "node:crypto";

export function mostrarInicio(req, res) {
  const nonce = randomBytes(16).toString("base64");
  res.status(200);
  res.set({
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy":
      "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; " +
      "style-src 'nonce-" + nonce + "'; script-src 'nonce-" + nonce + "'; connect-src 'self'; " +
      "img-src 'self' data:; font-src 'none'"
  });
  res.send(paginaHTML(nonce));
}

function paginaHTML(nonce) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="description" content="Panel de verificación de la API del Proyecto Grupo 7 — FarmaSalud Perú y Banco Andino Perú." />
  <title>Grupo 7 | Backend y servicios</title>
  <style nonce="${nonce}">
    :root {color-scheme: light; --forest:#074733;--forest2:#0a5c41;--emerald:#0da770;--line:#d9e8e1;--muted:#658174;--ink:#133b2c;--bg:#f4f8f6;--white:#fff;}
    * {box-sizing:border-box}
    html {scroll-behavior:smooth}
    body {margin:0;background:var(--bg);font:16px/1.58 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink)}
    a {color:inherit}
    button {font:inherit;cursor:pointer}
    button:focus-visible,a:focus-visible {outline:3px solid #10b981;outline-offset:4px}
    .container {width:min(1120px,calc(100% - 40px));margin:0 auto}
    .top {background:var(--forest);color:#fff;border-bottom:1px solid rgba(255,255,255,.12)}
    .nav {display:flex;justify-content:space-between;gap:16px;align-items:center;padding:19px 0}
    .brand {display:flex;align-items:center;gap:12px;text-decoration:none;font-size:17px;font-weight:760;letter-spacing:-.03em}
    .logo {display:grid;place-items:center;width:44px;height:44px;background:linear-gradient(135deg,#1bc88b,#0a9564);border-radius:13px;color:#fff;font-size:16px;font-weight:900;box-shadow:0 6px 22px #022d2160}
    .brand small {display:block;color:#a7d6be;font-weight:450;font-size:11px;letter-spacing:.05em;text-transform:uppercase}
    .navright {display:flex;gap:20px;align-items:center;font-size:13px;font-weight:640}
    .navright a {opacity:.83;text-decoration:none}.navright a:hover {opacity:1;text-decoration:underline}
    .navpill {background:#ffffff15;border:1px solid #ffffff30;border-radius:999px;padding:7px 13px;display:flex;gap:7px;align-items:center;white-space:nowrap}
    .dot {display:inline-block;width:8px;height:8px;border-radius:50%;background:#fbbf24;box-shadow:0 0 0 4px #fbbf2426}
    .dot.ok {background:#31d49c;box-shadow:0 0 0 4px #31d49c25}
    .dot.bad {background:#ff7b7b;box-shadow:0 0 0 4px #ff7b7b22}
    .hero {background:radial-gradient(circle at 90% 20%,#13826078 0,transparent 35%),linear-gradient(130deg,#074733,#073b2c);color:#fff;padding:74px 0 92px;position:relative;overflow:hidden}
    .hero:after {content:"";position:absolute;width:360px;height:360px;border:1px solid #ffffff15;border-radius:50%;right:-180px;bottom:-200px;box-shadow:0 0 0 80px #ffffff06,0 0 0 160px #ffffff04;pointer-events:none}
    .hero-grid {display:grid;grid-template-columns:minmax(0,1.18fr) minmax(280px,.82fr);gap:55px;align-items:center;position:relative;z-index:1}
    .eyebrow {color:#8fefc4;font-size:12px;text-transform:uppercase;letter-spacing:.16em;font-weight:800;margin:0 0 18px}
    h1 {font-size:clamp(36px,4.8vw,59px);letter-spacing:-.05em;line-height:1.08;margin:0 0 23px;font-weight:780}
    .hero-desc {max-width:610px;color:#d1e7dc;font-size:16px;line-height:1.8;margin:0 0 30px}
    .actions {display:flex;gap:12px;flex-wrap:wrap}
    .btn {padding:12px 17px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;gap:9px;text-decoration:none;font-weight:750;font-size:14px;transition:transform .14s,background .14s;border:1px solid transparent;min-height:46px}
    .btn:hover {transform:translateY(-2px)}
    .btn-primary {background:#16bd80;color:#042e20}.btn-primary:hover{background:#38d9a1}
    .btn-outline {border-color:#ffffff47;color:#fff;background:#ffffff12}.btn-outline:hover {background:#ffffff22}
    .terminal {border-radius:15px;background:#082b22;box-shadow:0 30px 60px #0223197d;border:1px solid #ffffff1b;overflow:hidden}
    .term-head {border-bottom:1px solid #ffffff16;background:#ffffff06;color:#9dc8b3;padding:12px 15px;display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:650}
    .lights {display:flex;gap:6px}.lights span {height:8px;width:8px;background:#4c886e;border-radius:50%}.lights span:first-child{background:#fb776c}.lights span:nth-child(2){background:#f5bf57}
    .term-content {padding:23px 22px;color:#b4ddc7;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px;line-height:2}
    .term-content strong {color:#49e3a3;font-weight:600}.term-comment{color:#80a496}
    .term-cursor {display:inline-block;background:#55d3a0;width:8px;height:16px;vertical-align:middle;animation:blink 1.2s step-end infinite}
    @keyframes blink {50%{opacity:0}}
    main {margin-top:-38px;position:relative;z-index:2;padding-bottom:70px}
    .summary {display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:31px}
    .stat {background:#fff;border:1px solid var(--line);border-radius:17px;padding:22px 23px;box-shadow:0 8px 30px #0738250a}
    .stat-top {display:flex;align-items:center;justify-content:space-between;margin-bottom:15px;gap:6px}
    .stat small {font-weight:750;color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.08em}
    .stat strong {display:block;font-size:21px;letter-spacing:-.025em;margin:2px 0}
    .stat p {color:#6c8076;font-size:13px;margin:0}
    .symbol {width:34px;height:34px;border-radius:10px;background:#e8f7ef;color:#097850;display:grid;place-items:center;font-weight:850}
    .state {font-size:12px;font-weight:800;color:#846500;background:#fff4d8;padding:5px 9px;border-radius:50px;white-space:nowrap}
    .state.ok {color:#08774d;background:#e1f8eb}.state.bad {color:#ad3a37;background:#fff0ef}
    .section-head {display:flex;justify-content:space-between;align-items:end;gap:20px;margin:38px 0 19px}
    h2 {font-size:25px;letter-spacing:-.037em;line-height:1.3;margin:0 0 5px}
    .section-head p {margin:0;color:var(--muted);font-size:14px}
    .refresh {background:white;color:#12694e;border:1px solid #cde4d7;padding:9px 14px;border-radius:10px;font-size:13px;font-weight:760}.refresh:hover{background:#e9f7ef}.refresh:disabled{cursor:wait;opacity:.65}
    .cards {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px}
    .card {background:white;border:1px solid var(--line);border-radius:17px;padding:25px;min-width:0;box-shadow:0 7px 27px #07382507}
    .card-label {font-size:11px;font-weight:850;letter-spacing:.1em;text-transform:uppercase;color:#0e9470;margin-bottom:12px}
    .card h3 {font-size:19px;margin:0 0 5px;letter-spacing:-.025em}
    .card p {color:#718679;font-size:13px;line-height:1.75;margin:0 0 19px}
    .card-bottom {display:flex;align-items:center;justify-content:space-between;gap:15px}
    .link {display:inline-flex;align-items:center;gap:5px;color:#087e55;text-decoration:none;font-weight:780;font-size:13px}.link:hover{text-decoration:underline}
    .endpoint {font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;background:#eef7f2;color:#255e44;padding:6px 8px;border-radius:7px}
    .details {background:#eaf4ef;border:1px solid #d4e8dd;border-radius:17px;padding:24px;margin-top:28px;display:flex;align-items:center;justify-content:space-between;gap:20px}
    .details h3 {font-size:17px;margin:0 0 4px}.details p{font-size:13px;color:#617d6c;margin:0}
    .copy {background:var(--forest);color:#fff;border:0;padding:12px 16px;border-radius:10px;font-weight:750;white-space:nowrap}
    .copy:hover{background:#0b6e50}
    .footer {border-top:1px solid var(--line);padding:25px 0 35px;color:#788c80;font-size:12px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
    .sr-only {position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    @media(max-width:840px){.hero-grid{grid-template-columns:1fr;gap:25px}.hero{padding:55px 0 75px}.terminal{max-width:560px}.summary{grid-template-columns:1fr}.cards{grid-template-columns:1fr}.stat{padding:20px}.section-head{align-items:start}}
    @media(max-width:540px){.container{width:min(100% - 26px,1120px)}.nav{gap:8px}.navright a{display:none}.hero{padding-top:43px}.terminal{display:none}.section-head{flex-direction:column}.details{flex-direction:column;align-items:stretch}.copy{width:100%}.hero-desc{font-size:14px}.btn{width:100%}}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{animation-duration:.01ms!important;transition:none!important}}
  </style>
</head>
<body>
  <div class="top"><nav class="nav container" aria-label="Navegación principal">
    <a class="brand" href="/" aria-label="Inicio Grupo 7"><span class="logo">G7</span><span>Grupo 7 <small>Plataforma Full Stack</small></span></a>
    <div class="navright"><a href="#servicios">Portales y endpoints</a><a href="#arquitectura">Arquitectura</a><span class="navpill"><span class="dot" id="mini-dot"></span><span id="mini-state">Verificando servicios</span></span></div>
  </nav></div>
  <header class="hero"><div class="container hero-grid">
    <div><p class="eyebrow">Proyecto Grupo 7 &nbsp; / &nbsp; Infraestructura cloud</p>
      <h1>Backend listo para<br />conectar tu negocio.</h1>
      <p class="hero-desc">API REST de FarmaSalud Perú y Banco Andino Perú. Servicios de farmacia, pedidos y operaciones bancarias integrados desde una arquitectura moderna, con acceso a los portales web.</p>
      <div class="actions"><a class="btn btn-primary" href="#servicios">Explorar servicios <span aria-hidden="true">↗</span></a><a class="btn btn-outline" href="/api/health" target="_blank" rel="noopener noreferrer">Ver conexión a Neon <span aria-hidden="true">↗</span></a></div>
    </div>
    <div class="terminal" aria-label="Estructura tecnológica">
      <div class="term-head"><span>grupo7-api / infraestructura</span><div class="lights" aria-hidden="true"><span></span><span></span><span></span></div></div>
      <div class="term-content"><div><span class="term-comment">// Entorno de producción</span></div><div>backend: <strong>Node.js + Express</strong></div><div>deploy: <strong>Render</strong></div><div>database: <strong>Neon PostgreSQL</strong></div><div>storage: <strong>Neon Object Storage</strong></div><div>frontend: <strong>React + Vercel</strong></div><div style="margin-top:12px"><span class="term-comment">$ GET /api/salud</span> <span class="term-cursor"></span></div></div>
    </div>
  </div></header>
  <main class="container">
    <section class="summary" aria-label="Verificación de servicios">
      <article class="stat"><div class="stat-top"><small>Servidor API</small><span class="symbol" aria-hidden="true">⌘</span></div><strong>Node.js / Express</strong><p><span class="state" id="api-status" role="status" aria-live="polite">Comprobando…</span></p></article>
      <article class="stat"><div class="stat-top"><small>Base de datos</small><span class="symbol" aria-hidden="true">▤</span></div><strong>PostgreSQL · Neon</strong><p><span class="state" id="db-status" role="status" aria-live="polite">Comprobando…</span></p></article>
      <article class="stat"><div class="stat-top"><small>Almacenamiento</small><span class="symbol" aria-hidden="true">◈</span></div><strong>Object Storage</strong><p>Integrado para imágenes · Estado no comprobado aquí</p></article>
    </section>
    <section id="servicios" aria-labelledby="servicios-titulo"><div class="section-head"><div><h2 id="servicios-titulo">Accesos y verificaciones</h2><p>Abre los portales o revisa la respuesta de los servicios en una nueva pestaña.</p></div><button class="refresh" type="button" id="refresh">↻ &nbsp; Actualizar estado</button></div>
      <div class="cards">
        <article class="card"><div class="card-label">01 · Portal público</div><h3>FarmaSalud y Banco Andino</h3><p>Accede como cliente para consultar medicamentos, crear pedidos y gestionar operaciones disponibles.</p><div class="card-bottom"><a class="link" href="https://grupo7-cliente.vercel.app/" target="_blank" rel="noopener noreferrer">Abrir portal Cliente <span aria-hidden="true">↗</span></a><span class="endpoint">Vercel</span></div></article>
        <article class="card"><div class="card-label">02 · Gestión interna</div><h3>Administración y empleados</h3><p>Accede al panel de gestión, inventario, pedidos y herramientas administrativas según el rol asignado.</p><div class="card-bottom"><a class="link" href="https://grupo7-admin.vercel.app/" target="_blank" rel="noopener noreferrer">Abrir Administración <span aria-hidden="true">↗</span></a><span class="endpoint">Vercel</span></div></article>
        <article class="card"><div class="card-label">03 · Diagnóstico de API</div><h3>Estado del servidor</h3><p>Confirma que el backend Express está disponible y responde desde Render con información JSON.</p><div class="card-bottom"><a class="link" href="/api/salud" target="_blank" rel="noopener noreferrer">Consultar endpoint <span aria-hidden="true">↗</span></a><code class="endpoint">GET /api/salud</code></div></article>
        <article class="card"><div class="card-label">04 · Diagnóstico de datos</div><h3>Conexión con Neon</h3><p>Verifica mediante una consulta real que el backend puede comunicarse con PostgreSQL en Neon.</p><div class="card-bottom"><a class="link" href="/api/health" target="_blank" rel="noopener noreferrer">Verificar base de datos <span aria-hidden="true">↗</span></a><code class="endpoint">GET /api/health</code></div></article>
      </div>
    </section>
    <section id="arquitectura" class="details"><div><h3>Arquitectura Full Stack · Grupo 7</h3><p>React en Vercel &nbsp;→&nbsp; API Node.js en Render &nbsp;→&nbsp; PostgreSQL y almacenamiento de imágenes en Neon.</p></div><button class="copy" type="button" id="copy-api">Copiar URL de la API</button></section>
  </main>
  <footer class="container footer"><span>© Grupo 7 · FarmaSalud Perú y Banco Andino Perú</span><span>Panel público informativo · Sin acceso a datos privados</span></footer>
  <script nonce="${nonce}">
    (() => {
      'use strict';
      const byId = id => document.getElementById(id);
      const setBadge = (id, ok, label) => {
        const node = byId(id);
        node.textContent = label;
        node.className = 'state ' + (ok ? 'ok' : 'bad');
      };
      async function comprobar() {
        const refrescar = byId('refresh');
        refrescar.disabled = true;
        byId('api-status').className = byId('db-status').className = 'state';
        byId('api-status').textContent = byId('db-status').textContent = 'Comprobando…';
        byId('mini-state').textContent = 'Verificando servicios';
        byId('mini-dot').className = 'dot';
        const check = async (url, validate) => {
          const ctl = new AbortController();
          const timer = setTimeout(() => ctl.abort(), 20000);
          try {
            const r = await fetch(url, {cache:'no-store',signal:ctl.signal,headers:{Accept:'application/json'}});
            if (!r.ok) return false;
            return validate(await r.json());
          } catch (_) { return false; }
          finally { clearTimeout(timer); }
        };
        try {
          const [api, db] = await Promise.all([
            check('/api/salud', json => json.ok === true),
            check('/api/health', json => json.estado === 'conectado')
          ]);
          setBadge('api-status', api, api ? '● Operativo' : '● No disponible');
          setBadge('db-status', db, db ? '● Conectado' : '● No disponible');
          byId('mini-state').textContent = api && db ? 'Servicios operativos' : 'Revisar estado';
          byId('mini-dot').className = 'dot ' + (api && db ? 'ok' : 'bad');
        } finally { refrescar.disabled = false; }
      }
      byId('refresh').addEventListener('click', comprobar);
      byId('copy-api').addEventListener('click', async () => {
        const btn = byId('copy-api');
        try {
          await navigator.clipboard.writeText(location.origin);
          btn.textContent = '✓ Dirección copiada';
        } catch (_) {
          btn.textContent = 'URL: ' + location.origin;
        }
      });
      comprobar();
    })();
  </script>
</body>
</html>`;
}
