/* ===================== EDITA AQUÍ ===================== */
const CONFIG = {
  nombre: "Dennis",
  edad: 23,
  pin: "1711", // DDMM de su cumpleaños: 17/11
  musica1: "assets/musica/musica1.mp3", // suena al abrir el sobre y en el pastel
  musica2: "assets/musica/musica2.mp3", // entra con el atardecer y las estrellas
  fotos: [
    { src: "assets/fotos/foto1.jpg", texto: "Esa risa que lo cambia todo ✨" },
    { src: "assets/fotos/foto2.jpg", texto: "Hasta la luz te busca 🌟" },
    { src: "assets/fotos/foto3.jpg", texto: "Tú y el sol, mismo brillo ☀️" },
    { src: "assets/fotos/foto4.jpg", texto: "Brillando bajo las luces 🌙" },
    { src: "assets/fotos/foto5.jpg", texto: "Siempre con esa sonrisa 💛" },
  ],
  carta: `Dennis:

Hoy cumples 23 y no quería que fuera un día cualquiera, porque tú no eres una persona cualquiera.

Gracias por tu risa, por tus conversaciones y por esa forma tan tuya de hacer que todo se sienta más liviano. Eres de esas personas que llegan y, sin darse cuenta, iluminan todo a su alrededor… igual que las estrellas que hace un rato escribieron tu nombre.

Te deseo un año lleno de cosas bonitas: que se cumplan tus sueños, que nunca te falten motivos para sonreír y que estés rodeada de gente que te quiera tanto como mereces.

Y si algún día lo olvidas, vuelve aquí: el cielo ya sabe tu nombre, y yo también.

¡Feliz cumpleaños! 🌸`,
  firma: "Con muchísimo cariño 💛",
};
/* ===================================================== */

const $ = (s) => document.querySelector(s);
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const azar = (a, b) => a + Math.random() * (b - a);

function irA(id) {
  document.querySelectorAll(".escena").forEach((e) => e.classList.toggle("on", e.id === id));
}

/* ---------- Corazones de fondo ---------- */
const corazones = $("#corazones");
function lanzarCorazones(lista, n) {
  corazones.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const c = document.createElement("span");
    c.className = "corazon";
    c.textContent = lista[i % lista.length];
    c.style.cssText = `left:${azar(0, 100)}%;--t:${azar(12, 26)}px;--dur:${azar(10, 18)}s;--del:${azar(0, 12)}s;--dx:${azar(-60, 60)}px`;
    corazones.appendChild(c);
  }
}
lanzarCorazones(["💗", "🤍", "💕", "🌸"], 14);

/* ---------- Música ---------- */
const m1 = $("#musica1"), m2 = $("#musica2"), btnMusica = $("#btnMusica");
m1.src = CONFIG.musica1;
m2.src = CONFIG.musica2;
let m2ok = true;
m2.addEventListener("error", () => (m2ok = false));

function fundir(audio, hasta, ms) {
  // iOS ignora volume: ahí el cambio será directo, no falla.
  const desde = audio.volume, t0 = performance.now();
  return new Promise((r) => {
    (function paso(t) {
      const k = Math.min(1, (t - t0) / ms);
      audio.volume = desde + (hasta - desde) * k;
      k < 1 ? requestAnimationFrame(paso) : r();
    })(t0);
  });
}
async function cambiarMusica() {
  if (!m2ok) return; // sin musica2 sigue la primera
  m2.volume = 0;
  m2.currentTime = 0;
  m2.play().catch(() => {});
  await Promise.all([fundir(m1, 0, 3000), fundir(m2, 1, 3000)]);
  m1.pause();
}
btnMusica.addEventListener("click", () => {
  const mute = !m1.muted;
  m1.muted = m2.muted = mute;
  btnMusica.textContent = mute ? "🔇" : "🔊";
  btnMusica.setAttribute("aria-label", mute ? "Activar música" : "Silenciar música");
});

/* ---------- 1. PIN ---------- */
let pin = "";
const cajas = [...document.querySelectorAll("#pinCajas span")];
function pintarPin() {
  cajas.forEach((c, i) => {
    c.textContent = pin[i] || "";
    c.classList.toggle("lleno", !!pin[i]);
  });
}
function teclear(k) {
  if (k === "borrar") pin = pin.slice(0, -1);
  else if (pin.length < 4) pin += k;
  pintarPin();
  if (pin.length === 4) setTimeout(revisarPin, 250);
}
function revisarPin() {
  if (pin === CONFIG.pin) return irA("s-sobre");
  const fila = $("#pinCajas");
  fila.classList.add("mal");
  setTimeout(() => { fila.classList.remove("mal"); pin = ""; pintarPin(); }, 600);
}
$("#teclado").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (b) teclear(b.dataset.k || b.textContent);
});
document.addEventListener("keydown", (e) => {
  if (!$("#s-pin").classList.contains("on")) return;
  if (/^\d$/.test(e.key)) teclear(e.key);
  if (e.key === "Backspace") teclear("borrar");
});

