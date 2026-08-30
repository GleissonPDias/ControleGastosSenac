
    function obterIconeCategoria(item) {
    if (item.tipo === "entrada") return "💰";
    
    const cat = (item.categoria || "").toLowerCase();
    const desc = (item.descricao || "").toLowerCase();

    if (cat.includes("alimenta") || desc.includes("mercado") || desc.includes("supermercado") || desc.includes("comida") || desc.includes("feira") || desc.includes("fruta") || desc.includes("restaurante") || desc.includes("lanche")) {
        return "🍎";
    }
    if (cat.includes("transporte") || desc.includes("uber") || desc.includes("carro") || desc.includes("bus") || desc.includes("combustivel") || desc.includes("gasolina") || desc.includes("passagem")) {
        return "🚗";
    }
    if (cat.includes("moradia") || desc.includes("aluguel") || desc.includes("casa") || desc.includes("condominio") || desc.includes("luz") || desc.includes("agua") || desc.includes("iptu")) {
        return "🏠";
    }
    if (cat.includes("entretenimento") || cat.includes("lazer") || desc.includes("cinema") || desc.includes("jogo") || desc.includes("netflix") || desc.includes("show")) {
        return "🎬";
    }
    if (cat.includes("saúde") || cat.includes("saude") || desc.includes("farmacia") || desc.includes("remedio") || desc.includes("medico") || desc.includes("hospital") || desc.includes("exame")) {
        return "🏥";
    }
    if (cat.includes("equipamento") || cat.includes("tecnologia") || desc.includes("pc") || desc.includes("celular") || desc.includes("notebook") || desc.includes("hardware")) {
        return "💻";
    }
    if (cat.includes("serviço") || cat.includes("servico") || desc.includes("conta") || desc.includes("internet") || desc.includes("telefone")) {
        return "⚙️";
    }
    
    return "💸";
}

finance.carregar();
    const avatar = document.querySelector(".avatar");
    if (finance.getUsuario()) avatar.innerText = finance.getUsuario()[0].toUpperCase();

    const list = document.getElementById("transactionListFull");
    const filterDesc = document.getElementById("filterDesc");
    const filterTipo = document.getElementById("filterTipo");
    const filterCat = document.getElementById("filterCat");

    function renderList() {
        let itens = finance.listar().slice().reverse();
        
        const desc = filterDesc.value.trim().toLowerCase();
        if (desc) itens = finance.buscar(desc).reverse();
        
        const tipo = filterTipo.value;
        if (tipo) itens = itens.filter(i => i.tipo === tipo);

        const cat = filterCat.value;
        if (cat) itens = itens.filter(i => i.categoria === cat);

        list.innerHTML = "";
        
        if (itens.length === 0) {
            list.innerHTML = "<p style='color: var(--muted); text-align: center; padding: 20px;'>Nenhuma transação encontrada.</p>";
            return;
        }

        const formatarMoeda = (valor) => Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        itens.forEach(item => {
            const div = document.createElement("div");
            div.className = "transaction";
            const isDespesa = item.tipo === "saida";
            
            let dateDisplay = item.data ? item.data.split("-").reverse().join("/") : "Hoje";

            div.innerHTML = `
                <div class="transaction-icon">${obterIconeCategoria(item)}</div>
                <div class="transaction-info">
                    <div class="transaction-name">${item.descricao}</div>
                    <div class="transaction-date">${dateDisplay} • ${item.categoria}</div>
                </div>
                <div class="transaction-right">
                    <div class="transaction-value ${isDespesa ? "negative" : "positive"}">
                        ${isDespesa ? "-" : "+"} ${formatarMoeda(item.valor)}
                    </div>
                    <button class="btn-edit-item" onclick="editarItem(${item.id})" title="Editar transação">
                        ✏️
                    </button>
                    <button class="btn-delete-item" onclick="deletarItem(${item.id})" title="Excluir transação">
                        🗑️
                    </button>
                </div>
            `;

            const btnDel = div.querySelector(".btn-delete-item");
            if (btnDel) {
                btnDel.addEventListener("mouseenter", () => div.classList.add("delete-hover"));
                btnDel.addEventListener("mouseleave", () => div.classList.remove("delete-hover"));
            }

            list.appendChild(div);
        });
    }

    function deletarItem(id) {
        finance.excluir(id);
        renderList();
    }

    filterDesc.addEventListener("input", renderList);
    filterTipo.addEventListener("change", renderList);
    filterCat.addEventListener("change", renderList);

    renderList();

    // ==== Modal: editar transação ====
    const modal = document.getElementById("modal");
    let editingId = null;

    function setModalMode(editing) {
        const title = document.getElementById("modalTitle");
        const submitBtn = document.querySelector("#transactionForm .submit");
        if (title) title.textContent = editing ? "✏️ Editar transação" : "Nova transação";
        if (submitBtn) submitBtn.textContent = editing ? "Salvar alterações" : "Adicionar transação";
    }

    function openModal() {
        editingId = null;
        setModalMode(false);
        if (modal) modal.classList.add("show");
    }
    function closeModal() { if (modal) modal.classList.remove("show"); }
    if (modal) modal.addEventListener("click", function(e) { if(e.target === modal) closeModal(); });

    function editarItem(id) {
        const item = finance.getById(id);
        if (!item) return;
        editingId = id;
        document.getElementById("description").value = item.descricao;
        document.getElementById("amount").value = item.valor;
        document.getElementById("type").value = item.tipo === "saida" ? "expense" : "income";
        document.getElementById("category").value = item.categoria;
        setModalMode(true);
        if (modal) modal.classList.add("show");
    }

    const form = document.getElementById("transactionForm");
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            const description = document.getElementById("description").value;
            const amount = Number(document.getElementById("amount").value);
            const typeSelect = document.getElementById("type").value;
            const category = document.getElementById("category").value;

            if (editingId !== null) {
                finance.editar(editingId, {
                    descricao: description,
                    valor: amount,
                    tipo: typeSelect === "expense" ? "saida" : "entrada",
                    categoria: category
                });
            } else {
                const dateObj = new Date();
                const tzOffset = dateObj.getTimezoneOffset() * 60000;
                const today = new Date(Date.now() - tzOffset).toISOString().split("T")[0];

                finance.adicionar({
                    tipo: typeSelect === "expense" ? "saida" : "entrada",
                    descricao: description,
                    valor: amount,
                    categoria: category,
                    data: today
                });
            }

            editingId = null;
            form.reset();
            closeModal();
            renderList();
        });
    }
