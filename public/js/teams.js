// Sincronización con Outlook/Teams

import { obtenerEventosTeams } from './api.js';
import { transformarEventoTeams } from './utils.js';

export const cargarEventosTeams = async () => {
  const eventos = await obtenerEventosTeams();
  return eventos.map(transformarEventoTeams);
};

export const actualizarEventosTeams = async (calendar) => {
  try {
    const nuevosEventos = await obtenerEventosTeams();

    // Eliminar eventos de Teams existentes
    calendar.getEvents()
      .filter(e => e.extendedProps.esTeams)
      .forEach(e => e.remove());

    // Agregar los nuevos eventos
    nuevosEventos.forEach(evento => {
      calendar.addEvent(transformarEventoTeams(evento));
    });

    console.log('Eventos de Outlook actualizados:', new Date().toLocaleString());
  } catch (error) {
    console.error('Error al actualizar eventos de Outlook:', error);
  }
};

export const iniciarSincronizacionDiaria = (calendar) => {
  // Actualizar cada 24 horas (86400000 ms)
  setInterval(() => actualizarEventosTeams(calendar), 24 * 60 * 60 * 1000);
};
