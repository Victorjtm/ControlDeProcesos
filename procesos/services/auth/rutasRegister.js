const db = require('../databases/databaseProcesos');
const path = require('path');

const registerRuta = async (req, res) => {
  console.log('Datos recibidos:', req.body);
  console.log('Archivo recibido:', req.file);

  const {
    empresa_id,
    proceso_id,
    departamento_id,
    orden,
    descripcion_corta,
    descripcion_detallada
  } = req.body;

  const archivo = req.file;

  if (!empresa_id || !proceso_id || !departamento_id || !orden || !descripcion_corta) {
    return res.status(400).json({ error: "Faltan datos requeridos en la solicitud." });
  }

  try {
    // Iniciar una transacción
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Verificar si el proceso existe
    const procesoExiste = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM procesos WHERE id = ?', [proceso_id], (err, row) => {
        if (err) reject(err);
        else resolve(row.count === 1);
      });
    });

    if (!procesoExiste) {
      await new Promise((resolve) => db.run('ROLLBACK', resolve));
      return res.status(400).json({ error: "El proceso especificado no existe." });
    }

    let url_contenido = null;
    let tipo_contenido = null;
    if (archivo) {
      url_contenido = '/uploads/' + path.basename(archivo.path);
      tipo_contenido = archivo.mimetype;
    }

    // Insertar la nueva ruta
    const rutaResult = await new Promise((resolve, reject) => {
      db.run(
        `
        INSERT INTO rutas (
          proceso_id, empresa_id, orden, descripcion_corta, descripcion_detallada, 
          tipo_contenido, url_contenido
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [proceso_id, empresa_id, orden, descripcion_corta, descripcion_detallada, tipo_contenido, url_contenido],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Insertar la asociación en rutas_procesos_departamentos
    await new Promise((resolve, reject) => {
      db.run(
        `
        INSERT INTO rutas_procesos_departamentos (
          ruta_id, proceso_id, departamento_id, empresa_id
        ) VALUES (?, ?, ?, ?)
      `,
        [rutaResult, proceso_id, departamento_id, empresa_id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Confirmar la transacción
    await new Promise((resolve, reject) => {
      db.run('COMMIT', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.status(200).json({ message: "Ruta registrada y asociada con éxito." });
  } catch (error) {
    console.error(error);
    await new Promise((resolve) => db.run('ROLLBACK', resolve));
    res.status(500).json({ error: "Error inesperado al procesar la solicitud." });
  }
};

module.exports = registerRuta;
