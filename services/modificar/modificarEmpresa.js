const dbempresa = require('../databases/databaseEmpresa'); // Asegúrate de que esto esté configurado correctamente
console.log("entreando en el backend");
const modificarEmpresa = async (req, res) => {
  const { nombreEmpresa, direccion, telefono, email, nif, ceo_id } = req.body;
  const empresaId = req.params.id;

  if (!nombreEmpresa || !direccion || !telefono || !email || !nif || !ceo_id) {
    return res.status(400).send("Faltan datos en la solicitud.");
  }

  try {
    // Verificar el nivel de privilegio del usuario
    if (req.user.nivel_privilegio !== 1 && req.user.nivel_privilegio !== 2) {
      return res.status(403).send('No tienes privilegios suficientes para modificar empresas.');
    }

    dbempresa.run(
      'UPDATE empresas SET nombre = ?, direccion = ?, telefono = ?, email = ?, nif = ?, ceo_id = ? WHERE id = ?',
      [nombreEmpresa, direccion, telefono, email, nif, ceo_id, empresaId],
      function(err) {
        if (err) {
          console.error('Error al modificar la empresa:', err);
          return res.status(500).send('Error al modificar la empresa.');
        }
        if (this.changes === 0) {
          return res.status(404).send('Empresa no encontrada.');
        }
        res.send('Empresa modificada con éxito.');
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error interno del servidor.');
  }
};

module.exports = modificarEmpresa;