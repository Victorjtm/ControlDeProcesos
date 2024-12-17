// Espera a que el DOM se haya cargado completamente antes de ejecutar el código
document.addEventListener('DOMContentLoaded', function() {
    // Función para validar el nombre de usuario
    function validarUsername() {
        // Obtiene el valor del campo de nombre de usuario
        const username = document.getElementById('username').value;
        // Obtiene el elemento para mostrar mensajes de error de nombre de usuario
        const usernameError = document.getElementById('usernameError');
        // Limpia los mensajes de error anteriores
        usernameError.textContent = '';
        // Asegura que el mensaje de error esté oculto inicialmente
        usernameError.style.display = 'none';

        // Validación del nombre de usuario: verifica si tiene entre 3 y 20 caracteres
        if (username.length < 3 || username.length > 20) {
            // Si no es válido, establece un mensaje de error en el elemento correspondiente
            usernameError.textContent = 'El nombre de usuario debe tener entre 3 y 20 caracteres.';
            // Muestra el mensaje de error
            usernameError.style.display = 'block';
        }
    }

    // Función para validar la contraseña
    function validarPassword() {
        // Obtiene el valor del campo de contraseña
        const password = document.getElementById('password').value;
        // Obtiene el elemento para mostrar mensajes de error de contraseña
        const passwordError = document.getElementById('passwordError');
        // Limpia los mensajes de error anteriores
        passwordError.textContent = '';
        // Asegura que el mensaje de error esté oculto inicialmente
        passwordError.style.display = 'none';

        // Validación de la contraseña: verifica si tiene entre 8 y 16 caracteres
        if (password.length < 8 || password.length > 16) {
            // Si no es válido, establece un mensaje de error en el elemento correspondiente
            passwordError.textContent = 'La contraseña debe tener entre 8 y 16 caracteres.';
            // Muestra el mensaje de error
            passwordError.style.display = 'block';
        }
    }

    // Asocia la función validarUsername al evento blur del campo de nombre de usuario
    document.getElementById('username').addEventListener('blur', validarUsername);

    // Asocia la función validarPassword al evento blur del campo de contraseña
    document.getElementById('password').addEventListener('blur', validarPassword);
});