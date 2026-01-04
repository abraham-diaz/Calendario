// Funciones de utilidad y transformación de datos

export const transformarEventoLocal = (evento) => ({
  title: `${evento.titulo}${evento.hora ? ' (' + evento.hora + ')' : ''}`,
  start: evento.hora ? `${evento.fecha}T${evento.hora}` : evento.fecha,
  id: evento.id,
  extendedProps: {
    descripcion: evento.descripcion,
    hora: evento.hora,
    esTeams: false
  },
  className: evento.tipo ? `evento-${evento.tipo}` : 'evento-recordatorio'
});

export const transformarEventoTeams = (evento) => ({
  title: `${evento.titulo}${evento.hora ? ' (' + evento.hora + ')' : ''}`,
  start: evento.hora ? `${evento.fecha}T${evento.hora}` : evento.fecha,
  end: evento.horaFin ? `${evento.fechaFin || evento.fecha}T${evento.horaFin}` : null,
  id: evento.id,
  extendedProps: {
    descripcion: evento.descripcion,
    hora: evento.hora,
    ubicacion: evento.ubicacion,
    esTeams: true
  },
  className: 'evento-teams',
  editable: false
});

export const formatearFecha = (fecha) => {
  const date = new Date(fecha + 'T00:00:00');
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const generarHTMLListaEventos = (eventos) => {
  if (eventos.length === 0) {
    return '<p class="sin-eventos">No hay eventos registrados</p>';
  }

  // Ordenar eventos por fecha
  const eventosOrdenados = [...eventos].sort((a, b) => {
    const fechaA = new Date(a.fecha + (a.hora ? 'T' + a.hora : ''));
    const fechaB = new Date(b.fecha + (b.hora ? 'T' + b.hora : ''));
    return fechaA - fechaB;
  });

  let html = '<div class="eventos-lista">';

  eventosOrdenados.forEach(evento => {
    const tipoClass = evento.tipo || 'recordatorio';
    const fechaFormateada = formatearFecha(evento.fecha);

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
  return html;
};
