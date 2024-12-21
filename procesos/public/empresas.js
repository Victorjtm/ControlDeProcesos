let empresaIdActual; // Variable global para almacenar el ID de la empresa actual

function verificarNombreEmpresa() {
    const nombreEmpresa = document.getElementById("nombreEmpresa").value.trim();
    console.log('verificando empresa', nombreEmpresa);
    if (nombreEmpresa) {
        fetch(`/verificar-nombre-empresa/${encodeURIComponent(nombreEmpresa)}`)
            .then(response => response.json())
            .then(data => {
                console.log('Datos recibidos:', data);
                const mensajeElemento = document.getElementById('mensaje');
                if (data.exists) {
                    console.log('Empresa encontrada, intentando rellenar campos');
                    // Rellenar los campos del formulario con los datos de la empresa
                    document.getElementById('direccion').value = data.direccion || '';
                    document.getElementById('telefono').value = data.telefono || '';
                    document.getElementById('email').value = data.email || '';
                    document.getElementById('nif').value = data.nif || '';
                    document.getElementById('ceo_id').value = data.ceo_id || '';
                    
                    // Almacenar el ID de la empresa en la variable global
                    empresaIdActual = data.id;
                    console.log('ID de empresa almacenado:', empresaIdActual);

                    mensajeElemento.textContent = 'Empresa encontrada. Se han rellenado los campos disponibles.';
                    mensajeElemento.style.color = 'blue';
                } else {
                    // Limpiar los campos si la empresa no existe
                    document.getElementById('direccion').value = '';
                    document.getElementById('telefono').value = '';
                    document.getElementById('email').value = '';
                    document.getElementById('nif').value = '';
                    document.getElementById('ceo_id').value = '';
                    
                    // Resetear el ID de la empresa actual
                    empresaIdActual = null;
                    console.log('ID de empresa reseteado');

                    mensajeElemento.textContent = 'Nombre de la empresa disponible.';
                    mensajeElemento.style.color = 'green';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const mensajeElemento = document.getElementById('mensaje');
                mensajeElemento.textContent = 'Error al verificar el nombre de la empresa.';
                mensajeElemento.style.color = 'red';
            });
    }
}



function modificarEmpresa() {
    if (validarFormularioEmpresa()) {
        obtenerNivelPrivilegio()
        .then(userData => {
            if (userData.nivel_privilegio !== 1 && userData.nivel_privilegio !== 2) {
                throw new Error('No tienes privilegios suficientes para modificar empresas.');
            }

            if (!empresaIdActual) {
                throw new Error('No se ha seleccionado ninguna empresa para modificar');
            }

            const nombreEmpresa = document.getElementById('nombreEmpresa').value.trim();
            const direccion = document.getElementById('direccion').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const email = document.getElementById('email').value.trim();
            const nif = document.getElementById('nif').value.trim();
            const ceo_id = document.getElementById('ceo_id').value.trim();

            return fetch(`/modificar-empresa/${empresaIdActual}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ nombreEmpresa, direccion, telefono, email, nif, ceo_id })
            });
        })
        .then(response => {
            if (!response || !response.ok) {
                // Manejar casos en que la respuesta es undefined o no es ok
                throw new Error('Error al modificar la empresa: ' + (response ? response.statusText : 'Response es undefined'));
            }
            return response.text();
        })
        .then(message => {
            document.getElementById('mensaje').textContent = message;
            document.getElementById('mensaje').style.color = 'green';
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('mensaje').textContent = 'Error: ' + error.message;
            document.getElementById('mensaje').style.color = 'red';
        });
    }
}


// Función para eliminar la empresa
function eliminarEmpresa() {
    // Solicitar confirmación al usuario antes de proceder con la eliminación
    if (confirm('¿Estás seguro de que quieres eliminar esta empresa? Esta acción no se puede deshacer.')) {

        // Obtener los datos del usuario, incluyendo el nivel de privilegio
        obtenerNivelPrivilegio()
            .then(userData => {
                // Verificar si el usuario tiene privilegios suficientes (1 o 2) para eliminar empresas
                if (userData.nivel_privilegio !== 1 && userData.nivel_privilegio !== 2) {
                    throw new Error('No tienes privilegios suficientes para eliminar empresas.'); // Lanzar error si no tiene privilegios
                }

                // Verificar si se ha seleccionado una empresa para eliminar
                if (!empresaIdActual) {
                    throw new Error('No se ha seleccionado ninguna empresa para eliminar'); // Lanzar error si no se ha seleccionado empresa
                }

                // Enviar una solicitud DELETE al servidor para eliminar la empresa seleccionada
                return fetch(`/eliminar-empresa/${empresaIdActual}`, {
                    method: 'DELETE', // Método HTTP para eliminar
                    headers: {
                        'Content-Type': 'application/json', // Tipo de contenido JSON
                        'Accept': 'application/json' // Espera una respuesta en formato JSON
                    }
                });
            })
            .then(response => {
                // Verificar si la respuesta del servidor es exitosa
                if (!response.ok) {
                    throw new Error('Error al eliminar la empresa: ' + response.statusText); // Lanzar error si la respuesta no es ok
                }
                return response.text(); // Obtener el cuerpo de la respuesta como texto
            })
            .then(message => {
                // Mostrar el mensaje de éxito al usuario
                document.getElementById('mensaje').textContent = message; // Mostrar el mensaje de éxito
                document.getElementById('mensaje').style.color = 'green'; // Cambiar el color del mensaje a verde

                // Redirigir al usuario a la página principal después de un breve retraso
                setTimeout(() => {
                    window.location.href = '/'; // Cambiar la URL a la página principal
                }, 2000); // Retraso de 2 segundos antes de redirigir
            })
            .catch(error => {
                // Manejar errores en el proceso de eliminación
                console.error('Error:', error); // Mostrar error en la consola
                document.getElementById('mensaje').textContent = 'Error: ' + error.message; // Mostrar mensaje de error al usuario
                document.getElementById('mensaje').style.color = 'red'; // Cambiar el color del mensaje a rojo
            });
    }
}

// Función para manejar la obtención y visualización de la lista de empresas
function manejarGestionEmpresas() {
    const empresaListContainer = document.getElementById('empresaList');
    const isVisible = empresaListContainer.style.display === 'block';

    // Alternar visibilidad del contenedor
    if (!isVisible) {
        empresaListContainer.style.display = 'block'; // Mostrar el contenedor

        // Realizar una solicitud GET al servidor para obtener la lista de empresas
        fetch('/api/empresas')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener la lista de empresas');
                }
                return response.json();
            })
            .then(data => {
                const tbody = empresaListContainer.querySelector('tbody');
                tbody.innerHTML = ''; // Limpiar cualquier contenido previo

                if (data.length > 0) {
                    data.forEach(empresa => {
                        const row = document.createElement('tr');
                        row.dataset.empresaId = empresa.id; // Añadir un data attribute para el ID de la empresa
                        row.innerHTML = `
                            <td>${empresa.id}</td>
                            <td>${empresa.nombre}</td>
                            <td>${empresa.nif}</td>
                        `;
                        row.addEventListener('click', () => seleccionarEmpresa(empresa));
                        tbody.appendChild(row);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="3">No se encontraron empresas.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const tbody = empresaListContainer.querySelector('tbody');
                tbody.innerHTML = '<tr><td colspan="3">Hubo un error al obtener la lista de empresas.</td></tr>';
            });
    } else {
        empresaListContainer.style.display = 'none'; // Ocultar el contenedor
    }
}

// Función que se llama cuando se selecciona una empresa
function seleccionarEmpresa(empresa) {
    // Rellenar los campos del formulario con los datos de la empresa seleccionada
    document.getElementById('nombreEmpresa').value = empresa.nombre;
    document.getElementById('direccion').value = empresa.direccion;
    document.getElementById('telefono').value = empresa.telefono;
    document.getElementById('email').value = empresa.email;
    document.getElementById('nif').value = empresa.nif;
    document.getElementById('ceo_id').value = empresa.ceo_id;
    empresaIdActual = empresa.id;

    console.log("la empresa seleccionada es: ", empresaIdActual);

    // Opcional: Ocultar la tabla de empresas después de seleccionar
    document.getElementById('empresaList').style.display = 'none';
}

// Función para enviar el formulario de registro de empresas
function enviarFormularioRegistro() {
    const nombreEmpresa = document.getElementById('nombreEmpresa').value;
    const direccion = document.getElementById('direccion').value;
    const telefono = document.getElementById('telefono').value;
    const email = document.getElementById('email').value;
    const nif = document.getElementById('nif').value;
    const ceo_id = document.getElementById('ceo_id').value;

    fetch('/registroEmpresa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombreEmpresa, direccion, telefono, email, nif, ceo_id }),
        credentials: 'include' // Importante para incluir las cookies en la solicitud
    })
    .then(response => response.json())
    .then(data => {
        const mensajeDiv = document.getElementById('mensaje');
        if (data.error) {
            console.error('Error:', data.error);
            mensajeDiv.textContent = `Error: ${data.error}`;
            mensajeDiv.style.color = 'red'; // Cambia el color del texto a rojo para errores
        } else {
            console.log('Éxito:', data.message);
            mensajeDiv.textContent = `Éxito: ${data.message}`;
            mensajeDiv.style.color = 'green'; // Cambia el color del texto a verde para éxito
            
            // Esperar 3 segundos y luego limpiar el formulario
            setTimeout(() => {
                limpiarFormulario();
                mensajeDiv.textContent = ''; // Limpiar el mensaje después de 3 segundos
            }, 3000);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        const mensajeDiv = document.getElementById('mensaje');
        mensajeDiv.textContent = 'Error al procesar la solicitud.';
        mensajeDiv.style.color = 'red';
    });
}

function limpiarFormulario() {
    document.getElementById('nombreEmpresa').value = '';
    document.getElementById('direccion').value = '';
    document.getElementById('telefono').value = '';
    document.getElementById('email').value = '';
    document.getElementById('nif').value = '';
    document.getElementById('ceo_id').value= '';
    // Limpiar otros campos si es necesario
}

