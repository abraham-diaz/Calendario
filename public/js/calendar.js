// Configuración de FullCalendar

import { actualizarEvento } from './api.js';

export const crearCalendario = (elemento, eventos, callbacks = {}) => {
  const calendar = new FullCalendar.Calendar(elemento, {
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
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },

    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día'
    },

    events: eventos,

    dateClick: (info) => {
      if (callbacks.onDateClick) callbacks.onDateClick(info.dateStr);
    },

    eventClick: (info) => {
      if (callbacks.onEventClick) callbacks.onEventClick(info.event);
    },

    eventDrop: async (info) => {
      // Solo permitir drag-drop en eventos locales
      if (info.event.extendedProps.esTeams) {
        info.revert();
        return;
      }

      const updated = {
        titulo: info.event.title,
        fecha: info.event.startStr.split('T')[0],
        hora: info.event.startStr.includes('T') ? info.event.startStr.split('T')[1].slice(0, 5) : '',
        descripcion: info.event.extendedProps.descripcion || '',
        tipo: info.event.classNames[0] || 'evento-recordatorio'
      };

      await actualizarEvento(info.event.id, updated);
      info.event.setProp('title', `${updated.titulo}${updated.hora ? ' (' + updated.hora + ')' : ''}`);
      info.event.setExtendedProp('hora', updated.hora);
    }
  });

  return calendar;
};
