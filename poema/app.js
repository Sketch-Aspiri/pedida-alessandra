const canvas = document.getElementById("dust");
if (!canvas) {
  // Atmosphere optional; page still works without canvas.
} else {
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
      r: 0.6 + Math.random() * 1.8,
      a: 0.12 + Math.random() * 0.28,
      vx: -0.12 + Math.random() * 0.24,
      vy: -0.18 - Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function frame(t) {
    ctx.clearRect(0, 0, state.w, state.h);
    const time = t * 0.001;

    for (const p of state.particles) {
      p.x += p.vx + Math.sin(time + p.phase) * 0.08;
      p.y += p.vy;

      if (p.y < -8) {
        p.y = state.h + 8;
        p.x = Math.random() * state.w;
      }
      if (p.x < -8) p.x = state.w + 8;
      if (p.x > state.w + 8) p.x = -8;

      ctx.beginPath();
      ctx.fillStyle = `rgba(107, 53, 68, ${p.a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    state.raf = requestAnimationFrame(frame);
  }

  resize();
  spawn(Math.round(Math.min(48, Math.max(22, state.w / 28))));

  window.addEventListener("resize", () => {
    resize();
    spawn(Math.round(Math.min(48, Math.max(22, state.w / 28))));
  });

  if (!reduceMotion) {
    state.raf = requestAnimationFrame(frame);
  }
}
