const finance = {
  items: [],

  //funcao para salvar

  salvar() {
    storage.salvarMovimentacoes(this.items);
  },

  // funcao para carregar os dados do storage

  carregar() {
    this.items = storage.carregarMovimentacoes();
  },

  listar() {
    return this.items;
  },

  // Função para adicionar entradas e saidas.

  adicionar({ tipo, descricao, valor, categoria, data }) {
    const novo = {
      id: Date.now(),
      tipo,
      descricao,
      valor,
      categoria,
      data,
    };
    this.items = [...this.items, novo];
    this.salvar();
    return novo;
  },

  // função de editar

  editar(id, dados) {
    let editou = false;
    this.items = this.items.map((i) => {
      if (i.id === id) {
        editou = true;
        return { ...i, ...dados };
      }
      return i;
    });
    this.salvar();
    return editou;
  },

  // função de excluir

  excluir(id) {
    this.items = this.items.filter((i) => i.id !== id);
    this.salvar();
  },

  // função de localizar por id

  getById(id) {
    return this.items.find((i) => i.id === id);
  },


  // Filtra as movimentações por entrada ou saída
  filtrarPorTipo(tipo) {
    return this.items.filter((item) => item.tipo === tipo);
  },

  // Filtra as movimentações pela categoria informada
  filtrarPorCategoria(categoria) {
    return this.items.filter((item) => item.categoria === categoria);
  },

  // Filtra movimentações dentro de um período
  filtrarPorPeriodo(inicio, fim) {
    const dataInicial = new Date(inicio);
    const dataFinal = new Date(fim);

    return this.items.filter((item) => {
      const dataMovimentacao = new Date(item.data);

      return (
        dataMovimentacao >= dataInicial &&
        dataMovimentacao <= dataFinal
      );
    });
  },

  // Busca movimentações pela descrição
  buscar(termo) {
    const termoNormalizado = termo.trim().toLowerCase();

    return this.items.filter(({ descricao }) =>
      descricao.toLowerCase().includes(termoNormalizado)
    );
  },


  // calcula o total das entradas
  totalEntradas() {
    return this.filtrarPorTipo("entrada").reduce(
      (total, { valor }) => total + valor, 
      0
    );
  },

  // Calcula o total das saídas
  totalSaidas() {
    return this.filtrarPorTipo("saida").reduce(
      (total, { valor }) => total + valor,
      0
    );
  },


  // Calcula o saldo disponivel
  saldo() {
    return this.totalEntradas() - this.totalSaidas();
  },

  // Retorna o total das despesas
  totalAPagar() {
    return this.totalSaidas();
  },

  // Reseta todos os dados da memória e do storage
  resetarTudo() {
    storage.limparTudo();
    this.items = [];
  },

};

const storage = {
  movimentacoes: "finance.movimentacoes",
  config: "finance.config",

  //salvar as movimentacoes no storage no navegador

  salvarMovimentacoes(items) {
    localStorage.setItem(this.movimentacoes, JSON.stringify(items));
  },

  //carregar os dados salvor no storage

  carregarMovimentacoes() {
    const dados = localStorage.getItem(this.movimentacoes);
    return dados ? JSON.parse(dados) : [];
  },

  //Salvar configurações no storage

  salvarConfig(cfg) {
    localStorage.setItem(this.config, JSON.stringify(cfg));
  },

  //Carregar configurações salvas

  carregarConfig() {
    const dados = localStorage.getItem(this.config);
    return dados ? JSON.parse(dados) : { nome: "", tema: "escuro" };
  },

  // Apaga todos os dados armazenados no localStorage
  limparTudo() {
    localStorage.clear();
  },
};

/* ==========================================================================
   STATS CODE (stats.js)
   ========================================================================== */

