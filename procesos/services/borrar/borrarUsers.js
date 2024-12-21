const bcrypt = require('bcryptjs');
const dbuser = require('../databases/databaseEmpresa');

module.exports = (req, res) => {
  const { username, password } = req.body;
  const loggedInUsername = req.user.username;
  const loggedInPrivilege = req.user.nivel_privilegio;

  // Verificar si el usuario logueado es el mismo que el del formulario o tiene nivel de privilegio 1
  if (loggedInUsername !== username && loggedInPrivilege !== 1) {
    return res.status(403).send('No puedes eliminar una cuenta diferente a la tuya, a menos que tengas privilegios de administrador.');
  }

  // Primero, obtener el hash de la contraseña almacenada
  dbuser.get('SELECT password FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Error al obtener el usuario:', err);
      return res.status(500).send('Error interno del servidor.');
    }
    
    if (!row) {
      return res.status(404).send('Usuario no encontrado.');
    }

    // Verificar la contraseña
    bcrypt.compare(password, row.password, (err, isMatch) => {
      if (err) {
        console.error('Error al comparar contraseñas:', err);
        return res.status(500).send('Error interno del servidor.');
      }

      if (!isMatch) {
        return res.status(401).send('Contraseña incorrecta. No se puede eliminar la cuenta.');
      }

      // Si la contraseña es correcta, proceder con la eliminación
      dbuser.run('DELETE FROM users WHERE username = ?', [username], (err) => {
        if (err) {
          console.error('Error al eliminar el usuario:', err);
          return res.status(500).send('Error al eliminar el usuario.');
        }
        
        res.clearCookie('token');
        res.status(200).send('Usuario eliminado con éxito. Has sido desconectado.');
      });
    });
  });
};
