const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');


// Variables de configuración
const secretKey = process.env.JWT_SECRET || 'secret123'; // Usa variable de entorno para seguridad
const TOKEN_EXPIRATION = '1h'; // Duración del token
const dbPath = path.join(__dirname, '..', '..', 'basesDatos', 'controlProcesos.db');// Ruta relativa a la base de datos

const uploadsDir = path.join(__dirname, 'procesos', 'uploads'); // Ruta relativa para archivos subidos

const db = require('./databases/databaseEmpresa');
const dbuser = require('./databases/databaseEmpresa');
const dbempresa = require('./databases/databaseEmpresa');
const dbUserEmpresa = require('./databases/databaseEmpresa');
const dbRutas = require('./databases/databaseProcesos');
const dbProyectos = require('./databases/databaseProcesos');
const dbpromesas = require('./databases/databaseProcesos');


// Configuración de multer
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Configuración de Express
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});


app.use(express.static(path.join(__dirname, '..', 'public'), { 
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}));


console.log('Ruta de archivos estáticos:', path.join(__dirname, '..', '..', 'procesos', 'public'));

app.use('/uploads', express.static(uploadsDir)); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'"]
    }
  }
}));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});


// Prueba de archivos estáticos subidos
app.use('/uploads', (req, res, next) => {
  console.log('Solicitud de archivo:', req.url);
  next();
}, express.static(uploadsDir));

// Rutas base
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'index.html'));
});


// 1. Rutas de gestión de archivos HTML (Usuarios, Empresas, Departamentos, Procesos, Rutas)----------------------------------------------------------------------------------
app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, '../registro.html'));
});

app.get('/gestion-usuarios', (req, res) => {
  res.sendFile(path.join(__dirname, '../registro.html'));
});

app.get('/gestion-empresas', (req, res) => {
  res.sendFile(path.join(__dirname, '../registroEmpresas.html'));
});

app.get('/gestion-departamentos', (req, res) => {
  res.sendFile(path.join(__dirname, '../resgistroDepartamentos.html'));
});

app.get('/gestion-proyectos', (req, res) => {
  res.sendFile(path.join(__dirname, '../registroProyectos.html'));
});

app.get('/gestion-promesas', (req, res) => {
  res.sendFile(path.join(__dirname, '../registroPromesas.html'));
});

app.get('/diagramaFlujo', (req, res) => {
  res.sendFile(path.join(__dirname, '../flowchart.html'));
});

app.get('/gestion-rutas', (req, res) => {
  res.sendFile(path.join(__dirname, '../rutas.html'));
});

app.get('/modificar-paso', (req, res) => {
  res.sendFile(path.join(__dirname, '../modificar-paso.html'));
});

app.get('/gestion-vistas', (req, res) => {
  res.sendFile(path.join(__dirname, '../gestionVistas.html'));
});

app.get('/diagrama-arbol', (req, res) => {
  res.sendFile(path.join(__dirname, '../diagrama-arbol.html'));
});

app.get('/asignar-empresas', (req, res) => {
  res.sendFile(path.join(__dirname, '../asignacionEmpresasUsuarios.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../login.html'));
});

app.get('/registroEmpresas', (req, res) => {
  res.sendFile(path.join(__dirname, '../registroEmpresas.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'index.html'));
});


app.get('/menuUsuarioLongeado', (req, res) => {
  res.sendFile(path.join(__dirname, '../menuUsuarioLongeado.html'));
});

app.get('/menuUsuarioLongeado2', (req, res) => {
  res.sendFile(path.join(__dirname, '../menuUsuarioLongeado2.html'));
});

app.get('/asignacionEmpresasUsuarios', (req, res) => {
  res.sendFile(path.join(__dirname, '../asignacionEmpresasUsuarios.html'));
});

app.get('/gestion-procesos', (req, res) => {
  res.sendFile(path.join(__dirname, '../registroProcesos.html'));
});

app.get('/pasos-proceso', (req, res) => {
  res.sendFile(path.join(__dirname, '../pasosProceso.html'));
});

app.get('/detalle-paso', (req, res) => {
  res.sendFile(path.join(__dirname, '../detalle-paso.html'));
});

//  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Endpoint de mensajes en capturas---------------------------------------------------------------------------------------------------------------------------------------

// Endpoint para obtener mensajes por recorte_id
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

// Endpoint para guardar un nuevo mensaje
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

// Endpoint para actualizar los mensajes de un recorte
app.post('/api/mensajes/actualizar', (req, res) => {
  const { recorteId, mensajes } = req.body;
  
  // Limpiar mensajes antiguos
  const deleteStmt = db.prepare('DELETE FROM mensajes WHERE recorte_id = ?');
  deleteStmt.run(recorteId);
  
  // Insertar nuevos mensajes
  const insertStmt = db.prepare('INSERT INTO mensajes (recorte_id, x, y, texto) VALUES (?, ?, ?, ?)');
  
  for (const mensaje of mensajes) {
      insertStmt.run(recorteId, mensaje.x, mensaje.y, mensaje.texto);
  }
  
  insertStmt.finalize();
  deleteStmt.finalize();
  
  res.json({ message: 'Mensajes actualizados correctamente' });
});

// Endpoint relacionados con promess--------------------------------------------------------------------------------------------------------------------------------------
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
  console.log('Solicitud recibida para /api/tipos-promesa');
  dbpromesas.all('SELECT id_tipo, descripcion FROM tipo_promesa', [], (err, rows) => {
    if (err) {
      console.error('Error al consultar tipos de promesa:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    console.log('Tipos de promesa recuperados:', rows);
    res.json(rows);
  });
});

app.get('/api/tipos-flecha', (req, res) => {
  console.log('Solicitud recibida para /api/tipos-flecha');
  dbpromesas.all('SELECT id_direccion, descripcion FROM direccion_flecha', [], (err, rows) => {
    if (err) {
      console.error('Error al consultar tipos de flecha:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    console.log('Tipos de flecha recuperados:', rows);
    res.json(rows);
  });
});

app.get('/api/verificar-promesa', (req, res) => {
  console.log('Verificando promesa:', req.query);
  const nombrePromesa = req.query.nombre;
  const proyectoId = req.query.proyecto;
  const numOrden = req.query.orden;

  // Validar que los parámetros necesarios estén presentes
  if (!nombrePromesa || !proyectoId) {
      return res.status(400).json({ error: 'El nombre de la promesa y el ID del proyecto son requeridos' });
  }

  dbpromesas.get(
    'SELECT * FROM promesa WHERE nombre_promesa = ? AND id_proyecto = ?',
    [nombrePromesa, proyectoId],
    (err, row) => {
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
          // Verificar si el número de orden ya existe en el proyecto
          dbpromesas.get(
            'SELECT * FROM promesa WHERE num_orden_promesa = ? AND id_proyecto = ?',
            [numOrden, proyectoId],
            (err, ordenRow) => {
              if (err) {
                console.error('Error al verificar el número de orden:', err.message);
                return res.status(500).json({ error: 'Error al verificar el número de orden' });
              }

              res.json({ 
                existePromesa: false,
                ordenExiste: ordenRow ? true : false
              });
            }
          );
      }
    }
  );
});

app.get('/api/verificar-promesa-existente', (req, res) => {
  console.log('Verificando existencia de promesa:', req.query);
  const promesaId = req.query.id;
  const proyectoId = req.query.proyecto;

  if (!promesaId || !proyectoId) {
    return res.status(400).json({ error: 'El ID de la promesa y el ID del proyecto son requeridos' });
  }

  dbpromesas.get(
    'SELECT * FROM promesa WHERE id_promesa = ? AND id_proyecto = ?',
    [promesaId, proyectoId],
    (err, row) => {
      if (err) {
        console.error('Error al verificar la existencia de la promesa:', err.message);
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
          direccion_flecha_id: row.direccion_flecha_id
        });
      } else {
        res.json({ existePromesa: false });
      }
    }
  );
});

app.get('/api/promesas-proyecto/:proyectoId', require('./middleware/authenticate'), (req, res) => {
  const proyectoId = req.params.proyectoId;

  console.log(`Solicitando promesas para el proyecto ID: ${proyectoId}`);

  const query = `
    SELECT 
      p.id_promesa,
      p.nombre_promesa,
      p.num_orden_promesa,
      p.tipo_promesa,
      p.siguiente_promesa_id,
      sp.nombre_promesa AS siguiente_promesa_nombre,
      p.rama_verdadera_id,
      rv.nombre_promesa AS rama_verdadera_nombre,
      p.rama_falsa_id,
      rf.nombre_promesa AS rama_falsa_nombre,
      p.inicio_bucle_id,
      ib.nombre_promesa AS inicio_bucle_nombre,
      p.fin_bucle_id,
      fb.nombre_promesa AS fin_bucle_nombre,
      p.direccion_flecha_id,
      df.descripcion AS direccion_flecha_nombre
    FROM promesa p
    LEFT JOIN promesa sp ON p.siguiente_promesa_id = sp.id_promesa
    LEFT JOIN promesa rv ON p.rama_verdadera_id = rv.id_promesa
    LEFT JOIN promesa rf ON p.rama_falsa_id = rf.id_promesa
    LEFT JOIN promesa ib ON p.inicio_bucle_id = ib.id_promesa
    LEFT JOIN promesa fb ON p.fin_bucle_id = fb.id_promesa
    LEFT JOIN direccion_flecha df ON p.direccion_flecha_id = df.id_direccion
    WHERE p.id_proyecto = ?
    ORDER BY p.num_orden_promesa ASC
  `;

  dbpromesas.all(query, [proyectoId], (err, rows) => {
    if (err) {
      console.error('Error al obtener las promesas del proyecto:', err.message);
      return res.status(500).json({ error: "Error interno del servidor al obtener las promesas" });
    }

    if (rows.length === 0) {
      console.log(`No se encontraron promesas para el proyecto ID: ${proyectoId}`);
      return res.status(404).json({ message: "No se encontraron promesas para este proyecto" });
    }

    console.log(`Se encontraron ${rows.length} promesas para el proyecto ID: ${proyectoId}`);
    res.json(rows);
  });
});

app.get('/api/verificar-orden-promesa', (req, res) => {
  const orden = req.query.num_orden_promesa || req.query.orden;
  const proyectoId = req.query.id_proyecto || req.query.proyectoId;

  console.log('Verificando orden:', orden);
  console.log('Verificando proyecto:', proyectoId);

  if (!orden || !proyectoId) {
    return res.status(400).json({ error: 'El número de orden y el ID del proyecto son requeridos' });
  }

  dbpromesas.get(
    'SELECT * FROM promesa WHERE num_orden_promesa = ? AND id_proyecto = ?',
    [orden, proyectoId],
    (err, row) => {
      if (err) {
        console.error('Error al verificar el orden de la promesa:', err.message);
        return res.status(500).json({ error: 'Error al verificar el orden de la promesa' });
      }

      res.json({ 
        ordenExiste: !!row,
        promesa: row ? {
          id: row.id_promesa,
          nombre: row.nombre_promesa,
          num_orden: row.num_orden_promesa,
          tipo_id: row.tipo_promesa
        } : null
      });
    }
  );
});



app.get('/api/promesas/:id', require('./middleware/authenticate'), (req, res) => {
  const id = req.params.id;
  dbpromesas.get('SELECT * FROM promesa WHERE id_promesa = ?', [id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Error al obtener la promesa" });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Promesa no encontrada" });
      return;
    }
    res.json(row);
  });
});