const stats = {
  // agrupa os valores por categoria (para gráfico pizza/barras). Retorna { categoria: total }
  porCategoria(tipo, items = (typeof finance !== "undefined" ? finance.items : [])) {
    const lista = (this && Array.isArray(this.items)) ? this.items : items;
    const filtrados = tipo
      ? lista.filter((item) => item.tipo === tipo)
      : lista;

    return filtrados.reduce((acc, { categoria, valor }) => {
      acc[categoria] = (acc[categoria] || 0) + Number(valor || 0);
      return acc;
    }, {});
  },

  // filtra as movimentações do mês/ano e retorna { entradas, saidas, saldo }
  resumoMensal(mes, ano, items = (typeof finance !== "undefined" ? finance.items : [])) {
    const lista = (this && Array.isArray(this.items)) ? this.items : items;
    const mesNum = Number(mes);
    const anoNum = Number(ano);

    const filtrados = lista.filter((item) => {
      if (!item.data) return false;
      const partes = String(item.data).split("-");
      if (partes.length >= 2) {
        const itemAno = Number(partes[0]);
        const itemMes = Number(partes[1]);
        return itemAno === anoNum && itemMes === mesNum;
      }
      const d = new Date(item.data);
      return (
        !isNaN(d) &&
        d.getFullYear() === anoNum &&
        d.getMonth() + 1 === mesNum
      );
    });

    const entradas = filtrados
      .filter((item) => item.tipo === "entrada")
      .reduce((total, { valor }) => total + Number(valor || 0), 0);

    const saidas = filtrados
      .filter((item) => item.tipo === "saida")
      .reduce((total, { valor }) => total + Number(valor || 0), 0);

    const saldo = entradas - saidas;

    return { entradas, saidas, saldo };
  },

  // retorna a maior saída (o item inteiro ou null)
  maiorGasto(items = (typeof finance !== "undefined" ? finance.items : [])) {
    const lista = (this && Array.isArray(this.items)) ? this.items : items;
    const saidas = lista.filter((item) => item.tipo === "saida");
    if (saidas.length === 0) return null;

    return saidas.reduce((maior, atual) => {
      return Number(atual.valor) > Number(maior.valor) ? atual : maior;
    });
  },

  // média de gastos por mês (soma total de saídas ÷ quantidade de meses com dados)
  mediaMensal(items = (typeof finance !== "undefined" ? finance.items : [])) {
    const lista = (this && Array.isArray(this.items)) ? this.items : items;
    const saidas = lista.filter((item) => item.tipo === "saida");
    if (saidas.length === 0) return 0;

    const totalSaidas = saidas.reduce(
      (total, { valor }) => total + Number(valor || 0),
      0
    );

    const mesesComDados = new Set(
      lista
        .map((item) => {
          if (!item.data) return null;
          const partes = String(item.data).split("-");
          if (partes.length >= 2) {
            return `${partes[0]}-${partes[1].padStart(2, "0")}`;
          }
          const d = new Date(item.data);
          if (isNaN(d)) return null;
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        })
        .filter(Boolean)
    );

    const qtdMeses = mesesComDados.size;
    return qtdMeses > 0 ? totalSaidas / qtdMeses : 0;
  },
};

// Integração: disponibiliza os métodos diretamente no objeto finance caso ele exista
if (typeof finance !== "undefined") {
  Object.assign(finance, stats);
}

/* ==========================================================================
   USER CODE (user.js)
   ========================================================================== */

const userPrefs = {
  // Retorna o nome salvo
  getUsuario() {
    return storage.carregarConfig().nome || "";
  },

  // Atualiza e persiste o nome
  setUsuario(nome) {
    const config = storage.carregarConfig();
    config.nome = nome;
    storage.salvarConfig(config);
    this.atualizarPerfilUI();
    if (typeof gamification !== "undefined") {
      gamification.avaliarConquistas();
    }
  },

  // Retorna "claro" ou "escuro" (escuro por padrão)
  getTema() {
    return storage.carregarConfig().tema || "escuro";
  },

  // Atualiza e persiste a preferência de tema
  setTema(tema) {
    const config = storage.carregarConfig();
    config.tema = tema;
    storage.salvarConfig(config);
    this.aplicarTema(tema);
  },

  aplicarTema(tema) {
    const root = document.documentElement;
    if (tema === "claro") {
      root.style.setProperty('--bg', '#f4f6fb');
      root.style.setProperty('--bg2', '#ffffff');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--card-border', '#e2e8f0');
      root.style.setProperty('--text', '#0f172a');
      root.style.setProperty('--muted', '#475569');
      root.style.setProperty('--primary', '#6d28d9');
      root.style.setProperty('--secondary', '#0284c7');
      document.body.classList.add("theme-light");
    } else {
      root.style.setProperty('--bg', '#070a12');
      root.style.setProperty('--bg2', '#0d1220');
      root.style.setProperty('--card', 'rgba(18, 24, 40, .72)');
      root.style.setProperty('--card-border', 'rgba(255, 255, 255, .08)');
      root.style.setProperty('--text', '#f5f7ff');
      root.style.setProperty('--muted', '#8d96aa');
      root.style.setProperty('--primary', '#7c5cff');
      root.style.setProperty('--secondary', '#19d3ff');
      document.body.classList.remove("theme-light");
    }
  },

  atualizarPerfilUI() {
    const nome = this.getUsuario();
    const nomeExibicao = nome.trim() ? nome.trim() : "Investidor";
    const inicial = nomeExibicao[0].toUpperCase();

    document.querySelectorAll(".avatar").forEach(av => {
      av.innerText = inicial;
      av.title = `Perfil de ${nomeExibicao}`;
    });

    const headerTitle = document.querySelector(".header h1");
    if (headerTitle) {
      if (window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/") || window.location.pathname === "") {
        headerTitle.innerHTML = `Olá, <span class="user-highlight-name">${nomeExibicao}</span>! 👋`;
      }
    }

    if (typeof gamification !== "undefined") {
      const levelInfo = gamification.getLevelInfo();
      document.querySelectorAll(".profile").forEach(prof => {
        let badge = prof.querySelector(".level-badge-header");
        if (!badge) {
          badge = document.createElement("div");
          badge.className = "level-badge-header";
          prof.appendChild(badge);
        }
        badge.innerHTML = `<span class="lvl-icon">${levelInfo.currentLevel.icon}</span> <small>Nível ${levelInfo.currentLevel.level}</small>`;
      });
    }
  }
};

// Integração: disponibiliza os métodos diretamente no objeto finance caso ele exista
if (typeof finance !== "undefined") {
  Object.assign(finance, userPrefs);
}

document.addEventListener("DOMContentLoaded", () => {
  userPrefs.aplicarTema(userPrefs.getTema());
  userPrefs.atualizarPerfilUI();
});