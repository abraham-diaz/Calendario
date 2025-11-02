document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');

  // MODAL EDITAR
  const modal = document.getElementById('modal');
  const cerrarModal = document.getElementById('cerrarModal');
  const modalTitulo = document.getElementById('modalTitulo');
  const modalFecha = document.getElementById('modalFecha');
  const modalHora = document.getElementById('modalHora');
  const modalDescripcion = document.getElementById('modalDescripcion');
  const guardarEventoBtn = document.getElementById('guardarEvento');
  const eliminarEventoBtn = document.getElementById('eliminarEvento');

  // MODAL NUEVO EVENTO
  const nuevoModal = document.getElementById('nuevoModal');
  const cerrarNuevoModal = document.getElementById('cerrarNuevoModal');
  const guardarNuevoEvento = document.getElementById('guardarNuevoEvento');
  const cancelarNuevoEvento = document.getElementById('cancelarNuevoEvento');
  const nuevoTitulo = document.getElementById('nuevoTitulo');
  const nuevoHora = document.getElementById('nuevoHora');
  const nuevoTipo = document.getElementById('nuevoTipo');
  const nuevoDescripcion = document.getElementById('nuevoDescripcion');

  // MODAL LISTA DE EVENTOS
  const listaModal = document.getElementById('listaModal');
  const cerrarListaModal = document.getElementById('cerrarListaModal');
  const verTodosEventosBtn = document.getElementById('verTodosEventos');
  const listaEventos = document.getElementById('listaEventos');

  let eventoSeleccionado = null;

  // FUNCIONES BACKEND
  const obtenerEventos = async () => (await fetch('/eventos')).json();
  const agregarEvento = async (evento) =>
    fetch('/eventos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(evento) });
  const actualizarEvento = async (id, evento) =>
    fetch(`/eventos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(evento) });
  const eliminarEvento = async (id) =>
    fetch(`/eventos/${id}`, { method: 'DELETE' });

  // CARGAR EVENTOS EXISTENTES
  const eventos = await obtenerEventos();

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    firstDay: 1,
    selectable: true,
    editable: true,
    dayMaxEvents: true,
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    height: 'auto',
    contentHeight: 'auto',
    fixedWeekCount: false,

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },

    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista'
    },

    events: eventos.map(e => ({
      title: `${e.titulo}${e.hora ? ' (' + e.hora + ')' : ''}`,
      start: e.hora ? `${e.fecha}T${e.hora}` : e.fecha,
      id: e.id,
      descripcion: e.descripcion,
      hora: e.hora,
      className: e.tipo || 'evento-recordatorio'
    })),

    // CLICK EN DÍA -> abrir modal nuevo evento
    dateClick: (info) => {
      nuevoModal.dataset.fecha = info.dateStr;
      nuevoTitulo.value = '';
      nuevoHora.value = '';
      nuevoTipo.value = 'recordatorio';
      nuevoDescripcion.value = '';
      nuevoModal.style.display = 'block';
    },

    // CLICK EN EVENTO -> abrir modal editar
    eventClick: (info) => {
      eventoSeleccionado = info.event;
      modalTitulo.textContent = eventoSeleccionado.title;
      modalFecha.textContent = eventoSeleccionado.startStr.split('T')[0];
      modalHora.value = eventoSeleccionado.extendedProps.hora || '';
      modalDescripcion.value = eventoSeleccionado.extendedProps.descripcion || '';
      modal.style.display = 'block';
    },

    // DRAG & DROP -> actualizar backend
    eventDrop: async (info) => {
      const updated = {
        titulo: info.event.title,
        fecha: info.event.startStr.split('T')[0],
        hora: info.event.startStr.includes('T') ? info.event.startStr.split('T')[1].slice(0,5) : '',
        descripcion: info.event.extendedProps.descripcion || '',
        tipo: info.event.classNames[0] || 'evento-recordatorio'
      };
      await actualizarEvento(info.event.id, updated);
      info.event.setProp('title', `${updated.titulo}${updated.hora ? ' (' + updated.hora + ')' : ''}`);
      info.event.setExtendedProp('hora', updated.hora);
    }
  });

  calendar.render();

  // CERRAR MODALES
  cerrarModal.onclick = () => modal.style.display = 'none';
  cerrarNuevoModal.onclick = () => nuevoModal.style.display = 'none';
  cerrarListaModal.onclick = () => listaModal.style.display = 'none';
  window.onclick = (e) => {
    if (e.target == modal) modal.style.display = 'none';
    if (e.target == nuevoModal) nuevoModal.style.display = 'none';
    if (e.target == listaModal) listaModal.style.display = 'none';
  };

  // GUARDAR CAMBIOS MODAL EDITAR
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

  // ELIMINAR EVENTO
  eliminarEventoBtn.onclick = async () => {
    if (!eventoSeleccionado) return;
    await eliminarEvento(eventoSeleccionado.id);
    eventoSeleccionado.remove();
    modal.style.display = 'none';
  };

  // GUARDAR NUEVO EVENTO
  guardarNuevoEvento.onclick = async () => {
    const titulo = nuevoTitulo.value.trim();
    if (!titulo) return alert('El título es obligatorio');
    const fecha = nuevoModal.dataset.fecha;
    const hora = nuevoHora.value;
    const tipo = nuevoTipo.value;
    const descripcion = nuevoDescripcion.value;

    const newEvent = { titulo, fecha, hora, descripcion, tipo };
    const res = await agregarEvento(newEvent);
    const data = await res.json();

    calendar.addEvent({
      title: `${titulo}${hora ? ' (' + hora + ')' : ''}`,
      start: hora ? `${fecha}T${hora}` : fecha,
      className: tipo === 'reunion' ? 'evento-reunion' : tipo === 'tarea' ? 'evento-tarea' : 'evento-recordatorio',
      id: data.id
    });

    nuevoModal.style.display = 'none';
  };

  // CANCELAR NUEVO EVENTO
  cancelarNuevoEvento.onclick = () => {
    nuevoModal.style.display = 'none';
  };

  // VER TODOS LOS EVENTOS
  verTodosEventosBtn.onclick = async () => {
    const todosEventos = await obtenerEventos();

    if (todosEventos.length === 0) {
      listaEventos.innerHTML = '<p class="sin-eventos">No hay eventos registrados</p>';
    } else {
      // Ordenar eventos por fecha
      todosEventos.sort((a, b) => {
        const fechaA = new Date(a.fecha + (a.hora ? 'T' + a.hora : ''));
        const fechaB = new Date(b.fecha + (b.hora ? 'T' + b.hora : ''));
        return fechaA - fechaB;
      });

      let html = '<div class="eventos-lista">';
      todosEventos.forEach(evento => {
        const tipoClass = evento.tipo || 'recordatorio';
        const fecha = new Date(evento.fecha + 'T00:00:00');
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        html += `
          <div class="evento-item ${tipoClass}">
            <div class="evento-header">
              <h3>${evento.titulo}</h3>
              <span class="evento-tipo">${tipoClass}</span>
            </div>
            <div class="evento-detalles">
              <p class="evento-fecha">📅 ${fechaFormateada}</p>
              ${evento.hora ? `<p class="evento-hora">🕐 ${evento.hora}</p>` : ''}
              ${evento.descripcion ? `<p class="evento-descripcion">${evento.descripcion}</p>` : ''}
            </div>
          </div>
        `;
      });
      html += '</div>';
      listaEventos.innerHTML = html;
    }

    listaModal.style.display = 'block';
  };
});