/* ---------- 2. Sobre ---------- */
$("#sello").addEventListener("click", () => {
  m1.volume = 1;
  m1.play().catch(() => {});
  // Desbloquea la 2da canción en iOS con este mismo toque
  m2.muted = true;
  m2.play().then(() => { m2.pause(); m2.muted = m1.muted; }).catch(() => {});
  btnMusica.classList.remove("oculto");
  $("#sobre").classList.add("abierta");
  $("#toqueSello").classList.add("oculto");
  setTimeout(() => $("#sobre").classList.add("leida"), 2300);
});
$("#btnSorpresa").addEventListener("click", () => {
  irA("s-pastel");
  lanzarCorazones(["🎈", "💗", "✨", "🎉"], 12);
});

/* ---------- 3. Pastel ---------- */
const velasBox = $("#velas");
const velas = [];
(function crearVelas() {
  // Dos anillos sobre el piso de arriba: 14 afuera + 9 adentro = 23
  const cx = 135, cy = 62;
  const anillos = [[14, 84, 12], [CONFIG.edad - 14, 46, 6]];
  for (const [n, rx, ry] of anillos) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (rx < 60 ? 0.3 : 0);
      const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
      const v = document.createElement("div");
      v.className = "vela";
      v.style.left = x - 3.5 + "px";
      v.style.top = y - 31 + "px";
      v.style.zIndex = Math.round(y);
      v.innerHTML = '<div class="llama"></div>';
      velasBox.appendChild(v);
      velas.push(v);
    }
  }
})();

let celebrado = false;
function apagar(cuantas) {
  const vivas = velas.filter((v) => !v.classList.contains("off"));
  vivas.sort(() => Math.random() - 0.5).slice(0, cuantas).forEach((v) => v.classList.add("off"));
  if (velas.every((v) => v.classList.contains("off")) && !celebrado) celebrar();
}
$("#pastel").addEventListener("click", (e) => {
  const v = e.target.closest(".vela");
  if (v && !v.classList.contains("off")) { v.classList.add("off"); apagar(0); }
  else apagar(4);
});

let micStream = null;
$("#btnMic").addEventListener("click", async () => {
  const btn = $("#btnMic");
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    btn.textContent = "No pude usar el micrófono, toca el pastel 🎂";
    return;
  }
  btn.textContent = "Ahora sopla fuerte… 🌬️";
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const an = ctx.createAnalyser();
  an.fftSize = 512;
  ctx.createMediaStreamSource(micStream).connect(an);
  const datos = new Uint8Array(an.fftSize);
  let racha = 0;
  (function escuchar() {
    if (celebrado) { micStream.getTracks().forEach((t) => t.stop()); ctx.close(); return; }
    an.getByteTimeDomainData(datos);
    let suma = 0;
    for (const d of datos) suma += (d - 128) ** 2;
    const volumen = Math.sqrt(suma / datos.length); // ~0 silencio, >25 soplido
    racha = volumen > 22 ? racha + 1 : 0;
    if (racha > 3) apagar(Math.ceil(volumen / 18));
    requestAnimationFrame(escuchar);
  })();
});

async function celebrar() {
  celebrado = true;
  $("#btnMic").classList.add("oculto");
  $("#pastelTitulo").textContent = `¡Feliz cumpleaños número ${CONFIG.edad}! 🎉`;
  $("#pastelTexto").textContent = "Que se cumpla todo lo que pediste 💗";
  confeti();
  await esperar(4200);

  // Gerberas
  corazones.innerHTML = "";
  sembrarGerberas();
  const sCielo = $("#s-cielo"), narra = $("#narra"), sub = $("#sub");
  sCielo.classList.add("dia-texto");
  narra.textContent = "Para ti, que floreces más bonita cada año 🌸";
  irA("s-cielo");
  $("#jardin").classList.add("on");
  await esperar(5500);

  // Atardecer
  narra.style.opacity = 0;
  await esperar(1200);
  $("#cielo").classList.add("es-tarde");
  sCielo.classList.remove("dia-texto");
  cambiarMusica();
  narra.textContent = "Y cuando cae la tarde…";
  narra.style.opacity = 1;
  await esperar(5000);

  // Noche
  narra.style.opacity = 0;
  $("#cielo").classList.add("es-noche");
  $("#jardin").classList.add("dormido");
  cielo.encender();
  await esperar(1800);
  narra.textContent = "…el cielo tiene algo que decirte";
  narra.style.opacity = 1;
  await esperar(4000);
  narra.style.opacity = 0;
  await esperar(1000);

  // Su nombre en estrellas
  await cielo.formarNombre();
  await esperar(4500);
  sub.textContent = `Hoy el cielo lleva tu nombre · ${CONFIG.edad} ✨`;
  sub.style.opacity = 1;
  await esperar(1500);
  $("#btnFotos").classList.remove("oculto");
}

