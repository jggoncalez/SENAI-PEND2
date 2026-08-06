// Massa de dados inicial
const sensoresIniciais = [
  { id: 1, nome: "Sensor Galpão A", tipo: "Temperatura", valor: 24.5, unidade: "°C", status: "normal" },
  { id: 2, nome: "Sensor Estufa 02", tipo: "Umidade", valor: 88.0, unidade: "%", status: "critico" },
  { id: 3, nome: "Sensor Compressor", tipo: "Pressão", valor: 6.2, unidade: "bar", status: "normal" },
  { id: 4, nome: "Sensor Câmara Fria", tipo: "Temperatura", valor: -2.1, unidade: "°C", status: "normal" },
  { id: 5, nome: "Sensor Almoxarifado", tipo: "Umidade", valor: 45.5, unidade: "%", status: "normal" },
  { id: 6, nome: "Sensor Caldeira", tipo: "Temperatura", valor: 98.4, unidade: "°C", status: "critico" }
];

const icones = {
  Temperatura: "🌡️",
  Umidade: "💧",
  Pressão: "🧭"
};

const container = document.getElementById("gridSensores");
const filtroTipo = document.getElementById("filtroTipo");
const btnAtualizar = document.getElementById("btnAtualizar");
const ultimaAtualizacao = document.getElementById("ultimaAtualizacao");

function renderizarDashboard(listaSensores) {
  container.innerHTML = "";

  listaSensores.forEach((sensor) => {
    const card = document.createElement("div");
    card.className = "card";

    if (sensor.status === "critico") {
      card.classList.add("card-alerta");
    }

    card.innerHTML = `
      <div class="card-nome">${sensor.nome}</div>
      <div class="card-icone-valor">
        <span class="card-icone">${icones[sensor.tipo] || "📟"}</span>
        <span class="card-valor">${sensor.valor} ${sensor.unidade}</span>
      </div>
      <span class="card-tipo">${sensor.tipo}</span>
      <button type="button">Histórico</button>
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
    tipoSelecionado === "todos"
      ? sensoresIniciais
      : sensoresIniciais.filter((sensor) => sensor.tipo === tipoSelecionado);

  renderizarDashboard(listaFiltrada);
}

function atualizarValoresSensores() {
  sensoresIniciais.forEach((sensor) => {
    const variacao = (Math.random() - 0.5) * 2;
    sensor.valor = Number((sensor.valor + variacao).toFixed(1));

    if (sensor.tipo === "Temperatura") {
      sensor.status = sensor.valor > 35 ? "critico" : "normal";
    } else if (sensor.tipo === "Umidade") {
      sensor.status = sensor.valor > 80 ? "critico" : "normal";
    }
  });

  aplicarFiltro();
  atualizarHorario();
}

filtroTipo.addEventListener("change", aplicarFiltro);
btnAtualizar.addEventListener("click", atualizarValoresSensores);

setInterval(atualizarValoresSensores, 3000);

renderizarDashboard(sensoresIniciais);
atualizarHorario();
