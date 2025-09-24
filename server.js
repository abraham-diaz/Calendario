const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(express.json());

// Servir la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Base de datos
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Conectado a SQLite.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    fecha TEXT NOT NULL,
    descripcion TEXT
  )`);
});

// Rutas API
app.get('/eventos', (req, res) => {
  db.all('SELECT * FROM eventos', [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post('/eventos', (req, res) => {
  const { titulo, fecha, descripcion } = req.body;
  db.run(
    'INSERT INTO eventos (titulo, fecha, descripcion) VALUES (?, ?, ?)',
    [titulo, fecha, descripcion],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

// Ruta principal -> devuelve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
