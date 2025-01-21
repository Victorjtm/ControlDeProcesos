let empresaIdActual;
let departamentoIdActual;

function manejarEliminacionProceso() {
    const procesoId = document.getElementById('proceso_id').value;
    const departamentoId = document.getElementById('departamento_id').value;
    const empresaId = document.getElementById('empresa_id').value;

    if (procesoId && departamentoId && empresaId) {
        // Caso 1: Todos seleccionados
        fetch(`/api/verificar-asociacion-proceso?procesoId=${procesoId}&departamentoId=${departamentoId}&empresaId=${empresaId}`)
            .then(response => response.json())
            .then(data => {
                if (data.asociados) {
                    if (confirm('¿Desea eliminar esta asociación?')) {
                        eliminarAsociacionProceso(procesoId, departamentoId, empresaId);
                    }
                } else {
                    alert('No hay asociación a eliminar.');
                }
            })
            .catch(error => console.error('Error:', error));
    } else if (procesoId) {
        // Caso 2: Solo proceso seleccionado
        fetch(`/api/departamentos-empresas-por-proceso/${procesoId}`)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    if (confirm('¿Desea eliminar el proceso por completo?')) {
                        eliminarProceso(procesoId);
                    }
                } else {
                    alert(`El proceso tiene ${data.length} asociación(es).`);
                }
            })
            .catch(error => console.error('Error:', error));
    } else {
        alert('Debe seleccionar al menos un proceso.');
    }
}

function eliminarAsociacionProceso(procesoId, departamentoId, empresaId) {
    fetch(`/api/eliminar-asociacion-proceso`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ procesoId, departamentoId, empresaId })
    })
        .then(response => response.json())
        .then(data => alert(data.message || 'Asociación eliminada con éxito.'))
        .catch(error => console.error('Error al eliminar la asociación:', error));
}

