const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { RRule } = require('rrule');
require('dotenv').config();

const app = express();

// URL del calendario ICS de Teams/Outlook (desde variable de entorno)
const ICS_URL = process.env.ICS_URL;

// Función para parsear ICS a eventos JSON
function parseICS(icsData) {
  const eventos = [];
  // Unir líneas que continúan (empiezan con espacio)
  const lines = icsData.replace(/\r\n[ \t]/g, '').replace(/\r?\n[ \t]/g, '').split(/\r?\n/);

  let evento = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      evento = { rrule: null, dtstart: null };
    } else if (line === 'END:VEVENT' && evento) {
      if (evento.titulo && evento.fecha) {
        // Si tiene RRULE, expandir las ocurrencias
        if (evento.rrule && evento.dtstart) {
          const expandidos = expandirRecurrencia(evento);
          eventos.push(...expandidos);
        } else {
          // Evento único, agregar directamente
          delete evento.rrule;
          delete evento.dtstart;
          eventos.push(evento);
        }
      }
      evento = null;
    } else if (evento) {
      // Manejar líneas con parámetros como DTSTART;TZID=...:valor
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const keyPart = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 1);
      const key = keyPart.split(';')[0]; // Obtener solo la clave sin parámetros

      if (key === 'DTSTART') {
        const fecha = parseICSDate(value);
        if (fecha) {
          evento.fecha = fecha.date;
          evento.hora = fecha.time;
          evento.dtstart = fecha.dateObj;
        }
      } else if (key === 'DTEND') {
        const fecha = parseICSDate(value);
        if (fecha) {
          evento.fechaFin = fecha.date;
          evento.horaFin = fecha.time;
        }
      } else if (key === 'SUMMARY') {
        evento.titulo = value;
      } else if (key === 'DESCRIPTION') {
        evento.descripcion = value.replace(/\\n/g, '\n').replace(/\\,/g, ',');
      } else if (key === 'UID') {
        evento.id = 'teams-' + value;
      } else if (key === 'LOCATION') {
        evento.ubicacion = value;
      } else if (key === 'RRULE') {
        evento.rrule = value;
      }
    }
  }

  return eventos;
}

// Expandir eventos recurrentes usando RRULE
function expandirRecurrencia(evento) {
  const eventos = [];

  try {
    // Parsear la RRULE
    const rruleStr = `DTSTART:${formatDateForRRule(evento.dtstart)}\nRRULE:${evento.rrule}`;
    const rule = RRule.fromString(rruleStr);

    // Obtener ocurrencias para los próximos 6 meses
    const ahora = new Date();
    const hasta = new Date();
    hasta.setMonth(hasta.getMonth() + 6);

    const ocurrencias = rule.between(ahora, hasta, true);

    for (const fecha of ocurrencias) {
      const nuevoEvento = {
        ...evento,
        id: `${evento.id}-${fecha.getTime()}`,
        fecha: formatDate(fecha),
        fechaFin: formatDate(fecha)
      };
      delete nuevoEvento.rrule;
      delete nuevoEvento.dtstart;
      eventos.push(nuevoEvento);
    }
  } catch (error) {
    console.error('Error expandiendo recurrencia:', error);
    // Si falla, agregar el evento original
    delete evento.rrule;
    delete evento.dtstart;
    eventos.push(evento);
  }

  return eventos;
}

// Formatear fecha para RRule
function formatDateForRRule(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  const sec = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hour}${min}${sec}Z`;
}

// Formatear fecha a YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parsear fecha ICS (formato: 20231215T100000Z o 20231215)
function parseICSDate(value) {
  if (!value) return null;

  // Formato con tiempo: 20231215T100000Z
  const matchDateTime = value.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (matchDateTime) {
    const [, year, month, day, hour, min, sec] = matchDateTime;
    return {
      date: `${year}-${month}-${day}`,
      time: `${hour}:${min}`,
      dateObj: new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(min), parseInt(sec)))
    };
  }

  // Formato solo fecha: 20231215
  const matchDate = value.match(/(\d{4})(\d{2})(\d{2})/);
  if (matchDate) {
    const [, year, month, day] = matchDate;
    return {
      date: `${year}-${month}-${day}`,
      time: null,
      dateObj: new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)))
    };
  }

  return null;
}
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Base de datos
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Conectado a SQLite.');
  
});

// Crear tabla eventos
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT,
    descripcion TEXT
  )`);
});

// Endpoint para obtener eventos de Teams/Outlook
app.get('/eventos-teams', async (req, res) => {
  try {
    const response = await fetch(ICS_URL);
    if (!response.ok) {
      throw new Error(`Error al obtener ICS: ${response.status}`);
    }
    const icsData = await response.text();
    const eventos = parseICS(icsData);
    res.json(eventos);
  } catch (error) {
    console.error('Error al obtener eventos de Teams:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rutas API
app.get('/eventos', (req, res) => {
  db.all('SELECT * FROM eventos ORDER BY fecha DESC', [], (err, rows) => {
    if (err) {
      console.error('Error en consulta eventos:', err);
      return res.status(500).json(err);
    }
    res.json(rows);
  });
});

app.post('/eventos', (req, res) => {
  const { titulo, fecha, descripcion } = req.body;
  if (!titulo || !fecha) return res.status(400).json({ error: 'Titulo y fecha son obligatorios' });

  db.run(
    'INSERT INTO eventos (titulo, fecha, descripcion) VALUES (?, ?, ?)',
    [titulo, fecha, descripcion || ''],
    function(err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

// Actualizar evento
app.put('/eventos/:id', (req, res) => {
  const { titulo, fecha, descripcion } = req.body;
  const { id } = req.params;
  db.run(
    'UPDATE eventos SET titulo=?, fecha=?, descripcion=? WHERE id=?',
    [titulo, fecha, descripcion, id],
    function(err) {
      if(err) return res.status(500).json(err);
      res.json({ cambios: this.changes });
    }
  );
});

// Eliminar evento
app.delete('/eventos/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM eventos WHERE id=?', [id], function(err) {
    if(err) return res.status(500).json(err);
    res.json({ cambios: this.changes });
  });
});
