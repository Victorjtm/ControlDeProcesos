// Función para mostrar mensaje de éxito o error después del registro
function mostrarMensajeRegistro() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const mensaje = document.getElementById('mensaje');
    if (success === 'true') {
        mensaje.textContent = 'Guardado con Éxito';
        mensaje.style.color = 'green';
    } else if (success === 'false') {
        mensaje.textContent = 'Error al guardar el usuario';
        mensaje.style.color = 'red';
    }
}
// Función para mostrar mensaje de éxito o error después del registro de la empresa
function mostrarMensajeRegistroEmpresa() {
    // Obtiene los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    // Obtiene el valor del parámetro 'success'
    const success = urlParams.get('success');
    // Obtiene el elemento del DOM donde se mostrará el mensaje
    const mensaje = document.getElementById('mensaje');
    
    // Verifica si el registro fue exitoso
    if (success === 'true') {
        mensaje.textContent = 'Empresa registrada con éxito';
        mensaje.style.color = 'green'; // Cambia el color del mensaje a verde
    } else if (success === 'false') {
        mensaje.textContent = 'Error al registrar la empresa';
        mensaje.style.color = 'red'; // Cambia el color del mensaje a rojo
    }
}