function eliminarProceso(procesoId) {
    fetch(`/api/eliminar-proceso/${procesoId}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => alert(data.message || 'Proceso eliminado con éxito.'))
        .catch(error => console.error('Error al eliminar el proceso:', error));
}

function verificarAsociacionProceso() {
    const procesoId = document.getElementById('proceso_id').value;
    const departamentoId = document.getElementById('departamento_id').value;
    const empresaId = document.getElementById('empresa_id').value;
    const mensajeElement = document.getElementById('mensaje');

    if (procesoId && departamentoId && empresaId) {
        // Caso 1: Tenemos todos los datos
        fetch(`/api/verificar-asociacion-proceso?procesoId=${procesoId}&departamentoId=${departamentoId}&empresaId=${empresaId}`)
            .then(response => response.json())
            .then(data => {
                mensajeElement.textContent = data.asociados ? 
                    'El proceso, departamento y empresa están asociados.' : 
                    'El proceso, departamento y empresa no están asociados.';
            })
            .catch(error => {
                console.error('Error:', error);
                mensajeElement.textContent = 'Error al verificar la asociación.';
            });
    } else if (empresaId && departamentoId) {
        // Caso 2: Tenemos empresa y departamento
        fetch(`/api/procesos-por-empresa-departamento/${empresaId}/${departamentoId}`)
            .then(response => response.json())
            .then(procesos => {
                console.log('Procesos recibidos:', procesos);
                if (procesos && procesos.length > 0) {
                    mostrarProcesosPorEmpresaYDepartamento(empresaId, departamentoId, procesos);
                } else {
                    mensajeElement.textContent = 'No se encontraron procesos para esta empresa y departamento.';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mensajeElement.textContent = 'Error al obtener los procesos.';
            });
    } else if (empresaId) {
        // Caso 3: Solo tenemos la empresa
        fetch(`/api/procesos-por-empresa/${empresaId}`)
            .then(response => response.json())
            .then(data => {
                console.log("los datos son: ", data); // Cambiado de data.procesos a data
                if (data && data.length > 0) { // Cambiado de data.procesos a data
                    mensajeElement.textContent = `Se encontraron ${data.length} proceso(s) asociados a esta empresa.`;
                    manejarSeleccionAsociacionesProceso(null, data); // Pasando data directamente
                } else {
                    mensajeElement.textContent = 'No se encontraron procesos para esta empresa.';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mensajeElement.textContent = 'Error al obtener los procesos.';
            });
    }  else if (departamentoId) {
        // Caso 3: Solo tenemos el departamento
        fetch(`/api/procesos-por-departamento/${departamentoId}`)
            .then(response => response.json())
            .then(data => {
                console.log("Procesos por departamento:", data);
                if (data && data.length > 0) {
                    mensajeElement.textContent = `Se encontraron ${data.length} proceso(s) asociados a este departamento.`;
                    manejarSeleccionAsociacionesProceso(null, data);
                } else {
                    mensajeElement.textContent = 'No se encontraron procesos para este departamento.';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mensajeElement.textContent = 'Error al obtener los procesos por departamento.';
            });
    } else {
        mensajeElement.textContent = 'Por favor, seleccione al menos una empresa o un departamento.';
    } 
}

function verificarProceso() {
    const procesoId = document.getElementById("proceso_id").value.trim();
    const nombreProceso = document.getElementById("nombreProceso").value.trim();
    const mensajeElement = document.getElementById('mensaje');

    if (nombreProceso || procesoId) {
        const inputUsado = nombreProceso ? 'nombre' : 'id';
        const valorBusqueda = nombreProceso || procesoId;

        fetch(`/api/verificar-proceso?${inputUsado}=${encodeURIComponent(valorBusqueda)}`)
            .then(response => response.json())
            .then(data => {
                if (data.existeProceso) {
                    document.getElementById('proceso_id').value = data.id || '';
                    document.getElementById('nombreProceso').value = data.nombre || '';
                    document.getElementById('descripcionProceso').value = data.descripcion || '';
                    mensajeElement.textContent = 'Proceso encontrado.';
                    mensajeElement.style.color = 'blue';
                } else {
                    document.getElementById('proceso_id').value = '';
                    document.getElementById('descripcionProceso').value = '';
                    mensajeElement.textContent = 'Proceso no encontrado.';
                    mensajeElement.style.color = 'red';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mensajeElement.textContent = 'Error al verificar el proceso.';
                mensajeElement.style.color = 'red';
            });
    } else {
        mensajeElement.textContent = 'Por favor, ingrese el nombre o ID del proceso.';
        mensajeElement.style.color = 'red';
    }
}



function manejarGestionDepartamentosProcesos() {
    const departamentoListContainer = document.getElementById('departamentoList');
    const mensajeContainer = document.getElementById('mensaje');
    const departamentoIdInput = document.getElementById('departamento_id');
    const nombreDepartamentoInput = document.getElementById('nombreDepartamento');

    function habilitarCamposDepartamento(habilitar) {
        departamentoIdInput.disabled = !habilitar;
        nombreDepartamentoInput.disabled = !habilitar;
    }

    // Obtener el ID y el nombre de la empresa del formulario
    const empresaIdInput = document.getElementById('empresa_id');
    const empresaNombreInput = document.getElementById('nombreEmpresa');
    const empresaId = empresaIdInput ? empresaIdInput.value : null;
    const empresaNombre = empresaNombreInput ? empresaNombreInput.value : null;

    // Comprobar si hay una empresa seleccionada
    if (!empresaId || !empresaNombre) {
        mensajeContainer.innerHTML = '<p class="alert alert-warning">Por favor, selecciona una empresa primero.</p>';
        habilitarCamposDepartamento(false);
        departamentoListContainer.style.display = 'none';
        return;
    }

    // Si hay una empresa seleccionada, habilitar los campos de departamento
    habilitarCamposDepartamento(true);
    mensajeContainer.innerHTML = '';

    // Manejar la visibilidad de la lista de departamentos
    const isVisible = departamentoListContainer.style.display === 'block';
    if (!isVisible) {
        departamentoListContainer.style.display = 'block';

        // Cargar los departamentos
        fetch('/api/departamentos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener la lista de departamentos');
            }
            return response.json();
        })
        .then(data => {
            const tbody = departamentoListContainer.querySelector('tbody');
            tbody.innerHTML = '';

            if (data.length > 0) {
                data.forEach(departamento => {
                    const row = document.createElement('tr');
                    row.dataset.departamentoId = departamento.id;
                    
                    // Verificar si el departamento está asociado a la empresa seleccionada
                    const estaAsociado = departamento.empresas.some(empresa => empresa.id === parseInt(empresaId));
                    
                    if (estaAsociado) {
                        row.style.backgroundColor = 'lightgreen';
                    }

                    row.innerHTML = `
                        <td>${departamento.id}</td>
                        <td>${departamento.nombre}</td>
                        <td>${estaAsociado ? empresaNombre : 'No asociado'}</td>
                    `;
                    row.addEventListener('click', () => seleccionarDepartamentoProceso(departamento));
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="3">No se encontraron departamentos.</td>
                    </tr>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mensajeContainer.innerHTML = `<p class="alert alert-danger">Hubo un error al obtener la lista de departamentos: ${error.message}</p>`;
        });
    } else {
        departamentoListContainer.style.display = 'none';
    }
}





function seleccionarDepartamentoProceso(departamento) {
    // Actualizar campos de departamento
    document.getElementById('departamento_id').value = departamento.id;
    document.getElementById('nombreDepartamento').value = departamento.nombre;
    
    // Obtener los valores actuales de los campos de empresa
    const empresaIdActual = document.getElementById('empresa_id').value;
    const nombreEmpresaActual = document.getElementById('nombreEmpresa').value;

    // Solo actualizar los campos de empresa si están vacíos
    if (!empresaIdActual && !nombreEmpresaActual) {
        document.getElementById('empresa_id').value = departamento.empresa_id || '';
        document.getElementById('nombreEmpresa').value = departamento.empresa_nombre || '';
    }

    // Actualizar variables globales si las estás usando
    departamentoIdActual = departamento.id;
    // Solo actualizar empresaIdActual si estaba vacío
    if (!empresaIdActual) {
        empresaIdActual = departamento.empresa_id;
    }

    // Ocultar la lista de departamentos
    document.getElementById('departamentoList').style.display = 'none';

    // Habilitar el botón de asignaciones
    const asignadoBtn = document.getElementById('asignado');
    if (asignadoBtn) {
        asignadoBtn.disabled = false; // Habilitar el botón
        asignadoBtn.title = ""; // Limpiar el título si estaba deshabilitado
    }
}


function manejarGestionProcesos() {
    const procesoListContainer = document.getElementById('procesoList');
    const isVisible = procesoListContainer.style.display === 'block';

    if (!isVisible) {
        procesoListContainer.style.display = 'block';

        fetch('/api/procesos')
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
                        row.dataset.procesoId = proceso.id;
                        row.innerHTML = `
                            <td>${proceso.id}</td>
                            <td>${proceso.nombre}</td>
                            <td>${proceso.departamento_nombre || 'N/A'}</td>
                            <td>${proceso.empresa_nombre || 'N/A'}</td>
                        `;
                        row.addEventListener('click', () => seleccionarProceso(proceso));
                        tbody.appendChild(row);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="4">No se encontraron procesos.</td></tr>';
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
    console.log('Entrando en seleccionarProceso', proceso);

    document.getElementById('proceso_id').value = proceso.id;
    document.getElementById('nombreProceso').value = proceso.nombre;
    document.getElementById('descripcionProceso').value = proceso.descripcion;
    
    // Limpiar campos de departamento y empresa
    document.getElementById('departamento_id').value = '';
    document.getElementById('nombreDepartamento').value = '';
    document.getElementById('empresa_id').value = '';
    document.getElementById('nombreEmpresa').value = '';

    const mensajeElemento = document.getElementById('mensaje');
    mensajeElemento.textContent = `Proceso "${proceso.nombre}" seleccionado.`;
    mensajeElemento.style.color = 'green';

    // Obtener las asociaciones del proceso
    fetch(`/api/asociaciones-proceso/${proceso.id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (data.asociaciones && data.asociaciones.length > 0) {
                mensajeElemento.textContent += ` Asociado a ${data.asociaciones.length} departamento(s)/empresa(s).`;
                
                // Mostrar la primera asociación
                const primeraAsociacion = data.asociaciones[0];
                document.getElementById('departamento_id').value = primeraAsociacion.departamento_id;
                document.getElementById('nombreDepartamento').value = primeraAsociacion.departamento_nombre;
                document.getElementById('empresa_id').value = primeraAsociacion.empresa_id;
                document.getElementById('nombreEmpresa').value = primeraAsociacion.empresa_nombre;

                // Si hay más de una asociación, permitir seleccionar
                if (data.asociaciones.length > 1) {
                    manejarSeleccionAsociacionesProceso(proceso.id, data.asociaciones);
                }
            } else {
                mensajeElemento.textContent = `El proceso "${proceso.nombre}" no tiene asociaciones.`;
                mensajeElemento.style.color = 'orange';
            }
        })
        .catch(error => {
            console.error('Error al obtener asociaciones:', error);
            mensajeElemento.textContent = `Error al obtener asociaciones para el proceso "${proceso.nombre}".`;
            mensajeElemento.style.color = 'red';
        })
        .finally(() => {
            document.getElementById('procesoList').style.display = 'none';
            
            // Habilitar botones individualmente
            const botonesIds = ['asignado', 'eliminarProceso', 'volverButton', 'mostrarProcesos', 'mostrarDepartamentosProcesos', 'mostrarEmpresasProcesos'];
            botonesIds.forEach(id => {
                const boton = document.getElementById(id);
                if (boton) {
                    boton.disabled = false;
                    console.log(`Botón ${id} habilitado`);
                } else {
                    console.warn(`Botón con id ${id} no encontrado`);
                }
            });
            
            // Habilitar el botón de tipo submit (Registrar)
            const submitButton = document.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
                console.log('Botón Registrar habilitado');
            } else {
                console.warn('Botón Registrar no encontrado');
            }
        });
}




