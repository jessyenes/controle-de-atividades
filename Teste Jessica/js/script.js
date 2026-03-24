// =========================================================
// script.js - CONTROLE DE ATIVIDADES (VERSÃO FINAL ESTÁVEL)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. CONFIGURAÇÕES E ESTADO GLOBAL ---
    const usuarioLogado = localStorage.getItem("usuario");
    const usuariosAutorizados = [
        { matricula: "123", senha: "123" },
        { matricula: "jessica", senha: "123" },
        { matricula: "789", senha: "123" }
    ];

    // --- 2. BLOQUEIO DE ACESSO (PROTEÇÃO DE PÁGINAS) ---
    const paginasPrivadas = ["menu.html", "turno.html", "origem.html", "material.html", "equipamentos.html", "horimetro.html", "page2.html", "historico.html"];
    const estaEmPaginaPrivada = paginasPrivadas.some(p => location.pathname.includes(p));

    if (!usuarioLogado && estaEmPaginaPrivada) {
        alert("Acesso negado! Faça login primeiro.");
        location.href = "../index.html";
        return;
    }

    // Exibir nome do usuário no Header se o campo existir
    const nomeUsuarioEl = document.getElementById("nomeUsuario");
    if (nomeUsuarioEl) nomeUsuarioEl.textContent = usuarioLogado;

    // --- 3. LOGIN E LOGOUT ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const matricula = loginForm.matricula.value.trim().toLowerCase();
            const senha = loginForm.senha.value.trim();
            const user = usuariosAutorizados.find(u => u.matricula === matricula && u.senha === senha);

            if (user) {
                localStorage.setItem("usuario", matricula);
                location.href = "pages/menu.html";
            } else {
                alert("Matrícula ou senha incorretos!");
            }
        });
    }

    document.getElementById("btnSair")?.addEventListener("click", () => {
        if (confirm("Deseja realmente sair?")) {
            localStorage.removeItem("usuario");
            location.href = "../index.html";
        }
    });

    // --- 4. MENU PRINCIPAL (SAUDAÇÃO E KPIs) ---
    const saudacaoEl = document.getElementById("saudacao");
    if (saudacaoEl) {
        const hora = new Date().getHours();
        let msg = hora < 12 ? "Bom dia ☀️" : hora < 18 ? "Boa tarde 🌤️" : "Boa noite 🌙";
        saudacaoEl.textContent = `${msg}, ${usuarioLogado}`;
        atualizarIndicadoresMenu();
    }

    // --- 5. FLUXO DE SELEÇÃO (TURNO -> ORIGEM -> MATERIAL -> ETC) ---
    
    // Genérico para botões de seleção única
    function configurarSelecao(classeBotao, spanId, btnProximoId, storageKey) {
        const botoes = document.querySelectorAll(`.${classeBotao}`);
        const span = document.getElementById(spanId);
        const btnProximo = document.getElementById(btnProximoId);

        botoes.forEach(btn => {
            btn.addEventListener("click", () => {
                botoes.forEach(b => b.classList.remove("ativo"));
                btn.classList.add("ativo");
                const valor = btn.dataset.turno || btn.dataset.origem || btn.dataset.destino || btn.dataset.material || btn.dataset.equipamento || btn.dataset.carga;
                
                if (span) span.textContent = valor;
                if (btnProximo) btnProximo.disabled = false;
                localStorage.setItem(storageKey, valor);
            });
        });
    }

    // Ativações baseadas na página atual
    configurarSelecao("turno-btn", "turnoSelecionado", "btnProximo", "turno");
    configurarSelecao("origem-btn", "origemSelecionada", "btnProximoOrigem", "origem");
    configurarSelecao("destino-btn", "destinoSelecionado", "btnProximoOrigem", "destino");
    configurarSelecao("material-btn", "materialSelecionado", "btnProximoMaterial", "material");
    configurarSelecao("equipamento-btn", "equipamentoSelecionado", "btnProximoEquipamento", "equipamento");
    configurarSelecao("carga-btn", "cargaSelecionada", "btnProximoEquipamento", "equipamentoCarga");

    // Lógica específica do Horímetro
    const inputHorimetro = document.getElementById("horimetroInicial");
    const btnProxHorimetro = document.getElementById("btnProximoHorimetro");
    inputHorimetro?.addEventListener("input", () => {
        btnProxHorimetro.disabled = !(parseFloat(inputHorimetro.value) > 0);
    });
    btnProxHorimetro?.addEventListener("click", () => {
        localStorage.setItem("horimetroInicial", inputHorimetro.value);
        location.href = "page2.html";
    });

    // --- 6. CRONÔMETRO (PAGE2.HTML) ---
    const displayCronometro = document.getElementById("cronometro");
    let segundos = 0;
    let intervalo = null;
    let atividadeAtual = "";

    document.querySelectorAll(".list-item").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".list-item").forEach(b => b.classList.remove("ativo"));
            btn.classList.add("ativo");
            atividadeAtual = btn.dataset.parada;
        });
    });

    document.getElementById("btnIniciar")?.addEventListener("click", () => {
        if (!atividadeAtual) return alert("Selecione uma atividade!");
        if (intervalo) return;

        document.getElementById("horaInicio").textContent = new Date().toLocaleTimeString();
        intervalo = setInterval(() => {
            segundos++;
            const h = String(Math.floor(segundos / 3600)).padStart(2, "0");
            const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, "0");
            const s = String(segundos % 60).padStart(2, "0");
            displayCronometro.textContent = `${h}:${m}:${s}`;
        }, 1000);
    });

    document.getElementById("btnParar")?.addEventListener("click", () => {
        if (!intervalo) return;
        clearInterval(intervalo);
        
        const novaAtividade = {
            usuario: usuarioLogado,
            data: new Date().toLocaleDateString('pt-BR'),
            turno: localStorage.getItem("turno"),
            origem: localStorage.getItem("origem"),
            destino: localStorage.getItem("destino"),
            material: localStorage.getItem("material"),
            equipamento: `${localStorage.getItem("equipamento")} / ${localStorage.getItem("equipamentoCarga")}`,
            horimetro: localStorage.getItem("horimetroInicial"),
            atividade: atividadeAtual,
            inicio: document.getElementById("horaInicio").textContent,
            fim: new Date().toLocaleTimeString(),
            duracao: displayCronometro.textContent
        };

        const db = JSON.parse(localStorage.getItem("atividades")) || [];
        db.push(novaAtividade);
        localStorage.setItem("atividades", JSON.stringify(db));

        alert("Atividade salva com sucesso!");
        location.href = "historico.html";
    });

    // --- 7. HISTÓRICO E FILTROS ---
    const corpoTabela = document.getElementById("corpoTabela");
    if (corpoTabela) {
        renderizarTabela();
        configurarFiltros();
        atualizarIndicadoresMenu(); // Atualiza cards de resumo no histórico
    }

    function renderizarTabela(dadosFiltrados = null) {
        if (!corpoTabela) return;
        const todas = JSON.parse(localStorage.getItem("atividades")) || [];
        const lista = dadosFiltrados || todas.filter(a => a.usuario === usuarioLogado);

        corpoTabela.innerHTML = lista.map(item => `
            <tr>
                <td>${item.data}</td>
                <td>${item.turno}</td>
                <td>${item.origem}</td>
                <td>${item.destino}</td>
                <td>${item.material}</td>
                <td>${item.equipamento}</td>
                <td>${item.horimetro}</td>
                <td>${item.atividade}</td>
                <td>${item.inicio}</td>
                <td>${item.fim}</td>
                <td>${item.duracao}</td>
                <td><button class="btn-perigo-sm" onclick="removerItem('${item.inicio}')">🗑️</button></td>
            </tr>
        `).join("");
    }

    function configurarFiltros() {
        const inputs = ["filtroAtividade", "filtroData", "filtroInicio", "filtroFim"];
        inputs.forEach(id => {
            document.getElementById(id)?.addEventListener("change", () => {
                const todas = JSON.parse(localStorage.getItem("atividades")) || [];
                let filtrados = todas.filter(a => a.usuario === usuarioLogado);

                const fAtiv = document.getElementById("filtroAtividade").value;
                const fData = document.getElementById("filtroData").value;

                if (fAtiv) filtrados = filtrados.filter(a => a.atividade === fAtiv);
                if (fData) {
                    // Converte YYYY-MM-DD para DD/MM/YYYY para comparar
                    const dataFmt = fData.split("-").reverse().join("/");
                    filtrados = filtrados.filter(a => a.data === dataFmt);
                }
                renderizarTabela(filtrados);
            });
        });
    }

    // --- 8. KPIs E GRÁFICOS ---
    function atualizarIndicadoresMenu() {
        const todas = JSON.parse(localStorage.getItem("atividades")) || [];
        const minhas = todas.filter(a => a.usuario === usuarioLogado);

        // Atualiza Total de Registros
        const kpiTotal = document.getElementById("kpiTotal") || document.getElementById("totalRegistros");
        if (kpiTotal) kpiTotal.textContent = minhas.length;

        // Atualiza Atividade Top
        const kpiTop = document.getElementById("kpiTop") || document.getElementById("atividadeTop");
        if (kpiTop && minhas.length > 0) {
            const contagem = {};
            minhas.forEach(a => contagem[a.atividade] = (contagem[a.atividade] || 0) + 1);
            const top = Object.keys(contagem).reduce((a, b) => contagem[a] > contagem[b] ? a : b);
            kpiTop.textContent = top;
        }
    }

    // Botão Limpar Histórico
    document.getElementById("btnLimpar")?.addEventListener("click", () => {
        if (confirm("⚠️ ATENÇÃO: Isso apagará TODOS os seus registros. Confirmar?")) {
            const todas = JSON.parse(localStorage.getItem("atividades")) || [];
            const outras = todas.filter(a => a.usuario !== usuarioLogado);
            localStorage.setItem("atividades", JSON.stringify(outras));
            location.reload();
        }
    });
});

