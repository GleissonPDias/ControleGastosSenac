const userPrefs = {
  // Retorna o nome salvo
  getUsuario() {
    return storage.carregarConfig().nome;
  },

  // Atualiza e persiste o nome
  setUsuario(nome) {
    const config = storage.carregarConfig();
    config.nome = nome;
    storage.salvarConfig(config);
  },

  // Retorna "claro" ou "escuro"
  getTema() {
    return storage.carregarConfig().tema;
  },

  // Atualiza e persiste a preferência de tema
  setTema(tema) {
    const config = storage.carregarConfig();
    config.tema = tema;
    storage.salvarConfig(config);
  }
};

// Integração: disponibiliza os métodos diretamente no objeto finance caso ele exista
if (typeof finance !== "undefined") {
  Object.assign(finance, userPrefs);
}
