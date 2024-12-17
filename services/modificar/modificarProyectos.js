const dbProyectos = require('../databases/databaseProcesos');

const modificarProyecto = async (req, res) => {
  const { nombre_proyecto, descripcion_proyecto } = req.body;
  const proyectoId = req.params.id;

  if (!nombre_proyecto || !descripcion_proyecto) {
    return res.status(400).json({ error: "Faltan datos en la solicitud." });
  }

  try {
    // Verificar el nivel de privilegio del usuario si es necesario
    // if (req.user.nivel_privilegio !== 1 && req.user.nivel_privilegio !== 2) {
    //   return res.status(403).json({ error: 'No tienes privilegios suficientes para modificar proyectos.' });
    // }

    dbProyectos.run(
      'UPDATE proyectos SET nombre_proyecto = ?, descripcion_proyecto = ? WHERE id_proyecto = ?',
      [nombre_proyecto, descripcion_proyecto, proyectoId],
      function(err) {
        if (err) {
          console.error('Error al modificar el proyecto:', err);
          return res.status(500).json({ error: 'Error al modificar el proyecto.', details: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Proyecto no encontrado.' });
        }
        res.json({ message: 'Proyecto modificado con éxito.', id: proyectoId });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor.', details: error.message });
  }
};

module.exports = modificarProyecto;