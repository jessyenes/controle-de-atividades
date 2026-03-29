# 📊 Controle de Atividades Operacionais

Aplicação web desenvolvida para registro, monitoramento e análise de atividades operacionais em tempo real, com foco em produtividade e geração de insights.

---

## 🎯 Objetivo do Projeto

Este projeto foi desenvolvido com o objetivo de:

* Simular um sistema real de controle operacional
* Aplicar conceitos de **análise de dados na prática**
* Estruturar dados para futura integração com dashboards (ex: Power BI)
* Demonstrar habilidades em **JavaScript, lógica e manipulação de dados**

---

## 🚀 Principais Funcionalidades

* 🔐 Autenticação de usuário (login)

* ⏱️ Cronômetro para controle de tempo de atividades

* 🧭 Registro completo do fluxo operacional:

  * Turno
  * Origem
  * Destino
  * Material
  * Equipamentos
  * Horímetro

* 📋 Histórico detalhado com:

  * Data
  * Hora de início e fim
  * Duração
  * Tipo de atividade

* 🔎 Filtros avançados:

  * Por atividade
  * Por data
  * Por período (dia, semana, mês)
  * Por horário

* 📊 Visualização de dados com gráficos dinâmicos (Chart.js)

---

## 🧠 Diferenciais Técnicos

* Estruturação de dados orientada à análise
* Persistência com `localStorage`
* Lógica de filtragem combinada (multi-filtro)
* Manipulação de datas e tempo em JavaScript
* Interface com padrão moderno (estilo SaaS)
* Organização do código por contexto de página

---

## 📊 Estrutura dos Dados

Exemplo de registro armazenado:

```json
{
  "usuario": "jessica",
  "turno": "TURNO A",
  "origem": "Origem A",
  "destino": "Destino B",
  "material": "Minério",
  "equipamento": "CB01",
  "carga": "EH02",
  "horimetro": "1234",
  "atividade": "Deslocamento",
  "data": "10/03/2026",
  "inicio": "08:00:00",
  "fim": "09:00:00",
  "duracao": "01:00:00"
}
```

👉 Esse modelo foi pensado para fácil integração com ferramentas de BI.

---

## 🧱 Arquitetura do Projeto

```bash
📁 projeto
 ┣ 📁 pages        # Fluxo do sistema (turno → registro → histórico)
 ┣ 📁 js           # Lógica principal (eventos, filtros, cronômetro)
 ┣ 📁 css          # Estilização (tema dark + UX moderna)
 ┗ index.html      # Login
```

---

## 🔄 Fluxo do Sistema

```text
Login → Menu → Turno → Origem/Destino → Material → Equipamentos → Horímetro → Registro → Histórico
```

---

## 📈 Aplicação em Dados

Este projeto permite:

* Análise de tempo por atividade
* Identificação de gargalos operacionais
* Agrupamento por período
* Base estruturada para dashboards

👉 Ideal para evolução para:

* Power BI
* Python (Pandas)
* Machine Learning

---

## 🛠️ Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript (ES6+)
* Chart.js
* Firebase (em evolução)

---

## 🔮 Próximos Passos

* Integração com banco de dados (Firebase / API)
* Criação de dashboard no Power BI
* Automação de relatórios
* Versão mobile (PWA)

---

## 👩‍💻 Sobre Mim

Jessica Enes
Analista de Programação Jr | Futura Cientista de Dados

* Python | SQL | Power BI | IA
* Foco em dados, automação e análise

---

## ⭐ Destaque

Este projeto demonstra minha capacidade de:

✔ Transformar um problema real em solução digital
✔ Estruturar dados para análise
✔ Desenvolver lógica de negócio
✔ Criar interfaces funcionais e modernas

---

💡 *Projeto desenvolvido como parte da minha transição e evolução para a área de Dados.*
