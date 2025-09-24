// ==========================
// 1️⃣ Importar módulos
// ==========================
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// ==========================
// 2️⃣ Middleware
// ==========================
app.use(express.json()); // Para recibir JSON
app.use(express.static(path.join(__dirname, 'public'))); // Servir frontend

// ==========================
// 3️⃣ Base de datos SQLite
// ==========================
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Conectado a SQLite.');
});

// Crear tabla eventos si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      fecha TEXT NOT NULL,
      descripcion TEXT
    )
  `);
});

// ==========================
// 4️⃣ Rutas API
// ==========================

// Obtener todos los eventos
app.get('/eventos', (req, res) => {
  db.all('SELECT * FROM eventos', [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    res.json(rows);
  });
});

// Agregar un evento
app.post('/eventos', (req, res) => {
  const { titulo, fecha, descripcion } = req.body;

  // Validar datos básicos
  if (!titulo || !fecha) {
    return res.status(400).json({ error: 'Titulo y fecha son obligatorios' });
  }

  db.run(
    'INSERT INTO eventos (titulo, fecha, descripcion) VALUES (?, ?, ?)',
    [titulo, fecha, descripcion || ''],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }
      res.json({ id: this.lastID });
    }
  );
});

// ==========================
// 5️⃣ Ruta principal
// ==========================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================
// 6️⃣ Iniciar servidor
// ==========================
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
