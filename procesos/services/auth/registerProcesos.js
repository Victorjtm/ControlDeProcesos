const dbProcesos = require('../databases/databaseProcesos');

const registerProcesos = async (req, res) => {
  const { nombre: nombreProceso, descripcion, departamentoId, empresaId } = req.body;

  if (!nombreProceso || !departamentoId || !empresaId) {
    return res.status(400).json({ error: "Faltan datos en la solicitud." });
  }

  try {
    // Iniciar transacción
    await new Promise((resolve, reject) => {
      dbProcesos.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Verificar si el proceso ya existe
    const procesoExistente = await new Promise((resolve, reject) => {
      dbProcesos.get(
        'SELECT id FROM procesos WHERE nombre = ?',
        [nombreProceso],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    let procesoId;

    if (procesoExistente) {
      procesoId = procesoExistente.id;
    } else {
      // El proceso no existe, se procede a registrarlo
      const result = await new Promise((resolve, reject) => {
        dbProcesos.run(
          'INSERT INTO procesos (nombre, descripcion) VALUES (?, ?)',
          [nombreProceso, descripcion],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      procesoId = result;
    }

    // Crear la asociación sin ruta_id
    await new Promise((resolve, reject) => {
      dbProcesos.run(
        'INSERT INTO rutas_procesos_departamentos (proceso_id, departamento_id, empresa_id) VALUES (?, ?, ?)',
        [procesoId, departamentoId, empresaId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Confirmar transacción
    await new Promise((resolve) => dbProcesos.run('COMMIT', resolve));

    res.status(200).json({ message: "Proceso registrado y asociado con éxito.", procesoId: procesoId });
  } catch (error) {
    await new Promise((resolve) => dbProcesos.run('ROLLBACK', resolve));
    console.error('Error en registerProcesos:', error);
    res.status(500).json({ error: "Error inesperado al registrar o asociar el proceso." });
  }
};

module.exports = registerProcesos;