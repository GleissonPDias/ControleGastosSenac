
    finance.carregar();
    const avatar = document.querySelector(".avatar");
    if (finance.getUsuario()) avatar.innerText = finance.getUsuario()[0].toUpperCase();

    const formatarMoeda = (valor) => Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    // Preenche cards
    document.getElementById("mediaVal").innerText = formatarMoeda(finance.mediaMensal());
    const maior = finance.maiorGasto();
    if (maior) {
        document.getElementById("maiorGastoVal").innerText = formatarMoeda(maior.valor);
        document.getElementById("maiorGastoDesc").innerText = `${maior.descricao} (${maior.data ? maior.data.split("-").reverse().join("/") : ""})`;
    }

    // Prepara Gráfico Anual (12 meses)
    const relCtx = document.getElementById("relatorioChart").getContext("2d");
    const date = new Date();
    const labelsLine = [];
    const entradasLine = [];
    const saidasLine = [];

    for (let i = 11; i >= 0; i--) {
        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
        labelsLine.push(d.toLocaleString("pt-BR", {month:"short"}).replace(".", ""));
        const res = finance.resumoMensal(d.getMonth() + 1, d.getFullYear());
        entradasLine.push(res.entradas);
        saidasLine.push(res.saidas);
    }

    new Chart(relCtx, {
        type: "bar",
        data: {
            labels: labelsLine,
            datasets: [
                {
                    label: "Receitas",
                    data: entradasLine,
                    backgroundColor: "#19d3ff",
                    borderRadius: 4
                },
                {
                    label: "Despesas",
                    data: saidasLine,
                    backgroundColor: "#ff5c7c",
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, labels: { color: "#fff" } } },
            scales: {
                x: { grid: { display: false }, ticks: { color: "#8d96aa" } },
                y: { grid: { color: "rgba(255,255,255,.05)" }, ticks: { color: "#8d96aa", callback: (val) => "R$ " + val } }
            }
        }
    });