function mostrarProcesosPorEmpresaYDepartamento() {
    const empresaId = document.getElementById('empresa_id').value;
    const departamentoId = document.getElementById('departamento_id').value;
    const procesoListContainer = document.getElementById('procesoList');

    if (!empresaId || !departamentoId) {
        alert('Por favor, seleccione una empresa y un departamento primero.');
        return;
    }

    procesoListContainer.style.display = 'block';

    fetch(`/api/procesos-por-empresa-y-departamento/${empresaId}/${departamentoId}`)
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
                    row.dataset.procesoId = proceso.id;
                    row.innerHTML = `
                        <td>${proceso.id}</td>
                        <td>${proceso.nombre}</td>
                        <td>${proceso.descripcion || 'N/A'}</td>
                    `;
                    row.addEventListener('click', () => seleccionarProcesoDepartamentoEmpresa(proceso));
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="3">No se encontraron procesos para esta empresa y departamento.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            procesoListContainer.innerHTML = '<p>Hubo un error al obtener la lista de procesos.</p>';
        });
}

function seleccionarProcesoDepartamentoEmpresa() {
    const empresaId = document.getElementById("empresa_id").value.trim();
    const departamentoId = document.getElementById("departamento_id").value.trim();
    const procesoListContainer = document.getElementById('procesoList');

    if (!empresaId || !departamentoId) {
        alert('Por favor, seleccione una empresa y un departamento primero.');
        return;
    }

    console.log(`Buscando procesos para empresa ID: ${empresaId} y departamento ID: ${departamentoId}`);

    procesoListContainer.style.display = 'block';

    fetch(`/api/procesos-por-empresa-y-departamento/${empresaId}/${departamentoId}`)
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
                    row.dataset.procesoId = proceso.id;
                    row.innerHTML = `
                        <td>${proceso.id}</td>
                        <td>${proceso.nombre}</td>
                        <td>${proceso.descripcion || 'N/A'}</td>
                    `;
                    row.addEventListener('click', () => seleccionarProceso(proceso));
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="3">No se encontraron procesos para esta empresa y departamento.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            procesoListContainer.innerHTML = '<p>Hubo un error al obtener la lista de procesos.</p>';
        });
}