app.get('/api/promesas', require('./middleware/authenticate'), (req, res) => {
  const proyectoId = req.query.proyectoId; // Opcional: para filtrar por proyecto

  let query = 'SELECT * FROM promesa';
  let params = [];

  if (proyectoId) {
    query += ' WHERE id_proyecto = ?';
    params.push(proyectoId);
  }

  dbpromesas.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error al obtener las promesas:', err.message);
      res.status(500).json({ error: "Error al obtener las promesas" });
      return;
    }
    res.json(rows);
  });
});

app.delete('/api/eliminar-promesa/:promesaId', require('./middleware/authenticate'), (req, res) => {
  const { promesaId } = req.params;

  // Primero, verificamos si la promesa existe
  dbpromesas.get('SELECT * FROM promesa WHERE id_promesa = ?', [promesaId], (err, row) => {
    if (err) {
      console.error('Error al verificar la existencia de la promesa:', err.message);
      return res.status(500).json({ error: 'Error al verificar la promesa' });
    }

    if (!row) {
      return res.status(404).json({ message: 'No se encontró la promesa especificada' });
    }

    // Si la promesa existe, procedemos a eliminarla
    dbpromesas.run('DELETE FROM promesa WHERE id_promesa = ?', [promesaId], function(err) {
      if (err) {
        console.error('Error al eliminar la promesa:', err.message);
        return res.status(500).json({ error: 'Error al eliminar la promesa' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'No se pudo eliminar la promesa' });
      }

      // Si se eliminó correctamente, actualizamos el orden de las promesas restantes
      dbpromesas.run(`
        UPDATE promesa 
        SET num_orden_promesa = num_orden_promesa - 1 
        WHERE id_proyecto = ? AND num_orden_promesa > ?
      `, [row.id_proyecto, row.num_orden_promesa], (err) => {
        if (err) {
          console.error('Error al actualizar el orden de las promesas:', err.message);
          // No devolvemos error aquí porque la promesa ya se eliminó correctamente
        }

        res.json({ message: 'Promesa eliminada con éxito y orden actualizado' });
      });
    });
  });
});

// Endpoints relacionados con proyectos...................................................................................................................................
app.get('/api/proyectos', require('./middleware/authenticate'), (req, res) => {
  dbProyectos.all('SELECT * FROM proyectos ORDER BY nombre_proyecto', [], (err, rows) => {
      if (err) {
          console.error(err.message);
          res.status(500).json({ error: "Error al obtener los proyectos" });
          return;
      }
      res.json(rows);
  });
});

app.get('/api/proyectos/:id', require('./middleware/authenticate'), (req, res) => {
  const id = req.params.id;
  dbProyectos.get('SELECT * FROM proyectos WHERE id_proyecto = ?', [id], (err, row) => {
      if (err) {
          console.error(err.message);
          res.status(500).json({ error: "Error al obtener el proyecto" });
          return;
      }
      if (!row) {
          res.status(404).json({ error: "Proyecto no encontrado" });
          return;
      }
      // Incluir todos los campos necesarios en la respuesta
      res.json({
          id: row.id_proyecto,
          nombre_proyecto: row.nombre_proyecto,
          descripcion_proyecto: row.descripcion_proyecto
      });
  });
});