// Função global para remover item específico (precisa estar fora do DOMContentLoaded)
window.removerItem = (horaInicio) => {
    if (confirm("Remover este registro?")) {
        const todas = JSON.parse(localStorage.getItem("atividades")) || [];
        const filtradas = todas.filter(a => a.inicio !== horaInicio);
        localStorage.setItem("atividades", JSON.stringify(filtradas));
        location.reload();
    }
};
// No seu script.js, dentro do DOMContentLoaded:

// Configuração do Turno
const btnProximoTurno = document.getElementById("btnProximo");
const botoesTurno = document.querySelectorAll(".turno-btn");

botoesTurno.forEach(btn => {
    btn.addEventListener("click", () => {
        // Remove 'ativo' de todos e adiciona no clicado
        botoesTurno.forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");

        const valor = btn.dataset.turno;
        
        // Atualiza o texto na tela
        const span = document.getElementById("turnoSelecionado");
        if (span) span.textContent = valor;

        // Salva no LocalStorage e Habilita o botão
        localStorage.setItem("turno", valor);
        if (btnProximoTurno) btnProximoTurno.disabled = false;
    });
});

// Ação do Clique no Botão Próximo do Turno
btnProximoTurno?.addEventListener("click", () => {
    const turnoSalvo = localStorage.getItem("turno");
    if (turnoSalvo) {
        window.location.href = "origem.html";
    } else {
        alert("Por favor, selecione um turno!");
    }
});
// =========================================================
// LÓGICA DE ORIGEM E DESTINO
// =========================================================
const btnProxOrigem = document.getElementById("btnProximoOrigem");
const botoesOrigem = document.querySelectorAll(".origem-btn");
const botoesDestino = document.querySelectorAll(".destino-btn");

