// Espera a que el DOM se haya cargado completamente antes de ejecutar el código
document.addEventListener('DOMContentLoaded', function() {
  // Realiza una solicitud al servidor para verificar la autenticación del usuario
  
  fetch('/check-auth')
      .then(response => {
          // Verifica si la respuesta del servidor es exitosa
          if (!response.ok) {
              // Si la respuesta no es exitosa, obtiene el texto de la respuesta y lanza un error
              return response.text().then(text => { throw new Error(text) });
          }
          // Convierte la respuesta a un objeto JSON si es exitosa
          return response.json();
      })
      .then(data => {
          // Obtiene el elemento del DOM donde se mostrará la información del usuario
          const userInfo = document.getElementById('user-info');
          // Verifica si el objeto de datos contiene un nombre de usuario
          if (data.username) {
              // Si el nombre de usuario está presente, muestra el nombre de usuario logueado
              userInfo.textContent = `Usuario logueado: ${data.username}`;
          } else {
              // Si no hay nombre de usuario, indica que el usuario no está logueado
              userInfo.textContent = 'No estás logueado';
          }
      })
      .catch(error => {
          // Captura y maneja cualquier error que ocurra durante la solicitud
          console.error('Error:', error.message);
          // Muestra un mensaje indicando que no hay ningún usuario conectado
          document.getElementById('user-info').textContent = 'Ningún usuario conectado.';
      });
});