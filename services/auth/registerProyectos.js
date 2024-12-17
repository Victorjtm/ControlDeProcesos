const dbProyectos = require('../databases/databaseProcesos');

const registerProyectos = async (req, res) => {
  const { nombre_proyecto, descripcion_proyecto } = req.body;

  if (!nombre_proyecto) {
    return res.status(400).json({ error: "El nombre del proyecto es obligatorio." });
  }

  try {
    // Iniciar transacción
    await new Promise((resolve, reject) => {
      dbProyectos.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Verificar si el proyecto ya existe
    const proyectoExistente = await new Promise((resolve, reject) => {
      dbProyectos.get(
        'SELECT id_proyecto FROM proyectos WHERE nombre_proyecto = ?',
        [nombre_proyecto],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (proyectoExistente) {
      // Si el proyecto ya existe, rollback y enviar mensaje de error
      await new Promise((resolve) => dbProyectos.run('ROLLBACK', resolve));
      return res.status(409).json({ error: "Ya existe un proyecto con ese nombre." });
    }

    // El proyecto no existe, se procede a registrarlo
    const result = await new Promise((resolve, reject) => {
      dbProyectos.run(
        'INSERT INTO proyectos (nombre_proyecto, descripcion_proyecto) VALUES (?, ?)',
        [nombre_proyecto, descripcion_proyecto],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Confirmar transacción
    await new Promise((resolve) => dbProyectos.run('COMMIT', resolve));

    res.status(201).json({ 
      message: "Proyecto registrado con éxito.",
      proyecto: {
        id: result,
        nombre: nombre_proyecto,
        descripcion: descripcion_proyecto
      }
    });
  } catch (error) {
    await new Promise((resolve) => dbProyectos.run('ROLLBACK', resolve));
    console.error('Error en registerProyectos:', error);
    res.status(500).json({ error: "Error inesperado al registrar el proyecto." });
  }
};

module.exports = registerProyectos;