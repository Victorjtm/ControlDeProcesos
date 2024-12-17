const dbPromesas = require('../databases/databaseProcesos');

const registerPromesas = async (req, res) => {
  const { 
    nombre_promesa, 
    num_orden_promesa, 
    tipo_id, 
    id_proyecto, 
    siguiente_promesa_id, 
    direccion_flecha_id,
    rama_verdadera_id,
    rama_falsa_id,
    inicio_bucle_id,
    fin_bucle_id
  } = req.body;

  // Consolas para verificar qué datos se reciben
  console.log('Datos recibidos:', req.body);

  // Validar que los campos obligatorios estén presentes
  if (!nombre_promesa || !num_orden_promesa || !tipo_id || !id_proyecto || !direccion_flecha_id) {
    console.error("Faltan campos obligatorios:", {
      nombre_promesa,
      num_orden_promesa,
      tipo_id,
      id_proyecto,
      direccion_flecha_id
    });
    return res.status(400).json({ error: "Los campos nombre, número de orden, tipo, proyecto y dirección de flecha son obligatorios." });
  }

  try {
    // Iniciar transacción
    await new Promise((resolve, reject) => {
      dbPromesas.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Verificar si la promesa ya existe para este proyecto
    const promesaExistente = await new Promise((resolve, reject) => {
      dbPromesas.get(
        'SELECT id_promesa FROM promesa WHERE nombre_promesa = ? AND id_proyecto = ?',
        [nombre_promesa, id_proyecto],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (promesaExistente) {
      // Si la promesa ya existe, rollback y enviar mensaje de error
      await new Promise((resolve) => dbPromesas.run('ROLLBACK', resolve));
      return res.status(409).json({ error: "Ya existe una promesa con ese nombre en este proyecto." });
    }

    // Verificar si el número de orden ya está en uso para este proyecto
    const ordenExistente = await new Promise((resolve, reject) => {
      dbPromesas.get(
        'SELECT id_promesa FROM promesa WHERE num_orden_promesa = ? AND id_proyecto = ?',
        [num_orden_promesa, id_proyecto],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (ordenExistente) {
      // Si el número de orden ya está en uso, rollback y enviar mensaje de error
      await new Promise((resolve) => dbPromesas.run('ROLLBACK', resolve));
      return res.status(409).json({ error: "El número de orden ya está en uso para este proyecto." });
    }

    // La promesa no existe y el número de orden está disponible, se procede a registrarla
    const result = await new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO promesa (
          nombre_promesa, num_orden_promesa, tipo_promesa, id_proyecto, 
          siguiente_promesa_id, direccion_flecha_id, rama_verdadera_id, 
          rama_falsa_id, inicio_bucle_id, fin_bucle_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        nombre_promesa, 
        num_orden_promesa, 
        tipo_id, 
        id_proyecto,
        siguiente_promesa_id || null, 
        direccion_flecha_id,
        rama_verdadera_id || null, 
        rama_falsa_id || null,
        inicio_bucle_id || null, 
        fin_bucle_id || null
      ];
      dbPromesas.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    // Confirmar transacción
    await new Promise((resolve) => dbPromesas.run('COMMIT', resolve));

    res.status(201).json({ 
      message: "Promesa registrada con éxito.",
      promesa: {
        id: result,
        nombre: nombre_promesa,
        num_orden: num_orden_promesa,
        tipo_id: tipo_id,
        id_proyecto: id_proyecto,
        siguiente_promesa_id: siguiente_promesa_id || null,
        direccion_flecha_id: direccion_flecha_id,
        rama_verdadera_id: rama_verdadera_id || null,
        rama_falsa_id: rama_falsa_id || null,
        inicio_bucle_id: inicio_bucle_id || null,
        fin_bucle_id: fin_bucle_id || null
      }
    });
  } catch (error) {
    await new Promise((resolve) => dbPromesas.run('ROLLBACK', resolve));
    console.error('Error en registerPromesas:', error);
    res.status(500).json({ error: "Error inesperado al registrar la promesa." });
  }
};

module.exports = registerPromesas;