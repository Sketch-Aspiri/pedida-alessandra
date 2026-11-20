const STEPS = [
  {
    asker: "Andres pregunta…",
    question: "¿Eres hermosa?",
    hint: "Sé honesta… aunque ya sabemos la respuesta.",
    final: false,
  },
  {
    asker: "Sigamos…",
    question: "¿Eres inteligente?",
    hint: "Otro sí fácil, ¿verdad?",
    final: false,
  },
  {
    asker: "Casi llegamos…",
    question: "¿Te caes bien Andres?",
    hint: "No te preocupes: el botón No es… tímido.",
    final: false,
  },
  {
    asker: "La pregunta importante",
    question: "¿Quieres ser mi novia?",
    hint: "Solo hay un camino correcto.",
    final: true,
  },
];

const askView = document.getElementById("ask");
const successView = document.getElementById("success");
const askerEl = document.getElementById("asker");
const questionEl = document.getElementById("question");
const hintEl = document.getElementById("hint");
const progressEl = document.getElementById("progress");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const actions = document.getElementById("actions");
const confettiCanvas = document.getElementById("confetti");
const petalsCanvas = document.getElementById("petals");

const confettiCtx = confettiCanvas.getContext("2d");
const petalsCtx = petalsCanvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let stepIndex = 0;

function resizeCanvases() {
  for (const canvas of [confettiCanvas, petalsCanvas]) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

window.addEventListener("resize", () => {
  resizeCanvases();
  resetNoPosition();
});
resizeCanvases();

/* Soft ambient petals */
const petals = Array.from({ length: reduceMotion ? 0 : 18 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  r: 4 + Math.random() * 7,
  drift: 0.2 + Math.random() * 0.45,
  sway: 0.4 + Math.random() * 0.8,
  phase: Math.random() * Math.PI * 2,
  alpha: 0.18 + Math.random() * 0.28,
  hue: 340 + Math.random() * 20,
}));

let petalRaf = 0;
function drawPetals() {
  petalsCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const p of petals) {
    p.phase += 0.008 * p.sway;
    p.y += p.drift;
    p.x += Math.sin(p.phase) * 0.35;
    if (p.y > window.innerHeight + 20) {
      p.y = -20;
      p.x = Math.random() * window.innerWidth;
    }
    petalsCtx.save();
    petalsCtx.translate(p.x, p.y);
    petalsCtx.rotate(Math.sin(p.phase) * 0.6);
    petalsCtx.fillStyle = `hsla(${p.hue}, 45%, 72%, ${p.alpha})`;
    petalsCtx.beginPath();
    petalsCtx.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, Math.PI * 2);
    petalsCtx.fill();
    petalsCtx.restore();
  }
  petalRaf = requestAnimationFrame(drawPetals);
}

if (!reduceMotion) {
  petalRaf = requestAnimationFrame(drawPetals);
}

/* Progress dots */
function renderProgress() {
  progressEl.innerHTML = "";
  STEPS.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "progress-dot";
    if (i < stepIndex) dot.classList.add("is-done");
    if (i === stepIndex) dot.classList.add("is-active");
    progressEl.appendChild(dot);
  });
}

function resetNoPosition() {
  const rect = actions.getBoundingClientRect();
  const btnW = noBtn.offsetWidth || 72;
  const btnH = noBtn.offsetHeight || 40;
  noBtn.classList.remove("is-fleeing");
  noBtn.style.left = `${Math.min(rect.width * 0.68, rect.width - btnW - 8)}px`;
  noBtn.style.top = `${Math.max(8, rect.height * 0.5 - btnH / 2)}px`;
  noBtn.style.transform = "translate(0, 0)";
}

function renderStep(animate = true) {
  const step = STEPS[stepIndex];
  askerEl.textContent = step.asker;
  questionEl.textContent = step.question;
  hintEl.textContent = step.hint;
  yesBtn.textContent = "Sí";
  yesBtn.classList.toggle("is-final", step.final);
  renderProgress();
  resetNoPosition();

  if (animate && !reduceMotion) {
    questionEl.classList.remove("is-swapping");
    hintEl.classList.remove("is-swapping");
    void questionEl.offsetWidth;
    questionEl.classList.add("is-swapping");
    hintEl.classList.add("is-swapping");
  }
}

/* Fleeing "No" */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function placeNoAwayFrom(pointX, pointY) {
  const pad = 10;
  const btnW = noBtn.offsetWidth || 72;
  const btnH = noBtn.offsetHeight || 40;
  const stage = actions.getBoundingClientRect();
  const maxLeft = Math.max(pad, stage.width - btnW - pad);
  const maxTop = Math.max(pad, stage.height - btnH - pad);

  let left;
  let top;
  let tries = 0;
  do {
    left = pad + Math.random() * maxLeft;
    top = pad + Math.random() * maxTop;
    tries += 1;
  } while (
    tries < 20 &&
    Math.hypot(stage.left + left + btnW / 2 - pointX, stage.top + top + btnH / 2 - pointY) < 120
  );

  noBtn.classList.add("is-fleeing");
  noBtn.style.left = `${clamp(left, pad, maxLeft)}px`;
  noBtn.style.top = `${clamp(top, pad, maxTop)}px`;
  noBtn.style.transform = "translate(0, 0)";
}

function fleeFromEvent(event) {
  const point =
    "touches" in event && event.touches[0]
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
      : { x: event.clientX, y: event.clientY };
  placeNoAwayFrom(point.x, point.y);
}

["pointerenter", "pointermove", "pointerdown", "touchstart", "focus"].forEach((type) => {
  noBtn.addEventListener(
    type,
    (event) => {
      if (type === "touchstart") event.preventDefault();
      fleeFromEvent(event);
    },
    { passive: type !== "touchstart" }
  );
});

noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  fleeFromEvent(event);
});

/* Confetti */
const confettiPieces = [];
let confettiRaf = 0;

function spawnConfetti() {
  const colors = ["#9c3a4f", "#c9a06a", "#e3a4b2", "#6e2434", "#fff6f7", "#d46b7a"];
  const count = reduceMotion ? 24 : 140;
  confettiPieces.length = 0;
  for (let i = 0; i < count; i += 1) {
    confettiPieces.push({
      x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 90,
      y: window.innerHeight * 0.32,
      vx: (Math.random() - 0.5) * 12,
      vy: -6 - Math.random() * 10,
      g: 0.16 + Math.random() * 0.08,
      w: 5 + Math.random() * 7,
      h: 8 + Math.random() * 10,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
      color: colors[i % colors.length],
      life: 1,
    });
  }
  cancelAnimationFrame(confettiRaf);
  confettiRaf = requestAnimationFrame(tickConfetti);
}

function tickConfetti() {
  confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  let alive = 0;
  for (const p of confettiPieces) {
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 0.0065;
    if (p.life <= 0 || p.y > window.innerHeight + 40) continue;
    alive += 1;
    confettiCtx.save();
    confettiCtx.globalAlpha = Math.max(0, p.life);
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.rot);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    confettiCtx.restore();
  }
  if (alive > 0) {
    confettiRaf = requestAnimationFrame(tickConfetti);
  } else {
    confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function celebrate() {
  askView.hidden = true;
  successView.hidden = false;
  cancelAnimationFrame(petalRaf);
  petalsCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  spawnConfetti();
}

function onYes() {
  const step = STEPS[stepIndex];
  if (step.final) {
    celebrate();
    return;
  }
  stepIndex += 1;
  renderStep(true);
}

yesBtn.addEventListener("click", onYes);

renderStep(false);
requestAnimationFrame(resetNoPosition);
