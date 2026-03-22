document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // ELEMENTOS
    // ===============================
    const botoes = document.querySelectorAll(".list-item");
    const atividadeSpan = document.getElementById("atividadeSelecionada");

    const displayCronometro = document.getElementById("cronometro");
    const duracaoEl = document.getElementById("duracao");

    const btnIniciar = document.getElementById("btnIniciar");
    const btnParar = document.getElementById("btnParar");
    const btnResetar = document.getElementById("btnResetar");

    const horaInicioEl = document.getElementById("horaInicio");
    const horaFimEl = document.getElementById("horaFim");
    const dataAtualEl = document.getElementById("dataAtual");

    const boxDuracao = document.querySelector(".destaque");

    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("menu");

    const btnSair = document.getElementById("btnSair");
    const loginForm = document.getElementById("loginForm");

    const toast = document.getElementById("toast");

    // ===============================
    // VARIÁVEIS
    // ===============================
    let segundos = 0;
    let intervalo = null;
    let rodando = false;
    let atividadeSelecionada = "";

    // ===============================
    // FORMATAR TEMPO
    // ===============================
    function formatarTempo(segundosTotais) {
        const h = String(Math.floor(segundosTotais / 3600)).padStart(2, "0");
        const m = String(Math.floor((segundosTotais % 3600) / 60)).padStart(2, "0");
        const s = String(segundosTotais % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    }

    // ===============================
    // DATA ATUAL
    // ===============================
    function atualizarData() {
        if (dataAtualEl) {
            dataAtualEl.textContent = new Date().toLocaleDateString();
        }
    }
    atualizarData();

    // ===============================
    // TOAST (FEEDBACK VISUAL)
    // ===============================
    function mostrarToast(mensagem) {
        if (!toast) return;

        toast.textContent = mensagem;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    // ===============================
    // ESTADO VISUAL
    // ===============================
    function setEstado(estado) {

        if (!boxDuracao) return;

        boxDuracao.classList.remove("rodando", "parado", "padrao", "pulsando");

        if (estado === "rodando") {
            boxDuracao.classList.add("rodando", "pulsando");
        }

        if (estado === "parado") {
            boxDuracao.classList.add("parado");
        }

        if (estado === "reset") {
            boxDuracao.classList.add("padrao");
        }
    }

    // ===============================
    // SELEÇÃO DE ATIVIDADE
    // ===============================
    botoes.forEach(btn => {
        btn.addEventListener("click", () => {

            botoes.forEach(b => b.classList.remove("ativo"));

            btn.classList.add("ativo");

            atividadeSelecionada = btn.dataset.parada;

            if (atividadeSpan) {
                atividadeSpan.textContent = atividadeSelecionada;
            }
        });
    });

    // ===============================
    // INICIAR
    // ===============================
    if (btnIniciar) {
        btnIniciar.addEventListener("click", () => {

            if (!atividadeSelecionada) {
                alert("Selecione uma atividade!");
                return;
            }

            if (rodando) return;

            rodando = true;

            const agora = new Date();
            if (horaInicioEl) {
                horaInicioEl.textContent = agora.toLocaleTimeString();
            }

            setEstado("rodando");

            intervalo = setInterval(() => {

                segundos++;

                const tempo = formatarTempo(segundos);

                if (displayCronometro) displayCronometro.textContent = tempo;
                if (duracaoEl) duracaoEl.textContent = tempo;

            }, 1000);
        });
    }

    // ===============================
    // PARAR + SALVAR + FEEDBACK
    // ===============================
    if (btnParar) {
        btnParar.addEventListener("click", () => {

            if (!rodando) return;

            rodando = false;
            clearInterval(intervalo);

            const agora = new Date();
            const horaFim = agora.toLocaleTimeString();

            if (horaFimEl) {
                horaFimEl.textContent = horaFim;
            }

            setEstado("parado");

            const atividade = {
                atividade: atividadeSelecionada,
                data: dataAtualEl?.textContent || "",
                inicio: horaInicioEl?.textContent || "",
                fim: horaFim,
                duracao: duracaoEl?.textContent || ""
            };

            salvarAtividade(atividade);

// dispara atualização global
window.dispatchEvent(new Event("atividadeSalva"));

            // 🔥 FEEDBACK VISUAL
            mostrarToast("✅ Atividade salva com sucesso!");

            // 🔥 REDIRECIONAMENTO
            setTimeout(() => {
                window.location.href = "historico.html";
            }, 2000);
        });
    }

    // ===============================
    // RESETAR
    // ===============================
    if (btnResetar) {
        btnResetar.addEventListener("click", () => {

            rodando = false;
            clearInterval(intervalo);

            segundos = 0;

            if (displayCronometro) displayCronometro.textContent = "00:00:00";
            if (duracaoEl) duracaoEl.textContent = "--:--:--";

            if (horaInicioEl) horaInicioEl.textContent = "--:--:--";
            if (horaFimEl) horaFimEl.textContent = "--:--:--";

            atividadeSelecionada = "";
            if (atividadeSpan) atividadeSpan.textContent = "Nenhuma";

            botoes.forEach(b => b.classList.remove("ativo"));

            setEstado("reset");
        });
    }

    // ===============================
    // MENU MOBILE
    // ===============================
    if (toggle && menu) {
        toggle.addEventListener("click", () => {
            menu.classList.toggle("ativo");
        });

        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                menu.classList.remove("ativo");
            });
        });
    }

    // ===============================
    // LOGIN
    // ===============================
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {

            e.preventDefault();

            const usuario = loginForm.username.value;
            const ut = loginForm.UT.value;

            if (!usuario || !ut) {
                alert("Preencha todos os campos!");
                return;
            }

            localStorage.setItem("usuario", usuario);
            localStorage.setItem("UT", ut);

            window.location.href = "pages/page2.html";
        });
    }

    // ===============================
    // LOGOUT
    // ===============================
    if (btnSair) {
        btnSair.addEventListener("click", () => {

            const confirmar = confirm("Deseja sair?");
            if (!confirmar) return;

            localStorage.removeItem("usuario");
            localStorage.removeItem("UT");

            window.location.href = "../index.html";
        });
    }

    // ===============================
    // USUÁRIO NO TOPO
    // ===============================
    const nome = localStorage.getItem("usuario");
    const nomeEl = document.getElementById("nomeUsuario");

    if (nome && nomeEl) {
        nomeEl.textContent = nome;
    }

});

// ===============================
// SALVAR NO LOCALSTORAGE
// ===============================
function salvarAtividade(novaAtividade) {

    let atividades = JSON.parse(localStorage.getItem("atividades")) || [];

    atividades.push(novaAtividade);

    localStorage.setItem("atividades", JSON.stringify(atividades));
}