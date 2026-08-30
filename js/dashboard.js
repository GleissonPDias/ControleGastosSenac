finance.carregar();
    if (!finance.getUsuario()) finance.setUsuario("H");

    function atualizarTela() {
        const saldo = finance.saldo();
        const receitas = finance.totalEntradas();
        const despesas = finance.totalSaidas();
        const economia = receitas > 0 ? Math.round(((receitas - despesas) / receitas) * 100) : 0;
        const formatarMoeda = (valor) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        document.querySelectorAll(".card .value")[0].textContent = formatarMoeda(saldo);
        document.querySelectorAll(".card .value")[1].textContent = formatarMoeda(receitas);
        document.querySelectorAll(".card .value")[2].textContent = formatarMoeda(despesas);
        document.querySelectorAll(".card .value")[3].textContent = economia + "%";

        const list = document.getElementById("transactionList");
        list.innerHTML = "";
        const itens = finance.listar().slice().reverse(); 
        itens.forEach(item => {
            const div = document.createElement("div");
            div.className = "transaction";
            const isDespesa = item.tipo === "saida";
            
            let dateDisplay = "Hoje";
            if(item.data) {
                 const [y, m, d] = item.data.split("-");
                 dateDisplay = d + "/" + m + "/" + y;
            }

            div.innerHTML = `
                <div class="transaction-icon">${isDespesa ? "💸" : "💰"}</div>
                <div class="transaction-info">
                    <div class="transaction-name">${item.descricao}</div>
                    <div class="transaction-date" style="display:flex; justify-content:space-between; width: 100%;">
                         <span>${dateDisplay} • ${item.categoria}</span>
                         <span onclick="deletarItem(${item.id})" style="color:var(--red); cursor:pointer; font-weight: bold; margin-left: auto;">Excluir ×</span>
                    </div>
                </div>
                <div class="transaction-value ${isDespesa ? "negative" : "positive"}">
                    ${isDespesa ? "-" : "+"} ${formatarMoeda(item.valor)}
                </div>
            `;
            list.appendChild(div);
        });

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

        const categoryCtx = document.getElementById("categoryChart").getContext("2d");
        categoryChartInstance = new Chart(categoryCtx, {
            type: "doughnut",
            data: {
                labels: labelsCat.length ? labelsCat : ["Nenhum dado"],
                datasets: [{
                    data: dataCat.length ? dataCat : [1],
                    backgroundColor: ["#7c5cff", "#19d3ff", "#25e6a5", "#ffc857", "#ff5c7c", "#ff99c2"],
                    borderWidth: 0,
                    hoverOffset: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "72%",
                plugins: { legend: { display: false } },
                tooltips: { enabled: labelsCat.length > 0 }
            }
        });

        const legendDiv = document.querySelector(".legend");
        legendDiv.innerHTML = "";
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

        const date = new Date();
        const labelsLine = [];
        const dataLine = [];
        for (let i = 7; i >= 0; i--) {
            const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
            labelsLine.push(d.toLocaleString("pt-BR", {month:"short"}).replace(".", ""));
            const res = finance.resumoMensal(d.getMonth() + 1, d.getFullYear());
            dataLine.push(res.saldo);
        }

        if (financeChartInstance) financeChartInstance.destroy();
        const financeCtx = document.getElementById("financeChart").getContext("2d");
        const gradient = financeCtx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(124,92,255,.35)");
        gradient.addColorStop(1, "rgba(124,92,255,0)");

        financeChartInstance = new Chart(financeCtx, {
            type: "line",
            data: {
                labels: labelsLine,
                datasets: [{
                    label: "Saldo",
                    data: dataLine,
                    borderColor: "#7c5cff",
                    backgroundColor: gradient,
                    fill: true,
                    tension: .45,
                    pointRadius: 4,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: "#8d96aa" } },
                    y: { grid: { color: "rgba(255,255,255,.05)" }, ticks: { color: "#8d96aa", callback: (val) => "R$ " + val } }
                }
            }
        });
    }

    const modal = document.getElementById("modal");
    function openModal() { modal.classList.add("show"); }
    function closeModal() { modal.classList.remove("show"); }
    modal.addEventListener("click", function(e) { if(e.target === modal) closeModal(); });

    const form = document.getElementById("transactionForm");
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const description = document.getElementById("description").value;
        const amount = Number(document.getElementById("amount").value);
        const typeSelect = document.getElementById("type").value;
        const category = document.getElementById("category").value;
        
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

        form.reset();
        closeModal();
        atualizarTela();
    });

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("mousemove", function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 18;
            const rotateY = (centerX - x) / 18;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-7px) scale(1.01)`;
        });
        card.addEventListener("mouseleave", function() {
            card.style.transform = "";
        });
    });

    atualizarTela();