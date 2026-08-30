
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
                <div class="transaction-icon">${isDespesa ? "💸" : "💰"}</div>
                <div class="transaction-info">
                    <div class="transaction-name">${item.descricao}</div>
                    <div class="transaction-date" style="display:flex; justify-content:space-between; width:100%">
                        <span>${dateDisplay} • ${item.categoria}</span>
                        <span onclick="deletarItem(${item.id})" style="color:var(--red); cursor:pointer; font-weight:bold;">Excluir ×</span>
                    </div>
                </div>
                <div class="transaction-value ${isDespesa ? "negative" : "positive"}">
                    ${isDespesa ? "-" : "+"} ${formatarMoeda(item.valor)}
                </div>
            `;
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
