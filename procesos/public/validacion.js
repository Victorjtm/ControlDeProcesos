// Función principal para validar el formulario
function validarFormulario() {
    // Obtener valores de los campos de entrada del formulario
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const nivelPrivilegio = document.getElementById("nivelPrivilegio").value.trim();

    // Variables para control de errores
    let usernameValido = false;
    let emailValido = false;
    let passwordValido = false;
    let confirmPasswordValido = false;
    let nivelPrivilegioValido = false;

    // Validación de nombre de usuario
    if (username.length > 3 && username.length < 20) {
        usernameValido = true;
        document.getElementById("usernameError").style.display = "none";
    } else {
        document.getElementById("usernameError").textContent = "El nombre de usuario debe tener entre 4 y 19 caracteres.";
        document.getElementById("usernameError").style.display = "block";
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

    // Validación de longitud de password
    if (password.length > 8 && password.length < 16) {
        passwordValido = true;
        document.getElementById("passwordError").style.display = "none";
    } else {
        document.getElementById("passwordError").textContent = "La contraseña debe tener entre 9 y 15 caracteres.";
        document.getElementById("passwordError").style.display = "block";
    }

    // Validación de coincidencia de password y confirmPassword
    if (password === confirmPassword) {
        confirmPasswordValido = true;
        document.getElementById("confirmPasswordError").style.display = "none";
    } else {
        document.getElementById("confirmPasswordError").textContent = "Las contraseñas no coinciden.";
        document.getElementById("confirmPasswordError").style.display = "block";
    }

    // Validación del nivel de privilegio
    const nivelPrivilegioInt = parseInt(nivelPrivilegio, 10);
    if (Number.isInteger(nivelPrivilegioInt) && nivelPrivilegioInt >= 0 && nivelPrivilegioInt <= 9) {
        nivelPrivilegioValido = true;
        document.getElementById("nivelPrivilegioError").style.display = "none";
    } else {
        document.getElementById("nivelPrivilegioError").textContent = "El nivel de privilegio debe estar entre 0 y 9.";
        document.getElementById("nivelPrivilegioError").style.display = "block";
    }

    // Verificar si todos los campos son válidos
    return usernameValido && emailValido && passwordValido && confirmPasswordValido && nivelPrivilegioValido;
}
