finance.carregar();
const avatar = document.querySelector(".avatar");

const configNome = document.getElementById("configNome");
const configTema = document.getElementById("configTema");
const msg = document.getElementById("configMsg");

function loadData() {
    const nome = finance.getUsuario();
    const tema = finance.getTema() || "escuro";
    if (nome && configNome) {
        configNome.value = nome;
        if (avatar) avatar.innerText = nome[0].toUpperCase();
    }
    if (configTema) configTema.value = tema;
}

const configForm = document.getElementById("configForm");
if (configForm) {
    configForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const novoNome = configNome ? configNome.value.trim() : "";
        const novoTema = configTema ? configTema.value : "escuro";

        finance.setUsuario(novoNome);
        finance.setTema(novoTema);

        if (novoNome && avatar) {
            avatar.innerText = novoNome[0].toUpperCase();
        }

        if (msg) {
            msg.style.display = "block";
            msg.innerText = "✨ Configurações salvas com sucesso!";
            setTimeout(() => { msg.style.display = "none"; }, 3000);
        }
    });
}

function resetarDados() {
    if (confirm("⚠️ ATENÇÃO: Esta ação irá apagar todas as suas movimentações, conquistas e configurações salvas no navegador.\n\nDeseja realmente apagar tudo?")) {
        if (typeof storage !== "undefined" && typeof storage.limparTudo === "function") {
            storage.limparTudo();
        } else {
            localStorage.clear();
        }
        alert("Todos os dados foram apagados com sucesso!");
        window.location.reload();
    }
}

document.addEventListener("DOMContentLoaded", loadData);
loadData();
