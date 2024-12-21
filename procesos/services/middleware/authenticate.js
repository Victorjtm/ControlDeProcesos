const jwt = require('jsonwebtoken');
const secretKey = 'secret123'; // Cambia esto a una clave secreta segura en producción

const TOKEN_EXPIRATION = '1h'; // Ajusta esto según tus necesidades
const GRACE_PERIOD = 5 * 60; // 5 minutos de período de gracia en segundos

const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  console.log('Token recibido:', token ? 'Presente' : 'No presente');
  
  if (token) {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        console.error('Error al verificar el token:', err);
        if (err.name === 'TokenExpiredError') {
          // Verificar si estamos dentro del período de gracia
          const expiredAt = err.expiredAt.getTime() / 1000;
          const now = Date.now() / 1000;
          if (now - expiredAt < GRACE_PERIOD) {
            // Dentro del período de gracia, renovar el token
            return renewToken(req, res, next);
          }
          return res.status(401).json({ error: 'Token expirado', renewRequired: true });
        }
        return res.status(401).json({ error: 'Token inválido' });
      } else {
        console.log('Token decodificado:', JSON.stringify(decoded, null, 2));
        
        if (!decoded.username || decoded.nivel_privilegio === undefined) {
          console.error('Token decodificado no contiene toda la información necesaria:', decoded);
          return res.status(401).json({ error: 'Información de usuario incompleta' });
        }
        req.user = decoded;
        console.log('req.user establecido:', JSON.stringify(req.user, null, 2));
        
        // Verificar si el token está cerca de expirar y renovarlo si es necesario
        const tokenExp = decoded.exp;
        const now = Math.floor(Date.now() / 1000);
        if (tokenExp - now < GRACE_PERIOD) {
          return renewToken(req, res, next);
        }
        
        next();
      }
    });
  } else {
    res.status(401).json({ error: 'No se proporcionó token' });
  }
};

const renewToken = (req, res, next) => {
  const oldToken = req.cookies.token;
  jwt.verify(oldToken, secretKey, { ignoreExpiration: true }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'No se pudo renovar el token' });
    }
    
    const newToken = jwt.sign(
      { 
        username: decoded.username, 
        nivel_privilegio: decoded.nivel_privilegio 
      }, 
      secretKey, 
      { expiresIn: TOKEN_EXPIRATION }
    );
    
    res.cookie('token', newToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    req.user = decoded;
    next();
  });
};

module.exports = authenticate;