
    finance.carregar();
    const avatar = document.querySelector(".avatar");
    
    const configNome = document.getElementById("configNome");
    const configTema = document.getElementById("configTema");
    const msg = document.getElementById("configMsg");

    function loadData() {
        const nome = finance.getUsuario();
        const tema = finance.getTema();
        if (nome) {
            configNome.value = nome;
            avatar.innerText = nome[0].toUpperCase();
        }
        if (tema) configTema.value = tema;
    }

    document.getElementById("configForm").addEventListener("submit", function(e) {
        e.preventDefault();
        finance.setUsuario(configNome.value.trim());
        finance.setTema(configTema.value);
        
        if (configNome.value.trim()) {
            avatar.innerText = configNome.value.trim()[0].toUpperCase();
        }

        // Simula mudança de tema básica
        if(configTema.value === "claro") {
            document.body.style.background = "#f0f2f5";
            document.documentElement.style.setProperty('--bg', '#f0f2f5');
        } else {
            document.body.style.background = "";
            document.documentElement.style.setProperty('--bg', '#070a12');
        }

        msg.style.display = "block";
        setTimeout(() => { msg.style.display = "none"; }, 3000);
    });

    loadData();
