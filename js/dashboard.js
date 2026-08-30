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

function atualizarTela() {
    const saldo = finance.saldo();
    const receitas = finance.totalEntradas();
    const despesas = finance.totalSaidas();
    const economia = receitas > 0 ? Math.round(((receitas - despesas) / receitas) * 100) : 0;
    const formatarMoeda = (valor) => Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const values = document.querySelectorAll(".card .value");
    if (values.length >= 4) {
        values[0].textContent = formatarMoeda(saldo);
        values[1].textContent = formatarMoeda(receitas);
        values[2].textContent = formatarMoeda(despesas);
        values[3].textContent = (economia > 0 ? economia : 0) + "%";
    }

    // Subtextos dinâmicos dos cards baseados em dados reais
    const saldoSub = document.getElementById("saldoSubtext");
    const receitasSub = document.getElementById("receitasSubtext");
    const despesasSub = document.getElementById("despesasSubtext");
    const economiaSub = document.getElementById("economiaSubtext");

    if (saldoSub) {
        saldoSub.textContent = saldo >= 0 ? "↑ Saldo Positivo" : "↓ Saldo Negativo";
        saldoSub.className = saldo >= 0 ? "positive" : "negative";
    }

    if (receitasSub) {
        const countEntradas = finance.filtrarPorTipo("entrada").length;
        receitasSub.textContent = `${countEntradas} entrada${countEntradas !== 1 ? 's' : ''}`;
    }

    if (despesasSub) {
        const countSaidas = finance.filtrarPorTipo("saida").length;
        despesasSub.textContent = `${countSaidas} saída${countSaidas !== 1 ? 's' : ''}`;
    }

    if (economiaSub) {
        if (receitas === 0) economiaSub.textContent = "Aguardando receitas";
        else if (economia >= 40) economiaSub.textContent = "Excelente!";
        else if (economia >= 20) economiaSub.textContent = "Bom progresso";
        else economiaSub.textContent = "Abaixo da meta";
    }

    // Renderiza o widget de gamificação do Dashboard
    if (typeof gamification !== "undefined") {
        try {
            gamification.renderUI();
            gamification.avaliarConquistas();
        } catch (err) {}
    }

    const list = document.getElementById("transactionList");
    if (list) {
        list.innerHTML = "";
        const itens = finance.listar().slice().reverse(); 

        if (itens.length === 0) {
            list.innerHTML = `<p style="color:var(--muted); text-align:center; padding:25px; font-size:14px;">Nenhuma movimentação registrada ainda. Clique em <strong>+ Adicionar</strong> para começar!</p>`;
        } else {
            itens.slice(0, 6).forEach(item => {
                const div = document.createElement("div");
                div.className = "transaction";
                const isDespesa = item.tipo === "saida";
                
                let dateDisplay = "Hoje";
                if(item.data) {
                     const parts = item.data.split("-");
                     if (parts.length === 3) dateDisplay = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }

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
    }

    atualizarGraficos();
}

function deletarItem(id) {
    finance.excluir(id);
    atualizarTela();
}

let financeChartInstance = null;
let categoryChartInstance = null;

function atualizarGraficos() {
    const porCat = finance.porCategoria("saida");
    const labelsCat = Object.keys(porCat);
    const dataCat = Object.values(porCat);

    if (categoryChartInstance) categoryChartInstance.destroy();

    const catEl = document.getElementById("categoryChart");
    if (catEl) {
        const categoryCtx = catEl.getContext("2d");
        categoryChartInstance = new Chart(categoryCtx, {
            type: "doughnut",
            data: {
                labels: labelsCat.length ? labelsCat : ["Sem despesas"],
                datasets: [{
                    data: dataCat.length ? dataCat : [1],
                    backgroundColor: labelsCat.length ? ["#7c5cff", "#19d3ff", "#25e6a5", "#ffc857", "#ff5c7c", "#ff99c2"] : ["rgba(255,255,255,0.08)"],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "72%",
                plugins: { legend: { display: false } }
            }
        });
    }

    const legendDiv = document.querySelector(".legend");
    if (legendDiv) {
        legendDiv.innerHTML = "";
        if (labelsCat.length === 0) {
            legendDiv.innerHTML = `<p style="color:var(--muted); text-align:center; font-size:13px; margin-top:10px;">Nenhum gasto por categoria ainda.</p>`;
        } else {
            const cores = ["#7c5cff", "#19d3ff", "#25e6a5", "#ffc857", "#ff5c7c", "#ff99c2"];
            const totalCat = dataCat.reduce((a,b)=>a+b,0);
            
            labelsCat.forEach((cat, index) => {
                const perc = totalCat > 0 ? Math.round((porCat[cat] / totalCat) * 100) : 0;
                legendDiv.innerHTML += `
                    <div class="legend-item">
                        <div class="legend-left">
                            <div class="dot" style="background:${cores[index % cores.length]}"></div>
                            ${cat}
                        </div>
                        <strong>${perc}%</strong>
                    </div>
                `;
            });
        }
    }

    const finEl = document.getElementById("financeChart");
    if (finEl) {
        const date = new Date();
        const labelsLine = [];
        const dataEntradas = [];
        const dataDespesas = [];
        const dataSaldo = [];
        for (let i = 7; i >= 0; i--) {
            const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
            labelsLine.push(d.toLocaleString("pt-BR", {month:"short"}).replace(".", ""));
            const res = finance.resumoMensal(d.getMonth() + 1, d.getFullYear());
            dataEntradas.push(res.entradas);
            dataDespesas.push(res.saidas);
            dataSaldo.push(res.saldo);
        }

        if (financeChartInstance) financeChartInstance.destroy();
        const financeCtx = finEl.getContext("2d");
        const gradient = financeCtx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(124,92,255,.35)");
        gradient.addColorStop(1, "rgba(124,92,255,0)");

        const isLight = document.body.classList.contains("theme-light");
        const eixoCor = isLight ? "#475569" : "#8d96aa";
        const gridCor = isLight ? "rgba(15,23,42,.07)" : "rgba(255,255,255,.05)";

        financeChartInstance = new Chart(financeCtx, {
            type: "line",
            data: {
                labels: labelsLine,
                datasets: [
                    {
                        label: "Entradas",
                        data: dataEntradas,
                        borderColor: "#25e6a5",
                        backgroundColor: "transparent",
                        borderWidth: 2,
                        fill: false,
                        tension: .45,
                        pointRadius: 4,
                        pointHoverRadius: 8
                    },
                    {
                        label: "Despesas",
                        data: dataDespesas,
                        borderColor: "#ff5c7c",
                        backgroundColor: "transparent",
                        borderWidth: 2,
                        fill: false,
                        tension: .45,
                        pointRadius: 4,
                        pointHoverRadius: 8
                    },
                    {
                        label: "Saldo",
                        data: dataSaldo,
                        borderColor: "#7c5cff",
                        backgroundColor: gradient,
                        fill: true,
                        tension: .45,
                        pointRadius: 4,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: eixoCor, boxWidth: 10, usePointStyle: true }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: eixoCor } },
                    y: { grid: { color: gridCor }, ticks: { color: eixoCor, callback: (val) => "R$ " + val } }
                }
            }
        });
    }
}

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
            if (typeof gamification !== "undefined") {
                try {
                    gamification.adicionarXp(3, "Transação editada");
                } catch (err) {}
            }
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

            if (typeof gamification !== "undefined") {
                try {
                    gamification.adicionarXp(10, "Transação cadastrada");
                    if (typeSelect !== "expense") {
                        gamification.dispararConfetti();
                    }
                } catch (err) {}
            }
        }

        editingId = null;
        form.reset();
        closeModal();
        atualizarTela();
    });
}