function manejarGestionDepartamentosSeleccionadosProceso(procesoId) {
    if (!procesoId) {
        alert('Por favor, seleccione un proceso primero.');
        return;
    }

    const departamentoListContainer = document.getElementById('departamentoList');
    const isVisible = departamentoListContainer.style.display === 'block';

    if (!isVisible) {
        departamentoListContainer.style.display = 'block';

        fetch(`/api/departamentos-empresas-por-proceso/${procesoId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener la lista de departamentos y empresas del proceso');
                }
                return response.json();
            })
            .then(data => {
                const tbody = departamentoListContainer.querySelector('tbody');
                tbody.innerHTML = '';

                if (data.length > 0) {
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        row.dataset.departamentoId = item.departamento_id;
                        row.dataset.empresaId = item.empresa_id;
                        row.innerHTML = `
                            <td>${item.departamento_id}</td>
                            <td>${item.departamento_nombre}</td>
                            <td>${item.empresa_nombre}</td>
                        `;
                        row.addEventListener('click', () => seleccionarDepartamentoEmpresaParaProceso(item));
                        tbody.appendChild(row);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="3">No se encontraron departamentos asociados a este proceso.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const tbody = departamentoListContainer.querySelector('tbody');
                tbody.innerHTML = '<tr><td colspan="3">Hubo un error al obtener la lista de departamentos y empresas del proceso.</td></tr>';
            });
    } else {
        departamentoListContainer.style.display = 'none';
    }
}

function seleccionarDepartamentoEmpresaParaProceso(item) {
    document.getElementById('departamento_id').value = item.departamento_id;
    document.getElementById('nombreDepartamento').value = item.departamento_nombre;
    document.getElementById('empresa_id').value = item.empresa_id;
    document.getElementById('nombreEmpresa').value = item.empresa_nombre;

    document.getElementById('departamentoList').style.display = 'none';

    const mensajeElemento = document.getElementById('mensaje');
    mensajeElemento.textContent = `Departamento "${item.departamento_nombre}" y Empresa "${item.empresa_nombre}" seleccionados para el proceso.`;
    mensajeElemento.style.color = 'blue';
}

function verificarEmpresa() {
    const empresaId = document.getElementById("empresa_id").value.trim();
    const nombreEmpresa = document.getElementById("nombreEmpresa").value.trim();
    const inputUsado = empresaId ? 'id' : 'nombre';
    const valorBusqueda = empresaId || nombreEmpresa;
    console.log(`Verificando empresa por ${inputUsado}:`, valorBusqueda);

    // Función para habilitar/deshabilitar campos de departamento y el botón de asignar departamentos
    function actualizarEstadoCampos(habilitar) {
        const departamentoIdInput = document.getElementById('departamento_id');
        const nombreDepartamentoInput = document.getElementById('nombreDepartamento');
        const asignarDepartamentoBtn = document.getElementById('mostrarDepartamentosProcesos');

        // Habilitar o deshabilitar los campos de departamento
        [departamentoIdInput, nombreDepartamentoInput].forEach(elemento => {
            if (elemento) {
                elemento.disabled = !habilitar;
                if (habilitar) {
                    elemento.removeAttribute('title');
                } else {
                    elemento.title = "Selecciona una empresa primero";
                }
            }
        });

        // Solo habilitar el botón de asignar departamentos
        if (asignarDepartamentoBtn) {
            asignarDepartamentoBtn.disabled = !habilitar;
            if (!habilitar) {
                asignarDepartamentoBtn.title = "Selecciona y verifica una empresa primero";
            }
        }
    }

    if (valorBusqueda) {
        fetch(`/verificar-empresa/${inputUsado}/${encodeURIComponent(valorBusqueda)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Datos recibidos:', data);
                const mensajeElemento = document.getElementById('mensaje');
                if (data.exists) {
                    console.log('Empresa encontrada, rellenando campos');
                    document.getElementById('empresa_id').value = data.id || '';
                    document.getElementById('nombreEmpresa').value = data.nombre || '';
                    empresaIdActual = data.id;
                    console.log('ID de empresa almacenado:', empresaIdActual);
                    mensajeElemento.textContent = 'Empresa encontrada. Se han rellenado los campos.';
                    mensajeElemento.style.color = 'blue';
                    actualizarEstadoCampos(true); // Habilitar campos y botón de asignar departamentos
                } else {
                    document.getElementById('empresa_id').value = '';
                    document.getElementById('nombreEmpresa').value = '';
                    empresaIdActual = null;
                    console.log('ID de empresa reseteado');
                    mensajeElemento.textContent = 'Empresa no encontrada.';
                    mensajeElemento.style.color = 'red';
                    actualizarEstadoCampos(false); // Deshabilitar campos y botón
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const mensajeElemento = document.getElementById('mensaje');
                mensajeElemento.textContent = `Error al verificar la empresa: ${error.message}`;
                mensajeElemento.style.color = 'red';
                actualizarEstadoCampos(false); // Deshabilitar campos y botón
            });
    } else {
        actualizarEstadoCampos(false); // Deshabilitar campos y botón
    }
}




function verificarDepartamento() {
    const departamentoId = document.getElementById("departamento_id").value.trim();
    const nombreDepartamento = document.getElementById("nombreDepartamento").value.trim();
    const mensajeElement = document.getElementById('mensaje');

    if (nombreDepartamento || departamentoId) {
        const inputUsado = nombreDepartamento ? 'nombre' : 'id';
        const valorBusqueda = nombreDepartamento || departamentoId;
        console.log(`Verificando departamento por ${inputUsado}:`, valorBusqueda);

        fetch(`/api/verificar-departamento?${inputUsado}=${encodeURIComponent(valorBusqueda)}`)
            .then(response => response.json())
            .then(data => {
                console.log('Datos recibidos:', data);
                if (data.existeDepartamento) {
                    console.log('Departamento encontrado');
                    document.getElementById('departamento_id').value = data.id || '';
                    document.getElementById('nombreDepartamento').value = data.nombre || '';
                    mensajeElement.textContent = 'Departamento encontrado.';
                    mensajeElement.style.color = 'blue';
                } else {
                    document.getElementById('departamento_id').value = '';
                    document.getElementById('nombreDepartamento').value = '';
                    mensajeElement.textContent = 'Departamento no encontrado.';
                    mensajeElement.style.color = 'red';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mensajeElement.textContent = 'Error al verificar el departamento.';
                mensajeElement.style.color = 'red';
            });
    } else {
        mensajeElement.textContent = 'Por favor, ingrese el nombre o ID del departamento.';
        mensajeElement.style.color = 'red';
    }
}

function manejarGestionEmpresasProcesos() {
    const empresaListContainer = document.getElementById('empresaList');
    const isVisible = empresaListContainer.style.display === 'block';

    if (!isVisible) {
        empresaListContainer.style.display = 'block';

        fetch('/api/empresas')
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
                        row.addEventListener('click', () => seleccionarEmpresaParaProceso(empresa));
                        tbody.appendChild(row);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="3">No se encontraron empresas.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                empresaListContainer.innerHTML = '<p>Hubo un error al obtener la lista de empresas.</p>';
            });
    } else {
        empresaListContainer.style.display = 'none';
    }
}

