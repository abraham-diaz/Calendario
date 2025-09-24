document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');

  // Modal
  const modal = document.getElementById('modal');
  const cerrarModal = document.getElementById('cerrarModal');
  const modalTitulo = document.getElementById('modalTitulo');
  const modalFecha = document.getElementById('modalFecha');
  const modalDescripcion = document.getElementById('modalDescripcion');
  const guardarEventoBtn = document.getElementById('guardarEvento');
  const eliminarEventoBtn = document.getElementById('eliminarEvento');

  let eventoSeleccionado = null;

  // API
  const obtenerEventos = async () => (await fetch('/eventos')).json();
  const agregarEvento = async (evento) =>
    fetch('/eventos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(evento) });
  const actualizarEvento = async (id, evento) =>
    fetch(`/eventos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(evento) });
  const eliminarEvento = async (id) =>
    fetch(`/eventos/${id}`, { method: 'DELETE' });

  // Inicializar calendario
  const eventos = await obtenerEventos();
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    selectable: true,
    editable: true,
    events: eventos.map(e => ({
      title: e.titulo,
      start: e.fecha,
      id: e.id,
      descripcion: e.descripcion
    })),

    // Clic en día: añadir evento
    dateClick: async (info) => {
      const titulo = prompt('Nombre del evento:');
      if (titulo) {
        const newEvent = { titulo, fecha: info.dateStr, descripcion: '' };
        await agregarEvento(newEvent);
        calendar.addEvent({ title: titulo, start: info.dateStr });
      }
    },

    // Clic en evento: abrir modal
    eventClick: (info) => {
      eventoSeleccionado = info.event;
      modalTitulo.textContent = eventoSeleccionado.title;
      modalFecha.textContent = eventoSeleccionado.startStr;
      modalDescripcion.value = eventoSeleccionado.extendedProps.descripcion || '';
      modal.style.display = 'block';
    },

    // Arrastrar evento a otra fecha
    eventDrop: async (info) => {
      const updated = {
        titulo: info.event.title,
        fecha: info.event.startStr,
        descripcion: info.event.extendedProps.descripcion || ''
      };
      await actualizarEvento(info.event.id, updated);
      alert(`Evento "${updated.titulo}" movido a ${updated.fecha}`);
    }
  });

  calendar.render();

  // Modal: cerrar
  cerrarModal.onclick = () => (modal.style.display = 'none');
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  // Modal: guardar cambios
  guardarEventoBtn.onclick = async () => {
    if (!eventoSeleccionado) return;
    const updated = {
      titulo: modalTitulo.textContent,
      fecha: eventoSeleccionado.startStr,
      descripcion: modalDescripcion.value
    };
    await actualizarEvento(eventoSeleccionado.id, updated);
    eventoSeleccionado.setProp('title', updated.titulo);
    eventoSeleccionado.setExtendedProp('descripcion', updated.descripcion);
    modal.style.display = 'none';
  };

  // Modal: eliminar evento
  eliminarEventoBtn.onclick = async () => {
    if (!eventoSeleccionado) return;
    await eliminarEvento(eventoSeleccionado.id);
    eventoSeleccionado.remove();
    modal.style.display = 'none';
  };
});
