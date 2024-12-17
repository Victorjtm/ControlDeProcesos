// Función para comprobar si el usuario está autenticado
async function checkAuthentication() {
    try {
        const response = await fetch('/check-auth'); // Solicitud al backend para verificar autenticación
        const userInfo = document.getElementById('user-info');
        const logoutButton = document.getElementById('logout');
        const tokenTimerElement = document.getElementById('token-timer');

        if (response.status === 200) { // Si la respuesta es exitosa y el usuario está autenticado
            const user = await response.json(); // Extrae la información del usuario de la respuesta
            userInfo.innerText = `Usuario conectado: ${user.username}`; // Muestra el nombre de usuario en la interfaz
            logoutButton.style.display = 'inline-block'; // Muestra el botón de logout
            tokenTimerElement.style.display = 'inline'; // Muestra el temporizador del token
            updateTokenTimer(); // Iniciar el temporizador
            setInterval(updateTokenTimer, 1000); // Actualizar cada segundo
        } else if (response.status === 401) { // Si la respuesta es un 401 (no autorizado)
            userInfo.innerText = 'Ningún usuario conectado'; // Indica que no hay un usuario autenticado
            logoutButton.style.display = 'none'; // Oculta el botón de logout
            tokenTimerElement.style.display = 'none'; // Oculta el temporizador del token
            setTimeout(() => {
                window.location.href = '/login'; // Redirige después de un breve retraso
            }, 2000);
        } else { // Para cualquier otro código de estado inesperado
            console.error('Error desconocido:', response.status);
        }
    } catch (error) { // Manejo de cualquier error que ocurra durante la solicitud
        console.error('Error checking authentication:', error);
        document.getElementById('user-info').innerText = 'Ningún usuario conectado';
        document.getElementById('logout').style.display = 'none';
        document.getElementById('token-timer').style.display = 'none';
    }
}

// Función para manejar el logout
async function handleLogout() {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            credentials: 'same-origin'
        });
        if (response.ok) {
            document.getElementById('user-info').innerText = 'Ningún usuario conectado';
            document.getElementById('logout').style.display = 'none';
            document.getElementById('token-timer').style.display = 'none';
            localStorage.removeItem('tokenExpiration');
            
            // Redirigir al usuario a la página de login
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

// Función para actualizar el temporizador del token
function updateTokenTimer() {
    const tokenExpiration = localStorage.getItem('tokenExpiration');
    const tokenTimerElement = document.getElementById('token-timer');
    const timeLeftElement = document.getElementById('time-left');

    if (tokenExpiration && tokenTimerElement && timeLeftElement) {
        const timeLeft = Math.max(0, Math.floor((parseInt(tokenExpiration) - Date.now()) / 1000));
        
        if (timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timeLeftElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            tokenTimerElement.style.display = 'inline';
        } else {
            tokenTimerElement.style.display = 'none';
            handleLogout(); // Cerrar sesión automáticamente cuando el token expire
        }
    } else if (tokenTimerElement) {
        tokenTimerElement.style.display = 'none';
    }
}

// Asignar el manejador de eventos al botón de logout después de cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout); // Asigna el manejador de eventos al botón de logout
    } else {
        console.error('El botón de logout no se encontró en el DOM');
    }
});

// Llamar a la función al cargar la página
window.onload = checkAuthentication; // Ejecuta la verificación de autenticación cuando la ventana se carga



