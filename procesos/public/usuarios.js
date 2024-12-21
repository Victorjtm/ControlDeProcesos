// Función para verificar si el usuario existe
function verificarUsuario() {
    const username = document.getElementById("username").value.trim();
    if (username) {
        fetch(`/verificar-usuario/${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.exists) {
                    document.getElementById('email').value = data.email;
                    document.getElementById('mensaje').textContent = 'Usuario encontrado. Se han rellenado los campos disponibles.';
                    document.getElementById('mensaje').style.color = 'blue';
                } else {
                    document.getElementById('mensaje').textContent = 'Usuario no encontrado.';
                    document.getElementById('mensaje').style.color = 'orange';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('mensaje').textContent = 'Error al verificar el usuario.';
                document.getElementById('mensaje').style.color = 'red';
            });
    }
}

// Función para verificar si el correo electrónico existe
function verificarEmail() {
    const email = document.getElementById("email").value.trim(); // Obtener el correo electrónico del campo de entrada
    if (email) {
        // Realizar una solicitud para verificar si el correo electrónico existe
        fetch(`/verificar-email/${email}`)
            .then(response => response.json())
            .then(data => {
                if (data.exists) {
                    document.getElementById('mensaje').textContent = 'Email ya registrado.';
                    document.getElementById('mensaje').style.color = 'orange';
                } else {
                    document.getElementById('mensaje').textContent = 'Email disponible.';
                    document.getElementById('mensaje').style.color = 'blue';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('mensaje').textContent = 'Error al verificar el email.';
                document.getElementById('mensaje').style.color = 'red';
            });
    }
}

// Función para eliminar el usuario
function eliminarUsuario() {
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Verificar que se haya ingresado una contraseña
        if (!password) {
            document.getElementById('mensaje').textContent = 'Por favor, ingresa tu contraseña para confirmar la eliminación de la cuenta.';
            document.getElementById('mensaje').style.color = 'red';
            return;
        }

        // Verificar que la contraseña y la confirmación coincidan
        if (password !== confirmPassword) {
            document.getElementById('mensaje').textContent = 'La contraseña y la confirmación no coinciden.';
            document.getElementById('mensaje').style.color = 'red';
            return;
        }

        obtenerUsuarioLogueado()
            .then(usuarioLogueado => {
                if (usuarioLogueado === username || usuarioLogueado.nivel_privilegio === 1) {
                    return fetch('/eliminar-usuario', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ username, password })
                    });
                } else {
                    throw new Error('No puedes eliminar un usuario diferente al que está logueado.');
                }
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(text || 'Network response was not ok');
                    });
                }
                return response.text();
            })
            .then(message => {
                document.getElementById('mensaje').textContent = message;
                document.getElementById('mensaje').style.color = 'green';
                // Redirigir al usuario a la página de inicio o de login después de un breve delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('mensaje').textContent = 'Error: ' + error.message;
                document.getElementById('mensaje').style.color = 'red';
            });
    }
}

// Función para modificar el usuario
function modificarUsuario() {
    if (validarFormulario()) {
        obtenerUsuarioLogueado()
            .then(usuarioLogueado => {
                const username = document.getElementById('username').value.trim();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value.trim();
                const nivel_privilegio = document.getElementById('nivelPrivilegio').value.trim();

                console.log(usuarioLogueado.nivel_privilegio);

                if (usuarioLogueado.username === username || usuarioLogueado.nivel_privilegio === 1) {
                    return fetch('/modificar-usuario', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ username, email, password, nivel_privilegio })
                    });
                } else {
                    throw new Error('No puedes modificar un usuario diferente al que está logueado.');
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
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

// Función para manejar la obtención y visualización de la lista de usuarios
function manejarGestionUsuarios() {
    const userListContainer = document.getElementById('userList');
    const isVisible = userListContainer.style.display === 'block';

    // Alternar visibilidad del contenedor
    if (!isVisible) {
        userListContainer.style.display = 'block'; // Mostrar el contenedor

        // Realizar una solicitud GET al servidor para obtener la lista de usuarios
        fetch('/api/usuarios')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener la lista de usuarios');
                }
                return response.json();
            })
            .then(data => {
                const tbody = userListContainer.querySelector('tbody');
                tbody.innerHTML = ''; // Limpiar cualquier contenido previo

                if (data.length > 0) {
                    data.forEach(user => {
                        const row = document.createElement('tr');
                        row.dataset.userId = user.id; // Añadir un data attribute para el ID del usuario
                        row.innerHTML = `
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${user.nivel_privilegio}</td>
                        `;
                        row.addEventListener('click', () => seleccionarUsuario(user));
                        tbody.appendChild(row);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="3">No se encontraron usuarios.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const tbody = userListContainer.querySelector('tbody');
                tbody.innerHTML = '<tr><td colspan="3">Hubo un error al obtener la lista de usuarios.</td></tr>';
            });
    } else {
        userListContainer.style.display = 'none'; // Ocultar el contenedor
    }
}

// Función que se llama cuando se selecciona un usuario
function seleccionarUsuario(user) {
    // Rellenar los campos del formulario con los datos del usuario seleccionado
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
    document.getElementById('password').value = ''; // Si necesitas establecer una contraseña, cámbiala aquí
    document.getElementById('confirmPassword').value = ''; // Igual para la confirmación de contraseña

    // Opcional: Ocultar la tabla de usuarios después de seleccionar
    document.getElementById('userList').style.display = 'none';
}


// Función para enviar el formulario
function enviarFormulario(event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const nivel_privilegio = document.getElementById('nivelPrivilegio').value.trim();

    // Verificar si el usuario ya existe
    fetch(`/verificar-usuario/${username}`)
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                // Si el usuario ya existe, mostrar mensaje de error
                document.getElementById('mensaje').textContent = 'No se puede volver a registrar un usuario ya registrado.';
                document.getElementById('mensaje').style.color = 'red';
                return; // Salir de la función si el usuario ya existe
            } else {
                // Verificar si el email ya existe
                fetch(`/verificar-email/${email}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.exists) {
                            // Si el email ya existe, mostrar mensaje de error
                            document.getElementById('mensaje').textContent = 'No se puede volver a registrar un email ya registrado.';
                            document.getElementById('mensaje').style.color = 'red';
                            return; // Salir de la función si el email ya existe
                        } else {
                            // Si ambos son válidos, proceder con el registro
                            if (validarFormulario()) {
                                
                                fetch('/registro', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ username, email, password, nivel_privilegio })
                                })
                                .then(response => {
                                    if (!response.ok) {
                                        return response.text().then(text => { throw new Error(text); });
                                    }
                                    
                                    return response.text();
                                })
                                .then(message => {
                                    document.getElementById('mensaje').textContent = message;
                                    document.getElementById('mensaje').style.color = 'green';
                                })
                                .catch(error => {
                                    document.getElementById('mensaje').textContent = error.message;
                                    document.getElementById('mensaje').style.color = 'red';
                                });
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error al verificar el email:', error);
                        document.getElementById('mensaje').textContent = 'Error al verificar el email.';
                        document.getElementById('mensaje').style.color = 'red';
                    });
            }
        })
        .catch(error => {
            console.error('Error al verificar el usuario:', error);
            document.getElementById('mensaje').textContent = 'Error al verificar el usuario.';
            document.getElementById('mensaje').style.color = 'red';
        });
}



