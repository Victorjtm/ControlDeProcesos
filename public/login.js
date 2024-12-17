// Variable global para la URL de login
const LOGIN_URL = '/login';

function startTokenExpirationTimer() {
    console.log('Iniciando temporizador de expiración del token...');
    setInterval(() => {
        if (isTokenExpired()) {
            console.log('El token ha expirado.');
            handleTokenExpiration();
        } else {
            console.log('El token es válido.');
        }
    }, 60000); // Verificar cada minuto
}

function handleTokenExpiration() {
    showMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', true);
    
    // Limpiar datos de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    // Limpiar cualquier otro dato de sesión si es necesario
    
    // Retrasar la redirección para que el mensaje sea visible
    setTimeout(() => {
        console.log('Redirigiendo al login...');
        // Redirigir a la página de login con un parámetro
        window.location.href = `${LOGIN_URL}?expired=true`;
    }, 9000);
}

function isTokenExpired() {
    const expiration = localStorage.getItem('tokenExpiration');
    const tokenSetTime = localStorage.getItem('tokenSetTime');
    if (!expiration || !tokenSetTime) {
        console.log('No se encontró la información del token. El token está considerado como expirado.');
        return true;
    }
    const now = Date.now();
    const expirationDate = parseInt(expiration);
    const tokenAge = now - parseInt(tokenSetTime);
    const maxAge = 60 * 60 * 1000; // 1 minuto en milisegundos
    const isExpired = now > expirationDate || tokenAge > maxAge;
    console.log(`Fecha actual: ${new Date(now).toISOString()}`);
    console.log(`Fecha de expiración: ${new Date(expirationDate).toISOString()}`);
    console.log(`Edad del token: ${tokenAge} ms`);
    console.log(`Estado: ${isExpired ? 'Expirado' : 'Válido'}`);
    return isExpired;
}
function showMessage(message, isError) {
    let messageBox = document.getElementById('message-box');
    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.id = 'message-box';
        document.body.insertBefore(messageBox, document.body.firstChild);
    }
    messageBox.textContent = message;
    messageBox.className = 'message ' + (isError ? 'error' : 'success');
    messageBox.style.display = 'block';
    
    // No ocultar el mensaje automáticamente si es un error de expiración
    if (!message.includes('sesión ha expirado')) {
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    }
}


export { startTokenExpirationTimer, isTokenExpired, showMessage };