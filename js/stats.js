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