function seleccionarEmpresaParaProceso(empresa) {
    document.getElementById('empresa_id').value = empresa.id;
    document.getElementById('nombreEmpresa').value = empresa.nombre;
    document.getElementById('empresaList').style.display = 'none';

    const mensajeElemento = document.getElementById('mensaje');
    mensajeElemento.textContent = `Empresa "${empresa.nombre}" seleccionada.`;
    mensajeElemento.style.color = 'blue';

    const procesoId = document.getElementById('proceso_id').value;

    if (procesoId) {
        // Si hay un proceso seleccionado, podrías querer verificar la asociación
        // o realizar alguna otra acción específica
        verificarAsociacion();
    } else {
        // Si no hay un proceso seleccionado, podrías querer mostrar los procesos de esta empresa
        // manejarGestionProcesosPorEmpresa(empresa.id);
    }

    // Habilitar solo el botón de asignar departamentos
    const asignarDepartamentoBtn = document.getElementById('mostrarDepartamentosProcesos');
    if (asignarDepartamentoBtn) {
        asignarDepartamentoBtn.disabled = false; // Habilitar el botón
        asignarDepartamentoBtn.title = ""; // Limpiar el título si estaba deshabilitado
    }
}


function manejarGestionProcesosPorEmpresa(empresaId) {
    const procesoListContainer = document.getElementById('procesoList');
    procesoListContainer.style.display = 'block';

    fetch(`/api/procesos-por-empresa/${empresaId}`)
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
                    row.dataset.procesoId = proceso.id;
                    row.dataset.empresaId = empresaId;
                    row.innerHTML = `
                        <td>${proceso.id}</td>
                        <td>${proceso.nombre}</td>
                        <td>${proceso.descripcion || 'N/A'}</td>
                        <td>${proceso.departamento_nombre || 'N/A'}</td>
                        <td>${empresaId}</td>
                    `;
                    row.addEventListener('click', () => seleccionarProcesoDepartamentoConEmpresa(proceso, empresaId));
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="5">No se encontraron procesos para esta empresa.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            procesoListContainer.innerHTML = '<p>Hubo un error al obtener la lista de procesos.</p>';
        });
}

