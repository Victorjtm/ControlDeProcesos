const dbPromesas = require('../databases/databaseProcesos');

const modificarPromesa = async (req, res) => {
  console.log('Iniciando modificación de promesa');
  console.log('Datos recibidos:', req.body);
  console.log('ID de promesa:', req.params.id);

  const { 
    nombre_promesa, 
    num_orden_promesa, 
    tipo_id, 
    siguiente_promesa_id, 
    direccion_flecha_id,
    rama_verdadera_id,
    rama_falsa_id,
    inicio_bucle_id,
    fin_bucle_id
  } = req.body;
  const promesaId = req.params.id;

  if (!nombre_promesa || !num_orden_promesa || !tipo_id || !direccion_flecha_id) {
    console.log('Faltan datos obligatorios en la solicitud');
    return res.status(400).json({ error: "Faltan datos obligatorios en la solicitud." });
  }

  try {
    console.log('Ejecutando consulta SQL');
    dbPromesas.run(
      `UPDATE promesa SET 
        nombre_promesa = ?, 
        num_orden_promesa = ?, 
        tipo_promesa = ?, 
        siguiente_promesa_id = ?,
        direccion_flecha_id = ?,
        rama_verdadera_id = ?,
        rama_falsa_id = ?,
        inicio_bucle_id = ?,
        fin_bucle_id = ?
      WHERE id_promesa = ?`,
      [
        nombre_promesa, 
        num_orden_promesa, 
        tipo_id, 
        siguiente_promesa_id || null,
        direccion_flecha_id,
        rama_verdadera_id || null,
        rama_falsa_id || null,
        inicio_bucle_id || null,
        fin_bucle_id || null,
        promesaId
      ],
      function(err) {
        if (err) {
          console.error('Error al modificar la promesa:', err);
          console.log('Detalles del error:', err.message);
          return res.status(500).json({ error: 'Error al modificar la promesa.', details: err.message });
        }
        console.log('Filas afectadas:', this.changes);
        if (this.changes === 0) {
          console.log('Promesa no encontrada');
          return res.status(404).json({ error: 'Promesa no encontrada.' });
        }
        console.log('Promesa modificada con éxito');
        res.json({ message: 'Promesa modificada con éxito.', id: promesaId });
      }
    );
  } catch (error) {
    console.error('Error en el bloque try-catch:', error);
    console.log('Detalles del error:', error.message);
    res.status(500).json({ error: 'Error interno del servidor.', details: error.message });
  }
};

module.exports = modificarPromesa;