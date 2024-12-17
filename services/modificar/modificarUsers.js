const bcrypt = require('bcryptjs');
const dbuser = require('../databases/databaseEmpresa'); // Asegúrate de que esto esté configurado correctamente

const updateUser = async (req, res) => {
const { username, email, password } = req.body;
console.log(req.body);
const nivelPrivilegio = parseInt(req.body.nivel_privilegio, 10);

console.log(nivelPrivilegio);
    
if (!username || !password || !email || isNaN(nivelPrivilegio)) {
  return res.status(400).send("Faltan datos en la solicitud.");
}

  try {
    console.log('el nivel de privilegio es: ', nivelPrivilegio);
    console.log("el usuario longeado es: ", req.user.username);
    console.log("el nivel de privilegio del usuario longeado es: ",req.user.nivel_privilegio);
    const hashedPassword = await bcrypt.hash(password, 10);


    // Asegúrate de que el usuario logueado está intentando modificar su propia cuenta
    if (req.user.username === username || req.user.nivel_privilegio === 1) {
      
      dbuser.run(
        'UPDATE users SET email = ?, password = ?, nivel_privilegio = ? WHERE username = ?', 
        [email, hashedPassword, nivelPrivilegio, username], 
        (err) => {
          if (err) {
            console.error('Error al modificar el usuario:', err.message); // Agrega detalles del error
            res.status(500).send('Error al modificar el usuario.');
          } else {
            res.send('Usuario modificado con éxito.');
          }
        }
      );
      
    } else {
      res.status(403).send('No tienes permisos para modificar este usuario.');
    }
  } catch (error) {
    res.status(500).send('Error al cifrar la contraseña.');
  }
};

module.exports = updateUser;