let origemOk = false;
let destinoOk = false;

// Evento para botões de Origem
botoesOrigem.forEach(btn => {
    btn.addEventListener("click", () => {
        botoesOrigem.forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        
        const valor = btn.dataset.origem;
        localStorage.setItem("origem", valor);
        document.getElementById("origemSelecionada").textContent = valor;
        
        origemOk = true;
        checarValidacaoOrigem();
    });
});

// Evento para botões de Destino
botoesDestino.forEach(btn => {
    btn.addEventListener("click", () => {
        botoesDestino.forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        
        const valor = btn.dataset.destino;
        localStorage.setItem("destino", valor);
        document.getElementById("destinoSelecionado").textContent = valor;
        
        destinoOk = true;
        checarValidacaoOrigem();
    });
});

function checarValidacaoOrigem() {
    if (origemOk && destinoOk && btnProxOrigem) {
        btnProxOrigem.disabled = false;
    }
}

// AÇÃO DO BOTÃO PRÓXIMO
btnProxOrigem?.addEventListener("click", () => {
    // Verifica se os dados estão no LocalStorage antes de ir
    if (localStorage.getItem("origem") && localStorage.getItem("destino")) {
        window.location.href = "material.html";
    } else {
        alert("Selecione Origem e Destino!");
    }
});

