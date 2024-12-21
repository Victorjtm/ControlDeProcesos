// Función principal para validar el formulario de rutas
async function validarFormularioRuta() {
    // Obtener valores de los campos de entrada del formulario
    const proceso = document.getElementById("proceso").value.trim();
    const empresaId = document.getElementById("empresa_id_display").textContent.trim();
    const orden = document.getElementById("orden").value.trim();
    const descripcionCorta = document.getElementById("descripcion_corta").value.trim();
    const descripcionDetallada = document.getElementById("descripcion_detallada").value.trim();
    const archivo = document.getElementById("archivo").files[0];

        // Crear y añadir un campo oculto con el ID de la empresa
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'empresa_id';
        hiddenInput.value = empresaId;
        document.getElementById('rutaForm').appendChild(hiddenInput);

    // Variables para control de errores
    let procesoValido = false;
    let empresaValida = false;
    let ordenValido = false;
    let descripcionCortaValida = false;
    let descripcionDetalladaValida = true; // Opcional
    let archivoValido = true; // Opcional

    // Validación de selección de proceso
    if (proceso !== "" && proceso !== "Seleccione un proceso") {
        procesoValido = true;
        document.getElementById("procesoError").style.display = "none";
    } else {
        document.getElementById("procesoError").textContent = "Debe seleccionar un proceso.";
        document.getElementById("procesoError").style.display = "block";
    }

    // Validación de empresa
    if (empresaId !== "") {
        empresaValida = true;
        // Asumiendo que no hay un elemento de error específico para la empresa
    } else {
        alert("Debe seleccionar una empresa antes de continuar.");
        return false;
    }

    // Validación de número de orden
    const ordenNumero = parseInt(orden, 10);
    if (ordenNumero > 0 && Number.isInteger(ordenNumero)) {
        try {
            const response = await fetch(`/api/obtenerOrdenMaximo?proceso=${proceso}&empresa_id=${empresaId}`);
            const data = await response.json();
            if (ordenNumero <= data.maxOrden + 1) {
                ordenValido = true;
                document.getElementById("ordenError").style.display = "none";
            } else {
                document.getElementById("ordenError").textContent = "El número de orden no es válido.";
                document.getElementById("ordenError").style.display = "block";
            }
        } catch (error) {
            console.error('Error al validar el número de orden:', error);
            document.getElementById("ordenError").textContent = "Error al validar el número de orden.";
            document.getElementById("ordenError").style.display = "block";
        }
    } else {
        document.getElementById("ordenError").textContent = "El número de orden debe ser un número entero positivo.";
        document.getElementById("ordenError").style.display = "block";
    }

    // Validación de descripción corta
    if (descripcionCorta.length >= 10 && descripcionCorta.length <= 255) {
        descripcionCortaValida = true;
        document.getElementById("descripcion_cortaError").style.display = "none";
    } else {
        document.getElementById("descripcion_cortaError").textContent = "La descripción corta debe tener entre 10 y 255 caracteres.";
        document.getElementById("descripcion_cortaError").style.display = "block";
    }

    // Validación de descripción detallada (opcional)
    if (descripcionDetallada.length > 0 && descripcionDetallada.length <= 1000) {
        descripcionDetalladaValida = true;
        document.getElementById("descripcion_detalladaError").style.display = "none";
    } else if (descripcionDetallada.length > 1000) {
        descripcionDetalladaValida = false;
        document.getElementById("descripcion_detalladaError").textContent = "La descripción detallada no debe exceder los 1000 caracteres.";
        document.getElementById("descripcion_detalladaError").style.display = "block";
    }

// Validación de archivo adjunto (opcional)
if (archivo) {
    const tipoArchivo = archivo.type;
    const tiposPermitidos = [
        'image/jpeg', 
        'image/png', 
        'video/mp4', 
        'audio/mpeg', 
        'video/avi', 
        'video/x-matroska', 
        'image/gif',
        'video/webm'  // Añadido para permitir archivos WebM
    ];
    if (tiposPermitidos.includes(tipoArchivo)) {
        archivoValido = true;
        document.getElementById("archivoError").style.display = "none";
    } else {
        archivoValido = false;
        document.getElementById("archivoError").textContent = "El archivo adjunto debe ser una imagen, video, audio o animación válidos.";
        document.getElementById("archivoError").style.display = "block";
        console.log("Tipo de archivo no permitido:", tipoArchivo); // Para depuración
    }
}

    // Verificar si todos los campos requeridos son válidos
    return procesoValido && empresaValida && ordenValido && descripcionCortaValida && descripcionDetalladaValida && archivoValido;
}
