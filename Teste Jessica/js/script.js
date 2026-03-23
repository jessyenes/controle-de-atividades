// ===============================
// script.js - Controle de Atividades Diárias (VERSÃO FINAL FUNCIONAL)
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // ELEMENTOS DO DOM
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

    const btnSair = document.getElementById("btnSair");
    const loginForm = document.getElementById("loginForm");

    const corpoTabela = document.getElementById("corpoTabela");

    const filtroAtividade = document.getElementById("filtroAtividade");
    const filtroData = document.getElementById("filtroData");
    const filtroInicio = document.getElementById("filtroInicio");
    const filtroFim = document.getElementById("filtroFim");

    const tipoGraficoSelect = document.getElementById("tipoGrafico");
    const btnLimpar = document.getElementById("btnLimpar");

    // ===============================
    // USUÁRIOS AUTORIZADOS
    // ===============================
    const usuariosAutorizados = [
        { usuario: "admin", UT: "sobral" },
        { usuario: "usuario1", UT: "xambioa" },
        { usuario: "usuario2", UT: "vidal_ramos" }
    ];

    // ===============================
    // VARIÁVEIS GLOBAIS
    // ===============================
    let segundos = 0;
    let intervalo = null;
    let rodando = false;
    let atividadeSelecionada = "";
    let atividades = [];
    let grafico = null;
    let tipoGraficoAtual = "bar";

    const usuarioLogado = localStorage.getItem("usuario");
    const utLogado = localStorage.getItem("UT");

    // ===============================
    // BLOQUEIO DE ACESSO
    // ===============================
    if (!usuarioLogado &&
        (location.pathname.includes("page2.html") ||
         location.pathname.includes("historico.html"))) {

        alert("Faça login para acessar!");
        location.href = "../index.html";
        return;
    }

    // ===============================
    // LOGIN
    // ===============================
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const usuario = loginForm.username.value.trim().toLowerCase();
            const ut = loginForm.UT.value;

            const valido = usuariosAutorizados.find(u =>
                u.usuario === usuario && u.UT === ut
            );

            if (!valido) {
                alert("Usuário não autorizado!");
                return;
            }

            localStorage.setItem("usuario", usuario);
            localStorage.setItem("UT", ut);

            location.href = "pages/page2.html";
        });
    }

    // ===============================
    // LOGOUT
    // ===============================
    btnSair?.addEventListener("click", () => {
        if (!confirm("Deseja sair?")) return;

        localStorage.clear();
        location.href = "../index.html";
    });

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
    // UTILIDADES DE TEMPO
    // ===============================
    function formatarTempo(seg) {
        const h = String(Math.floor(seg / 3600)).padStart(2, "0");
        const m = String(Math.floor((seg % 3600) / 60)).padStart(2, "0");
        const s = String(seg % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    }

    function converterTempoParaSegundos(t) {
        const [h, m, s] = t.split(":").map(Number);
        return h * 3600 + m * 60 + s;
    }

    // ===============================
    // DATA PADRÃO
    // ===============================
    function obterDataAtual() {
        const hoje = new Date();
        const dia = String(hoje.getDate()).padStart(2, "0");
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const ano = hoje.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }

    // ===============================
    // CRONÔMETRO
    // ===============================
    btnIniciar?.addEventListener("click", () => {

        if (!atividadeSelecionada) {
            alert("Selecione uma atividade!");
            return;
        }

        if (rodando) return;

        rodando = true;

        if (horaInicioEl) {
            horaInicioEl.textContent = new Date().toLocaleTimeString();
        }

        intervalo = setInterval(() => {
            segundos++;

            const tempo = formatarTempo(segundos);

            if (displayCronometro) displayCronometro.textContent = tempo;
            if (duracaoEl) duracaoEl.textContent = tempo;

        }, 1000);
    });

    // ===============================
    // PARAR E SALVAR
    // ===============================
    btnParar?.addEventListener("click", () => {

        if (!rodando) return;

        rodando = false;
        clearInterval(intervalo);

        const horaFim = new Date().toLocaleTimeString();

        if (horaFimEl) horaFimEl.textContent = horaFim;

        const atividade = {
            usuario: usuarioLogado,
            UT: utLogado,
            atividade: atividadeSelecionada,
            data: obterDataAtual(),
            inicio: horaInicioEl?.textContent || "",
            fim: horaFim,
            duracao: duracaoEl?.textContent || ""
        };

        salvarAtividade(atividade);

        alert("Atividade registrada com sucesso!");
        location.href = "historico.html";
    });

    // ===============================
    // RESET
    // ===============================
    btnResetar?.addEventListener("click", () => {

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
    });

    // ===============================
    // LOCAL STORAGE
    // ===============================
    function carregarAtividades() {
        const todas = JSON.parse(localStorage.getItem("atividades")) || [];

        atividades = todas.filter(a =>
            a.usuario === usuarioLogado && a.UT === utLogado
        ).reverse();
    }

    function salvarAtividade(nova) {
        const todas = JSON.parse(localStorage.getItem("atividades")) || [];
        todas.push(nova);
        localStorage.setItem("atividades", JSON.stringify(todas));
    }

    // ===============================
    // TABELA
    // ===============================
    function renderizarTabela(lista = atividades) {

        if (!corpoTabela) return;

        corpoTabela.innerHTML = "";

        if (!lista.length) {
            corpoTabela.innerHTML = `<tr><td colspan="6">Nenhuma atividade</td></tr>`;
            return;
        }

        lista.forEach((item, index) => {

            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td>${item.data}</td>
                <td>${item.atividade}</td>
                <td>${item.inicio}</td>
                <td>${item.fim}</td>
                <td>${item.duracao}</td>
                <td><button data-index="${index}" class="btnExcluir">❌</button></td>
            `;

            corpoTabela.appendChild(linha);
        });

        document.querySelectorAll(".btnExcluir").forEach(btn => {
            btn.addEventListener("click", () => {

                if (!confirm("Excluir registro?")) return;

                const index = Number(btn.dataset.index);

                const todas = JSON.parse(localStorage.getItem("atividades")) || [];

                const novas = todas.filter((item, i) =>
                    !(item.usuario === usuarioLogado && item.UT === utLogado && i === index)
                );

                localStorage.setItem("atividades", JSON.stringify(novas));

                carregarAtividades();
                atualizarTela();
            });
        });
    }

    // ===============================
    // FILTROS
    // ===============================
    function aplicarFiltros() {

        let lista = [...atividades];

        if (filtroAtividade?.value) {
            lista = lista.filter(a => a.atividade === filtroAtividade.value);
        }

        if (filtroData?.value) {
            lista = lista.filter(a => {
                const [d, m, y] = a.data.split("/");
                return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}` === filtroData.value;
            });
        }

        if (filtroInicio?.value) {
            lista = lista.filter(a => a.inicio >= filtroInicio.value);
        }

        if (filtroFim?.value) {
            lista = lista.filter(a => a.fim <= filtroFim.value);
        }

        atualizarTela(lista);
    }

    // ===============================
    // GRÁFICO
    // ===============================
    function gerarGrafico(lista) {

        const ctx = document.getElementById("graficoAtividades");
        if (!ctx) return;

        const resumo = {};

        lista.forEach(item => {
            if (!item.duracao || item.duracao === "--:--:--") return;

            const seg = converterTempoParaSegundos(item.duracao);
            resumo[item.atividade] = (resumo[item.atividade] || 0) + seg;
        });

        const labels = Object.keys(resumo);
        const valores = Object.values(resumo).map(v => (v / 3600).toFixed(2));

        const cores = labels.map((_, i) => [
            "#ff6a00", "#ff8c00", "#ff3c00", "#ffa500"
        ][i % 4]);

        if (grafico) grafico.destroy();

        grafico = new Chart(ctx, {
            type: tipoGraficoAtual,
            data: {
                labels,
                datasets: [{
                    data: valores,
                    backgroundColor: cores
                }]
            }
        });
    }

    // ===============================
    // ATUALIZAÇÃO GERAL
    // ===============================
    function atualizarTela(lista = atividades) {
        renderizarTabela(lista);
        gerarGrafico(lista);
    }

    // ===============================
    // EVENTOS
    // ===============================
    filtroAtividade?.addEventListener("change", aplicarFiltros);
    filtroData?.addEventListener("change", aplicarFiltros);
    filtroInicio?.addEventListener("change", aplicarFiltros);
    filtroFim?.addEventListener("change", aplicarFiltros);

    tipoGraficoSelect?.addEventListener("change", (e) => {
        tipoGraficoAtual = e.target.value;
        gerarGrafico(atividades);
    });

    btnLimpar?.addEventListener("click", () => {
        if (!confirm("Apagar histórico?")) return;

        localStorage.removeItem("atividades");
        atividades = [];
        atualizarTela();
    });

    // ===============================
    // INICIALIZAÇÃO
    // ===============================
    carregarAtividades();
    atualizarTela();

});