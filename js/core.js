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