function seleccionarProcesoDepartamentoConEmpresa(proceso, empresaId) {
    // Rellenar los campos del formulario con los datos del proceso seleccionado
    document.getElementById('proceso_id').value = proceso.id;
    document.getElementById('nombreProceso').value = proceso.nombre;
    document.getElementById('descripcionProceso').value = proceso.descripcion || '';
    document.getElementById('departamento_id').value = proceso.departamento_id || '';
    document.getElementById('nombreDepartamento').value = proceso.departamento_nombre || '';
    document.getElementById('empresa_id').value = empresaId;
    document.getElementById('nombreEmpresa').value = proceso.empresa_nombre || '';

    // Ocultar la lista de procesos
    document.getElementById('procesoList').style.display = 'none';

    // Mostrar un mensaje de confirmación
    const mensajeElement = document.getElementById('mensaje');
    mensajeElement.textContent = `Proceso "${proceso.nombre}" seleccionado.`;
    mensajeElement.style.color = 'green';
}

function enviarFormularioProceso() {
    const nombreProceso = document.getElementById('nombreProceso').value.trim();
    const descripcion = document.getElementById('descripcionProceso').value.trim();
    const departamentoId = document.getElementById('departamento_id').value.trim();
    const empresaId = document.getElementById('empresa_id').value.trim();

    // Verificar que todos los campos requeridos estén llenos
    if (!nombreProceso || !descripcion || !departamentoId || !empresaId) {
        const mensajeDiv = document.getElementById('mensaje');
        mensajeDiv.textContent = 'Error: Todos los campos son obligatorios.';
        mensajeDiv.style.color = 'red';
        return; // Detener la ejecución si falta algún dato
    }

    fetch('/registroProceso', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nombre: nombreProceso,
            descripcion: descripcion,
            departamentoId: departamentoId,
            empresaId: empresaId
        }),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        const mensajeDiv = document.getElementById('mensaje');
        console.log('Éxito:', data.message);
        mensajeDiv.textContent = `Éxito: ${data.message}`;
        mensajeDiv.style.color = 'green';
        
        // Limpiar los campos del formulario después de un registro exitoso
        document.getElementById('nombreProceso').value = '';
        document.getElementById('descripcionProceso').value = '';
        document.getElementById('departamento_id').value = '';
        document.getElementById('empresa_id').value = '';
    })
    .catch((error) => {
        console.error('Error:', error);
        const mensajeDiv = document.getElementById('mensaje');
        mensajeDiv.textContent = `Error: ${error.error || 'Error al procesar la solicitud.'}`;
        mensajeDiv.style.color = 'red';
    });
}