// ==========================================
// SELEÇÃO DE MATERIAL (Página material.html)
// ==========================================
const btnProxMat = document.getElementById("btnProximoMaterial");
const botoesMat = document.querySelectorAll(".material-btn");

botoesMat.forEach(btn => {
    btn.addEventListener("click", () => {
        // Estilo visual de seleção
        botoesMat.forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        
        // Captura o valor e salva
        const materialEscolhido = btn.dataset.material;
        localStorage.setItem("materialSelecionado", materialEscolhido);
        
        // Atualiza o texto de feedback
        const feedback = document.getElementById("materialSelecionado");
        if (feedback) feedback.textContent = materialEscolhido;
        
        // Habilita o botão de próximo
        if (btnProxMat) {
            btnProxMat.disabled = false;
            console.log("Material selecionado: " + materialEscolhido + ". Botão liberado!");
        }
    });
});

// EVENTO DE CLIQUE PARA MUDAR DE PÁGINA
if (btnProxMat) {
    btnProxMat.addEventListener("click", function() {
        console.log("Tentando navegar para equipamentos.html...");
        window.location.href = "equipamentos.html"; 
    });
}
// ==========================================
// LÓGICA DE EQUIPAMENTOS (Página equipamento.html)
// ==========================================
const btnProximoEquip = document.getElementById("btnProximoEquipamento");
const botoesEquip = document.querySelectorAll(".equipamento-btn");
const botoesCarga = document.querySelectorAll(".carga-btn");

// Função para verificar se os dois foram selecionados
function validarSelecoesEquipamento() {
    const equip = localStorage.getItem("equipamento");
    const carga = localStorage.getItem("equipamentoCarga");

    if (equip && carga && btnProximoEquip) {
        btnProximoEquip.disabled = false;
        console.log("Seleções completas. Botão Próximo liberado!");
    }
}

// Evento para Equipamento (Caminhão)
botoesEquip.forEach(btn => {
    btn.addEventListener("click", () => {
        botoesEquip.forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        
        localStorage.setItem("equipamento", btn.dataset.equipamento);
        document.getElementById("equipamentoSelecionado").textContent = btn.dataset.equipamento;
        
        validarSelecoesEquipamento();
    });
});

// Evento para Equipamento de Carga
botoesCarga.forEach(btn => {
    btn.addEventListener("click", () => {
        botoesCarga.forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        
        localStorage.setItem("equipamentoCarga", btn.dataset.carga);
        document.getElementById("cargaSelecionada").textContent = btn.dataset.carga;
        
        validarSelecoesEquipamento();
    });
});

// Ação de Clique no Botão Próximo
if (btnProximoEquip) {
    btnProximoEquip.addEventListener("click", function() {
        console.log("Navegando para horimetro.html...");
        window.location.href = "horimetro.html";
    });
}