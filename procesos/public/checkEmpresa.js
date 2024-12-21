// Espera a que el DOM se haya cargado completamente antes de ejecutar el código
document.addEventListener('DOMContentLoaded', function() {
    // Realiza una solicitud al servidor para verificar la autenticación de la empresa
    fetch('/check-auth-empresa')
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
            // Obtiene el elemento del DOM donde se mostrará la información de la empresa
            const empresaInfo = document.getElementById('empresa-info');
            // Verifica si el objeto de datos contiene un nombre de empresa
            if (data.nombreEmpresa) {
                // Si el nombre de la empresa está presente, muestra el nombre de la empresa logueada
                empresaInfo.textContent = `Empresa logueada: ${data.nombreEmpresa}`;
            } else {
                // Si no hay nombre de empresa, indica que la empresa no está logueada
                empresaInfo.textContent = 'No estás logueado como empresa';
            }
        })
        .catch(error => {
            // Captura y maneja cualquier error que ocurra durante la solicitud
            console.error('Error:', error.message);
            // Muestra un mensaje indicando que no hay ninguna empresa conectada
            document.getElementById('empresa-info').textContent = 'Ninguna empresa conectada.';
        });
  });