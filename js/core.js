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
    return dados ? JSON.parse(dados) : { nome: "", tema: "claro" };
  },
};
