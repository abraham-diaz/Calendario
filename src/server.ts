import express from 'express';
import path from 'path';
import 'dotenv/config';
import { parseICS } from './ics-parser';
import { getEventos, createEvento, updateEvento, deleteEvento } from './database';

const app = express();
const port = 3000;

const ICS_URL = process.env.ICS_URL;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Eventos de Teams/Outlook
app.get('/eventos-teams', async (_req, res) => {
  try {
    const response = await fetch(ICS_URL!);
    if (!response.ok) {
      throw new Error(`Error al obtener ICS: ${response.status}`);
    }
    const icsData = await response.text();
    const eventos = parseICS(icsData);
    res.json(eventos);
  } catch (error) {
    console.error('Error al obtener eventos de Teams:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// CRUD eventos locales
app.get('/eventos', async (_req, res) => {
  try {
    const eventos = await getEventos();
    res.json(eventos);
  } catch (err) {
    console.error('Error en consulta eventos:', err);
    res.status(500).json(err);
  }
});

app.post('/eventos', async (req, res) => {
  const { titulo, fecha, descripcion } = req.body;
  if (!titulo || !fecha) {
    res.status(400).json({ error: 'Titulo y fecha son obligatorios' });
    return;
  }

  try {
    const id = await createEvento({ titulo, fecha, descripcion });
    res.json({ id });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put('/eventos/:id', async (req, res) => {
  const { titulo, fecha, descripcion } = req.body;
  const { id } = req.params;

  try {
    const cambios = await updateEvento(id, { titulo, fecha, descripcion });
    res.json({ cambios });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete('/eventos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const cambios = await deleteEvento(id);
    res.json({ cambios });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Ruta principal
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