/* ---------- Gerberas ---------- */
function gerberaSVG(c1, c2) {
  let p = "";
  for (let i = 0; i < 22; i++) p += `<ellipse cx="0" cy="-31" rx="6.5" ry="24" fill="${c1}" transform="rotate(${i * 360 / 22})"/>`;
  for (let i = 0; i < 22; i++) p += `<ellipse cx="0" cy="-22" rx="4.6" ry="16" fill="${c2}" transform="rotate(${i * 360 / 22 + 8})"/>`;
  return `<svg viewBox="-60 -60 120 120">${p}<circle r="15" fill="#f4b23c"/><circle r="11" fill="#5a3418"/><circle r="6" fill="#2e1a0c"/></svg>`;
}
function sembrarGerberas() {
  const colores = [["#ff5c8a", "#ff86a8"], ["#ff8a3d", "#ffad6b"], ["#ff4d6d", "#ff7b92"], ["#ffb3c7", "#ffd0dd"], ["#f9653b", "#ff9166"]];
  const ancho = innerWidth;
  const n = ancho < 500 ? 7 : ancho < 1000 ? 10 : 14;
  const jardin = $("#jardin");
  jardin.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const [c1, c2] = colores[i % colores.length];
    const s = azar(70, 120) * (ancho < 500 ? 0.85 : 1);
    const f = document.createElement("div");
    f.className = "flor";
    f.style.cssText = `--x:${(i + 0.5) / n * 100 + azar(-3, 3)}%;--h:${azar(18, 40)}vh;--s:${s}px;--d:${azar(0, 1.6)}s`;
    f.innerHTML = `<div class="tallo"></div><div class="cabeza">${gerberaSVG(c1, c2)}</div>`;
    jardin.appendChild(f);
  }
}

/* ---------- Cielo de estrellas ---------- */
const cielo = (() => {
  const cv = $("#estrellas"), ctx = cv.getContext("2d");
  let W, H, alfa = 0, objetivoAlfa = 0, modo = null, fugaz = null;
  const fondo = [], parts = [];

  function medir() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fondo.length = 0;
    const n = Math.round((W * H) / 3500);
    for (let i = 0; i < n; i++) fondo.push({ x: azar(0, W), y: azar(0, H * 0.85), r: azar(0.3, 1.4), f: azar(0, 6.3), v: azar(0.5, 2) });
    if (modo) apuntar(modo);
  }

  function puntosTexto(px, cy) {
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const o = off.getContext("2d");
    o.font = `700 ${px}px "Dancing Script", cursive`;
    o.textAlign = "center"; o.textBaseline = "middle";
    o.fillText(CONFIG.nombre, W / 2, cy);
    const img = o.getImageData(0, 0, W, H).data;
    const paso = Math.max(3, Math.round(px / 34));
    const pts = [];
    for (let y = 0; y < H; y += paso)
      for (let x = 0; x < W; x += paso)
        if (img[(y * W + x) * 4 + 3] > 140) pts.push({ x: x + azar(-0.8, 0.8), y: y + azar(-0.8, 0.8) });
    return pts;
  }

  function apuntar(m) {
    modo = m;
    const grande = m === "centro";
    const px = grande ? Math.min(W * 0.3, H * 0.3, 230) : Math.min(W * 0.17, H * 0.14, 120);
    const pts = puntosTexto(px, grande ? H * 0.42 : H * 0.13);
    if (!parts.length) pts.forEach((p) => parts.push({ x: azar(0, W), y: azar(0, H), tx: p.x, ty: p.y, k: azar(0.015, 0.045), f: azar(0, 6.3) }));
    else parts.forEach((p, i) => { const q = pts[i % pts.length]; p.tx = q.x; p.ty = q.y; });
  }

  function dibujar(t) {
    alfa += (objetivoAlfa - alfa) * 0.02;
    ctx.clearRect(0, 0, W, H);
    if (alfa > 0.01) {
      for (const s of fondo) {
        ctx.globalAlpha = alfa * (0.45 + 0.55 * Math.sin(t / 1000 * s.v + s.f));
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
      }
      for (const p of parts) {
        p.x += (p.tx - p.x) * p.k; p.y += (p.ty - p.y) * p.k;
        const brillo = 0.75 + 0.25 * Math.sin(t / 400 + p.f);
        ctx.globalAlpha = 0.18 * brillo; ctx.fillStyle = "#ffe7b0";
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.4, 0, 7); ctx.fill();
        ctx.globalAlpha = brillo; ctx.fillStyle = "#fffaf0";
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.25, 0, 7); ctx.fill();
      }
      // Estrella fugaz de vez en cuando
      if (!fugaz && Math.random() < 0.004) fugaz = { x: azar(W * 0.2, W), y: azar(0, H * 0.3), vida: 1 };
      if (fugaz) {
        ctx.globalAlpha = fugaz.vida;
        const g = ctx.createLinearGradient(fugaz.x, fugaz.y, fugaz.x + 90, fugaz.y - 40);
        g.addColorStop(0, "#fff"); g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(fugaz.x, fugaz.y); ctx.lineTo(fugaz.x + 90, fugaz.y - 40); ctx.stroke();
        fugaz.x -= 9; fugaz.y += 4; fugaz.vida -= 0.02;
        if (fugaz.vida <= 0) fugaz = null;
      }
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(dibujar);
  }

  let espera;
  addEventListener("resize", () => { clearTimeout(espera); espera = setTimeout(medir, 200); });
  medir();
  requestAnimationFrame(dibujar);

  return {
    encender() { objetivoAlfa = 1; },
    async formarNombre() {
      await document.fonts.load('700 100px "Dancing Script"').catch(() => {});
      apuntar("centro");
    },
    subirNombre() { apuntar("arriba"); },
  };
})();

