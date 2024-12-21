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

function seleccionarEmpresa(empresa) {
    document.getElementById('empresa_id_display').textContent = empresa.id;
    document.getElementById('empresa_nombre_display').textContent = empresa.nombre;
    document.getElementById('empresaList').style.display = 'none';
    
    // Mostrar la sección de departamentos
    document.getElementById('departamento-section').style.display = 'block';
    
    // Resetear la selección de departamento
    document.getElementById('departamento_id_display').textContent = 'No seleccionado';
    document.getElementById('departamento_nombre_display').textContent = 'No seleccionado';
    document.getElementById('departamentosList').style.display = 'none';
}

function manejarGestionDepartamentos() {
    const departamentoListContainer = document.getElementById('departamentosList');
    if (!departamentoListContainer) {
        console.error('El elemento departamentosList no existe');
        return;
    }

    const isVisible = departamentoListContainer.style.display === 'block';

    if (!isVisible) {
        departamentoListContainer.style.display = 'block';

        const empresaId = document.getElementById('empresa_id_display').textContent;

        if (empresaId === 'No seleccionada') {
            departamentoListContainer.innerHTML = '<p>Por favor, seleccione una empresa primero.</p>';
            return;
        }

        departamentoListContainer.innerHTML = '<p>Cargando departamentos...</p>';

        fetch(`/api/departamentos-por-empresa/${empresaId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const tbody = document.createElement('tbody');

                if (data.length > 0) {
                    data.forEach(departamento => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${departamento.id}</td>
                            <td>${departamento.nombre}</td>
                        `;
                        row.addEventListener('click', () => seleccionarDepartamento(departamento));
                        tbody.appendChild(row);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="2">No se encontraron departamentos para esta empresa.</td></tr>';
                }

                departamentoListContainer.innerHTML = '';
                const table = document.createElement('table');
                table.appendChild(tbody);
                departamentoListContainer.appendChild(table);
            })
            .catch(error => {
                console.error('Error:', error);
                departamentoListContainer.innerHTML = `<p>Error al obtener departamentos: ${error.message}</p>`;
            });
    } else {
        departamentoListContainer.style.display = 'none';
    }
}
// ... (código previo sin cambios)

function seleccionarDepartamento(departamento) {
    document.getElementById('departamento_id_display').textContent = departamento.id;
    document.getElementById('departamento_nombre_display').textContent = departamento.nombre;
    document.getElementById('departamento-section').style.display = 'block';

    // Habilitar la sección de procesos
    document.getElementById('proceso-section').style.display = 'block';
    
    // Resetear la selección de proceso
    document.getElementById('proceso_id_display').textContent = 'No seleccionado';
    document.getElementById('proceso_nombre_display').textContent = 'No seleccionado';
    document.getElementById('procesosList').style.display = 'none';

    // Opcional: ocultar la lista de departamentos después de seleccionar
    document.getElementById('departamentosList').style.display = 'none';
}

// Nueva función para manejar la gestión de procesos
function manejarGestionProcesos() {
    const procesoListContainer = document.getElementById('procesosList');
    const isVisible = procesoListContainer.style.display === 'block';

    if (!isVisible) {
        procesoListContainer.style.display = 'block';

        // Obtener el ID del departamento seleccionado
        const departamentoId = document.getElementById('departamento_id_display').textContent;

        if (departamentoId === 'No seleccionado') {
            procesoListContainer.innerHTML = '<p>Por favor, seleccione un departamento primero.</p>';
            return;
        }

        fetch(`/api/procesos/${departamentoId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener la lista de procesos');
                }
                return response.json();
            })
            .then(data => {
                const tbody = procesoListContainer.querySelector('tbody');
                tbody.innerHTML = '';

                if (data.length > 0) {
                    data.forEach(proceso => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${proceso.id}</td>
                            <td>${proceso.nombre}</td>
                        `;
                        row.addEventListener('click', () => seleccionarProceso(proceso));
                        tbody.appendChild(row);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="2">No se encontraron procesos para este departamento.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                procesoListContainer.innerHTML = '<p>Hubo un error al obtener la lista de procesos.</p>';
            });
    } else {
        procesoListContainer.style.display = 'none';
    }
}

function seleccionarProceso(proceso) {
    document.getElementById('proceso_id_display').textContent = proceso.id;
    document.getElementById('proceso_nombre_display').textContent = proceso.nombre;

    // Opcional: ocultar la lista de procesos después de seleccionar
    document.getElementById('procesosList').style.display = 'none';
        // Hacer visible el botón "Ver pasos del proceso"
    document.getElementById('verPasosProceso').style.display = 'block';
}



