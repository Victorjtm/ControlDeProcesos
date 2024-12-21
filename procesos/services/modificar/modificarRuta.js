const db = require('../databases/databaseProcesos');
const path = require('path'); // Asegúrate de importar path

const modificarPaso = async (req, res) => {
    console.log('Iniciando modificación de paso');
    console.log('Datos recibidos:', req.body);
    console.log('ID del paso:', req.params.id);

    const { 
        proceso_id,
        empresa_id,
        departamento_id,
        orden,
        descripcion_corta,
        descripcion_detallada
    } = req.body;

    const pasoId = req.params.id;
    const archivo = req.file;

    // Verificación de datos obligatorios
    const missingFields = [];
    if (!proceso_id) missingFields.push('proceso_id');
    if (!empresa_id) missingFields.push('empresa_id');
    if (!departamento_id) missingFields.push('departamento_id');
    if (!orden) missingFields.push('orden');
    if (!descripcion_corta) missingFields.push('descripcion_corta');

    if (missingFields.length > 0) {
        console.log('Faltan datos obligatorios en la solicitud:', missingFields.join(', '));
        return res.status(400).json({ error: "Faltan datos obligatorios en la solicitud.", missingFields });
    }

    try {
        console.log('Iniciando transacción');
        await new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        let url_contenido = null;
        let tipo_contenido = null; // Variable para almacenar el tipo de contenido

        if (archivo) {
            url_contenido = '/uploads/' + path.basename(archivo.path); // Usa path para obtener el nombre del archivo
            tipo_contenido = archivo.mimetype; // Obtén el tipo de contenido del archivo
            console.log('Nuevo archivo subido:', url_contenido);
            console.log('Tipo de contenido:', tipo_contenido);
        } else {
            console.log('No se subió un nuevo archivo');
        }

        console.log('Ejecutando consulta SQL para actualizar el paso');
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE rutas SET 
                  proceso_id = ?, 
                  empresa_id = ?, 
                  orden = ?, 
                  descripcion_corta = ?,
                  descripcion_detallada = ?,
                  url_contenido = COALESCE(?, url_contenido),
                  tipo_contenido = COALESCE(?, tipo_contenido) -- Actualiza el tipo de contenido
                WHERE id = ?`,
                [
                    proceso_id,
                    empresa_id,
                    orden,
                    descripcion_corta,
                    descripcion_detallada,
                    url_contenido,
                    tipo_contenido, // Añade el tipo de contenido a la consulta
                    pasoId
                ],
                function(err) {
                    if (err) reject(err);
                    else if (this.changes === 0) reject(new Error('Paso no encontrado'));
                    else resolve();
                }
            );
        });

        // Actualizar asociación en rutas_procesos_departamentos
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE rutas_procesos_departamentos SET
                  proceso_id = ?,
                  departamento_id = ?,
                  empresa_id = ?
                WHERE ruta_id = ?`,
                [proceso_id, departamento_id, empresa_id, pasoId],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        await new Promise((resolve, reject) => {
            db.run('COMMIT', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log('Paso modificado con éxito');
        res.json({ message: 'Paso modificado con éxito.', id: pasoId });

    } catch (error) {
        console.error('Error en el bloque try-catch:', error);
        await new Promise((resolve) => db.run('ROLLBACK', resolve));
        res.status(500).json({ error: 'Error al modificar el paso.', details: error.message });
    }
};

module.exports = modificarPaso;