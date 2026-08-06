// ---------- Dados ----------
const sensoresIniciais = [
  { id: 1, nome: "Sensor Galpão A", tipo: "Temperatura", valor: 24.5, unidade: "°C", status: "normal" },
  { id: 2, nome: "Sensor Estufa 02", tipo: "Umidade", valor: 88.0, unidade: "%", status: "critico" },
  { id: 3, nome: "Sensor Compressor", tipo: "Pressão", valor: 6.2, unidade: "bar", status: "normal" },
  { id: 4, nome: "Sensor Câmara Fria", tipo: "Temperatura", valor: -2.1, unidade: "°C", status: "normal" },
  { id: 5, nome: "Sensor Almoxarifado", tipo: "Umidade", valor: 45.5, unidade: "%", status: "normal" },
  { id: 6, nome: "Sensor Caldeira", tipo: "Temperatura", valor: 98.4, unidade: "°C", status: "critico" }
].map((sensor) => ({ ...sensor, historico: [sensor.valor] }));

const icones = {
  Temperatura: "🌡️",
  Umidade: "💧",
  Pressão: "🧭"
};

// Faixas realistas por tipo de sensor
const limites = {
  Temperatura: { min: -30, max: 150 },
  Umidade: { min: 0, max: 100 },
  Pressão: { min: 0, max: 15 }
};

const HISTORICO_MAX = 5;

// ---------- Estado ----------
let online = true;
let intervalId = null;

// ---------- Elementos DOM ----------
const container = document.getElementById("gridSensores");
const filtroTipo = document.getElementById("filtroTipo");
const btnAtualizar = document.getElementById("btnAtualizar");
const ultimaAtualizacao = document.getElementById("ultimaAtualizacao");
const statusConexao = document.getElementById("statusConexao");
const statusTexto = document.getElementById("statusTexto");
const modalHistorico = document.getElementById("modalHistorico");
const modalTitulo = document.getElementById("modalTitulo");
const modalLista = document.getElementById("modalLista");
const btnFecharModal = document.getElementById("btnFecharModal");

// ---------- Utilidades ----------
function clamp(valor, min, max) {
  return Math.min(max, Math.max(min, valor));
}

// ---------- Renderização ----------
function renderizarDashboard(listaSensores) {
  container.innerHTML = "";
  container.classList.toggle("grid-pausada", !online);

  listaSensores.forEach((sensor) => {
    const card = document.createElement("div");
    card.className = "card";

    if (sensor.status === "critico") {
      card.classList.add("card-alerta");
    }
    if (!online) {
      card.classList.add("card-pausado");
    }

    card.innerHTML = `
      ${!online ? '<span class="card-pausado-badge">Pausado</span>' : ""}
      <div class="card-nome">${sensor.nome}</div>
      <div class="card-icone-valor">
        <span class="card-icone">${icones[sensor.tipo] || "📟"}</span>
        <span class="card-valor">${sensor.valor} ${sensor.unidade}</span>
      </div>
      <span class="card-tipo">${sensor.tipo}</span>
      <button type="button" data-historico="${sensor.id}">Histórico</button>
      <span class="card-status">${sensor.status}</span>
    `;

    container.appendChild(card);
  });
}

function atualizarHorario() {
  const agora = new Date();
  const horas = String(agora.getHours()).padStart(2, "0");
  const minutos = String(agora.getMinutes()).padStart(2, "0");
  const segundos = String(agora.getSeconds()).padStart(2, "0");
  ultimaAtualizacao.textContent = `${horas}:${minutos}:${segundos}`;
}

function aplicarFiltro() {
  const tipoSelecionado = filtroTipo.value;

  const listaFiltrada =
    tipoSelecionado === "Todos"
      ? sensoresIniciais
      : sensoresIniciais.filter((sensor) => sensor.tipo === tipoSelecionado);

  renderizarDashboard(listaFiltrada);
}

// ---------- Histórico ----------
function abrirHistorico(sensorId) {
  const sensor = sensoresIniciais.find((s) => s.id === Number(sensorId));
  if (!sensor) return;

  modalTitulo.textContent = `Histórico — ${sensor.nome}`;
  modalLista.innerHTML = "";

  const ultimosValores = sensor.historico.slice(-HISTORICO_MAX).reverse();
  ultimosValores.forEach((valor) => {
    const item = document.createElement("li");
    item.textContent = `${valor} ${sensor.unidade}`;
    modalLista.appendChild(item);
  });

  modalHistorico.hidden = false;
}

function fecharHistorico() {
  modalHistorico.hidden = true;
}

// ---------- Conexão online/offline ----------
function iniciarAtualizacoes() {
  if (intervalId !== null) return;
  intervalId = setInterval(atualizarValoresSensores, 3000);
}

function pararAtualizacoes() {
  clearInterval(intervalId);
  intervalId = null;
}

function alternarConexao() {
  online = !online;

  statusConexao.classList.toggle("offline", !online);
  statusConexao.setAttribute("aria-pressed", String(online));
  statusTexto.textContent = online ? "Online" : "Offline";
  btnAtualizar.disabled = !online;

  if (online) {
    iniciarAtualizacoes();
  } else {
    pararAtualizacoes();
  }

  aplicarFiltro();
}

// ---------- Atualização de valores ----------
function atualizarValoresSensores() {
  if (!online) return;

  sensoresIniciais.forEach((sensor) => {
    const variacao = (Math.random() - 0.5) * 2;
    const { min, max } = limites[sensor.tipo] || { min: -Infinity, max: Infinity };
    sensor.valor = clamp(Number((sensor.valor + variacao).toFixed(1)), min, max);

    sensor.historico.push(sensor.valor);
    if (sensor.historico.length > HISTORICO_MAX) {
      sensor.historico.shift();
    }

    if (sensor.tipo === "Temperatura") {
      sensor.status = sensor.valor > 35 ? "critico" : "normal";
    } else if (sensor.tipo === "Umidade") {
      sensor.status = sensor.valor > 80 ? "critico" : "normal";
    }
  });

  aplicarFiltro();
  atualizarHorario();
}

// ---------- Eventos ----------
filtroTipo.addEventListener("change", aplicarFiltro);
btnAtualizar.addEventListener("click", atualizarValoresSensores);
statusConexao.addEventListener("click", alternarConexao);
btnFecharModal.addEventListener("click", fecharHistorico);
modalHistorico.addEventListener("click", (evento) => {
  if (evento.target === modalHistorico) fecharHistorico();
});
container.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-historico]");
  if (botao) abrirHistorico(botao.dataset.historico);
});

// ---------- Inicialização ----------
renderizarDashboard(sensoresIniciais);
atualizarHorario();
iniciarAtualizacoes();
