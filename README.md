# 💰 Controle Financeiro Pessoal

Aplicação web desenvolvida com **HTML, CSS e JavaScript puro** para controle de gastos pessoais.
Permite cadastrar entradas e saídas, informar categoria, editar e excluir movimentações e
acompanhar em tempo real o **Total de Entradas**, o **Total de Saídas** e o **Saldo Final**.

![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs&logoColor=white)

> Trabalho acadêmico — SENAC. Referência de organização de dados: estrutura da To-Do List,
> reforçando o uso de `map()`, `filter()`, `reduce()`, Spread Operator, funções e Arrow Functions.

---

## ✨ Funcionalidades

### Requisitos principais
- ✅ Cadastrar movimentação financeira (entrada ou saída)
- ✅ Definir o tipo: **Entrada** (receita) ou **Saída** (despesa)
- ✅ Informar **descrição**, **categoria** e **valor**
- ✅ Editar movimentação existente
- ✅ Excluir movimentação
- ✅ Listar movimentações cadastradas
- ✅ Exibir **Total de Entradas**, **Total de Saídas** e **Saldo Final**
- ✅ Validação dos dados antes de cadastrar
- ✅ Dados organizados em **arrays e objetos**
- ✅ Interface atualizada dinamicamente a partir dos dados
- ✅ Código organizado em **funções com responsabilidades bem definidas**

### Diferenciais implementados
- 🔎 **Busca** por descrição e **filtros** por tipo e categoria
- 📊 **Gráficos** com Chart.js (evolução mensal e gastos por categoria)
- 💾 **localStorage** — dados persistentes no navegador
- 🌙 **Dark mode / tema claro**
- 📱 **Responsividade total** — desktop, tablet e mobile (sidebar vira barra de navegação inferior)
- 🏆 **Gamificação** — XP, níveis, conquistas, metas e "saúde financeira"
- 🪙 **Fundo 3D interativo** com cifrões flutuantes

---

## 🚀 Como executar

Basta abrir o arquivo `index.html` no navegador (ou servir a pasta com um servidor local):

```bash
# Opcional: servidor local simples com Python
python -m http.server 5500
# depois acesse http://localhost:5500
```

> O app usa o **CDN do Chart.js** e a fonte **Inter** (Google Fonts), então é necessário acesso à internet.

---

## 📁 Estrutura do projeto

```
├── index.html          → Dashboard (cards com saldo, gráficos, gamificação e metas)
├── transacoes.html     → Página de todas as transações (busca + filtros)
├── relatorios.html     → Relatórios (média mensal, maior gasto, gráfico do ano)
├── configuracoes.html  → Nome de usuário, tema e reset de dados
├── css/
│   └── style.css       → Todo o estilo visual + responsividade
└── js/
    ├── core.js         → "Coração" do app: finance, storage, stats e userPrefs
    ├── stats.js        → Estatísticas e agregações
    ├── user.js         → Preferências de usuário (nome e tema)
    ├── dashboard.js    → Lógica da tela principal (totais, gráficos, cards 3D)
    ├── transacoes.js   → Listagem, busca, filtros, editar e excluir
    ├── relatorios.js   → Relatórios e gráfico anual
    ├── configuracoes.js→ Configurações e reset
    ├── gamification.js → Sistema de XP, níveis, conquistas, metas e saúde
    └── background3d.js → Visual 3D do fundo (partículas + cifrões) — sem lógica de dados
```

---

## 🧠 Explicação dos códigos em JS

A aplicação segue o mesmo raciocínio da **To-Do List**: uma "massa de dados" em um array de
objetos que é **lida, filtrada, transformada e renderizada** a cada interação. Todo o código
usa **funções com uma única responsabilidade** e **funções de alta ordem** do JS moderno.

### Modelo de dados

Cada movimentação é um **objeto** dentro do array `finance.items`:

```js
{
  id: 1700000000000,          // timestamp único (gerado com Date.now())
  tipo: "saida",              // "entrada" ou "saida"
  descricao: "Supermercado",  // texto informado pelo usuário
  valor: 245.90,              // valor numérico
  categoria: "Alimentação",
  data: "2026-08-30"          // no formato ISO
}
```

### `map()` — transformar (usado na **edição**)

`map()` cria um **novo array** sem modificar o original. É usado em `finance.editar()`:
percorre todos os itens e devolve cada um da mesma forma, **exceto** o que tem o `id`
buscado, que é substituído pela versão atualizada. Isso preserva o princípio da
**imutabilidade** — em vez de alterar o array direto, geramos uma nova versão dele.

```js
editar(id, dados) {
  let editou = false;
  this.items = this.items.map((i) => {
    if (i.id === id) {
      editou = true;
      return { ...i, ...dados };   // Spread Operator: mescla o item antigo com a edição
    }
    return i;                      // mantém os demais intactos
  });
  this.salvar();
  return editou;
}
```

