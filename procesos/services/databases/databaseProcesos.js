const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'basesDatos', 'controlProcesos.db');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}


const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
    process.exit(1);
  } else {
    console.log('Base de datos conectada con éxito.');
  }
});

db.serialize(() => {
  
    // Nueva tabla mensajes
    db.run(`CREATE TABLE IF NOT EXISTS mensajes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recorte_id INTEGER NOT NULL,
      x FLOAT NOT NULL,
      y FLOAT NOT NULL,
      texto TEXT NOT NULL,
      FOREIGN KEY (recorte_id) REFERENCES recortes(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS procesos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    responsable_id INTEGER,
    proceso_padre_id INTEGER,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responsable_id) REFERENCES empleados(id) ON DELETE SET NULL,
    FOREIGN KEY (proceso_padre_id) REFERENCES procesos(id) ON DELETE SET NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS rutas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proceso_id INTEGER NOT NULL,
    empresa_id INTEGER NOT NULL,
    orden INTEGER NOT NULL,
    descripcion_corta TEXT,
    descripcion_detallada TEXT,
    tipo_contenido TEXT,
    url_contenido TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proceso_id) REFERENCES procesos(id) ON DELETE CASCADE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS empleados_procesos (
    empleado_id INTEGER NOT NULL,
    proceso_id INTEGER NOT NULL,
    PRIMARY KEY (empleado_id, proceso_id),
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
    FOREIGN KEY (proceso_id) REFERENCES procesos(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS empleados_rutas (
    empleado_id INTEGER NOT NULL,
    ruta_id INTEGER NOT NULL,
    PRIMARY KEY (empleado_id, ruta_id),
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
    FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS empleados_empresas (
    empleado_id INTEGER NOT NULL,
    empresa_id INTEGER NOT NULL,
    PRIMARY KEY (empleado_id, empresa_id),
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS rutas_procesos_departamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ruta_id INTEGER,
    proceso_id INTEGER NOT NULL,
    departamento_id INTEGER NOT NULL,
    empresa_id INTEGER NOT NULL,
    FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE CASCADE,
    FOREIGN KEY (proceso_id) REFERENCES procesos(id) ON DELETE CASCADE,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_ruta_proceso_depto_empresa ON rutas_procesos_departamentos (ruta_id, proceso_id, departamento_id, empresa_id)`);

  db.run(`CREATE TABLE IF NOT EXISTS proyectos (
    id_proyecto INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_proyecto VARCHAR(30) UNIQUE,
    descripcion_proyecto TEXT
  )`);

  // Tabla tipo_promesa (sin cambios)
  db.run(`CREATE TABLE IF NOT EXISTS tipo_promesa (
    id_tipo INTEGER PRIMARY KEY,
    descripcion VARCHAR(50)
  )`);

  // Nueva tabla direccion_flecha
  db.run(`CREATE TABLE IF NOT EXISTS direccion_flecha (
    id_direccion INTEGER PRIMARY KEY,
    descripcion VARCHAR(20)
  )`);

  // Tabla promesa modificada
  db.run(`CREATE TABLE IF NOT EXISTS promesa (
  id_promesa INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_promesa VARCHAR(20),
  num_orden_promesa INTEGER,
  tipo_promesa INTEGER,
  id_proyecto INTEGER,
  siguiente_promesa_id INTEGER,
  direccion_flecha_id INTEGER,
  rama_verdadera_id INTEGER,
  rama_falsa_id INTEGER,
  inicio_bucle_id INTEGER,
  fin_bucle_id INTEGER,
  FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto),
  FOREIGN KEY (tipo_promesa) REFERENCES tipo_promesa(id_tipo),
  FOREIGN KEY (siguiente_promesa_id) REFERENCES promesa(id_promesa),
  FOREIGN KEY (direccion_flecha_id) REFERENCES direccion_flecha(id_direccion),
  FOREIGN KEY (rama_verdadera_id) REFERENCES promesa(id_promesa),
  FOREIGN KEY (rama_falsa_id) REFERENCES promesa(id_promesa),
  FOREIGN KEY (inicio_bucle_id) REFERENCES promesa(id_promesa),
  FOREIGN KEY (fin_bucle_id) REFERENCES promesa(id_promesa),
  UNIQUE(nombre_promesa, id_proyecto)
)`);

  // Insertar tipos de promesa
  const tipos_promesa = [
    [1, 'Inicio del algoritmo'],
    [2, 'Solicitud de lectura'],
    [3, 'Solicitud de escritura'],
    [4, 'Repetir mientras'],
    [5, 'Repetir hasta'],
    [6, 'Si entonces (condicional)'],
    [7, 'Fin del algoritmo']
  ];

  const stmtTipoPromesa = db.prepare('INSERT OR IGNORE INTO tipo_promesa (id_tipo, descripcion) VALUES (?, ?)');
  tipos_promesa.forEach(tipo => stmtTipoPromesa.run(tipo));
  stmtTipoPromesa.finalize();

  // Insertar direcciones de flecha
  const direcciones_flecha = [
    [1, 'Derecha'],
    [2, 'Izquierda'],
    [3, 'Arriba'],
    [4, 'Abajo']
  ];

  const stmtDireccionFlecha = db.prepare('INSERT OR IGNORE INTO direccion_flecha (id_direccion, descripcion) VALUES (?, ?)');
  direcciones_flecha.forEach(direccion => stmtDireccionFlecha.run(direccion));
  stmtDireccionFlecha.finalize();
});

module.exports = db;
