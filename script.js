// Bilder für die Money Wipe, je nach Thema (# und Leerzeichen sind für die URL kodiert)
const WIPE_SETS = {
  musik: [
    "img/The_Neighbourhood.png",
    "img/The_Weeknd.png",
    "img/Travis_MONEY_TRANSITION.png",
    "img/Travis_Scott.png",
    "img/WEEKNS_MONEY_TRANSTION.png",
    "img/musik%20note.png",
    "img/musik%20transition.png",
    "img/musik%20vinly.png",
    "img/%23SWAG.png"
  ],
  f1: [
    "img/F1_HELMET.png",
    "img/f1_image.png",
    "img/f1%20logo.png",
    "img/red_bull.png"
  ],
  gaming: [
    "img/8%20Ball.png",
    "img/%23SWAG.png",
    "img/musik%20note.png",
    "img/Travis_Scott.png",
    "img/f1%20logo.png"
  ]
};
WIPE_SETS.autos = [
  "img/AGERA.jpg",
  "img/BLUPRINT.jpg",
  "img/GHOST.jpg",
  "img/LOGOO.jpg",
  "img/red_bull.png"
];
WIPE_SETS.start = [...new Set([...WIPE_SETS.musik, ...WIPE_SETS.f1, ...WIPE_SETS.autos, ...WIPE_SETS.gaming])];
const WIPE_IMGS = WIPE_SETS.start;

// Inhalte für Musik
const STAGES = {
  musik: {
    kicker: "Was ich höre",
    items: [
      { name: "Travis Scott", img: "img/Travis_Scott.png", text: "Dunkle Beats, riesige Produktionen und eine Energie, die keiner sonst hat.", facts: [["Lieblingsalbum", "Astroworld"], ["Song", "SICKO MODE"], ["Vibe", "Rage"]] },
      { name: "The Weeknd", img: "img/The_Weeknd.png", text: "Seine Stimme und dieser 80er Sound laufen bei mir in Dauerschleife.", facts: [["Lieblingsalbum", "After Hours"], ["Song", "Blinding Lights"], ["Vibe", "Nachtfahrt"]] },
      { name: "The Neighbourhood", img: "img/The_Neighbourhood.png", text: "Schwarz weiß, melancholisch und trotzdem perfekt zum Abschalten.", facts: [["Lieblingsalbum", "I Love You."], ["Song", "Sweater Weather"], ["Vibe", "Chill"]] }
    ]
  }
};

const pages = document.querySelectorAll(".page");
const navBtns = document.querySelectorAll(".nav button");
const wipeEl = document.getElementById("wipe");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
let busy = false;
let current = "start";

// Bilder vorladen, damit die Wipe sofort voll ist
WIPE_IMGS.forEach(src => { const i = new Image(); i.src = src; });

const rand = (a, b) => a + Math.random() * (b - a);

// Baut eine neue Collage aus vielen Bildern
function buildWipe(imgs) {
  wipeEl.innerHTML = "";
  const track = document.createElement("div");
  track.className = "wipe-track";
  const mobile = innerWidth < 760;
  const count = mobile ? 34 : 55;
  const tones = ["#ece6da", "#ddd7cb", "#cfc9bd", "#f4f1ea", "#bdb8ae"];
  const cards = [];
  let n = Math.floor(Math.random() * imgs.length);

  // komplett zufällig verteilt
  for (let i = 0; i < count; i++) {
    const w = mobile ? rand(26, 40) : rand(10, 17); // in vw
    cards.push({
      x: rand(-8, 98), y: rand(-10, 92),
      w, h: w * rand(.8, 1.25),
      r: rand(-12, 12),
      bg: tones[Math.floor(Math.random() * tones.length)],
      src: imgs[n++ % imgs.length]
    });
  }
  // weiter rechts liegende Bilder oben
  cards.sort((a, b) => a.x - b.x);

  const els = cards.map(c => {
    const el = document.createElement("div");
    el.className = "wipe-card";
    el.style.left = c.x + "vw";
    el.style.top = c.y + "vh";
    el.style.width = c.w + "vw";
    el.style.height = c.h + "vw";
    el.style.rotate = c.r + "deg";
    el.style.backgroundColor = c.bg;
    el.innerHTML = `<img src="${c.src}" alt="">`;
    track.appendChild(el);
    // Position von links nach rechts (0 bis 1) bestimmt, wann das Bild erscheint
    return { el, pos: Math.min(Math.max(c.x / 100, 0), 1) };
  });

  wipeEl.appendChild(track);
  return { cards: els };
}

