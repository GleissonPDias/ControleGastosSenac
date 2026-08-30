/**
 * Engine Visual 3D Interativo — Controle Financeiro
 * Detecta o tema ativo e adapta as cores das partículas, cifrões flutuantes e conexões automaticamente.
 */

(function () {
  let canvas, ctx;
  let particles = [];
  let shapes = [];
  let width, height;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let currentTheme = "escuro";

  // Paletas de cores para cada tema
  const PALETTES = {
    escuro: {
      particleColors: ["rgba(124, 92, 255, ", "rgba(25, 211, 255, "],
      connectionColor: "rgba(124, 92, 255, ",
      dollarColors: ["124, 92, 255", "25, 211, 255"],
      canvasOpacity: "0.75",
      baseAlphaMultiplier: 1,
      connectionAlpha: 0.18,
    },
    claro: {
      particleColors: ["rgba(109, 40, 217, ", "rgba(2, 132, 199, "],
      connectionColor: "rgba(109, 40, 217, ",
      dollarColors: ["109, 40, 217", "2, 132, 199"],
      canvasOpacity: "0.8",
      baseAlphaMultiplier: 1,
      connectionAlpha: 0.16,
    },
  };

  function getTheme() {
    return document.body.classList.contains("theme-light") ? "claro" : "escuro";
  }

  function getPalette() {
    return PALETTES[getTheme()];
  }

  function init() {
    canvas = document.createElement("canvas");
    canvas.id = "bg3dCanvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "-1";
    document.body.prepend(canvas);

    ctx = canvas.getContext("2d");

    resize();
    createScene();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
      mouse.targetX = (e.clientX - width / 2) * 0.08;
      mouse.targetY = (e.clientY - height / 2) * 0.08;
    });

    // Observa mudanças de tema no body
    const observer = new MutationObserver(() => {
      const newTheme = getTheme();
      if (newTheme !== currentTheme) {
        currentTheme = newTheme;
        applyThemeToScene();
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    requestAnimationFrame(animate);
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function applyThemeToScene() {
    const palette = getPalette();
    canvas.style.opacity = palette.canvasOpacity;

    // Reaplica cores nos cifrões
    shapes.forEach((s, i) => {
      s.rgb = palette.dollarColors[i % palette.dollarColors.length];
    });

    // Reaplica cores nas partículas
    particles.forEach((p) => {
      p.color = palette.particleColors[Math.random() > 0.45 ? 0 : 1];
    });
  }

  // Distribui N pontos de forma espaçada e uniforme (grid + leve ruído)
  function buildSpacedPositions(count, worldW, worldH) {
    const cols = Math.ceil(Math.sqrt(count * (worldW / worldH)));
    const rows = Math.ceil(count / cols);
    const cellW = worldW / cols;
    const cellH = worldH / rows;
    const jitX = cellW * 0.2;
    const jitY = cellH * 0.2;

    const pts = [];
    for (let i = 0; i < count; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols) % rows;
      pts.push({
        x: (c + 0.5) * cellW - worldW / 2 + (Math.random() - 0.5) * 2 * jitX,
        y: (r + 0.5) * cellH - worldH / 2 + (Math.random() - 0.5) * 2 * jitY,
      });
    }
    return pts;
  }

  function createScene() {
    particles = [];
    shapes = [];
    const palette = getPalette();
    currentTheme = getTheme();
    canvas.style.opacity = palette.canvasOpacity;

    const particleCount = Math.floor(Math.min(width, height) / 14);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.6,
        y: (Math.random() - 0.5) * height * 1.6,
        z: Math.random() * 900 + 10,
        size: Math.random() * 2.8 + 1,
        color: palette.particleColors[Math.random() > 0.45 ? 0 : 1],
        baseAlpha: (Math.random() * 0.55 + 0.25),
        speedZ: Math.random() * 0.6 + 0.3,
      });
    }

    const positions = buildSpacedPositions(30, width * 1.5, height * 1.5);

    for (let i = 0; i < positions.length; i++) {
      shapes.push({
        x: positions[i].x,
        y: positions[i].y,
        z: Math.random() * 900 + 50,
        size: Math.random() * 68 + 60,
        rot: Math.random() * Math.PI * 2,
        speedRot: (Math.random() - 0.5) * 0.018,
        alpha: Math.random() * 0.35 + 0.45,
        rgb: palette.dollarColors[i % palette.dollarColors.length],
      });
    }
  }

  function drawDollar(ctx, s, projX, projY, scale) {
    const size = s.size * scale;
    if (size < 8) return;

    ctx.save();
    ctx.translate(projX, projY);
    ctx.rotate(s.rot);

    ctx.font = `800 ${size.toFixed(1)}px Inter, system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.globalAlpha = Math.min(1, s.alpha * scale);
    ctx.shadowColor = `rgba(${s.rgb}, ${currentTheme === "claro" ? 0.85 : 0.95})`;
    ctx.shadowBlur = currentTheme === "claro" ? 14 * scale : 18 * scale;
    ctx.fillStyle = `rgba(${s.rgb}, 1)`;
    ctx.fillText("$", 0, 0);

    ctx.restore();
  }

  function animate() {
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    ctx.clearRect(0, 0, width, height);

    const palette = getPalette();
    const fov = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    // Renderiza cifrões flutuantes 3D
    shapes.forEach((s) => {
      s.rot += s.speedRot;
      const scale = fov / (fov + s.z);
      const projX = (s.x + mouse.x * (scale * 1.5)) * scale + centerX;
      const projY = (s.y + mouse.y * (scale * 1.5)) * scale + centerY;
      drawDollar(ctx, s, projX, projY, scale);
    });

    // Renderiza partículas 3D + conexões
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.z -= p.speedZ;
      if (p.z <= 10) p.z = 900;

      const scale = fov / (fov + p.z);
      const projX = (p.x + mouse.x * (scale * 2)) * scale + centerX;
      const projY = (p.y + mouse.y * (scale * 2)) * scale + centerY;
      const projSize = p.size * scale * 2;

      if (projX >= 0 && projX <= width && projY >= 0 && projY <= height) {
        const alpha = p.baseAlpha * scale * palette.baseAlphaMultiplier;

        ctx.beginPath();
        ctx.arc(projX, projY, Math.max(0.8, projSize), 0, Math.PI * 2);
        ctx.fillStyle = p.color + alpha + ")";

        // Glow adaptativo — mais suave no tema claro
        ctx.shadowBlur = currentTheme === "claro" ? 11 * scale : 12 * scale;
        ctx.shadowColor = p.color + (currentTheme === "claro" ? "0.75)" : "0.8)");
        ctx.fill();
        ctx.shadowBlur = 0;

        // Linhas de conexão entre partículas próximas
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const scale2 = fov / (fov + p2.z);
          const projX2 = (p2.x + mouse.x * (scale2 * 2)) * scale2 + centerX;
          const projY2 = (p2.y + mouse.y * (scale2 * 2)) * scale2 + centerY;

          const dx = projX - projX2;
          const dy = projY - projY2;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            const connAlpha = (1 - dist / 115) * palette.connectionAlpha * scale;
            ctx.beginPath();
            ctx.moveTo(projX, projY);
            ctx.lineTo(projX2, projY2);
            ctx.strokeStyle = palette.connectionColor + connAlpha + ")";
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }
    }

    requestAnimationFrame(animate);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
