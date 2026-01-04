// Funciones de comunicación con el backend

export const obtenerEventos = async () => {
  const response = await fetch('/eventos');
  return response.json();
};

export const obtenerEventosTeams = async () => {
  try {
    const response = await fetch('/eventos-teams');
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error al cargar eventos de Teams:', error);
    return [];
  }
};

export const agregarEvento = async (evento) => {
  const response = await fetch('/eventos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evento)
  });
  return response.json();
};

export const actualizarEvento = async (id, evento) => {
  return fetch(`/eventos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evento)
  });
};

export const eliminarEvento = async (id) => {
  return fetch(`/eventos/${id}`, { method: 'DELETE' });
};
