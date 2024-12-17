const dbempresa = require('../databases/databaseEmpresa'); // Asegúrate de que esto esté configurado correctamente

const registerEmpresas = async (req, res) => {
  const nombreEmpresa = req.body.nombreEmpresa;
  const direccion = req.body.direccion;
  const telefono = req.body.telefono;
  const email = req.body.email;
  const nif = req.body.nif;
  const ceo_id = req.body.ceo_id;

  if (!nombreEmpresa || !email || !nif) {
    return res.status(400).json({ error: "Faltan datos en la solicitud." });
  }

  try {
    dbempresa.get('SELECT * FROM empresas WHERE email = ?', [email], (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Error al verificar el email." });
      }
      if (row) {
        return res.status(400).json({ error: "El email ya está registrado." });
      }

      dbempresa.get('SELECT * FROM empresas WHERE nif = ?', [nif], (err, row) => {
        if (err) {
          return res.status(500).json({ error: "Error al verificar el NIF." });
        }
        if (row) {
          return res.status(400).json({ error: "El NIF ya está registrado." });
        }

        const stmt = dbempresa.prepare("INSERT INTO empresas (nombre, direccion, telefono, email, nif, ceo_id) VALUES (?, ?, ?, ?, ?, ?)");
        stmt.run(nombreEmpresa, direccion, telefono, email, nif, ceo_id, (err) => {
          if (err) {
            return res.status(500).json({ error: "Error al guardar la empresa." });
          }
          res.status(200).json({ message: "Empresa registrada con éxito." });
        });
        stmt.finalize();
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Error inesperado." });
  }
};

module.exports = registerEmpresas