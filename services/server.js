const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secretKey = 'secret123';
const TOKEN_EXPIRATION = '1h';
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Usa variables de entorno para las rutas de archivos y base de datos
const uploadsDir = process.env.UPLOADS_DIR || '/tmp/uploads';
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'base de datos', 'databaseEmpresa.db');

console.log('Directorio actual:', __dirname);
console.log('Ruta de la base de datos:', dbPath);
console.log('Ruta de uploads:', uploadsDir);

// Asegúrate de que el directorio de uploads exista
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Asegúrate de que la base de datos exista
if (!fs.existsSync(dbPath)) {
    console.log('La base de datos no existe. Creando una nueva...');
    fs.writeFileSync(dbPath, '');
}

// Abre la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});

// Importa los módulos de base de datos y pasa la conexión
const dbuser = require('./databases/databaseEmpresa')(db);
const dbempresa = require('./databases/databaseEmpresa')(db);
const dbUserEmpresa = require('./databases/databaseEmpresa')(db);
const dbRutas = require('./databases/databaseProcesos')(db);
const dbProyectos = require('./databases/databaseProcesos')(db);
const dbpromesas = require('./databases/databaseProcesos')(db);

// Configura Multer para almacenar archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

const app = express();
const port = process.env.PORT || 3000;

// Configuración de middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas para servir archivos HTML
const htmlFiles = [
    'registro', 'gestion-usuarios', 'gestion-empresas', 'gestion-departamentos',
    'gestion-proyectos', 'gestion-promesas', 'diagramaFlujo', 'gestion-rutas',
    'modificar-paso', 'gestion-vistas', 'diagrama-arbol', 'asignar-empresas',
    'login', 'registroEmpresas', 'menuUsuarioLongeado', 'menuUsuarioLongeado2',
    'asignacionEmpresasUsuarios', 'gestion-procesos', 'pasos-proceso', 'detalle-paso'
];

htmlFiles.forEach(file => {
    app.get(`/${file}`, (req, res) => {
        res.sendFile(path.join(__dirname, `../${file}.html`));
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Endpoint de mensajes en capturas
app.get('/api/mensajes', (req, res) => {
    const recorteId = req.query.recorteId;
    db.all('SELECT * FROM mensajes WHERE recorte_id = ?', [recorteId], (err, rows) => {
        if (err) {
            console.error('Error al obtener mensajes:', err.message);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
});

app.post('/api/mensajes', (req, res) => {
    const { recorteId, x, y, texto } = req.body;
    const stmt = db.prepare('INSERT INTO mensajes (recorte_id, x, y, texto) VALUES (?, ?, ?, ?)');
    stmt.run(recorteId, x, y, texto, function(err) {
        if (err) {
            console.error('Error al guardar el mensaje:', err.message);
            return res.status(500).json({ error: 'Error al guardar el mensaje' });
        }
        res.json({ id: this.lastID, recorteId, x, y, texto });
    });
});

app.post('/api/mensajes/actualizar', (req, res) => {
    const { recorteId, mensajes } = req.body;
    db.run('BEGIN TRANSACTION');
    db.run('DELETE FROM mensajes WHERE recorte_id = ?', recorteId, (err) => {
        if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Error al actualizar mensajes' });
        }
        const stmt = db.prepare('INSERT INTO mensajes (recorte_id, x, y, texto) VALUES (?, ?, ?, ?)');
        mensajes.forEach(mensaje => {
            stmt.run(recorteId, mensaje.x, mensaje.y, mensaje.texto);
        });
        stmt.finalize();
        db.run('COMMIT', (err) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Error al finalizar la actualización' });
            }
            res.json({ message: 'Mensajes actualizados correctamente' });
        });
    });
});

// Endpoints relacionados con promesas
app.get('/api/verificar-proyecto', (req, res) => {
    const nombreProyecto = req.query.nombre;
    if (!nombreProyecto) {
        return res.status(400).json({ error: 'El nombre del proyecto es requerido' });
    }
    dbProyectos.get('SELECT * FROM proyectos WHERE nombre_proyecto = ?', [nombreProyecto], (err, row) => {
        if (err) {
            console.error('Error al verificar el proyecto:', err.message);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json({ existeProyecto: !!row });
    });
});

app.get('/api/tipos-promesa', (req, res) => {
    dbpromesas.all('SELECT id_tipo, descripcion FROM tipo_promesa', [], (err, rows) => {
        if (err) {
            console.error('Error al consultar tipos de promesa:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
});

app.get('/api/tipos-flecha', (req, res) => {
    dbpromesas.all('SELECT id_direccion, descripcion FROM direccion_flecha', [], (err, rows) => {
        if (err) {
            console.error('Error al consultar tipos de flecha:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
});

app.get('/api/verificar-promesa', (req, res) => {
    const { nombre: nombrePromesa, proyecto: proyectoId, orden: numOrden } = req.query;
    if (!nombrePromesa || !proyectoId) {
        return res.status(400).json({ error: 'El nombre de la promesa y el ID del proyecto son requeridos' });
    }
    dbpromesas.get('SELECT * FROM promesa WHERE nombre_promesa = ? AND id_proyecto = ?', [nombrePromesa, proyectoId], (err, row) => {
        if (err) {
            console.error('Error al verificar la promesa:', err.message);
            return res.status(500).json({ error: 'Error al verificar la promesa' });
        }
        if (row) {
            res.json({
                existePromesa: true,
                id: row.id_promesa,
                nombre: row.nombre_promesa,
                num_orden: row.num_orden_promesa,
                tipo_id: row.tipo_promesa,
                siguiente_promesa_id: row.siguiente_promesa_id,
                direccion_flecha_id: row.direccion_flecha_id,
                rama_verdadera_id: row.rama_verdadera_id,
                rama_falsa_id: row.rama_falsa_id,
                inicio_bucle_id: row.inicio_bucle_id,
                fin_bucle_id: row.fin_bucle_id
            });
        } else {
            dbpromesas.get('SELECT * FROM promesa WHERE num_orden_promesa = ? AND id_proyecto = ?', [numOrden, proyectoId], (err, ordenRow) => {
                if (err) {
                    console.error('Error al verificar el número de orden:', err.message);
                    return res.status(500).json({ error: 'Error al verificar el número de orden' });
                }
                res.json({ existePromesa: false, ordenExiste: !!ordenRow });
            });
        }
    });
});

// ... (resto de los endpoints)

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Conexión a la base de datos cerrada.');
        process.exit(0);
    });
});
