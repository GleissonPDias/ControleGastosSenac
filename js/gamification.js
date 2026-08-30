/**
 * Sistema de Gamificação — Controle Financeiro
 * Níveis & XP, conquistas com notificações, metas com barra de progresso
 * e score de saúde financeira.
 */
const gamification = {
  storageKey: "finance.gamification",
  state: null,
  toasts: null,

  levelTitles: [
    { level: 1,  title: "Iniciante",          icon: "🌱" },
    { level: 2,  title: "Aprendiz",           icon: "📘" },
    { level: 3,  title: "Explorador",         icon: "🧭" },
    { level: 5,  title: "Estrategista",       icon: "🧠" },
    { level: 8,  title: "Investidor",         icon: "💼" },
    { level: 12, title: "Analista",           icon: "📈" },
    { level: 16, title: "Especialista",       icon: "🎯" },
    { level: 20, title: "Mestre das Finanças",icon: "👑" },
    { level: 30, title: "Lenda Financeira",   icon: "🏆" },
    { level: 40, title: "Magnata",            icon: "💎" },
    { level: 50, title: "Estilo de Vida",     icon: "🚀" },
  ],

  metasTipo: {
    economia:   { rotulo: "Economizar (saldo do mês)",   icone: "💰" },
    limite:     { rotulo: "Limite de gasto no mês",      icone: "🛡️" },
    receitas:   { rotulo: "Receitas no mês",             icone: "📈" },
    transacoes: { rotulo: "Movimentações no mês",        icone: "♟️" },
  },

  conquistas: [
    { id: "primeiro_passo",     icon: "🚀", titulo: "Primeiro passo",   desc: "Registre sua primeira movimentação",         permanente: true,  teste: () => finance.listar().length >= 1 },
    { id: "primeira_receita",   icon: "💰", titulo: "Primeira receita", desc: "Registre sua primeira entrada",              permanente: true,  teste: () => finance.listar().some(i => i.tipo === "entrada") },
    { id: "movimentado5",       icon: "📊", titulo: "Movimentado",      desc: "Registre 5 movimentações",                  permanente: true,  teste: () => finance.listar().length >= 5 },
    { id: "movimentado25",      icon: "🔥", titulo: "Ritmo forte",      desc: "Registre 25 movimentações",                 permanente: true,  teste: () => finance.listar().length >= 25 },
    { id: "movimentado50",      icon: "⚡", titulo: "Máquina",          desc: "Registre 50 movimentações",                 permanente: true,  teste: () => finance.listar().length >= 50 },
    { id: "dia_movimentado",    icon: "📅", titulo: "Dia movimentado",  desc: "3 movimentações no mesmo dia",              permanente: true,  teste: () => {
        const porDia = {};
        finance.listar().forEach(i => { if (i.data) porDia[i.data] = (porDia[i.data] || 0) + 1; });
        return Object.values(porDia).some(c => c >= 3);
      } },
    { id: "saldo_5k",    icon: "💎", titulo: "Saldo R$ 5.000",   desc: "Tenha R$ 5.000 de saldo",      teste: () => finance.saldo() >= 5000 },
    { id: "saldo_10k",   icon: "📈", titulo: "Saldo R$ 10.000",  desc: "Tenha R$ 10.000 de saldo",     teste: () => finance.saldo() >= 10000 },
    { id: "saldo_20k",   icon: "🪙", titulo: "Saldo R$ 20.000",  desc: "Tenha R$ 20.000 de saldo",     teste: () => finance.saldo() >= 20000 },
    { id: "saldo_30k",   icon: "🏦", titulo: "Saldo R$ 30.000",  desc: "Tenha R$ 30.000 de saldo",     teste: () => finance.saldo() >= 30000 },
    { id: "saldo_50k",   icon: "💰", titulo: "Saldo R$ 50.000",  desc: "Tenha R$ 50.000 de saldo",     teste: () => finance.saldo() >= 50000 },
    { id: "saldo_70k",   icon: "🏆", titulo: "Saldo R$ 70.000",  desc: "Tenha R$ 70.000 de saldo",     teste: () => finance.saldo() >= 70000 },
    { id: "saldo_80k",   icon: "👑", titulo: "Saldo R$ 80.000",  desc: "Tenha R$ 80.000 de saldo",     teste: () => finance.saldo() >= 80000 },
    { id: "saldo_100k",  icon: "🚀", titulo: "Saldo R$ 100.000", desc: "Tenha R$ 100.000 de saldo",    teste: () => finance.saldo() >= 100000 },
    { id: "economia_trinta",    icon: "🧠", titulo: "Economizador",    desc: "Economize 30% da receita em um mês",        teste: () => gamification._melhorEconomiaMensal() >= 0.3 },
    { id: "economia_cinquenta", icon: "🧊", titulo: "Disciplina total", desc: "Economize 50% da receita em um mês",        teste: () => gamification._melhorEconomiaMensal() >= 0.5 },
    { id: "mes_positivo",       icon: "💚", titulo: "Mês no positivo", desc: "Feche o mês atual com saldo positivo",      teste: () => {
        const agora = new Date();
        const r = finance.resumoMensal(agora.getMonth() + 1, agora.getFullYear());
        return r.saldo > 0;
      } },
    { id: "meta_atingida",      icon: "🎯", titulo: "Meta atingida",   desc: "Conclua uma meta",                          permanente: true,  teste: () => gamification.state.metaConcluida === true },
    { id: "colecionador3",      icon: "🎖️", titulo: "Colecionador",    desc: "Desbloqueie 3 conquistas",                  permanente: true,  teste: () => gamification.state.conquistas.length >= 3 },
    { id: "colecionador6",      icon: "🌟", titulo: "Mestre colecionador", desc: "Desbloqueie 6 conquistas",                permanente: true,  teste: () => gamification.state.conquistas.length >= 6 },
  ],

  // ==================== Vida útil do estado ====================

  carregar() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      this.state = raw ? JSON.parse(raw) : null;
    } catch (e) { this.state = null; }
    if (!this.state) this.state = { xp: 0, conquistas: [], metas: [], ultimaVisita: null, metaConcluida: false, xpPagos: [] };
    if (!Array.isArray(this.state.conquistas)) this.state.conquistas = [];
    if (!Array.isArray(this.state.metas)) this.state.metas = [];
    if (!Array.isArray(this.state.xpPagos)) this.state.xpPagos = [];
    if (typeof this.state.metaConcluida === "undefined") this.state.metaConcluida = false;
  },

  salvar() {
    try { localStorage.setItem(this.storageKey, JSON.stringify(this.state)); } catch (e) {}
  },

  init() {
    this.carregar();

    if (!document.getElementById("gamiToasts")) {
      const container = document.createElement("div");
      container.id = "gamiToasts";
      document.body.appendChild(container);
    }
    this.toasts = document.getElementById("gamiToasts");

    const hoje = new Date().toISOString().slice(0, 10);
    if (this.state.ultimaVisita !== hoje) {
      this.state.ultimaVisita = hoje;
      this.state.xp += 3;
      this.salvar();
    }

    // renderUI primeiro: marca metas concluídas antes de avaliar conquistas
    this.renderUI();
    this.avaliarConquistas();
    this.renderUI();
  },

  // ==================== Níveis & XP ====================

  xpParaNivel(nivel) {
    return 220 + (nivel - 1) * 70;
  },

  getLevelInfo() {
    const xp = this.state ? this.state.xp : 0;

    // Curva crescente: nível 1→2 custa 220 XP, cada nível seguinte +70 XP
    let nivel = 1;
    let restante = xp;
    while (nivel < 50) {
      const custo = this.xpParaNivel(nivel);
      if (restante < custo) break;
      restante -= custo;
      nivel++;
    }
    const noNivel = restante;
    const custoAtual = this.xpParaNivel(nivel);
    const progressPercent = Math.min(100, Math.round((noNivel / custoAtual) * 100));

    let currentLevel = this.levelTitles[0];
    for (const t of this.levelTitles) {
      if (t.level <= nivel) currentLevel = t;
    }
    const proximo = Math.min(50, nivel + 1);

    return {
      currentLevel: { level: nivel, title: currentLevel.title, icon: currentLevel.icon },
      nextLevel: { level: proximo },
      progressPercent,
      xpAtual: noNivel,
      xpPara: custoAtual,
    };
  },

  adicionarXp(qtd, motivo) {
    const antes = this.getLevelInfo();
    this.state.xp += qtd;
    this.salvar();
    const depois = this.getLevelInfo();

    if (depois.currentLevel.level > antes.currentLevel.level) {
      this.notificar({
        icon: depois.currentLevel.icon,
        titulo: "Nível subiu!",
        descricao: `${depois.currentLevel.title} (Nível ${depois.currentLevel.level})`,
        cor: "ouro",
      });
    }
    this.renderUI();
  },

  // ==================== Conquistas ====================

  _melhorEconomiaMensal() {
    const porMes = {};
    finance.listar().forEach(i => {
      if (!i.data) return;
      const chave = String(i.data).slice(0, 7);
      if (!porMes[chave]) porMes[chave] = { entradas: 0, saidas: 0 };
      porMes[chave][i.tipo === "entrada" ? "entradas" : "saidas"] += Number(i.valor) || 0;
    });
    let melhor = 0;
    Object.values(porMes).forEach(m => {
      if (m.entradas > 0) melhor = Math.max(melhor, (m.entradas - m.saidas) / m.entradas);
    });
    return melhor;
  },

  avaliarConquistas() {
    if (!this.state) return;
    let mudou = false;

    // Reavalia em cascata até estabilizar
    // (permite revogar conquistas de estado e destravar tipo "Colecionador" na MESMA leva)
    for (let i = 0; i <= this.conquistas.length; i++) {
      // 1) Revoga conquistas de estado que deixaram de ser verdadeiras
      //    (ex: saldo negativo derruba "Mês no positivo", "Saldo R$ 1.000"...)
      this.conquistas.forEach(c => {
        if (c.permanente) return;
        if (!this.state.conquistas.includes(c.id)) return;
        try {
          if (!c.teste()) {
            this.state.conquistas = this.state.conquistas.filter(id => id !== c.id);
            mudou = true;
          }
        } catch (e) {}
      });

      // 2) Desbloqueia novas
      const novas = [];

      this.conquistas.forEach(c => {
        if (this.state.conquistas.includes(c.id)) return;
        try {
          if (c.teste()) novas.push(c);
        } catch (e) {}
      });

      if (novas.length === 0) break;

      mudou = true;
      novas.forEach(c => {
        this.state.conquistas.push(c.id);
        // XP pago apenas na PRIMEIRA conquista; rebloqueio/redesbloqueio não farma
        if (!this.state.xpPagos.includes(c.id)) {
          this.state.xpPagos.push(c.id);
          this.state.xp += 15;
        }
        this.notificar({ icon: c.icon, titulo: "Conquista desbloqueada!", descricao: c.titulo, cor: "ouro" });
      });
    }

    if (!mudou) return;
    this.salvar();
    this.renderUI();
  },

  // ==================== Score de saúde financeira ====================

  calcularScoreSaude() {
    const total = finance.listar().length;
    if (total === 0) return 0;

    const entradas = finance.totalEntradas();
    const saidas = finance.totalSaidas();
    const saldo = finance.saldo();
    const agora = new Date();
    const mes = finance.resumoMensal(agora.getMonth() + 1, agora.getFullYear());

    let score = 0;

    // 1) Atividade (histórico) — 2 pts por movimentação, até 16
    score += Math.min(16, total * 2);

    // 2) Receitas — gradativo: 1 mês com entrada +6, mais de 1 mês +12
    const mesesEntrada = new Set(
      finance.listar()
        .filter(i => i.tipo === "entrada" && i.data)
        .map(i => String(i.data).slice(0, 7))
    );
    if (mesesEntrada.size >= 1) score += 6;
    if (mesesEntrada.size >= 2) score += 6;

    // 3) Saldo sólido — proporcional: saldo / total de entradas, até 14
    score += Math.min(14, Math.max(0, (saldo / (entradas || 1)) * 14));

    // 4) Mês equilibrado — proporcional à economia do mês, até 14
    if (mes.entradas > 0) {
      score += Math.min(14, Math.max(0, 1 - mes.saidas / mes.entradas) * 14);
    }

    // 5) Disciplina no histórico — evolução conforme a folga total, até 8
    if (entradas > 0) {
      score += Math.min(8, Math.max(0, 1 - saidas / entradas) * 8);
    }

    // 6) Metas concluídas — 3 pts cada, até 10 gradativo
    score += Math.min(10, (this.state ? this.state.metas.filter(m => m.completado).length : 0) * 3);

    // Maturidade: o score só se aproxima do valor real com histórico.
    // Cada movimentação aumenta o teto (1 depósito não pode dar nota alta).
    const fator = Math.min(1, total / 6);

    return Math.max(0, Math.min(100, Math.round(score * fator)));
  },

  _animarScore(el, alvo) {
    if (!el) return;
    const atual = parseInt(el.textContent || "0", 10);
    if (atual === alvo || isNaN(atual)) return;
    const inicio = performance.now();
    const duracao = 1100;
    const step = (t) => {
      const p = Math.min(1, (t - inicio) / duracao);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(atual + (alvo - atual) * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  // ==================== Metas ====================

  listarMetas() {
    if (!this.state) return [];
    return this.state.metas.slice();
  },

  adicionarMeta({ descricao, tipo, meta }) {
    const nova = {
      id: Date.now(),
      descricao,
      tipo: String(tipo),
      meta: Number(meta) || 0,
      completado: false,
      criadaEm: new Date().toISOString(),
    };
    this.state.metas.push(nova);
    this.salvar();
    this.renderUI();
    this.avaliarConquistas();
    return nova;
  },

  excluirMeta(id) {
    this.state.metas = this.state.metas.filter(m => m.id !== id);
    this.salvar();
    this.renderUI();
    this.avaliarConquistas();
  },

  calcularProgressoMeta(meta) {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mesNum = agora.getMonth() + 1;
    const mes = finance.resumoMensal(mesNum, ano);
    const chave = `${ano}-${String(mesNum).padStart(2, "0")}`;

    let atual = 0;
    switch (meta.tipo) {
      case "economia":   atual = Math.max(0, mes.saldo); break;
      case "limite":     atual = mes.saidas; break;
      case "receitas":   atual = mes.entradas; break;
      case "transacoes": atual = finance.listar().filter(i => i.data && String(i.data).startsWith(chave)).length; break;
    }

    const alvo = Number(meta.meta) || 0;
    let progresso = alvo > 0 ? Math.min(1, atual / alvo) : 0;
    if (meta.tipo === "limite") {
      progresso = alvo > 0 ? Math.min(1, Math.max(0, 1 - atual / alvo)) : 0;
    }
    return { atual, alvo, progresso };
  },

  _textoProgresso(meta, p) {
    const fmt = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    switch (meta.tipo) {
      case "economia":   return `${fmt(p.atual)} de ${fmt(p.alvo)} economizados`;
      case "limite":     return `${fmt(p.atual)} gastos — limite ${fmt(p.alvo)}`;
      case "receitas":   return `${fmt(p.atual)} de ${fmt(p.alvo)} recebidos`;
      case "transacoes": return `${p.atual} de ${p.alvo} movimentações`;
    }
    return "";
  },

  renderMetas() {
    const list = document.getElementById("metasList");
    if (!list || !this.state) return;

    const metas = this.listarMetas();
    if (metas.length === 0) {
      list.innerHTML = `<p style="color: var(--muted); font-size: 13px; text-align: center; padding: 12px 0;">Nenhuma meta cadastrada. Crie a sua acima! 🎯</p>`;
      return;
    }

    let ganhouXp = false;
    let registrouMeta = false;
    let reabriu = false;
    const cards = metas.map((meta) => {
      const p = this.calcularProgressoMeta(meta);
      const tipoInfo = this.metasTipo[meta.tipo] || { rotulo: meta.tipo, icone: "🎯" };

      if (!meta.completado && p.progresso >= 1) {
        meta.completado = true;
        this.state.metaConcluida = true;
        registrouMeta = true;
        this.state.xp += 15;
        ganhouXp = true;
        this.notificar({ icon: "🎯", titulo: "Meta atingida!", descricao: `${meta.descricao} — +15 XP`, cor: "verde" });
      } else if (meta.completado && p.progresso < 1) {
        // Requisito deixou de ser cumprido: meta volta a ficar em aberto
        meta.completado = false;
        reabriu = true;
      } else if (meta.completado && !this.state.metaConcluida) {
        this.state.metaConcluida = true;
        registrouMeta = true;
      }

      const pct = Math.min(100, Math.round(p.progresso * 100));
      const done = meta.completado ? " done" : "";
      return `
        <div class="goal-card-3d${done}">
          <div class="goal-top">
            <span class="goal-icon">${tipoInfo.icone}</span>
            <div class="goal-info">
              <strong>${meta.descricao}</strong>
              <small>${this._textoProgresso(meta, p)} • ${tipoInfo.rotulo}</small>
            </div>
            <button class="goal-delete" onclick="gamification.excluirMeta(${meta.id})" title="Excluir meta">✕</button>
          </div>
          <div class="goal-bar"><div class="goal-fill" style="width: ${pct}%"></div></div>
          <div class="goal-pct"><span>${done ? "Concluída ✅" : pct + "%"}</span></div>
        </div>`;
    });

    if (ganhouXp || registrouMeta || reabriu) this.salvar();
    list.innerHTML = cards.join("");
    if (ganhouXp) this.renderBadges();
  },

  // ==================== Badges (conquistas) ====================

  renderBadges() {
    const grid = document.getElementById("badgesGrid");
    if (!grid || !this.state) return;

    grid.innerHTML = "";
    this.conquistas.forEach(c => {
      const unlocked = this.state.conquistas.includes(c.id);
      const div = document.createElement("div");
      div.className = "badge-card-3d" + (unlocked ? " unlocked" : "");
      div.title = `${c.titulo}: ${c.desc}`;
      div.innerHTML = `<span class="badge-icon">${c.icon}</span><span class="badge-name">${c.titulo}</span>`;
      grid.appendChild(div);
    });
  },

  // ==================== Renderização geral ====================

  renderUI() {
    const levelInfo = this.getLevelInfo();
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set("dashLvlIcon", levelInfo.currentLevel.icon);
    set("dashLvlTitle", `${levelInfo.currentLevel.title} (Nível ${levelInfo.currentLevel.level})`);
    this._animarScore(document.getElementById("dashHealthScore"), this.calcularScoreSaude());
    set("dashXpText", `${levelInfo.progressPercent}% para o nível ${levelInfo.nextLevel.level}`);

    const xpFill = document.getElementById("dashXpFill");
    if (xpFill) xpFill.style.width = `${levelInfo.progressPercent}%`;

    // Mantém o badge de nível do cabeçalho sincronizado com o nível real
    // (atualizarPerfilUI só roda no DOMContentLoaded, então atualizamos aqui também)
    if (typeof userPrefs !== "undefined") {
      try { userPrefs.atualizarPerfilUI(); } catch (e) {}
    }

    this.renderBadges();
    this.renderMetas();
  },

  // ==================== Confete ====================

  dispararConfetti() {
    const cores = ["#7c5cff", "#19d3ff", "#25e6a5", "#ffc857", "#ff5c7c", "#ffffff"];
    const total = 90;

    for (let i = 0; i < total; i++) {
      const piece = document.createElement("div");
      piece.className = "gami-confetti";
      piece.style.left = (Math.random() * 100) + "vw";
      piece.style.background = cores[Math.floor(Math.random() * cores.length)];
      piece.style.setProperty("--cx", (Math.random() * 160 - 80) + "px");
      piece.style.setProperty("--cy", (window.innerHeight * (0.45 + Math.random() * 0.4)) + "px");
      piece.style.setProperty("--rot", (180 + Math.random() * 540) + "deg");
      piece.style.setProperty("--dur", (1.3 + Math.random() * 1.1) + "s");
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 3500);
    }
  },

  // ==================== Notificações (toasts) ====================

  notificar({ icon, titulo, descricao, cor = "roxo" }) {
    const container = this.toasts;
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `gami-toast cor-${cor}`;
    toast.innerHTML = `
      <span class="gami-toast-icon">${icon}</span>
      <div class="gami-toast-body">
        <strong>${titulo}</strong>
        <small>${descricao}</small>
      </div>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  },
};

document.addEventListener("DOMContentLoaded", () => gamification.init());