### `filter()` — filtrar (usado na **exclusão**, filtros e totais)

`filter()` devolve somente os elementos que atendem à condição. É usado para:

- **Excluir** uma movimentação (`finance.excluir`): mantém apenas os itens cujo `id`
  é diferente do excluído.
- **Filtrar** por tipo/categoria/período ou busca por descrição.
- Separar entradas e saídas para os totais.

```js
excluir(id) {
  this.items = this.items.filter((i) => i.id !== id);
  this.salvar();
}

totalEntradas() {
  return this.filtrarPorTipo("entrada")   // filter() → só entradas
    .reduce((total, { valor }) => total + valor, 0);  // reduce() → soma tudo
}
```

### `reduce()` — consolidar (usado nos **totais** e estatísticas)

`reduce()` percorre o array acumulando um valor. É o coração dos **Total de Entradas**,
**Total de Saídas**, média mensal e do agrupamento por categoria para o gráfico donut.

```js
// Agrupa os gastos por categoria: { "Alimentação": 320.5, "Transporte": 90.0, ... }
return filtrados.reduce((acc, { categoria, valor }) => {
  acc[categoria] = (acc[categoria] || 0) + Number(valor || 0);
  return acc;
}, {});
```

### Spread Operator (`...`) — clonar e mesclar

Usado para **adicionar com segurança** (sem `push` direto no array original) e para
**editar mesclando dados**:

```js
// Adiciona um novo item criando um novo array
this.items = [...this.items, novo];

// Une o objeto original com os novos valores na edição
return { ...i, ...dados };
```

### Arrow Functions `=>`

Usadas em todo o código por serem curtas, sem `this` próprio e ideais com funções de alta
ordem (callbacks de `map`, `filter`, `reduce` e eventos):

```js
const formatarMoeda = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const termoNormalizado = termo.trim().toLowerCase();
return this.items.filter(({ descricao }) =>
  descricao.toLowerCase().includes(termoNormalizado)
);
```

> Observação: na linha acima também entra a **desestruturação de parâmetro**
> (`({ descricao })`), que extrai direto a propriedade do objeto recebido.

### Organização em módulos (funções bem definidas)

| Módulo | Responsabilidade |
|---|---|
| `finance` | Regras de negócio: adicionar, editar, excluir, listar, filtrar, totais e saldo |
| `storage` | Toda a persistência em `localStorage` (movimentações + configurações) |
| `stats` | Estatísticas: por categoria, resumo mensal, maior gasto, média mensal |
| `userPrefs` | Nome de usuário e tema (escuro/claro) |
| `gamification` | XP, níveis, conquistas, metas e saúde financeira |
| `dashboard.js` | Orquestra a tela inicial: renderiza dados e gráficos |
| `transacoes.js` / `relatorios.js` / `configuracoes.js` | Lógica de cada página |

### Atualização dinâmica da interface

Cada ação (adicionar, editar, excluir ou filtrar) dispara um **re-render** das funções
`atualizarTela()` (dashboard) ou `renderList()` (transações) e `atualizarGraficos()`.
Essas funções **leem o array** (`finance.items`), transformam os dados e reconstroem o HTML —
a interface é sempre um "espelho" fiel dos dados.

### Validação

A validação acontece em duas camadas:
1. **HTML**: atributos `required` nos campos (impede cadastro sem descrição/valor).
2. **JavaScript**: `Number()` converte o valor do input em número (evita texto como `"abc"`
   virar transação) e as funções `finance.*` só operam sobre objetos válidos.

---

## 🎨 Responsividade

- **> 1100px**: layout completo com sidebar fixa (250px) e grades em colunas.
- **641–1100px**: cards em 2 colunas e grades empilhadas; sidebar vira rail de ícones (68px).
- **≤ 640px**: sidebar vira **barra de navegação inferior**; cards em 1 coluna;
  modal vira **bottom-sheet**; filtros e formulário de metas empilham.

Mobile consideram ainda `env(safe-area-inset-bottom)` (notch de iPhone) e tap targets maiores.

---

## 📄 Documentação complementar

- `Documentacao_Funcionalidades_JavaScript.pdf` — PDF gerado com **todas as funções e fluxos**
  do JavaScript (modelo de dados, funções por arquivo, fluxos de inicialização, gamificação).

---

## 🛠️ Tecnologias

- **HTML5 + CSS3** (variáveis, Grid/Flexbox, media queries, animações, backdrop-filter)
- **JavaScript** ES6+ (arrow functions, template literals, destructuring, spread, `map`/`filter`/`reduce`)
- **Chart.js** (CDN) — gráficos de linha e donut
- **Google Fonts** — fonte Inter
- **localStorage** — persistência de dados no navegador