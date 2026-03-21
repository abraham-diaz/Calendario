import sqlite3 from 'sqlite3';
import type { Evento, EventoCreate } from './types';

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Conectado a SQLite.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT,
    descripcion TEXT
  )`);
});

export function getEventos(): Promise<Evento[]> {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM eventos ORDER BY fecha DESC', [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows as Evento[]);
    });
  });
}

export function createEvento(evento: EventoCreate): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO eventos (titulo, fecha, descripcion) VALUES (?, ?, ?)',
      [evento.titulo, evento.fecha, evento.descripcion || ''],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      },
    );
  });
}

export function updateEvento(id: string, evento: EventoCreate): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE eventos SET titulo=?, fecha=?, descripcion=? WHERE id=?',
      [evento.titulo, evento.fecha, evento.descripcion, id],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      },
    );
  });
}

export function deleteEvento(id: string): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM eventos WHERE id=?', [id], function (err) {
      if (err) return reject(err);
      resolve(this.changes);
    });
  });
}
