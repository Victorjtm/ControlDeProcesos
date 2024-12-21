const dbempresa = require('../databases/databaseEmpresa');

const registerDepartamentos = async (req, res) => {
  const { nombre: nombreDepartamento, empresaId } = req.body;

  if (!nombreDepartamento || !empresaId) {
    return res.status(400).json({ error: "Faltan datos en la solicitud." });
  }

  try {
    // Iniciar transacción
    await new Promise((resolve, reject) => {
      dbempresa.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Verificar si el departamento existe y si está asociado a la empresa
    const verificacion = await new Promise((resolve, reject) => {
      dbempresa.get(
        'SELECT d.id, CASE WHEN ed.empresa_id IS NOT NULL THEN 1 ELSE 0 END as asociado ' +
        'FROM departamentos d ' +
        'LEFT JOIN empresa_departamento ed ON d.id = ed.departamento_id AND ed.empresa_id = ? ' +
        'WHERE d.nombre = ?',
        [empresaId, nombreDepartamento],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (verificacion) {
      if (verificacion.asociado) {
        await new Promise((resolve) => dbempresa.run('ROLLBACK', resolve));
        return res.status(400).json({ error: "El departamento ya está registrado y asociado a esta empresa." });
      } else {
        // El departamento existe pero no está asociado a esta empresa
        await new Promise((resolve, reject) => {
          dbempresa.run(
            'INSERT INTO empresa_departamento (empresa_id, departamento_id) VALUES (?, ?)',
            [empresaId, verificacion.id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    } else {
      // El departamento no existe, se procede a registrarlo
      const result = await new Promise((resolve, reject) => {
        dbempresa.run(
          'INSERT INTO departamentos (nombre) VALUES (?)',
          [nombreDepartamento],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      await new Promise((resolve, reject) => {
        dbempresa.run(
          'INSERT INTO empresa_departamento (empresa_id, departamento_id) VALUES (?, ?)',
          [empresaId, result],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Confirmar transacción
    await new Promise((resolve) => dbempresa.run('COMMIT', resolve));

    res.status(200).json({ message: "Departamento registrado o asociado con éxito." });
  } catch (error) {
    await new Promise((resolve) => dbempresa.run('ROLLBACK', resolve));
    console.error('Error en registerDepartamentos:', error);
    res.status(500).json({ error: "Error inesperado al registrar o asociar el departamento." });
  }
};

module.exports = registerDepartamentos;

