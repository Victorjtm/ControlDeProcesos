const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbuser = require('../databases/databaseEmpresa');
const secretKey = 'secret123'; // Cambia esto a una clave secreta segura en producción

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Faltan datos en la solicitud." });
  }

  dbuser.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
    if (err) {
      console.error('Error al buscar el usuario:', err);
      return res.status(500).json({ message: "Error al buscar el usuario." });
    } 
    
    console.log('Datos del usuario obtenidos de la base de datos:', {
      id: row.id,
      username: row.username,
      nivel_privilegio: row.nivel_privilegio
    });
    
    if (row && await bcrypt.compare(password, row.password)) {
      const expiresIn = '1h';
      const token = jwt.sign(
        { 
          id: row.id,
          username: row.username,
          nivel_privilegio: row.nivel_privilegio 
        }, 
        secretKey, 
        { expiresIn }
      );
      
      // Calcular la fecha de expiración
      const expiresAt = new Date(Date.now() + 3600000).getTime(); // 1 hora en milisegundos
      
      res.cookie('token', token, { httpOnly: true });
      res.json({ 
        success: true, 
        message: "Login exitoso",
        user: {
          username: row.username,
          nivel_privilegio: row.nivel_privilegio
        },
        token: token,
        expiresAt: expiresAt
      });
    } else {
      res.status(401).json({ message: "Credenciales inválidas." });
    }
  });
};

module.exports = login;