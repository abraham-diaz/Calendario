// Orquestador principal

import { obtenerEventos } from './api.js';
import { transformarEventoLocal } from './utils.js';
import { crearCalendario } from './calendar.js';
import { initModals } from './modals.js';
import { cargarEventosTeams, iniciarSincronizacionDiaria } from './teams.js';

const inicializarApp = async () => {
  const calendarEl = document.getElementById('calendar');

  // Cargar eventos en paralelo
  const [eventosLocales, eventosTeams] = await Promise.all([
    obtenerEventos(),
    cargarEventosTeams()
  ]);

  // Transformar eventos locales
  const eventos = [
    ...eventosLocales.map(transformarEventoLocal),
    ...eventosTeams
  ];

  // Crear calendario
  const calendar = crearCalendario(calendarEl, eventos);
  calendar.render();

  // Inicializar modales
  initModals(calendar);

  // Iniciar sincronización diaria de eventos de Outlook
  iniciarSincronizacionDiaria(calendar);
};

document.addEventListener('DOMContentLoaded', inicializarApp);