// ==== Metas (gamificação) ====
const goalForm = document.getElementById("goalForm");
if (goalForm) {
    goalForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const descricao = document.getElementById("goalDesc").value.trim();
        const tipo = document.getElementById("goalType").value;
        const valor = Number(document.getElementById("goalValue").value);

        if (!descricao || !valor || typeof gamification === "undefined") return;

        gamification.adicionarMeta({ descricao, tipo, meta: valor });
        goalForm.reset();
    });
}

// ==== Cards 3D Interativos ====
function isLightTheme() {
    return document.body.classList.contains("theme-light");
}

const cardStates = [];

document.querySelectorAll(".cards > .card").forEach((card) => {
    const shine = document.createElement("div");
    shine.className = "card-shine";
    card.appendChild(shine);

    const layers = card.querySelectorAll(".icon, .value, .card-label, small, .balance, .mini-chart");
    card.classList.add("tilt-ready");

    const state = {
        card,
        shine,
        layers,
        hovering: false,
        target: { rx: 0, ry: 0, shadow: 0 },
        cur: { rx: 0, ry: 0, shadow: 0 },
    };
    cardStates.push(state);

    card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const px = x / r.width;
        const py = y / r.height;

        state.hovering = true;
        state.target.ry = (px - 0.5) * 20;
        state.target.rx = (0.5 - py) * 16;
        state.target.shadow = 1;

        card.style.setProperty("--cursor-x", `${x}px`);
        card.style.setProperty("--cursor-y", `${y}px`);
        shine.style.opacity = "1";

        layers.forEach((el, i) => {
            const depth = (i + 1) * (isLightTheme() ? 2.5 : 4);
            el.style.transform = `translate3d(${(px - 0.5) * depth}px, ${(py - 0.5) * depth}px, 0)`;
        });
    });

    card.addEventListener("mouseleave", () => {
        state.hovering = false;
        state.target.rx = 0;
        state.target.ry = 0;
        state.target.shadow = 0;
        shine.style.opacity = "0";
        layers.forEach((el) => { el.style.transform = ""; });
    });
});

function animateCards() {
    cardStates.forEach((s) => {
        const t = s.target;
        const c = s.cur;
        c.rx += (t.rx - c.rx) * 0.06;
        c.ry += (t.ry - c.ry) * 0.06;
        c.shadow += (t.shadow - c.shadow) * 0.06;

        const lift = s.hovering ? -8 : -4;
        s.card.style.transform =
            `translateY(${lift}px) perspective(900px) rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg) scale(${1 + c.shadow * 0.02})`;

        if (isLightTheme()) {
            s.card.style.boxShadow = c.shadow > 0.01
                ? `0 ${24 * c.shadow}px ${50 * c.shadow}px rgba(109, 40, 217, ${0.12 * c.shadow}), 0 0 0 1px rgba(109, 40, 217, ${0.18 * c.shadow})`
                : "";
        } else {
            s.card.style.boxShadow = c.shadow > 0.01
                ? `0 ${30 * c.shadow}px ${70 * c.shadow}px rgba(0, 0, 0, ${0.36 * c.shadow}), 0 0 0 1px rgba(124, 92, 255, ${0.3 * c.shadow}), inset 0 1px rgba(255, 255, 255, ${0.1 * c.shadow})`
                : "";
        }

        if (!s.hovering && c.rx < 0.01 && c.ry < 0.01 && c.shadow < 0.01) {
            s.card.style.transform = "";
            s.card.style.boxShadow = "";
        }
    });
    requestAnimationFrame(animateCards);
}
animateCards();

document.addEventListener("DOMContentLoaded", atualizarTela);
atualizarTela();