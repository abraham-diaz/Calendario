document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');

  // Obtener eventos desde el backend
  const eventos = await fetch('/eventos').then(res => res.json());

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    selectable: true,
    events: eventos.map(e => ({
      title: e.titulo,
      start: e.fecha,
      id: e.id
    })),
    dateClick: async (info) => {
      const titulo = prompt('Nombre del evento:');
      if (titulo) {
        const newEvent = { titulo, fecha: info.dateStr, descripcion: '' };
        await fetch('/eventos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent)
        });
        calendar.addEvent({ title: titulo, start: info.dateStr });
      }
    }
  });

  calendar.render();
});
