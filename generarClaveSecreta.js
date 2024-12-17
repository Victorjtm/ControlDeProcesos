const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
console.log(secret);  // Esto generará una clave secreta segura
