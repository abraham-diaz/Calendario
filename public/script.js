// ==========================
// 1️⃣ Selección de elementos del DOM
// ==========================
const form = document.getElementById('eventoForm');
const lista = document.getElementById('listaEventos');

// ==========================
// 2️⃣ Funciones de UI
// ==========================
function crearElementoEvento(evento) {
  const li = document.createElement('li');
  li.innerHTML = `
    <strong>${evento.titulo}</strong> - ${evento.fecha}<br>
    ${evento.descripcion || ''}
  `;
  return li;
}

function mostrarEventos(eventos) {
  lista.innerHTML = '';
  eventos.forEach(evento => lista.appendChild(crearElementoEvento(evento)));
}

// ==========================
// 3️⃣ Funciones de API
// ==========================
async function obtenerEventos() {
  const res = await fetch('/eventos');
  return res.json();
}

async function agregarEvento(evento) {
  await fetch('/eventos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evento)
  });
}

// ==========================
// 4️⃣ Manejo del formulario
// ==========================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const evento = {
    titulo: form.titulo.value,
    fecha: form.fecha.value,
    descripcion: form.descripcion.value
  };

  await agregarEvento(evento);
  form.reset();

  const eventos = await obtenerEventos();
  mostrarEventos(eventos);
});

// ==========================
// 5️⃣ Inicialización
// ==========================
(async function init() {
  const eventos = await obtenerEventos();
  mostrarEventos(eventos);
})();