// Die Money Wipe: jedes Bild ploppt einzeln auf, von links nach rechts
async function moneyWipe(swap, theme) {
  if (busy) return;
  if (reduced) { swap(); return; }
  busy = true;

  const { cards } = buildWipe(WIPE_SETS[theme] || WIPE_SETS.start);
  wipeEl.classList.add("on");

  const spread = 700;   // Zeit, in der die Bilder nacheinander erscheinen
  const pop = 380;      // Dauer pro Bild
  const ease = "cubic-bezier(.2, .8, .2, 1)";

  // Rein: Bilder erscheinen einzeln mit leichtem Scale
  const anims = [];
  cards.forEach(({ el, pos }) => {
    anims.push(el.animate([
      { opacity: 0, transform: "translateX(-4vw) scale(1.35)" },
      { opacity: 1, transform: "translateX(0) scale(.94)", offset: .65 },
      { opacity: 1, transform: "translateX(0) scale(1)" }
    ], { duration: pop, delay: pos * spread + rand(0, 60), easing: ease, fill: "forwards" }));
  });
  await Promise.all(anims.map(a => a.finished));

  swap();
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 150));

  // Raus: Bilder verschwinden einzeln nach rechts
  const out = [];
  cards.forEach(({ el, pos }) => {
    out.push(el.animate([
      { opacity: 1, transform: "translateX(0) scale(1)" },
      { opacity: 1, transform: "translateX(1vw) scale(1.08)", offset: .35 },
      { opacity: 0, transform: "translateX(6vw) scale(.7)" }
    ], { duration: pop, delay: pos * spread + rand(0, 60), easing: ease, fill: "forwards" }));
  });
  await Promise.all(out.map(a => a.finished));

  wipeEl.classList.remove("on");
  wipeEl.innerHTML = "";
  busy = false;
}

// Reveal Animation für die aktive Seite
function reveal(page) {
  page.classList.remove("show");
  page.querySelectorAll("[data-reveal]").forEach((el, i) => el.style.setProperty("--i", i));
  void page.offsetWidth;
  requestAnimationFrame(() => page.classList.add("show"));
}

function showPage(id) {
  pages.forEach(p => p.classList.toggle("active", p.id === id));
  navBtns.forEach(b => b.classList.toggle("active", b.dataset.go === id));
  current = id;
  reveal(document.getElementById(id));

  // F1: Video startet von vorne, sonst wird es pausiert
  if (id === "f1") {
    video.currentTime = 0;
    video.muted = false;
    video.play().catch(() => { video.muted = true; video.play(); }); // falls Ton blockiert wird
  } else {
    video.pause();
  }
}

// Video läuft nur 6 Sekunden, danach runter zum Text über Lewis
const VIDEO_LENGTH = 6;
const video = document.getElementById("lewis-video");
video.addEventListener("timeupdate", () => {
  if (video.currentTime >= VIDEO_LENGTH && !video.paused) {
    video.pause();
    document.getElementById("lewis").scrollIntoView({ behavior: "smooth" });
  }
});

// Seitenwechsel
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-go]");
  if (!btn) return;
  const id = btn.dataset.go;
  if (id === current) return;
  const item = btn.dataset.item; // Bilder auf der Startseite öffnen direkt den passenden Tab
  moneyWipe(() => {
    if (item !== undefined) renderStage(id, +item);
    showPage(id);
  }, id);
});

// Stage rendern (Musik)
function renderStage(key, index) {
  const stage = document.querySelector(`[data-stage="${key}"]`);
  const data = STAGES[key];
  const item = data.items[index];

  stage.innerHTML = `
    <div class="tabs" data-reveal>
      ${data.items.map((it, i) => `<button class="${i === index ? "active" : ""}" data-tab="${i}">${it.name}</button>`).join("")}
    </div>
    <div class="stage-grid">
      <div class="stage-img" data-reveal><img src="${item.img}" alt="${item.name}"></div>
      <div class="stage-text">
        <p class="kicker" data-reveal>${data.kicker}</p>
        <h2 class="big" data-reveal>${item.name}</h2>
        <p class="lead" data-reveal>${item.text}</p>
        <ul class="facts" data-reveal>
          ${item.facts.map(f => `<li><span>${f[0]}</span><span>${f[1]}</span></li>`).join("")}
        </ul>
      </div>
    </div>`;

  stage.querySelectorAll("[data-tab]").forEach(b => {
    b.addEventListener("click", () => {
      const i = +b.dataset.tab;
      if (i === index) return;
      // innerhalb einer Kategorie keine Transition
      renderStage(key, i);
      reveal(stage.closest(".page"));
    });
  });
}

// Collage folgt der Maus (jedes Bild mit eigener Tiefe)
const collage = document.querySelector(".hero-collage");
const depths = [28, 16, 40, 22];
collage.addEventListener("mousemove", e => {
  const r = collage.getBoundingClientRect();
  const mx = (e.clientX - r.left) / r.width - .5;
  const my = (e.clientY - r.top) / r.height - .5;
  collage.querySelectorAll("img").forEach((img, i) => {
    img.style.translate = `${mx * depths[i]}px ${my * depths[i]}px`;
  });
});
collage.addEventListener("mouseleave", () => {
  collage.querySelectorAll("img").forEach(img => img.style.translate = "0 0");
});

Object.keys(STAGES).forEach(k => renderStage(k, 0));
reveal(document.getElementById("start"));