app.delete('/api/proyectos/:id', require('./middleware/authenticate'), (req, res) => {
  const id = req.params.id;
  dbProyectos.run('DELETE FROM proyectos WHERE id = ?', id, function(err) {
      if (err) {
          console.error(err.message);
          res.status(500).json({ error: "Error al eliminar el proyecto" });
          return;
      }
      res.json({ message: "Proyecto eliminado con éxito" });
  });
});






// 4. Endpoints relacionados con procesos---------------------------------------------------------------------------------------------------------------------------------

app.get('/api/asociaciones-proceso/:procesoId', (req, res) => {
  const procesoId = req.params.procesoId;

  const query = `
      SELECT 
          rpd.id as asociacion_id,
          rpd.ruta_id,
          rpd.proceso_id,
          rpd.departamento_id,
          rpd.empresa_id,
          d.nombre as departamento_nombre,
          e.nombre as empresa_nombre
      FROM rutas_procesos_departamentos rpd
      JOIN departamentos d ON rpd.departamento_id = d.id
      JOIN empresas e ON rpd.empresa_id = e.id
      WHERE rpd.proceso_id = ?
  `;

  dbRutas.all(query, [procesoId], (err, rows) => {
      if (err) {
          console.error('Error al obtener asociaciones:', err.message);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (rows.length === 0) {
          return res.json({ message: 'No se encontraron asociaciones para este proceso', asociaciones: [] });
      }

      res.json({
          message: `Se encontraron ${rows.length} asociaciones para el proceso`,
          asociaciones: rows
      });
  });
});


app.get('/api/verificar-proceso', (req, res) => {
  const { id, nombre } = req.query;
  
  // Verificar que se ha proporcionado al menos un parámetro
  if (!id && !nombre) {
      return res.status(400).json({ error: 'Se debe proporcionar un ID o un nombre de proceso' });
  }

  let query;
  let params;

  if (id) {
      query = 'SELECT * FROM procesos WHERE id = ?';
      params = [id];
  } else {
      query = 'SELECT * FROM procesos WHERE nombre = ?';
      params = [nombre];
  }

  dbempresa.get(query, params, (err, row) => {
      if (err) {
          console.error('Error al verificar el proceso:', err.message);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (row) {
          // Proceso encontrado
          res.json({
              existeProceso: true,
              id: row.id,
              nombre: row.nombre
          });
      } else {
          // Proceso no encontrado
          res.json({
              existeProceso: false,
              id: null,
              nombre: null
          });
      }
  });
});

app.get('/api/verificar-asociacion-proceso', (req, res) => {
  const { procesoId, departamentoId, empresaId } = req.query;

  // Verificar que se han proporcionado todos los parámetros necesarios
  if (!procesoId || !departamentoId || !empresaId) {
      return res.status(400).json({ error: 'Se deben proporcionar procesoId, departamentoId y empresaId' });
  }

  // Consulta SQL para verificar la asociación
  const query = `
      SELECT COUNT(*) as count
      FROM rutas_procesos_departamentos
      WHERE proceso_id = ? AND departamento_id = ? AND empresa_id = ?
  `;

  dbempresa.get(query, [procesoId, departamentoId, empresaId], (err, row) => {
      if (err) {
          console.error('Error al verificar la asociación del proceso:', err.message);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }

      // Si count es mayor que 0, existe una asociación
      const asociados = row.count > 0;

      res.json({ asociados });
  });
});

app.get('/api/departamentos-empresas-por-proceso/:procesoId', (req, res) => {
  const { procesoId } = req.params;

  // Verificar que se ha proporcionado un procesoId
  if (!procesoId) {
      return res.status(400).json({ error: 'Se debe proporcionar un ID de proceso' });
  }

  // Consulta SQL para obtener departamentos y empresas asociados al proceso
  const query = `
      SELECT DISTINCT d.id AS departamento_id, d.nombre AS departamento_nombre, 
                      e.id AS empresa_id, e.nombre AS empresa_nombre
      FROM rutas_procesos_departamentos rpd
      JOIN departamentos d ON rpd.departamento_id = d.id
      JOIN empresas e ON rpd.empresa_id = e.id
      WHERE rpd.proceso_id = ?
      ORDER BY e.nombre, d.nombre
  `;

  dbempresa.all(query, [procesoId], (err, rows) => {
      if (err) {
          console.error('Error al obtener departamentos y empresas por proceso:', err.message);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (rows.length === 0) {
          return res.json({ message: 'No se encontraron asociaciones para este proceso', asociaciones: [] });
      }

      // Formatear los resultados
      const asociaciones = rows.map(row => ({
          departamento: {
              id: row.departamento_id,
              nombre: row.departamento_nombre
          },
          empresa: {
              id: row.empresa_id,
              nombre: row.empresa_nombre
          }
      }));

      res.json({ asociaciones });
  });
});

app.get('/api/procesos', (req, res) => {
  // Consulta SQL actualizada para incluir la descripción del proceso
  const query = `
      SELECT p.id, p.nombre, p.descripcion, 
             d.id AS departamento_id, d.nombre AS departamento_nombre,
             e.id AS empresa_id, e.nombre AS empresa_nombre
      FROM procesos p
      LEFT JOIN rutas_procesos_departamentos rpd ON p.id = rpd.proceso_id
      LEFT JOIN departamentos d ON rpd.departamento_id = d.id
      LEFT JOIN empresas e ON rpd.empresa_id = e.id
      ORDER BY p.nombre, e.nombre, d.nombre
  `;

  dbempresa.all(query, [], (err, rows) => {
      if (err) {
          console.error('Error al obtener los procesos:', err.message);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }

      // Procesar los resultados para agrupar por proceso
      const procesos = rows.reduce((acc, row) => {
          if (!acc[row.id]) {
              acc[row.id] = {
                  id: row.id,
                  nombre: row.nombre,
                  descripcion: row.descripcion, // Incluir la descripción
                  asociaciones: []
              };
          }
          if (row.departamento_id) {
              acc[row.id].asociaciones.push({
                  departamento: {
                      id: row.departamento_id,
                      nombre: row.departamento_nombre
                  },
                  empresa: {
                      id: row.empresa_id,
                      nombre: row.empresa_nombre
                  }
              });
          }
          return acc;
      }, {});

      // Convertir el objeto a un array
      const procesosArray = Object.values(procesos);

      res.json(procesosArray);
  });
});

// Endpoint para obtener la lista de procesos de una empresa específica
app.get('/api/procesos-por-empresa/:empresaId', require('./middleware/authenticate'), (req, res) => {
  const empresaId = req.params.empresaId;

  const query = `
SELECT DISTINCT p.id, p.nombre, p.descripcion, 
       d.id AS departamento_id, d.nombre AS departamento_nombre,
       rpd.empresa_id, e.nombre AS empresa_nombre
FROM procesos p
JOIN rutas_procesos_departamentos rpd ON p.id = rpd.proceso_id
LEFT JOIN departamentos d ON rpd.departamento_id = d.id
LEFT JOIN empresas e ON rpd.empresa_id = e.id
WHERE rpd.empresa_id = ?
ORDER BY p.nombre ASC
`;
  
  dbRutas.all(query, [empresaId], (err, rows) => {
    if (err) {
      console.error('Error al obtener procesos por empresa:', err.message);
      res.status(500).json({ error: 'Error al obtener procesos por empresa.' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/procesos-por-departamento/:departamentoId', (req, res) => {
  const departamentoId = req.params.departamentoId;

  const query = `
    SELECT DISTINCT p.id, p.nombre, p.descripcion, 
           d.id AS departamento_id, d.nombre AS departamento_nombre,
           rpd.empresa_id, e.nombre AS empresa_nombre
    FROM procesos p
    JOIN rutas_procesos_departamentos rpd ON p.id = rpd.proceso_id
    JOIN departamentos d ON rpd.departamento_id = d.id
    LEFT JOIN empresas e ON rpd.empresa_id = e.id
    WHERE rpd.departamento_id = ?
    ORDER BY p.nombre ASC
  `;
  
  dbRutas.all(query, [departamentoId], (err, rows) => {
    if (err) {
      console.error('Error al obtener procesos por departamento:', err.message);
      res.status(500).json({ error: 'Error al obtener procesos por departamento.' });
    } else {
      res.json(rows);
    }
  });
}); 

app.get('/api/procesos-por-empresa-departamento/:empresaId/:departamentoId', require('./middleware/authenticate'), (req, res) => {
  const empresaId = req.params.empresaId;
  const departamentoId = req.params.departamentoId;

  const query = `
    SELECT DISTINCT p.id, p.nombre, p.descripcion
    FROM procesos p
    JOIN rutas_procesos_departamentos rpd ON p.id = rpd.proceso_id
    WHERE rpd.empresa_id = ? AND rpd.departamento_id = ?
    ORDER BY p.nombre ASC
  `;
  
  dbRutas.all(query, [empresaId, departamentoId], (err, rows) => {
    if (err) {
      console.error('Error al obtener procesos por empresa y departamento:', err.message);
      res.status(500).json({ error: 'Error al obtener procesos por empresa y departamento.' });
    } else {
      console.log('Procesos encontrados:', rows); // Añade este log
      res.json(rows); // Cambia esto para enviar directamente el array de procesos
    }
  });
});

// 2. Endpoints relacionados con Empresa----------------------------------------------------------------------------------------------------------------------------------

app.get('/api/empresa/:id', (req, res) => {
  const empresaId = req.params.id;

  // Consulta SQL para obtener el nombre de la empresa
  const query = 'SELECT nombre FROM empresas WHERE id = ?';

  dbempresa.get(query, [empresaId], (err, row) => {
      if (err) {
          console.error('Error al obtener el nombre de la empresa:', err.message);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (!row) {
          return res.status(404).json({ error: 'Empresa no encontrada' });
      }

      res.json({ nombre: row.nombre });
  });
});

// Endpoint para obtener la lista de empresas
app.get('/api/empresas', require('./middleware/authenticate'), (req, res) => {
  const nivelPrivilegio = req.user.nivel_privilegio;
  const userId = req.user.id;

  let query;
  let params = [];

  if (nivelPrivilegio === 1) {
      // Si el usuario tiene nivel de privilegio 1, obtener todas las empresas
      query = 'SELECT * FROM empresas ORDER BY nombre ASC';
  } else {
      // Si no, obtener solo las empresas asociadas al usuario
      query = `
          SELECT e.* 
          FROM empresas e 
          INNER JOIN user_empresas ue ON e.id = ue.empresa_id 
          WHERE ue.user_id = ?
          ORDER BY e.nombre ASC
      `;
      params = [userId];
  }

  dbempresa.all(query, params, (err, rows) => {
      if (err) {
          console.error('Error al obtener empresas:', err.message);
          res.status(500).json({ error: 'Error al obtener empresas.' });
      } else {
          res.json(rows); // Envía la lista de empresas filtrada como JSON
      }
  });
});

app.post('/api/crear-token-empresa', require('./middleware/authenticate'), (req, res) => {
  const userId = req.user.id;
  const nivelPrivilegio = req.user.nivel_privilegio;
  const { empresaId } = req.body;

  if (!empresaId) {
      return res.status(400).json({ error: 'Se requiere el ID de la empresa.' });
  }

  let query;
  let params;

  if (nivelPrivilegio === 1) {
      // Si el usuario tiene nivel de privilegio 1, puede acceder a cualquier empresa
      query = 'SELECT * FROM empresas WHERE id = ?';
      params = [empresaId];
  } else {
      // Si no, verificar que el usuario tenga acceso a esta empresa
      query = `
          SELECT e.* 
          FROM empresas e 
          INNER JOIN user_empresas ue ON e.id = ue.empresa_id 
          WHERE ue.user_id = ? AND e.id = ?
      `;
      params = [userId, empresaId];
  }

  dbempresa.get(query, params, (err, empresa) => {
      if (err) {
          console.error('Error al verificar la empresa:', err.message);
          return res.status(500).json({ error: 'Error al verificar la empresa.' });
      }

      if (!empresa) {
          return res.status(403).json({ error: 'No tienes acceso a esta empresa.' });
      }

      // Devolver la información de la empresa
      res.json({ 
          mensaje: 'Acceso a la empresa verificado',
          empresa: {
              id: empresa.id,
              nombre: empresa.nombre,
              // Incluye aquí cualquier otra información relevante de la empresa
          }
      });
  });
});

// Verificación de empresa por ID o nombre
app.get('/verificar-empresa/:tipo/:valor', (req, res) => {
  const tipo = req.params.tipo;
  const valor = req.params.valor;
  
  let query;
  let params;

  if (tipo === 'id') {
    query = 'SELECT * FROM empresas WHERE id = ?';
    params = [valor];
  } else if (tipo === 'nombre') {
    query = 'SELECT * FROM empresas WHERE nombre = ?';
    params = [valor];
  } else {
    return res.status(400).json({ error: 'Tipo de búsqueda no válido' });
  }

  dbempresa.get(query, params, (err, row) => {
    if (err) {
      console.error('Error al verificar la empresa:', err.message);
      res.status(500).json({ error: 'Error al verificar la empresa.' });
    } else if (row) {
      res.json({
        exists: true,
        id: row.id,
        nombre: row.nombre,
        direccion: row.direccion,
        telefono: row.telefono,
        email: row.email,
        nif: row.nif,
        ceo_id: row.ceo_id
      });
    } else {
      res.json({ exists: false });
    }
  });
});

// 3. Endpoints para departamentos-----------------------------------------------------------------------------------------------------------------------------------------------

// Endpoint para verificar departamento
app.get('/api/verificar-departamento', (req, res) => {
  const nombreDepartamento = req.query.nombre;
  const departamentoId = req.query.id;

  if (!nombreDepartamento && !departamentoId) {
      return res.status(400).json({ error: 'Se requiere el nombre o ID del departamento' });
  }

  let query, params;
  if (departamentoId) {
      query = 'SELECT id, nombre FROM departamentos WHERE id = ?';
      params = [departamentoId];
  } else {
      query = 'SELECT id, nombre FROM departamentos WHERE nombre = ?';
      params = [nombreDepartamento];
  }

  dbempresa.get(query, params, (err, row) => {
      if (err) {
          console.error('Error al verificar el departamento:', err.message);
          return res.status(500).json({ error: 'Error al verificar el departamento' });
      }
      
      if (row) {
          res.json({
              existeDepartamento: true,
              id: row.id,
              nombre: row.nombre
          });
      } else {
          res.json({ existeDepartamento: false });
      }
  });
});

// Endpoint para obtener la lista de departamentos
app.get('/api/departamentos', require('./middleware/authenticate'), (req, res) => {
  const nivelPrivilegio = req.user.nivel_privilegio;
  const userId = req.user.id;

  let query;
  let params = [];

  if (nivelPrivilegio === 1) {
    // Si el usuario tiene nivel de privilegio 1, obtener todos los departamentos
    query = `
      SELECT d.id, d.nombre, 
             GROUP_CONCAT(e.id || ',' || e.nombre) as empresas
      FROM departamentos d
      LEFT JOIN empresa_departamento ed ON d.id = ed.departamento_id
      LEFT JOIN empresas e ON ed.empresa_id = e.id
      GROUP BY d.id
      ORDER BY d.nombre ASC
    `;
  } else {
    // Si no, obtener solo los departamentos de las empresas asociadas al usuario
    query = `
      SELECT d.id, d.nombre, 
             GROUP_CONCAT(e.id || ',' || e.nombre) as empresas
      FROM departamentos d
      JOIN empresa_departamento ed ON d.id = ed.departamento_id
      JOIN empresas e ON ed.empresa_id = e.id
      JOIN user_empresas ue ON e.id = ue.empresa_id
      WHERE ue.user_id = ?
      GROUP BY d.id
      ORDER BY d.nombre ASC
    `;
    params = [userId];
  }

  dbempresa.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error al obtener departamentos:', err.message);
      res.status(500).json({ error: 'Error al obtener departamentos.' });
    } else {
      // Procesar los resultados para formatear correctamente las empresas
      const departamentos = rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        empresas: row.empresas ? row.empresas.split(',').map(e => {
          const [id, nombre] = e.split(',');
          return { id: parseInt(id), nombre };
        }) : []
      }));
      res.json(departamentos);
    }
  });
});

// Endpoint para verificar departamento y empresa asociada

app.get('/api/verificar-departamento', (req, res) => {
  const nombreDepartamento = req.query.nombre;
  const empresaId = req.query.empresaId;

  if (!nombreDepartamento || !empresaId) {
      return res.status(400).json({ error: 'Nombre del departamento y ID de la empresa son requeridos' });
  }

  // Primero, verificamos si el departamento existe
  db.get('SELECT id FROM departamentos WHERE nombre = ?', [nombreDepartamento], (err, departamento) => {
      if (err) {
          console.error('Error al verificar departamento:', err.message);
          return res.status(500).json({ error: 'Error al verificar departamento' });
      }

      if (!departamento) {
          // El departamento no existe
          return res.json({ existeDepartamento: false, asociadoAEmpresa: false });
      }

      // El departamento existe, ahora verificamos si está asociado a la empresa
      db.get('SELECT * FROM empresa_departamento WHERE departamento_id = ? AND empresa_id = ?', 
          [departamento.id, empresaId], (err, asociacion) => {
          if (err) {
              console.error('Error al verificar asociación:', err.message);
              return res.status(500).json({ error: 'Error al verificar asociación' });
          }

          res.json({
              existeDepartamento: true,
              asociadoAEmpresa: !!asociacion
          });
      });
  });
});

app.get('/api/empresas-por-departamento/:departamentoId', require('./middleware/authenticate'), (req, res) => {
  const departamentoId = req.params.departamentoId;
  const nivelPrivilegio = req.user.nivel_privilegio;
  const userId = req.user.id;

  let query;
  let params = [departamentoId];

  if (nivelPrivilegio === 1) {
    // Si el usuario tiene nivel de privilegio 1, obtener todas las empresas asociadas al departamento
    query = `
      SELECT e.* 
      FROM empresas e 
      INNER JOIN empresa_departamento ed ON e.id = ed.empresa_id 
      WHERE ed.departamento_id = ?
      ORDER BY e.nombre ASC
    `;
  } else {
    // Si no, obtener solo las empresas asociadas al departamento y al usuario
    query = `
      SELECT e.* 
      FROM empresas e 
      INNER JOIN empresa_departamento ed ON e.id = ed.empresa_id 
      INNER JOIN user_empresas ue ON e.id = ue.empresa_id 
      WHERE ed.departamento_id = ? AND ue.user_id = ?
      ORDER BY e.nombre ASC
    `;
    params.push(userId);
  }

  dbempresa.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error al obtener empresas del departamento:', err.message);
      res.status(500).json({ error: 'Error al obtener empresas del departamento.' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/departamentos-por-empresa/:empresaId', require('./middleware/authenticate'), (req, res) => {
  const empresaId = req.params.empresaId;
  const nivelPrivilegio = req.user.nivel_privilegio;
  const userId = req.user.id;

  let query;
  let params = [empresaId];

  if (nivelPrivilegio === 1) {
    // Si el usuario tiene nivel de privilegio 1, obtener todos los departamentos asociados a la empresa
    query = `
      SELECT d.* 
      FROM departamentos d 
      INNER JOIN empresa_departamento ed ON d.id = ed.departamento_id 
      WHERE ed.empresa_id = ?
      ORDER BY d.nombre ASC
    `;
  } else {
    // Si no, obtener solo los departamentos asociados a la empresa y al usuario
    query = `
      SELECT d.* 
      FROM departamentos d 
      INNER JOIN empresa_departamento ed ON d.id = ed.departamento_id 
      INNER JOIN user_empresas ue ON ed.empresa_id = ue.empresa_id 
      WHERE ed.empresa_id = ? AND ue.user_id = ?
      ORDER BY d.nombre ASC
    `;
    params.push(userId);
  }

  dbempresa.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error al obtener departamentos de la empresa:', err.message);
      res.status(500).json({ error: 'Error al obtener departamentos de la empresa.' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/verificar-asociacion', require('./middleware/authenticate'), (req, res) => {
  const { departamentoId, empresaId } = req.query;

  if (!departamentoId || !empresaId) {
      return res.status(400).json({ error: 'Se requieren departamentoId y empresaId' });
  }

  const query = `
      SELECT COUNT(*) as count
      FROM empresa_departamento
      WHERE departamento_id = ? AND empresa_id = ?
  `;

  dbempresa.get(query, [departamentoId, empresaId], (err, row) => {
      if (err) {
          console.error('Error al verificar la asociación:', err.message);
          return res.status(500).json({ error: 'Error al verificar la asociación' });
      }

      const asociados = row.count > 0;

      res.json({
          asociados: asociados,
          departamentoId: departamentoId,
          empresaId: empresaId
      });
  });
});

app.delete('/api/eliminar-asociacion', require('./middleware/authenticate'), (req, res) => {
  const { departamentoId, empresaId } = req.body;

  if (!departamentoId || !empresaId) {
      return res.status(400).json({ error: 'Se requieren departamentoId y empresaId' });
  }

  const query = 'DELETE FROM empresa_departamento WHERE departamento_id = ? AND empresa_id = ?';

  dbempresa.run(query, [departamentoId, empresaId], function(err) {
      if (err) {
          console.error('Error al eliminar la asociación:', err.message);
          return res.status(500).json({ error: 'Error al eliminar la asociación' });
      }

      if (this.changes === 0) {
          return res.status(404).json({ message: 'No se encontró la asociación especificada' });
      }

      res.json({ message: 'Asociación eliminada con éxito' });
  });
});

app.delete('/api/eliminar-departamento/:departamentoId', require('./middleware/authenticate'), (req, res) => {
  const { departamentoId } = req.params;

  // Primero, eliminar todas las asociaciones del departamento
  const deleteAssociationsQuery = 'DELETE FROM empresa_departamento WHERE departamento_id = ?';
  
  dbempresa.run(deleteAssociationsQuery, [departamentoId], function(err) {
      if (err) {
          console.error('Error al eliminar asociaciones del departamento:', err.message);
          return res.status(500).json({ error: 'Error al eliminar asociaciones del departamento' });
      }

      // Luego, eliminar el departamento
      const deleteDepartmentQuery = 'DELETE FROM departamentos WHERE id = ?';
      
      dbempresa.run(deleteDepartmentQuery, [departamentoId], function(err) {
          if (err) {
              console.error('Error al eliminar el departamento:', err.message);
              return res.status(500).json({ error: 'Error al eliminar el departamento' });
          }

          if (this.changes === 0) {
              return res.status(404).json({ message: 'No se encontró el departamento especificado' });
          }

          res.json({ message: 'Departamento y sus asociaciones eliminados con éxito' });
      });
  });
});

// Endpoints API
app.get('/api/usuarios', (req, res) => {
  dbuser.all('SELECT id, username, email, password, nivel_privilegio FROM users ORDER BY username ASC', (err, rows) => {
      if (err) {
          console.error('Error al obtener usuarios:', err.message);
          res.status(500).json({ error: 'Error al obtener usuarios.' });
      } else {
          res.json(rows); // Envía la lista de usuarios como JSON
      }
  });
});


// Endpoint para obtener la lista de departamentos de una empresa específica
app.get('/api/departamentos/:empresaId', require('./middleware/authenticate'), (req, res) => {
  const empresaId = req.params.empresaId;
  const query = `
    SELECT d.* 
    FROM departamentos d
    INNER JOIN empresa_departamento ed ON d.id = ed.departamento_id
    WHERE ed.empresa_id = ?
    ORDER BY d.nombre ASC
  `;
  
  dbempresa.all(query, [empresaId], (err, rows) => {
    if (err) {
      console.error('Error al obtener departamentos:', err.message);
      res.status(500).json({ error: 'Error al obtener departamentos.' });
    } else {
      res.json(rows);
    }
  });
});

// Endpoint para obtener la lista de procesos de un departamento específico
app.get('/api/procesos/:departamentoId', require('./middleware/authenticate'), (req, res) => {
  const departamentoId = req.params.departamentoId;

  const query = `
    SELECT DISTINCT p.id, p.nombre
    FROM procesos p
    JOIN rutas_procesos_departamentos rpd ON p.id = rpd.proceso_id
    WHERE rpd.departamento_id = ?
    ORDER BY p.nombre ASC
  `;
  
  dbRutas.all(query, [departamentoId], (err, rows) => {
    if (err) {
      console.error('Error al obtener procesos:', err.message);
      res.status(500).json({ error: 'Error al obtener procesos.' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/pasos', (req, res) => {
  const { empresaId, departamentoId, procesoId } = req.query;

  console.log('Parámetros recibidos (sin procesar):', req.query);
  console.log('Parámetros recibidos:', { empresaId, departamentoId, procesoId });

  // Validar que todos los parámetros necesarios estén presentes
  if (!empresaId || !departamentoId || !procesoId) {
    console.log('Error: Faltan parámetros requeridos');
    return res.status(400).json({ error: 'Se requieren empresaId, departamentoId y procesoId' });
  }

  // Convertir parámetros a enteros
  const empresaIdInt = parseInt(empresaId);
  const departamentoIdInt = parseInt(departamentoId);
  const procesoIdInt = parseInt(procesoId);

  // Verificar que la conversión fue exitosa
  if (isNaN(empresaIdInt) || isNaN(departamentoIdInt) || isNaN(procesoIdInt)) {
    console.log('Error: Los parámetros deben ser números válidos');
    return res.status(400).json({ error: 'Los parámetros deben ser números válidos' });
  }

  // Verificar la existencia de las tablas y sus datos
  const tableCheckQuery = `
    SELECT 
      (SELECT COUNT(*) FROM rutas) as rutas_count,
      (SELECT COUNT(*) FROM rutas_procesos_departamentos) as rpd_count
  `;

  dbRutas.get(tableCheckQuery, [], (err, row) => {
    if (err) {
      console.error('Error al verificar las tablas:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
    }

    console.log('Número de entradas en rutas:', row.rutas_count);
    console.log('Número de entradas en rutas_procesos_departamentos:', row.rpd_count);

    if (row.rutas_count === 0 || row.rpd_count === 0) {
      return res.status(404).json({ message: 'No hay datos en las tablas necesarias' });
    }

    // Verificar la existencia de asociaciones para los parámetros dados
    const verificationQuery = `
      SELECT COUNT(*) as count
      FROM rutas_procesos_departamentos
      WHERE empresa_id = $empresaId AND departamento_id = $departamentoId AND proceso_id = $procesoId
    `;

    dbRutas.get(verificationQuery, {
      $empresaId: empresaIdInt,
      $departamentoId: departamentoIdInt,
      $procesoId: procesoIdInt
    }, (err, row) => {
      if (err) {
        console.error('Error al verificar existencia de datos:', err.message);
        return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
      }

      console.log('Número de entradas en rutas_procesos_departamentos:', row.count);

      if (row.count === 0) {
        return res.status(404).json({ message: 'No se encontraron asociaciones para los parámetros proporcionados' });
      }

      // Consulta principal
      const query = `
      SELECT r.id, r.orden, r.descripcion_corta, r.descripcion_detallada, r.tipo_contenido, r.url_contenido
      FROM rutas_procesos_departamentos rpd
      LEFT JOIN rutas r ON rpd.ruta_id = r.id
      WHERE rpd.empresa_id = $empresaId
      AND rpd.departamento_id = $departamentoId
      AND rpd.proceso_id = $procesoId
      ORDER BY r.orden
    `;

      console.log('Query SQL:', query);
      console.log('Parámetros de la query:', { empresaIdInt, departamentoIdInt, procesoIdInt });

      dbRutas.all(query, {
        $empresaId: empresaIdInt,
        $departamentoId: departamentoIdInt,
        $procesoId: procesoIdInt
      }, (err, rows) => {
        if (err) {
          console.error('Error al ejecutar la consulta:', err.message);
          return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
        }

        console.log('Número de filas devueltas:', rows.length);
        console.log('Resultados:', rows);

        if (rows.length === 0) {
          console.log('No se encontraron resultados para los parámetros proporcionados');
          return res.status(404).json({ message: 'No se encontraron pasos para los parámetros proporcionados' });
        }

        res.json(rows);
      });
    });
  });
});

app.get('/api/obtener-datos-ruta', (req, res) => {
  const { empresaId, departamentoId, procesoId, orden } = req.query;

  console.log('Parámetros recibidos:', { empresaId, departamentoId, procesoId, orden });

  if (!empresaId || !departamentoId || !procesoId || !orden) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }

  const query = `
      SELECT r.id, r.orden, r.descripcion_corta, r.descripcion_detallada, r.tipo_contenido, r.url_contenido
      FROM rutas r
      JOIN rutas_procesos_departamentos rpd ON r.id = rpd.ruta_id
      WHERE rpd.empresa_id = ? AND rpd.departamento_id = ? AND rpd.proceso_id = ? AND r.orden = ?
  `;

  dbRutas.get(query, [empresaId, departamentoId, procesoId, orden], (err, row) => {
      if (err) {
          console.error('Error al obtener datos de la ruta:', err.message);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (row) {
          res.json({
              id: row.id,
              orden: row.orden,
              descripcion_corta: row.descripcion_corta,
              descripcion_detallada: row.descripcion_detallada,
              tipo_contenido: row.tipo_contenido,
              url_contenido: row.url_contenido
          });
      } else {
          res.status(404).json({ error: 'Ruta no encontrada' });
      }
  });
});

app.get('/api/detalle-paso', (req, res) => {
  const { id } = req.query;

  console.log('Parámetro recibido (sin procesar):', req.query);
  console.log('ID del paso recibido:', id);

  // Validar que el parámetro necesario esté presente
  if (!id) {
    console.log('Error: Falta el parámetro requerido');
    return res.status(400).json({ error: 'Se requiere el ID del paso' });
  }

  // Convertir parámetro a entero
  const pasoIdInt = parseInt(id);

  // Verificar que la conversión fue exitosa
  if (isNaN(pasoIdInt)) {
    console.log('Error: El ID del paso debe ser un número válido');
    return res.status(400).json({ error: 'El ID del paso debe ser un número válido' });
  }

  // Verificar la existencia de la tabla y sus datos
  const tableCheckQuery = `
    SELECT COUNT(*) as rutas_count FROM rutas
  `;

  dbRutas.get(tableCheckQuery, [], (err, row) => {
    if (err) {
      console.error('Error al verificar la tabla:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
    }

    console.log('Número de entradas en rutas:', row.rutas_count);

    if (row.rutas_count === 0) {
      return res.status(404).json({ message: 'No hay datos en la tabla de rutas' });
    }

    // Consulta principal
    const query = `
      SELECT r.id, r.orden, r.descripcion_corta, r.descripcion_detallada, r.tipo_contenido, r.url_contenido,
             rpd.empresa_id, rpd.departamento_id, rpd.proceso_id
      FROM rutas r
      LEFT JOIN rutas_procesos_departamentos rpd ON r.id = rpd.ruta_id
      WHERE r.id = $pasoId
    `;

    console.log('Query SQL:', query);
    console.log('Parámetro de la query:', { pasoIdInt });

    dbRutas.get(query, { $pasoId: pasoIdInt }, (err, row) => {
      if (err) {
        console.error('Error al ejecutar la consulta:', err.message);
        return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
      }

      console.log('Resultado:', row);

      if (!row) {
        console.log('No se encontró ningún paso con el ID proporcionado');
        return res.status(404).json({ message: 'No se encontró ningún paso con el ID proporcionado' });
      }

      res.json(row);
    });
  });
});

app.delete('/api/detalle-paso/:id', (req, res) => {
  const { id } = req.params;

  console.log('ID del paso a eliminar:', id);

  // Validar que el ID sea un número válido
  const pasoIdInt = parseInt(id);
  if (isNaN(pasoIdInt)) {
    console.log('Error: El ID del paso debe ser un número válido');
    return res.status(400).json({ error: 'El ID del paso debe ser un número válido' });
  }

  // Iniciar una transacción para asegurar la integridad de los datos
  dbRutas.serialize(() => {
    dbRutas.run('BEGIN TRANSACTION');

    // Primero, eliminar las entradas relacionadas en rutas_procesos_departamentos
    const deleteRPDQuery = 'DELETE FROM rutas_procesos_departamentos WHERE ruta_id = ?';
    dbRutas.run(deleteRPDQuery, pasoIdInt, function(err) {
      if (err) {
        console.error('Error al eliminar de rutas_procesos_departamentos:', err.message);
        dbRutas.run('ROLLBACK');
        return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
      }

      // Luego, eliminar el paso de la tabla rutas
      const deleteRutaQuery = 'DELETE FROM rutas WHERE id = ?';
      dbRutas.run(deleteRutaQuery, pasoIdInt, function(err) {
        if (err) {
          console.error('Error al eliminar de rutas:', err.message);
          dbRutas.run('ROLLBACK');
          return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
        }

        if (this.changes === 0) {
          dbRutas.run('ROLLBACK');
          return res.status(404).json({ message: 'No se encontró ningún paso con el ID proporcionado' });
        }

        dbRutas.run('COMMIT');
        res.json({ message: 'Paso eliminado con éxito', deletedId: pasoIdInt });
      });
    });
  });
});

// Endpoint para validar si un número de orden ya existe en un proceso específico
app.get('/api/validarOrden', (req, res) => {
  const { proceso, orden } = req.query;

  console.log('el proceso es: ',proceso,'el orden es: ',orden);

  if (!proceso || !orden) {
    return res.status(400).json({ error: 'Parámetros proceso y orden son requeridos' });
  }

  // Consulta SQL para verificar si el número de orden ya existe en el proceso
  const query = 'SELECT COUNT(*) AS count FROM rutas WHERE proceso_id = ? AND orden = ?';

  dbRutas.get(query, [proceso, orden], (err, row) => {
    if (err) {
      console.error('Error al validar el número de orden:', err.message);
      return res.status(500).json({ error: 'Error al validar el número de orden' });
    }
  console.log('conteo: ', row.count);  
    // Devolver true si el número de orden ya existe, de lo contrario false
    if (row.count > 0) {
      res.json({ existe: true });
    } else {
      res.json({ existe: false });
    }
  });
});

// Endpoint para obtener el número de orden más alto para un proceso y empresa específicos
app.get('/api/obtenerOrdenMaximo', (req, res) => {
  const { proceso, empresa_id } = req.query;

  console.log('Proceso ID:', proceso, 'Empresa ID:', empresa_id);

  if (!proceso || !empresa_id) {
    return res.status(400).json({ error: 'Parámetros proceso y empresa_id son requeridos' });
  }

  // Consulta SQL para obtener el número de orden más alto
  const query = `
    SELECT MAX(orden) AS max_orden 
    FROM rutas 
    WHERE proceso_id = ? AND empresa_id = ?
  `;

  dbRutas.get(query, [proceso, empresa_id], (err, row) => {
    if (err) {
      console.error('Error al obtener el número de orden máximo:', err.message);
      return res.status(500).json({ error: 'Error al obtener el número de orden máximo' });
    }

    const maxOrden = row.max_orden || 0; // Si no hay resultados, devuelve 0
    console.log('Número de orden máximo:', maxOrden);

    res.json({ maxOrden: maxOrden });
  });
}); 


// Endpoint para asignar usuarios a una empresa
app.post('/api/asignar-usuarios', (req, res) => {
  const { empresa_id, user_ids } = req.body;

  if (!empresa_id || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ error: 'Datos de entrada inválidos' });
  }

  // Prepara la consulta para insertar los registros en la tabla user_empresas
  const placeholders = user_ids.map(() => '(?, ?)').join(', ');
  const values = [];
  user_ids.forEach(user_id => {
      values.push(user_id, empresa_id);
  });

  const query = `INSERT INTO user_empresas (user_id, empresa_id) VALUES ${placeholders}`;

  dbUserEmpresa.run(query, values, function(err) {
      if (err) {
          console.error('Error al insertar asignaciones:', err.message);
          return res.status(500).json({ error: 'Error al asignar usuarios a la empresa' });
      }
      res.json({ message: 'Asignación realizada correctamente' });
  });
});

// Endpoint para crear un nuevo departamento
app.post('/api/crear-departamento', (req, res) => {
  const { nombre, empresaId } = req.body;

  if (!nombre) {
    return res.status(400).json({ success: false, message: 'El nombre del departamento es requerido.' });
  }

  dbempresa.serialize(() => {
    dbempresa.run('BEGIN TRANSACTION');

    dbempresa.run('INSERT INTO departamentos (nombre) VALUES (?)', [nombre], function(err) {
      if (err) {
        dbempresa.run('ROLLBACK');
        console.error('Error al insertar departamento:', err.message);
        return res.status(500).json({ success: false, message: 'Error al crear el departamento.' });
      }

      const departamentoId = this.lastID;

      if (empresaId) {
        dbempresa.run('INSERT INTO empresa_departamento (empresa_id, departamento_id) VALUES (?, ?)', 
          [empresaId, departamentoId], 
          (err) => {
            if (err) {
              dbempresa.run('ROLLBACK');
              console.error('Error al asociar departamento con empresa:', err.message);
              return res.status(500).json({ success: false, message: 'Error al asociar el departamento con la empresa.' });
            }

            dbempresa.run('COMMIT');
            res.status(201).json({ 
              success: true, 
              message: 'Departamento creado y asociado con éxito.', 
              id: departamentoId 
            });
          }
        );
      } else {
        dbempresa.run('COMMIT');
        res.status(201).json({ 
          success: true, 
          message: 'Departamento creado con éxito.', 
          id: departamentoId 
        });
      }
    });
  });
});

// Endpoints adicionales
app.get('/verificar-usuario/:username', (req, res) => {
  const username = req.params.username;

  dbuser.get('SELECT username, email FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      res.status(500).send("Error al verificar el usuario.");
    } else if (row) {
      res.json({ exists: true, email: row.email });
    } else {
      res.json({ exists: false });
    }
  });
});

app.get('/verificar-email/:email', (req, res) => {
  const email = req.params.email;

  dbuser.get('SELECT email FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      res.status(500).send("Error al verificar el email.");
    } else if (row) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  });
});

// Verificación de empresa
app.get('/verificar-nombre-empresa/:nombreEmpresa', (req, res) => {
  const nombreEmpresa = req.params.nombreEmpresa;

  dbempresa.get('SELECT * FROM empresas WHERE nombre = ?', [nombreEmpresa], (err, row) => {
    if (err) {
      console.error('Error al verificar el nombre de la empresa:', err.message);
      res.status(500).json({ error: 'Error al verificar el nombre de la empresa.' });
    } else if (row) {
      res.json({
        exists: true,
        id: row.id,
        nombre: row.nombre,
        direccion: row.direccion,
        telefono: row.telefono,
        email: row.email,
        nif: row.nif,
        ceo_id: row.ceo_id
      });
    } else {
      res.json({ exists: false });
    }
  });
});

// Verificación de NIF
app.get('/verificar-nif/:nif', (req, res) => {
  const nif = req.params.nif;

  dbempresa.get('SELECT nif FROM empresas WHERE nif = ?', [nif], (err, row) => {
    if (err) {
      res.status(500).send("Error al verificar el NIF.");
    } else if (row) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  });
});

// Endpoint para obtener la lista de procesos
app.get('/api/procesos', (req, res) => {
  dbRutas.all('SELECT id, nombre FROM procesos ORDER BY nombre ASC', (err, rows) => {
      if (err) {
          console.error('Error al obtener procesos:', err.message);
          res.status(500).json({ error: 'Error al obtener procesos.' });
      } else {
          res.json(rows); // Envía la lista completa de procesos como JSON
      }
  });
});

// Endpoint para obtener el último número de orden de un proceso dentro de una empresa específica
app.get('/api/procesos/:procesoId/empresa/:empresaId/ultimoOrden', (req, res) => {
  const { procesoId, empresaId } = req.params;

  const query = 'SELECT MAX(orden) AS ultimoOrden FROM rutas WHERE proceso_id = ? AND empresa_id = ?';
  dbRutas.get(query, [procesoId, empresaId], (err, row) => {
      if (err) {
          console.error('Error al obtener el último número de orden:', err.message);
          res.status(500).json({ error: 'Error al obtener el último número de orden.' });
      } else {
          // Devuelve el último orden encontrado, o 0 si no existe
          res.json({ ultimoOrden: row.ultimoOrden || 0 });
      }
  });
});




// Rutas POST
app.post('/gestion-rutas', require('./middleware/authenticate'), require('./auth/rutasRegister'));
app.post('/registroRutas', require('./middleware/authenticate'), upload.single('archivo'), require('./auth/rutasRegister'));
app.post('/registro', require('./middleware/authenticate'), require('./auth/register'));
app.post('/registroDepartamento', 
  require('./middleware/authenticate'), 
  (req, res, next) => {
      console.log('Solicitud recibida para registrar departamento:', req.body);
      next();
  },
  require('./auth/registerDepartamentos')
);
app.post('/registroProceso', 
  require('./middleware/authenticate'), 
  (req, res, next) => {
    console.log('Solicitud recibida para registrar proceso:', req.body);
    next();
  },
  require('./auth/registerProcesos')
);
app.post('/registroProyectos', require('./middleware/authenticate'), require('./auth/registerProyectos'));
app.post('/registroPromesas', require('./middleware/authenticate'), require('./auth/registerPromesas'));
app.post('/registroEmpresa', require('./middleware/authenticate'), require('./auth/registerEmpresas'));
app.post('/login', require('./auth/login'));
app.post('/modificar-usuario', require('./middleware/authenticate'), require('./modificar/modificarUsers'));
app.put('/modificar-empresa/:id', require('./middleware/authenticate'), require('./modificar/modificarEmpresa'));
app.put('/api/proyectos/:id', require('./middleware/authenticate'), require('./modificar/modificarProyectos'));
app.put('/api/promesas/:id', require('./middleware/authenticate'), require('./modificar/modificarPromesas'));
app.put('/api/modificar-paso/:id', 
  require('./middleware/authenticate'), 
  upload.single('archivo'), // 'archivo' debe coincidir con el nombre del campo en el formulario
  require('./modificar/modificarRuta')
);
app.post('/eliminar-usuario', require('./middleware/authenticate'), require('./borrar/borrarUsers'));
app.delete('/eliminar-empresa/:id', require('./middleware/authenticate'), require('./borrar/borrarEmpresas'));

app.get('/check-auth', require('./middleware/authenticate'), (req, res) => {
  if (req.user) {
      res.json({ 
        username: req.user.username,  
        nivel_privilegio: req.user.nivel_privilegio 
      });
  } else {
      res.status(401).json({ error: 'No autenticado' });
  }
});

app.get('/check-auth-empresa', require('./middleware/authenticate'), (req, res) => {
  res.json({ username: req.user.username });
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Obtener usuario de la base de datos
    dbuser.get('SELECT * FROM usuarios WHERE username = ?', [username], async (err, user) => {
      if (err) {
        console.error('Error al buscar usuario:', err.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { username: user.username, nivel_privilegio: user.nivel_privilegio },
        secretKey,
        { expiresIn: TOKEN_EXPIRATION }
      );

      res.cookie('token', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000 // 1 hora en milisegundos
      });

      res.json({ 
        message: 'Inicio de sesión exitoso',
        user: { username: user.username, nivel_privilegio: user.nivel_privilegio }
      });
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});




