document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // ELEMENTOS
    // ===============================
    const corpoTabela = document.getElementById("corpoTabela");
    const btnLimpar = document.getElementById("btnLimpar");
    const filtroAtividade = document.getElementById("filtroAtividade");
    const filtroData = document.getElementById("filtroData");

    let atividades = [];
    let grafico = null;

    // ===============================
    // UTIL
    // ===============================
    function tempoParaSegundos(tempo) {
        if (!tempo || tempo === "--:--:--") return 0;

        const [h = 0, m = 0, s = 0] = tempo.split(":").map(Number);
        return h * 3600 + m * 60 + s;
    }

    function segundosParaTempo(total) {
        const h = String(Math.floor(total / 3600)).padStart(2, "0");
        const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
        const s = String(total % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    }

    // ===============================
    // FILTRO DE DATA
    // ===============================
    function filtrarPorData(lista, tipo) {

        const hoje = new Date();

        return lista.filter(item => {

            if (!item.data) return false;

            const [dia, mes, ano] = item.data.split("/");
            const dataItem = new Date(ano, mes - 1, dia);

            if (tipo === "hoje") {
                return dataItem.toDateString() === hoje.toDateString();
            }

            if (tipo === "semana") {
                const inicioSemana = new Date(hoje);
                inicioSemana.setDate(hoje.getDate() - hoje.getDay());
                return dataItem >= inicioSemana && dataItem <= hoje;
            }

            if (tipo === "mes") {
                return (
                    dataItem.getMonth() === hoje.getMonth() &&
                    dataItem.getFullYear() === hoje.getFullYear()
                );
            }

            return true;
        });
    }

    // ===============================
    // KPIs
    // ===============================
    function calcularKPIs(lista) {

        let totalSegundos = 0;
        const contagem = {};

        lista.forEach(item => {
            totalSegundos += tempoParaSegundos(item.duracao);
            contagem[item.atividade] = (contagem[item.atividade] || 0) + 1;
        });

        const total = lista.length;

        const atividadeTop = total > 0
            ? Object.keys(contagem).reduce((a, b) =>
                contagem[a] > contagem[b] ? a : b
            )
            : "-";

        document.getElementById("totalRegistros").textContent = total;
        document.getElementById("tempoTotal").textContent = segundosParaTempo(totalSegundos);
        document.getElementById("atividadeTop").textContent = atividadeTop;
    }

    // ===============================
    // GRÁFICO (ATUALIZA SEM RECRIAR)
    // ===============================
    function gerarGrafico(lista) {

        const ctx = document.getElementById("graficoAtividades");
        if (!ctx) return;

        const resumo = {};

        lista.forEach(item => {
            const seg = tempoParaSegundos(item.duracao);
            if (!seg) return;

            resumo[item.atividade] = (resumo[item.atividade] || 0) + seg;
        });

        const labels = Object.keys(resumo);
        const valores = Object.values(resumo).map(v => (v / 3600).toFixed(2));

        // Atualiza gráfico existente
        if (grafico) {
            grafico.data.labels = labels;
            grafico.data.datasets[0].data = valores;
            grafico.update();
            return;
        }

        // Cria gráfico
        grafico = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Horas por atividade",
                    data: valores
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 800,
                    easing: "easeOutBounce"
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // ===============================
    // TABELA
    // ===============================
    function renderizarTabela(lista) {

        corpoTabela.innerHTML = "";

        if (lista.length === 0) {
            corpoTabela.innerHTML = `<tr><td colspan="6">Nenhuma atividade encontrada</td></tr>`;
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

                const index = btn.dataset.index;

                if (!confirm("Excluir este registro?")) return;

                atividades.splice(index, 1);
                salvarDados();
                atualizarTela();
            });
        });
    }

    // ===============================
    // FILTROS
    // ===============================
    function aplicarFiltros() {

        let lista = [...atividades];

        if (filtroAtividade.value) {
            lista = lista.filter(a => a.atividade === filtroAtividade.value);
        }

        if (filtroData.value) {
            lista = filtrarPorData(lista, filtroData.value);
        }

        atualizarTela(lista);
    }

    // ===============================
    // STORAGE
    // ===============================
    function salvarDados() {
        localStorage.setItem("atividades", JSON.stringify(atividades));
    }

    function carregarDados() {
        atividades = JSON.parse(localStorage.getItem("atividades")) || [];
        atividades.reverse();
    }

    // ===============================
    // RENDER GERAL
    // ===============================
    function atualizarTela(lista = atividades) {
        renderizarTabela(lista);
        calcularKPIs(lista);
        gerarGrafico(lista);
    }

    // ===============================
    // EVENTOS
    // ===============================
    filtroAtividade.addEventListener("change", aplicarFiltros);
    filtroData.addEventListener("change", aplicarFiltros);

    btnLimpar.addEventListener("click", () => {
        if (!confirm("Tem certeza que deseja apagar tudo?")) return;

        localStorage.removeItem("atividades");
        atividades = [];
        atualizarTela();
    });

    // 🔥 ATUALIZA EM TEMPO REAL
    window.addEventListener("atividadeSalva", () => {
        carregarDados();
        atualizarTela();
    });

    // ===============================
    // INIT
    // ===============================
    carregarDados();
    atualizarTela();

});