const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = 'C:/procesos/basesDatos/controlProcesos.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
    process.exit(1);
  } else {
    console.log('Base de datos conectada con éxito.');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(50),
    email VARCHAR(255),
    nif VARCHAR(50),
    ceo_id INTEGER,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ceo_id) REFERENCES empleados(id) ON DELETE SET NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nivel_privilegio INTEGER NOT NULL DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_empresas (
    user_id INTEGER,
    empresa_id INTEGER,
    PRIMARY KEY (user_id, empresa_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
  )`);
})

  // Crear tabla de departamentos
  db.run(`CREATE TABLE IF NOT EXISTS departamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255) NOT NULL
  )`);

  // Crear nueva tabla de relación empresa_departamento
  db.run(`CREATE TABLE IF NOT EXISTS empresa_departamento (
    empresa_id INTEGER,
    departamento_id INTEGER,
    PRIMARY KEY (empresa_id, departamento_id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE
  )`);

  // Crear tabla de empleados
  db.run(`CREATE TABLE IF NOT EXISTS empleados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255) NOT NULL,
    puesto_id INTEGER,
    email VARCHAR(255),
    telefono VARCHAR(50),
    fecha_contratacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    departamento_id INTEGER,                    -- Relacionado con un departamento específico
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE SET NULL
  )`);

module.exports = db;
