const finance = {
  items: [],

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
