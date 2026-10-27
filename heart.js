(() => {
  const PHRASES = [
    "I love you",
    "Seni seviyorum",
    "Te amo",
    "Je t'aime",
    "Ich liebe dich",
    "Ti amo",
    "Eu te amo",
    "Я тебя люблю",
    "사랑해",
    "愛してる",
    "我爱你",
    "मैं तुमसे प्यार करता हूँ",
    "Σ' αγαπώ",
    "Ik hou van jou",
    "Jag älskar dig",
    "Kocham cię",
    "ฉันรักเธอ",
    "Anh yêu em",
    "Aku cinta kamu",
    "Я тебе кохаю",
  ]; //[cite: 1]

  const BG = "#060208"; //[cite: 1]
  const SC = 21; //[cite: 1]
  const OY = 20; //[cite: 1]
  const GAP = 7; //[cite: 1]
  const SIZES = [9, 10, 11, 12]; //[cite: 1]

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = BG;
  overlay.style.zIndex = "9999999";
  overlay.style.cursor = "pointer";

  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  overlay.appendChild(canvas);
  document.body.appendChild(overlay);

  const ctx = canvas.getContext("2d");
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // 1. Generar els punts del polígon del cor[cite: 1]
  const poly = [];
  for (let i = 0; i < 720; i++) {
    const a = (2 * Math.PI * i) / 720;
    const x = 16 * Math.pow(Math.sin(a), 3) * SC;
    const y =
      (13 * Math.cos(a) -
        5 * Math.cos(2 * a) -
        2 * Math.cos(3 * a) -
        Math.cos(4 * a)) *
        SC +
      OY;
    poly.push({ x, y });
  }

  const yMax = Math.max(...poly.map((p) => p.y));
  const yMin = Math.min(...poly.map((p) => p.y));
  const heartCY = (yMax + yMin) / 2;

  // Funció per calcular les interseccions horitzontals[cite: 1]
  function spans(y) {
    const xs = [];
    for (let i = 0; i < poly.length; i++) {
      const p1 = poly[i],
        p2 = poly[(i + 1) % poly.length];
      if ((p1.y <= y && y < p2.y) || (p2.y <= y && y < p1.y)) {
        xs.push(p1.x + ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y));
      }
    }
    xs.sort((a, b) => a - b);
    const pairs = [];
    for (let i = 0; i < xs.length; i += 2) pairs.push([xs[i], xs[i + 1]]);
    return pairs;
  }

  // Intersecció de caixes per assegurar que el text cap totalment dins els límits[cite: 1]
  function intersect(A, B) {
    const out = [];
    for (const a of A) {
      for (const b of B) {
        const lo = Math.max(a[0], b[0]);
        const hi = Math.min(a[1], b[1]);
        if (hi - lo > 14) out.push([lo, hi]);
      }
    }
    return out;
  }

  // 2. Empaquetar el text (Funció 'build')[cite: 1]
  const rowH = 16;
  const half = rowH / 2;
  const placed = [];

  let currentY = yMax - half;
  while (currentY > yMin + half) {
    const rowSpans = intersect(spans(currentY + half), spans(currentY - half));

    for (let [lo, hi] of rowSpans) {
      lo += 4;
      hi -= 4;
      let cur = lo + Math.random() * 8;
      const line = [];

      while (true) {
        let fit = null;
        for (let tr = 0; tr < 10; tr++) {
          const text = PHRASES[Math.floor(Math.random() * PHRASES.length)];
          const size = SIZES[Math.floor(Math.random() * SIZES.length)];
          ctx.font = `bold ${size}px Arial`;
          const w = ctx.measureText(text).width;
          if (cur + w <= hi) {
            fit = { text, size, w };
            break;
          }
        }
        if (!fit) break;
        line.push({
          x: cur + fit.w / 2,
          text: fit.text,
          size: fit.size,
          w: fit.w,
        });
        cur += fit.w + GAP;
      }

      if (line.length === 0) continue;

      // Distribuir equitativament l'espai sobrant si hi ha més d'una paraula[cite: 1]
      if (line.length > 1) {
        const last = line[line.length - 1];
        const left = hi - (last.x + last.w / 2);
        line.forEach((it, i) => {
          it.x += left * (i / (line.length - 1));
        });
      } else {
        line[0].x = (lo + hi) / 2;
      }

      line.forEach((it) => {
        // Barreja de colors wine, crimson, i blood[cite: 1]
        const rad = Math.min(
          1.0,
          Math.hypot(it.x / (16 * SC), (currentY - heartCY) / (14.5 * SC)),
        );
        const color = rad > 0.6 ? "rgb(250, 25, 40)" : "rgb(180, 15, 30)";

        placed.push({
          x: it.x,
          y: currentY,
          text: it.text,
          size: it.size,
          color: color,
          progress: 0,
          speed: 0.005 + Math.random() * 0.015,
          delay: Math.random() * 60,
        });
      });
    }
    currentY -= rowH;
  }

  overlay.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  // 3. Renderitzar animació
  let frame = 0;
  function animate() {
    if (!document.body.contains(overlay)) return;
    frame++;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    placed.forEach((p) => {
      if (frame > p.delay && p.progress < 1) {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 1;
      }

      const e = 1 - Math.pow(1 - p.progress, 3);

      // Transformar coordenades matemàtiques a Canvas (X centrat, Y invertida i centrada)
      const finalX = cx + p.x;
      const finalY = cy - p.y;

      const startX = finalX;
      const startY = finalY + 150;

      const drawX = startX + (finalX - startX) * e;
      const drawY = startY + (finalY - startY) * e;
      const hover = (1 - e) * 34; //[cite: 1]

      if (p.progress > 0) {
        ctx.font = `bold ${p.size}px Arial`;
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, drawX, drawY - hover);
      }
    });

    requestAnimationFrame(animate);
  }

  animate();
})();
