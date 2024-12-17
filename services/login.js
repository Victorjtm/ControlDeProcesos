const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dbuser = require('./databases/databaseEmpresa'); // Asegúrate de que esta ruta sea correcta

const secretKey = 'secret123'; // Usa la misma clave que en authenticate.js
const TOKEN_EXPIRATION = '1h'; // Duración del token

const login = async (req, res) => {
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
};

module.exports = { login };