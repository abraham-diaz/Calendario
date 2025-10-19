document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');

  const modal = document.getElementById('modal');
  const cerrarModal = document.getElementById('cerrarModal');
  const modalTitulo = document.getElementById('modalTitulo');
  const modalFecha = document.getElementById('modalFecha');
  const modalHora = document.getElementById('modalHora');
  const modalDescripcion = document.getElementById('modalDescripcion');
  const guardarEventoBtn = document.getElementById('guardarEvento');
  const eliminarEventoBtn = document.getElementById('eliminarEvento');

  let eventoSeleccionado = null;

  const obtenerEventos = async () => (await fetch('/eventos')).json();
  const agregarEvento = async (evento) =>
    fetch('/eventos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(evento) });
  const actualizarEvento = async (id, evento) =>
    fetch(`/eventos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(evento) });
  const eliminarEvento = async (id) =>
    fetch(`/eventos/${id}`, { method: 'DELETE' });

  const eventos = await obtenerEventos();

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    firstDay: 1, // lunes
    selectable: true,
    editable: true,
    events: eventos.map(e => ({
      title: `${e.titulo}${e.hora ? ' (' + e.hora + ')' : ''}`,
      start: e.hora ? `${e.fecha}T${e.hora}` : e.fecha,
      id: e.id,
      descripcion: e.descripcion,
      hora: e.hora
    })),

    dateClick: async (info) => {
      const titulo = prompt('Nombre del evento:');
      const hora = prompt('Hora (HH:MM)') || '';
      if (titulo) {
        const newEvent = { titulo, fecha: info.dateStr, hora, descripcion: '' };
        await agregarEvento(newEvent);
        calendar.addEvent({
          title: `${titulo}${hora ? ' (' + hora + ')' : ''}`,
          start: hora ? `${info.dateStr}T${hora}` : info.dateStr
        });
      }
    },

    eventClick: (info) => {
      eventoSeleccionado = info.event;
      modalTitulo.textContent = eventoSeleccionado.title;
      modalFecha.textContent = eventoSeleccionado.startStr.split('T')[0];
      modalHora.value = eventoSeleccionado.extendedProps.hora || '';
      modalDescripcion.value = eventoSeleccionado.extendedProps.descripcion || '';
      modal.style.display = 'block';
    },

    eventDrop: async (info) => {
      const updated = {
        titulo: info.event.title,
        fecha: info.event.startStr.split('T')[0],
        hora: info.event.startStr.includes('T') ? info.event.startStr.split('T')[1].slice(0,5) : '',
        descripcion: info.event.extendedProps.descripcion || ''
      };
      await actualizarEvento(info.event.id, updated);
      info.event.setProp('title', `${updated.titulo}${updated.hora ? ' (' + updated.hora + ')' : ''}`);
      info.event.setExtendedProp('hora', updated.hora);
      alert(`Evento "${updated.titulo}" movido a ${updated.fecha}`);
    }
  });

  calendar.render();

  cerrarModal.onclick = () => (modal.style.display = 'none');
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  guardarEventoBtn.onclick = async () => {
    if (!eventoSeleccionado) return;
    const updated = {
      titulo: modalTitulo.textContent,
      fecha: eventoSeleccionado.startStr.split('T')[0],
      hora: modalHora.value,
      descripcion: modalDescripcion.value
    };
    await actualizarEvento(eventoSeleccionado.id, updated);
    eventoSeleccionado.setProp('title', `${updated.titulo}${updated.hora ? ' (' + updated.hora + ')' : ''}`);
    eventoSeleccionado.setExtendedProp('descripcion', updated.descripcion);
    eventoSeleccionado.setExtendedProp('hora', updated.hora);
    modal.style.display = 'none';
  };

  eliminarEventoBtn.onclick = async () => {
    if (!eventoSeleccionado) return;
    await eliminarEvento(eventoSeleccionado.id);
    eventoSeleccionado.remove();
    modal.style.display = 'none';
  };
});
