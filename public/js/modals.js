// Gestión de modales

import { actualizarEvento, eliminarEvento, agregarEvento, obtenerEventos } from './api.js';
import { generarHTMLListaEventos } from './utils.js';

// Referencias al DOM
let modal, nuevoModal, listaModal;
let modalTitulo, modalFecha, modalHora, modalDescripcion;
let guardarEventoBtn, eliminarEventoBtn;
let nuevoTitulo, nuevoHora, nuevoTipo, nuevoDescripcion;
let guardarNuevoEvento, cancelarNuevoEvento;
let listaEventos;
let eventoSeleccionado = null;
let calendarInstance = null;

export const initModals = (calendar) => {
  calendarInstance = calendar;

  // Modal editar
  modal = document.getElementById('modal');
  modalTitulo = document.getElementById('modalTitulo');
  modalFecha = document.getElementById('modalFecha');
  modalHora = document.getElementById('modalHora');
  modalDescripcion = document.getElementById('modalDescripcion');
  guardarEventoBtn = document.getElementById('guardarEvento');
  eliminarEventoBtn = document.getElementById('eliminarEvento');

  // Modal nuevo evento
  nuevoModal = document.getElementById('nuevoModal');
  nuevoTitulo = document.getElementById('nuevoTitulo');
  nuevoHora = document.getElementById('nuevoHora');
  nuevoTipo = document.getElementById('nuevoTipo');
  nuevoDescripcion = document.getElementById('nuevoDescripcion');
  guardarNuevoEvento = document.getElementById('guardarNuevoEvento');
  cancelarNuevoEvento = document.getElementById('cancelarNuevoEvento');

  // Modal lista
  listaModal = document.getElementById('listaModal');
  listaEventos = document.getElementById('listaEventos');

  // Configurar eventos
  configurarCierreModales();
  configurarModalEditar();
  configurarModalNuevo();
  configurarModalLista();
};

const configurarCierreModales = () => {
  document.getElementById('cerrarModal').onclick = () => modal.style.display = 'none';
  document.getElementById('cerrarNuevoModal').onclick = () => nuevoModal.style.display = 'none';
  document.getElementById('cerrarListaModal').onclick = () => listaModal.style.display = 'none';

  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
    if (e.target === nuevoModal) nuevoModal.style.display = 'none';
    if (e.target === listaModal) listaModal.style.display = 'none';
  };
};

const configurarModalEditar = () => {
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
};

const configurarModalNuevo = () => {
  guardarNuevoEvento.onclick = async () => {
    const titulo = nuevoTitulo.value.trim();
    if (!titulo) return alert('El título es obligatorio');

    const fecha = nuevoModal.dataset.fecha;
    const hora = nuevoHora.value;
    const tipo = nuevoTipo.value;
    const descripcion = nuevoDescripcion.value;

    const newEvent = { titulo, fecha, hora, descripcion, tipo };
    const data = await agregarEvento(newEvent);

    calendarInstance.addEvent({
      title: `${titulo}${hora ? ' (' + hora + ')' : ''}`,
      start: hora ? `${fecha}T${hora}` : fecha,
      className: `evento-${tipo}`,
      id: data.id,
      extendedProps: {
        descripcion,
        hora,
        esTeams: false
      }
    });

    nuevoModal.style.display = 'none';
  };

  cancelarNuevoEvento.onclick = () => {
    nuevoModal.style.display = 'none';
  };
};

const configurarModalLista = () => {
  document.getElementById('verTodosEventos').onclick = async () => {
    const todosEventos = await obtenerEventos();
    listaEventos.innerHTML = generarHTMLListaEventos(todosEventos);

    // Añadir listeners a los botones de eliminar
    listaEventos.querySelectorAll('.evento-eliminar').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (confirm('¿Eliminar este evento?')) {
          await eliminarEvento(id);
          btn.closest('.evento-item').remove();

          // Eliminar del calendario si existe
          const eventoCalendario = calendarInstance.getEventById(id);
          if (eventoCalendario) eventoCalendario.remove();
        }
      };
    });

    listaModal.style.display = 'flex';
  };
};

export const abrirModalEditar = (evento) => {
  eventoSeleccionado = evento;
  const esTeams = evento.extendedProps.esTeams;

  modalTitulo.textContent = evento.title;
  modalFecha.textContent = evento.startStr.split('T')[0];
  modalHora.value = evento.extendedProps.hora || '';
  modalDescripcion.value = evento.extendedProps.descripcion || '';

  if (esTeams) {
    modalHora.disabled = true;
    modalDescripcion.disabled = true;
    guardarEventoBtn.style.display = 'none';
    eliminarEventoBtn.style.display = 'none';
    if (evento.extendedProps.ubicacion) {
      modalDescripcion.value = `📍 ${evento.extendedProps.ubicacion}\n\n${modalDescripcion.value}`;
    }
  } else {
    modalHora.disabled = false;
    modalDescripcion.disabled = false;
    guardarEventoBtn.style.display = '';
    eliminarEventoBtn.style.display = '';
  }

  modal.style.display = 'flex';
};

export const abrirModalNuevo = (fecha) => {
  nuevoModal.dataset.fecha = fecha;
  nuevoTitulo.value = '';
  nuevoHora.value = '';
  nuevoTipo.value = 'recordatorio';
  nuevoDescripcion.value = '';
  nuevoModal.style.display = 'flex';
};
