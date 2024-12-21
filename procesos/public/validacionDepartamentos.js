// Función principal para validar el formulario de registro de departamentos
function validarFormularioDepartamento() {
    // Obtener valores de los campos de entrada del formulario
    const nombre = document.getElementById("nombreDepartamento").value.trim();
    const empresa = document.getElementById("empresa_id").value;

    // Variables para control de errores
    let nombreValido = false;
    let empresaValida = false;

    // Validación de nombre del departamento
    if (nombre.length >= 2 && nombre.length <= 50) {
        nombreValido = true;
        document.getElementById("empresaNombreError").style.display = "none";
    } else {
        document.getElementById("empresaNombreError").textContent = "El nombre del departamento debe tener entre 2 y 50 caracteres.";
        document.getElementById("empresaNombreError").style.display = "block";
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
    return nombreValido && empresaValida;
}

// Función para limpiar los mensajes de error
function limpiarErrores() {
    const errores = document.getElementsByClassName("error");
    for (let error of errores) {
        error.style.display = "none";
    }
}

// Evento para limpiar errores cuando se modifica un campo
document.getElementById("nombreDepartamento").addEventListener("input", limpiarErrores);
document.getElementById("empresa_id").addEventListener("change", limpiarErrores);

// Evento para validar el formulario antes de enviarlo
document.getElementById("registroDepartamentoForm").addEventListener("submit", function(event) {
    if (!validarFormularioDepartamento()) {
        event.preventDefault(); // Previene el envío del formulario si no es válido
    }
});