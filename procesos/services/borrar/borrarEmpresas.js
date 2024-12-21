// Importa la conexión a la base de datos de empresas
const dbempresa = require('../databases/databaseEmpresa');

// Exporta la función que maneja la solicitud de eliminación de una empresa
module.exports = (req, res) => {
  // Extrae el nombre de la empresa del cuerpo de la solicitud
  const { nombreEmpresa } = req.body;
  // Extrae el ID de la empresa de los parámetros de la solicitud
  const empresaId = req.params.id;

  // Verifica si el usuario autenticado tiene los privilegios necesarios
  // Solo usuarios con nivel de privilegio 1 o 2 pueden eliminar empresas
  if (req.user.nivel_privilegio !== 1 && req.user.nivel_privilegio !== 2) {
    // Si el usuario no tiene los privilegios necesarios, devuelve un error 403 (Forbidden)
    return res.status(403).send('No tienes privilegios suficientes para eliminar empresas.');
  }

  // Busca en la base de datos si la empresa con el ID proporcionado existe
  dbempresa.get('SELECT id FROM empresas WHERE id = ?', [empresaId], (err, row) => {
    // Si hay un error al realizar la consulta, registra el error y devuelve un error 500 (Internal Server Error)
    if (err) {
      console.error('Error al obtener la empresa:', err);
      return res.status(500).send('Error interno del servidor.');
    }
    
    // Si no se encuentra la empresa (es decir, `row` es `null`), devuelve un error 404 (Not Found)
    if (!row) {
      return res.status(404).send('Empresa no encontrada.');
    }

    // Si la empresa existe, procede a eliminarla de la base de datos
    dbempresa.run('DELETE FROM empresas WHERE id = ?', [empresaId], (err) => {
      // Si ocurre un error al intentar eliminar la empresa, registra el error y devuelve un error 500
      if (err) {
        console.error('Error al eliminar la empresa:', err);
        return res.status(500).send('Error al eliminar la empresa.');
      }
      
      // Si la eliminación es exitosa, envía una respuesta 200 (OK) confirmando la eliminación
      res.status(200).send('Empresa eliminada con éxito.');
    });
  });
};
