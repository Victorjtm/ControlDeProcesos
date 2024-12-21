// Función principal para validar el formulario de registro de empresas
function validarFormularioEmpresa() {
    // Obtener valores de los campos de entrada del formulario
    const nombre = document.getElementById("nombreEmpresa").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const email = document.getElementById("email").value.trim();
    const nif = document.getElementById("nif").value.trim();

    // Variables para control de errores
    let nombreValido = false;
    let direccionValida = false;
    let telefonoValido = false;
    let emailValido = false;
    let nifValido = false;

    // Validación de nombre de la empresa
    if (nombre.length > 2 && nombre.length < 100) {
        nombreValido = true;
        document.getElementById("nombreError").style.display = "none";
    } else {
        document.getElementById("nombreError").textContent = "El nombre de la empresa debe tener entre 3 y 100 caracteres.";
        document.getElementById("nombreError").style.display = "block";
    }

    // Validación de dirección
    if (direccion.length > 5) {
        direccionValida = true;
        document.getElementById("direccionError").style.display = "none";
    } else {
        document.getElementById("direccionError").textContent = "La dirección debe tener al menos 6 caracteres.";
        document.getElementById("direccionError").style.display = "block";
    }

    // Validación de teléfono usando expresión regular
    const telefonoRegex = /^[0-9]{9,15}$/;
    if (telefonoRegex.test(telefono)) {
        telefonoValido = true;
        document.getElementById("telefonoError").style.display = "none";
    } else {
        document.getElementById("telefonoError").textContent = "Ingrese un número de teléfono válido (9-15 dígitos).";
        document.getElementById("telefonoError").style.display = "block";
    }

    // Validación de email usando expresión regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
        emailValido = true;
        document.getElementById("emailError").style.display = "none";
    } else {
        document.getElementById("emailError").textContent = "Ingrese un email válido.";
        document.getElementById("emailError").style.display = "block";
    }

    // Validación de NIF (Número de Identificación Fiscal)
    if (nif.length > 0) {
        nifValido = true;
        document.getElementById("nifError").style.display = "none";
    } else {
        document.getElementById("nifError").textContent = "El NIF es obligatorio.";
        document.getElementById("nifError").style.display = "block";
    }

    // Verificar si todos los campos son válidos
    return nombreValido && direccionValida && telefonoValido && emailValido && nifValido;
}