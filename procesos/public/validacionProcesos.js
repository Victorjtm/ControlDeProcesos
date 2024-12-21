// Función principal para validar el formulario de registro de procesos
function validarFormularioProceso() {
    // Obtener valores de los campos de entrada del formulario
    const nombre = document.getElementById("nombreProceso").value.trim();
    const departamento = document.getElementById("departamento_id").value;
    const empresa = document.getElementById("empresa_id").value;

    // Variables para control de errores
    let nombreValido = false;
    let departamentoValido = false;
    let empresaValida = false;

    // Validación de nombre del proceso
    if (nombre.length >= 2 && nombre.length <= 50) {
        nombreValido = true;
        document.getElementById("nombreError").style.display = "none";
    } else {
        document.getElementById("nombreError").textContent = "El nombre del proceso debe tener entre 2 y 50 caracteres.";
        document.getElementById("nombreError").style.display = "block";
    }

    // Validación de selección de departamento
    if (departamento !== "") {
        departamentoValido = true;
        document.getElementById("departamentoIdError").style.display = "none";
    } else {
        document.getElementById("departamentoIdError").textContent = "Debe seleccionar un departamento.";
        document.getElementById("departamentoIdError").style.display = "block";
    }

    // Validación de selección de empresa
    if (empresa !== "") {
        empresaValida = true;
        document.getElementById("empresaIdError").style.display = "none";
    } else {
        document.getElementById("empresaIdError").textContent = "Debe seleccionar una empresa.";
        document.getElementById("empresaIdError").style.display = "block";
    }

    // Verificar si todos los campos son válidos
    return nombreValido && departamentoValido && empresaValida;
}

// Función para limpiar los mensajes de error
function limpiarErrores() {
    const errores = document.getElementsByClassName("error");
    for (let error of errores) {
        error.style.display = "none";
    }
}

// Evento para limpiar errores cuando se modifica un campo
document.getElementById("nombreProceso").addEventListener("input", limpiarErrores);
document.getElementById("departamento_id").addEventListener("change", limpiarErrores);
document.getElementById("empresa_id").addEventListener("change", limpiarErrores);

// Evento para validar el formulario antes de enviarlo
document.getElementById("registroProcesoForm").addEventListener("submit", function(event) {
    if (!validarFormularioProceso()) {
        event.preventDefault(); // Previene el envío del formulario si no es válido
    }
});