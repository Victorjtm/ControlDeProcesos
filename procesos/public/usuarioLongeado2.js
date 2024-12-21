function tokenEmpresaEsValido() {
    const token = localStorage.getItem('tokenEmpresa');
    return !!token;
}

function verificarYObtenerTokenEmpresa() {
    return new Promise((resolve, reject) => {
        mostrarListaEmpresas()
            .then(() => {
                console.log('Lista de empresas mostrada');
                resolve();
            })
            .catch(error => {
                console.error('Error al mostrar la lista de empresas:', error);
                reject(error);
            });
    });
}

function actualizarEmpresaEnHeader() {
    const empresaInfo = document.getElementById('empresa-info');
    const empresaNombre = document.getElementById('empresa-nombre');
    const empresaSeleccionada = JSON.parse(localStorage.getItem('empresaSeleccionada'));

    if (empresaSeleccionada) {
        empresaNombre.textContent = empresaSeleccionada.nombre;
        empresaInfo.style.display = 'inline-block';
    } else {
        empresaInfo.style.display = 'none';
    }
}

function mostrarMensajeError(mensaje) {
    const mensajeElement = document.getElementById('mensaje-error');
    if (mensajeElement) {
        mensajeElement.textContent = mensaje;
        mensajeElement.style.display = 'block';
    } else {
        alert(mensaje);
    }
}

function mostrarListaEmpresas() {
    return new Promise((resolve, reject) => {
        const empresaListContainer = document.getElementById('empresaList');
        empresaListContainer.style.display = 'block';

        fetch('/api/empresas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener la lista de empresas');
            }
            return response.json();
        })
        .then(data => {
            const tbody = empresaListContainer.querySelector('tbody');
            tbody.innerHTML = '';

            if (data.length > 0) {
                data.forEach(empresa => {
                    const row = document.createElement('tr');
                    row.dataset.empresaId = empresa.id;
                    row.innerHTML = `
                        <td>${empresa.id}</td>
                        <td>${empresa.nombre}</td>
                        <td>${empresa.nif}</td>
                    `;
                    row.addEventListener('click', () => {
                        seleccionarEmpresaYCrearToken(empresa)
                            .then(resolve)
                            .catch(reject);
                    });
                    tbody.appendChild(row);
                });

                // Añadir mensaje si ya hay una empresa seleccionada
                const empresaSeleccionada = JSON.parse(localStorage.getItem('empresaSeleccionada'));
                if (empresaSeleccionada) {
                    const mensaje = document.createElement('p');
                    mensaje.textContent = `Empresa actual: ${empresaSeleccionada.nombre}. Haz clic en otra empresa para cambiar.`;
                    empresaListContainer.insertBefore(mensaje, empresaListContainer.firstChild);
                }
            } else {
                tbody.innerHTML = '<tr><td colspan="3">No se encontraron empresas asociadas a tu usuario.</td></tr>';
                reject(new Error('No se encontraron empresas asociadas'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            empresaListContainer.innerHTML = '<p>Hubo un error al obtener la lista de empresas.</p>';
            reject(error);
        });
    });
}

function seleccionarEmpresaYCrearToken(empresa) {
    return new Promise((resolve, reject) => {
        fetch('/api/crear-token-empresa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ empresaId: empresa.id })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al crear el token de empresa');
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('tokenEmpresa', data.token);
            localStorage.setItem('empresaSeleccionada', JSON.stringify(empresa));
            console.log(`Empresa seleccionada: ${empresa.nombre}`);
            actualizarEmpresaEnHeader();
            
            // Ocultar la tabla de selección de empresas
            const empresaListContainer = document.getElementById('empresaList');
            if (empresaListContainer) {
                empresaListContainer.style.display = 'none';
            }

            // Mostrar un mensaje de confirmación
            showMessage(`Empresa "${empresa.nombre}" seleccionada correctamente.`, 'success');

            resolve();
        })
        .catch(error => {
            console.error('Error al crear el token de empresa:', error);
            showMessage('Error al seleccionar la empresa. Por favor, intenta de nuevo.', 'error');
            reject(error);
        });
    });
}