function manejarSeleccionAsociacionesProceso(procesoId, asociaciones) {
    console.log('Manejando selección de asociaciones para el proceso', procesoId);
    
    const contenedorAsociaciones = document.getElementById('contenedorAsociaciones');
    const tabla = document.getElementById('tablaAsociaciones');
    const tbody = tabla.querySelector('tbody');
    
    // Limpiar contenido anterior
    tbody.innerHTML = '';
    
    // Llenar la tabla con las asociaciones
    asociaciones.forEach(asociacion => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${asociacion.id}</td>
            <td>${asociacion.nombre}</td>
            <td>${asociacion.departamento_id}</td>
            <td>${asociacion.departamento_nombre}</td>
            <td>${asociacion.empresa_id}</td>
            <td>${asociacion.empresa_nombre}</td>
        `;
        fila.addEventListener('click', () => seleccionarAsociacion(asociacion));
        tbody.appendChild(fila);
    });
    
    // Mostrar el contenedor de asociaciones
    contenedorAsociaciones.style.display = 'block';
    
    // Actualizar el mensaje
    const mensajeElemento = document.getElementById('mensaje');
    mensajeElemento.textContent = 'Seleccione una asociación:';
}

function seleccionarAsociacion(asociacion) {
    console.log('Asociación seleccionada:', asociacion);  // Añade esta línea

    document.getElementById('departamento_id').value = asociacion.departamento_id || '';
    document.getElementById('nombreDepartamento').value = asociacion.departamento_nombre || '';
    document.getElementById('empresa_id').value = asociacion.empresa_id || '';
    document.getElementById('nombreEmpresa').value = asociacion.empresa_nombre || '';
    
    const mensajeElemento = document.getElementById('mensaje');
    mensajeElemento.textContent = `Asociación seleccionada: ${asociacion.departamento_nombre} - ${asociacion.empresa_nombre}`;
    
    // Ocultar la tabla después de la selección
    document.getElementById('contenedorAsociaciones').style.display = 'none';

    // Verifica los valores después de establecerlos
    console.log('Valores establecidos:', {
        departamento_id: document.getElementById('departamento_id').value,
        nombreDepartamento: document.getElementById('nombreDepartamento').value,
        empresa_id: document.getElementById('empresa_id').value,
        nombreEmpresa: document.getElementById('nombreEmpresa').value
    });
}
function mostrarProcesosPorEmpresaYDepartamento(empresaId, departamentoId, procesos) {
    console.log('Mostrando procesos para empresa:', empresaId, 'y departamento:', departamentoId);
    
    const contenedorProcesos = document.getElementById('contenedorProcesos');
    const tabla = document.getElementById('tablaProcesos');
    const tbody = tabla.querySelector('tbody');
    
    // Limpiar contenido anterior
    tbody.innerHTML = '';
    
    // Llenar la tabla con los procesos
    procesos.forEach(proceso => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${proceso.id}</td>
            <td>${proceso.nombre}</td>
            <td>${proceso.descripcion || 'N/A'}</td>
        `;
        fila.addEventListener('click', () => seleccionarProceso(proceso));
        tbody.appendChild(fila);
    });
    
    // Mostrar el contenedor de procesos
    contenedorProcesos.style.display = 'block';
    
    // Actualizar el mensaje
    const mensajeElemento = document.getElementById('mensaje');
    mensajeElemento.textContent = `Se encontraron ${procesos.length} proceso(s) para la empresa y departamento seleccionados. Seleccione un proceso:`;
}

/*function seleccionarProceso(proceso) {
    console.log('Proceso seleccionado:', proceso);

    document.getElementById('proceso_id').value = proceso.id || '';
    document.getElementById('nombreProceso').value = proceso.nombre || '';
    document.getElementById('descripcionProceso').value = proceso.descripcion || '';
    
    const mensajeElemento = document.getElementById('mensaje');
    mensajeElemento.textContent = `Proceso seleccionado: ${proceso.nombre}`;
    
    // Ocultar la tabla después de la selección
    document.getElementById('contenedorProcesos').style.display = 'none';

    // Verifica los valores después de establecerlos
    console.log('Valores establecidos:', {
        proceso_id: document.getElementById('proceso_id').value,
        nombreProceso: document.getElementById('nombreProceso').value,
        deSscripcionProceso: document.getElementById('descripcionProceso').value
    });
}*/