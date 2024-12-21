// Función para activar la lógica de selección
function activarLogicaDeSeleccion() {
    const empresaCheckboxes = document.querySelectorAll('#empresasTabla input[type="checkbox"]');
    const usuarioCheckboxes = document.querySelectorAll('#usuariosTabla input[type="checkbox"]');

    empresaCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(event) {
            if (event.target.checked) {
                // Desactivar todos los checkboxes de otras empresas
                empresaCheckboxes.forEach(cb => {
                    if (cb !== event.target) {
                        cb.disabled = true;
                        cb.checked = false;
                    }
                });

                // Activar todos los checkboxes de usuarios
                usuarioCheckboxes.forEach(cb => cb.disabled = false);
            } else {
                // Si se desmarca la empresa, reactivar otros checkboxes de empresa y desactivar los de usuarios
                empresaCheckboxes.forEach(cb => cb.disabled = false);
                usuarioCheckboxes.forEach(cb => {
                    cb.disabled = true;
                    cb.checked = false; // Desmarcar usuarios si se desmarca la empresa
                });
            }
        });
    });
}

// Función para cargar los usuarios
function cargarUsuarios() {
    fetch('/api/usuarios')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener usuarios');
            }
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('usuariosTabla');
            tbody.innerHTML = ''; // Limpiar cualquier contenido previo
            data.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" data-id="${user.id}" disabled /></td>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error al cargar usuarios:', error);
        });
}

// Función para cargar las empresas
function cargarEmpresas() {
    fetch('/api/empresas')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener empresas');
            }
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('empresasTabla');
            tbody.innerHTML = ''; // Limpiar cualquier contenido previo
            data.forEach(empresa => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" data-id="${empresa.id}" /></td>
                    <td>${empresa.id}</td>
                    <td>${empresa.nombre}</td>
                    <td>${empresa.nif}</td>
                `;
                tbody.appendChild(row);
            });

            // Después de cargar las empresas, activar la lógica de selección
            activarLogicaDeSeleccion();
        })
        .catch(error => {
            console.error('Error al cargar empresas:', error);
        });
}

// Función para manejar el evento de asignación
function asignarUsuariosAEmpresa() {
    const empresaSeleccionada = document.querySelector('#empresasTabla input[type="checkbox"]:checked');
    const usuariosSeleccionados = document.querySelectorAll('#usuariosTabla input[type="checkbox"]:checked');

    if (!empresaSeleccionada) {
        alert('Debe seleccionar una empresa.');
        return;
    }

    if (usuariosSeleccionados.length === 0) {
        alert('Debe seleccionar al menos un usuario.');
        return;
    }

    // Crear el payload con los IDs seleccionados
    const empresaId = empresaSeleccionada.getAttribute('data-id');
    const userIds = Array.from(usuariosSeleccionados).map(cb => cb.getAttribute('data-id'));

    const payload = {
        empresa_id: empresaId,
        user_ids: userIds
    };

    // Enviar el payload al servidor
    fetch('/api/asignar-usuarios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al asignar usuarios a la empresa');
        }
        return response.json();
    })
    .then(data => {
        alert('Usuarios asignados correctamente');
        // Aquí puedes agregar lógica adicional, como limpiar la selección o actualizar la UI
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al asignar los usuarios');
    });
}











