const canvas = document.getElementById("petals");
if (canvas) {
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    w: 0,
    h: 0,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    particles: [],
    raf: 0,
  };

  function resize() {
    state.w = window.innerWidth;
    state.h = window.innerHeight;
    canvas.width = Math.floor(state.w * state.dpr);
    canvas.height = Math.floor(state.h * state.dpr);
    canvas.style.width = `${state.w}px`;
    canvas.style.height = `${state.h}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  function spawn(count) {
    state.particles = Array.from({ length: count }, () => ({
      x: Math.random() * state.w,
      y: Math.random() * state.h,
      r: 1.2 + Math.random() * 2.4,
      a: 0.14 + Math.random() * 0.32,
      vx: -0.18 + Math.random() * 0.36,
      vy: 0.14 + Math.random() * 0.28,
      spin: (Math.random() - 0.5) * 0.04,
      rot: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      kind: Math.random() > 0.55 ? "petal" : "mote",
    }));
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, 0.55);
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r * 1.4, p.r * 0.9, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(184, 90, 100, ${p.a})`;
    ctx.fill();
    ctx.restore();
  }

  function drawMote(p) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(212, 176, 106, ${p.a})`;
    ctx.arc(p.x, p.y, p.r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  function frame(t) {
    ctx.clearRect(0, 0, state.w, state.h);
    const time = t * 0.001;

    for (const p of state.particles) {
      p.x += p.vx + Math.sin(time + p.phase) * 0.12;
      p.y += p.vy;
      p.rot += p.spin;

      if (p.y > state.h + 12) {
        p.y = -12;
        p.x = Math.random() * state.w;
      }
      if (p.x < -12) p.x = state.w + 12;
      if (p.x > state.w + 12) p.x = -12;

      if (p.kind === "petal") drawPetal(p);
      else drawMote(p);
    }

    state.raf = requestAnimationFrame(frame);
  }

  resize();
  spawn(Math.round(Math.min(42, Math.max(18, state.w / 32))));

  window.addEventListener("resize", () => {
    resize();
    spawn(Math.round(Math.min(42, Math.max(18, state.w / 32))));
  });

  if (!reduceMotion) {
    state.raf = requestAnimationFrame(frame);
  }
}
