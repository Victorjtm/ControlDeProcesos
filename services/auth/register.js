const bcrypt = require('bcryptjs');
const dbuser = require('../databases/databaseEmpresa');

const register = async (req, res) => {
    console.log(req.body);

    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const nivelPrivilegio = parseInt(req.body.nivel_privilegio, 10);

    console.log(nivelPrivilegio);
    
    if (!username || !password || !email || isNaN(nivelPrivilegio)) {
        return res.status(400).send("Faltan datos en la solicitud.");
    }

    try {
        dbuser.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).send("Error al verificar el email.");
            }
            if (row) {
                return res.status(400).send("El email ya está registrado.");
            }

            dbuser.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
                if (err) {
                    return res.status(500).send("Error al verificar el usuario.");
                }
                if (row) {
                    return res.status(400).send("El nombre de usuario ya existe.");
                }

                try {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const stmt = dbuser.prepare("INSERT INTO users (username, email, password, nivel_privilegio) VALUES (?, ?, ?, ?)");
                    stmt.run(username, email, hashedPassword, nivelPrivilegio, (err) => {
                        if (err) {
                            return res.status(500).send("Error al guardar el usuario.");
                        }
                        res.status(200).send("Usuario registrado con éxito.");
                    });
                    stmt.finalize();
                } catch (error) {
                    res.status(500).send("Error al cifrar la contraseña.");
                }
            });
        });
    } catch (error) {
        res.status(500).send("Error inesperado.");
    }
};

module.exports = register;