/* ---------- 4. Fotos ---------- */
$("#btnFotos").addEventListener("click", () => {
  $("#sub").style.opacity = 0;
  $("#btnFotos").classList.add("oculto");
  $("#jardin").classList.add("lejos");
  cielo.subirNombre();
  const car = $("#carrusel");
  car.innerHTML = "";
  CONFIG.fotos.forEach((f, i) => {
    const fig = document.createElement("figure");
    fig.className = "polaroid";
    fig.style.cssText = `--r:${azar(-5, 5).toFixed(1)}deg;--del:${0.8 + i * 0.35}s`;
    fig.innerHTML = `<img src="${f.src}" alt="${f.texto}" loading="lazy"><figcaption>${f.texto}</figcaption>`;
    fig.querySelector("img").addEventListener("error", () => { fig.remove(); ajustarCarrusel(); });
    car.appendChild(fig);
  });
  ajustarCarrusel();
  irA("s-fotos");
});
function ajustarCarrusel() {
  const car = $("#carrusel");
  car.classList.toggle("pocas", car.scrollWidth <= car.clientWidth + 2);
}
document.querySelectorAll(".flecha").forEach((b) =>
  b.addEventListener("click", () => $("#carrusel").scrollBy({ left: b.dataset.dir * 280, behavior: "smooth" }))
);

/* ---------- 5. Carta ---------- */
let saltar = false;
$("#btnCarta").addEventListener("click", async () => {
  irA("s-carta");
  lanzarCorazones(["💛", "🤍", "💗", "✨"], 16);
  const caja = $("#cartaTexto"), papel = $("#papel");
  caja.textContent = "";
  await esperar(1400);
  const texto = [...CONFIG.carta];
  for (let i = 0; i < texto.length; i++) {
    if (saltar) { caja.textContent = CONFIG.carta; break; }
    caja.textContent += texto[i];
    papel.scrollTop = papel.scrollHeight;
    await esperar(texto[i] === "\n" ? 260 : /[.,…:!]/.test(texto[i]) ? 180 : 38);
  }
  caja.classList.add("listo");
  $("#firma").textContent = CONFIG.firma;
  $("#firma").classList.remove("oculto");
  papel.scrollTop = papel.scrollHeight;
  await esperar(1500);
  $("#btnOtraVez").classList.remove("oculto");
});
$("#papel").addEventListener("click", () => (saltar = true));
$("#btnOtraVez").addEventListener("click", () => location.reload());

/* ---------- Confeti ---------- */
function confeti() {
  const cv = $("#confeti"), ctx = cv.getContext("2d");
  const W = (cv.width = innerWidth), H = (cv.height = innerHeight);
  const colores = ["#ff5c8a", "#ffb3c7", "#f6c34f", "#8fd0f2", "#ff8a3d", "#ffffff", "#c58cff"];
  const ps = Array.from({ length: W < 500 ? 160 : 260 }, () => ({
    x: W / 2 + azar(-40, 40), y: H * 0.55,
    vx: azar(-9, 9), vy: azar(-17, -6),
    w: azar(6, 11), h: azar(8, 15), r: azar(0, 6), vr: azar(-0.25, 0.25),
    c: colores[Math.floor(azar(0, colores.length))],
  }));
  (function paso() {
    ctx.clearRect(0, 0, W, H);
    let vivas = 0;
    for (const p of ps) {
      p.vy += 0.32; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      if (p.y < H + 20) vivas++;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
      ctx.restore();
    }
    vivas ? requestAnimationFrame(paso) : ctx.clearRect(0, 0, W, H);
  })();
}
