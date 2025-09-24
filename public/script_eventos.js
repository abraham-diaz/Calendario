const lista = document.getElementById('listaEventos');

async function obtenerEventos() {
  const res = await fetch('/eventos');
  return res.json();
}

async function mostrarEventos() {
  const eventos = await obtenerEventos();
  lista.innerHTML = '';
  eventos.forEach(e => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${e.titulo}</strong> - ${e.fecha}<br>${e.descripcion || ''}`;
    lista.appendChild(li);
  });
}

mostrarEventos();
