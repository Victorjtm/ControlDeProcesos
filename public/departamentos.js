let empresaIdActual; // Variable global para almacenar el ID de la empresa actual

function manejarEliminacionDepartamento() {
    const departamentoId = document.getElementById('departamento_id').value;
    const empresaId = document.getElementById('empresa_id').value;

    if (departamentoId && empresaId) {
        // Caso 7: Ambos seleccionados
        fetch(`/api/verificar-asociacion?departamentoId=${departamentoId}&empresaId=${empresaId}`)
            .then(response => response.json())
            .then(data => {
                if (data.asociados) {
                    // Caso 8: Existe asociación
                    if (confirm('¿Desea eliminar esta asociación?')) {
                        eliminarAsociacion(departamentoId, empresaId);
                    }
                } else {
                    alert('No hay asociación a eliminar.');
                }
            })
            .catch(error => console.error('Error:', error));
    } else if (departamentoId) {
        // Caso 2: Solo departamento seleccionado
        fetch(`/api/empresas-por-departamento/${departamentoId}`)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    // Caso 3: El departamento no está asociado a ninguna empresa
                    if (confirm('¿Desea eliminar el departamento por completo?')) {
                        eliminarDepartamento(departamentoId);
                    }
                } else {
                    // Caso 4: El departamento tiene empresas asociadas
                    alert(`El departamento tiene ${data.length} empresa(s) asociada(s).`);
                }
            })
            .catch(error => console.error('Error:', error));
    } else if (empresaId) {
        // Caso 5: Solo empresa seleccionada
        alert('Debe seleccionar un departamento.');
    } else {
        // Caso 6: Ninguno seleccionado
        alert('No hay ningún departamento ni empresa seleccionado.');
    }
}

function eliminarAsociacion(departamentoId, empresaId) {
    fetch(`/api/eliminar-asociacion`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departamentoId, empresaId })
    })
    .then(response => response.json())
    .then(data => alert(data.message || 'Asociación eliminada con éxito.'))
    .catch(error => console.error('Error al eliminar la asociación:', error));
}

function eliminarDepartamento(departamentoId) {
    fetch(`/api/eliminar-departamento/${departamentoId}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => alert(data.message || 'Departamento eliminado con éxito.'))
        .catch(error => console.error('Error al eliminar el departamento:', error));
}

function verificarAsociacion() {
    const departamentoId = document.getElementById('departamento_id').value;
    const empresaId = document.getElementById('empresa_id').value;
    const mensajeElement = document.getElementById('mensaje');

    if (departamentoId && empresaId) {
        // Caso 1: Ambos seleccionados
        fetch(`/api/verificar-asociacion?departamentoId=${departamentoId}&empresaId=${empresaId}`)
            .then(response => response.json())
            .then(data => {
                if (data.asociados) {
                    mensajeElement.textContent = 'El departamento y la empresa están asociados.';
                } else {
                    mensajeElement.textContent = 'El departamento y la empresa no están asociados.';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mensajeElement.textContent = 'Error al verificar la asociación.';
            });
    } else if (departamentoId) {
        // Caso 2: Solo departamento seleccionado
        fetch(`/api/empresas-por-departamento/${departamentoId}`)
            .then(response => response.json())
            .then(data => {
                mensajeElement.textContent = `El departamento está asociado a ${data.length} empresa(s).`;
            })
            .catch(error => {
                console.error('Error:', error);
                mensajeElement.textContent = 'Error al obtener las empresas asociadas.';
            });
    } else if (empresaId) {
        // Caso 3: Solo empresa seleccionada
        fetch(`/api/departamentos-por-empresa/${empresaId}`)
            .then(response => response.json())
            .then(data => {
                mensajeElement.textContent = `La empresa está asociada a ${data.length} departamento(s).`;
            })
            .catch(error => {
                console.error('Error:', error);
                mensajeElement.textContent = 'Error al obtener los departamentos asociados.';
            });
    } else {
        // Caso 4: Ninguno seleccionado
        mensajeElement.textContent = 'No hay ningún departamento ni empresa seleccionado.';
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
                    
                    mensajeElement.textContent = 'Departamento no encontrado.';
                    mensajeElement.style.color = 'orange';

                    if (confirm('El departamento no existe. ¿Desea crearlo?')) {
                        // Aquí llamarías a una función para crear el departamento
                        crearNuevoDepartamento(nombreDepartamento);
                    }
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

function crearNuevoDepartamento(nombreDepartamento) {
    const empresaId = document.getElementById("empresa_id").value.trim();
    const mensajeElement = document.getElementById('mensaje');
    
    fetch('/api/crear-departamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre: nombreDepartamento, empresaId: empresaId || null }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        mensajeElement.textContent = empresaId 
          ? 'Departamento creado y asociado con éxito.' 
          : 'Departamento creado con éxito.';
        mensajeElement.style.color = 'green';
        
        // Mostrar el mensaje durante 3 segundos y luego limpiar el formulario
        setTimeout(() => {
          limpiarFormulario();
        }, 3000);
      } else {
        mensajeElement.textContent = 'Error al crear el departamento: ' + data.message;
        mensajeElement.style.color = 'red';
      }
    })
    .catch(error => {
      console.error('Error:', error);
      mensajeElement.textContent = 'Error al crear el departamento.';
      mensajeElement.style.color = 'red';
    });
  }
  
  function limpiarFormulario() {
    document.getElementById('departamento_id').value = '';
    document.getElementById('nombreDepartamento').value = '';
    document.getElementById('empresa_id').value = '';
    document.getElementById('nombreEmpresa').value = '';
    document.getElementById('mensaje').textContent = '';
  }

function verificarEmpresa() {
    const empresaId = document.getElementById("empresa_id").value.trim();
    const nombreEmpresa = document.getElementById("nombreEmpresa").value.trim();
    const inputUsado = empresaId ? 'id' : 'nombre';
    const valorBusqueda = empresaId || nombreEmpresa;

    console.log(`Verificando empresa por ${inputUsado}:`, valorBusqueda);

    if (valorBusqueda) {
        fetch(`/verificar-empresa/${inputUsado}/${encodeURIComponent(valorBusqueda)}`)
            .then(response => response.json())
            .then(data => {
                console.log('Datos recibidos:', data);
                const mensajeElemento = document.getElementById('mensaje');
                if (data.exists) {
                    console.log('Empresa encontrada, rellenando campos');
                    // Rellenar los campos del formulario con los datos de la empresa
                    document.getElementById('empresa_id').value = data.id || '';
                    document.getElementById('nombreEmpresa').value = data.nombre || '';
                    
                    // Almacenar el ID de la empresa en la variable global
                    empresaIdActual = data.id;
                    console.log('ID de empresa almacenado:', empresaIdActual);

                    mensajeElemento.textContent = 'Empresa encontrada. Se han rellenado los campos.';
                    mensajeElemento.style.color = 'blue';
                } else {
                    // Limpiar los campos si la empresa no existe
                    document.getElementById('empresa_id').value = '';
                    document.getElementById('nombreEmpresa').value = '';
                    
                    // Resetear el ID de la empresa actual
                    empresaIdActual = null;
                    console.log('ID de empresa reseteado');

                    mensajeElemento.textContent = 'Empresa no encontrada.';
                    mensajeElemento.style.color = 'red';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const mensajeElemento = document.getElementById('mensaje');
                mensajeElemento.textContent = 'Error al verificar la empresa.';
                mensajeElemento.style.color = 'red';
            });
    }
}

function manejarGestionEmpresasDepartamentos() {
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
                        row.addEventListener('click', () => seleccionarEmpresaParaDepartamento(empresa));
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

function seleccionarEmpresaParaDepartamento(empresa) {
    // Rellenar los campos del formulario con los datos de la empresa seleccionada
    document.getElementById('empresa_id').value = empresa.id;
    document.getElementById('nombreEmpresa').value = empresa.nombre;

    // Ocultar la lista de empresas
    document.getElementById('empresaList').style.display = 'none';

    // Mostrar un mensaje de confirmación
    const mensajeElemento = document.getElementById('mensaje');
    mensajeElemento.textContent = `Empresa "${empresa.nombre}" seleccionada.`;
    mensajeElemento.style.color = 'blue';

    // Verificar si hay un departamento seleccionado
    const departamentoId = document.getElementById('departamento_id').value;
    
    if (!departamentoId) {
        // Si no hay departamento seleccionado, llamar a la función para manejar los departamentos
        manejarGestionDepartamentosSeleccionadosEmpresa(empresa.id);
    }
}

function manejarGestionDepartamentosSeleccionadosEmpresa() {
    const empresaId = document.getElementById('empresa_id').value;
    if (!empresaId) {
        alert('Por favor, seleccione una empresa primero.');
        return;
    }

    const departamentoListContainer = document.getElementById('departamentoList');
    const isVisible = departamentoListContainer.style.display === 'block';

    if (!isVisible) {
        departamentoListContainer.style.display = 'block';

        fetch(`/api/departamentos-por-empresa/${empresaId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener la lista de departamentos de la empresa');
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
                        row.innerHTML = `
                            <td>${departamento.id}</td>
                            <td>${departamento.nombre}</td>
                        `;
                        row.addEventListener('click', () => seleccionarDepartamentosAsignadosParaEmpresa(departamento));
                        tbody.appendChild(row);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="2">No se encontraron departamentos asociados a esta empresa.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const tbody = departamentoListContainer.querySelector('tbody');
                tbody.innerHTML = '<tr><td colspan="2">Hubo un error al obtener la lista de departamentos de la empresa.</td></tr>';
            });
    } else {
        departamentoListContainer.style.display = 'none';
    }
}

function seleccionarDepartamentosAsignadosParaEmpresa(departamento) {
    document.getElementById('departamento_id').value = departamento.id;
    document.getElementById('nombreDepartamento').value = departamento.nombre;

    document.getElementById('departamentoList').style.display = 'none';

    const mensajeElemento = document.getElementById('mensaje');
    mensajeElemento.textContent = `Departamento "${departamento.nombre}" seleccionado para la empresa.`;
    mensajeElemento.style.color = 'blue';
}

function manejarGestionEmpresasSeleccionadasDepartamentos() {
    const departamentoId = document.getElementById('departamento_id').value;
    if (!departamentoId) {
        alert('Por favor, seleccione un departamento primero.');
        return;
    }

    const empresaListContainer = document.getElementById('empresaList');
    const isVisible = empresaListContainer.style.display === 'block';

    if (!isVisible) {
        empresaListContainer.style.display = 'block';

        fetch(`/api/empresas-por-departamento/${departamentoId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener la lista de empresas del departamento');
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
                            <td>${empresa.nif || 'N/A'}</td>
                        `;
                        row.addEventListener('click', () => seleccionarEmpresaAsignadaParaDepartamento(empresa));
                        tbody.appendChild(row);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="3">No se encontraron empresas asociadas a este departamento.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const tbody = empresaListContainer.querySelector('tbody');
                tbody.innerHTML = '<tr><td colspan="3">Hubo un error al obtener la lista de empresas del departamento.</td></tr>';
            });
    } else {
        empresaListContainer.style.display = 'none';
    }
}

function seleccionarEmpresaAsignadaParaDepartamento(empresa) {
    document.getElementById('empresa_id').value = empresa.id;
    document.getElementById('nombreEmpresa').value = empresa.nombre;

    document.getElementById('empresaList').style.display = 'none';

    const mensajeElemento = document.getElementById('mensaje');
    mensajeElemento.textContent = `Empresa "${empresa.nombre}" seleccionada para el departamento.`;
    mensajeElemento.style.color = 'blue';
}


function manejarGestionDepartamentos() {
    const departamentoListContainer = document.getElementById('departamentoList');
    const isVisible = departamentoListContainer.style.display === 'block';

    if (!isVisible) {
        departamentoListContainer.style.display = 'block';

        fetch('/api/departamentos')
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
                    console.log("El número de departamentos es: ",data.length);
                    data.forEach(departamento => {
                        const row = document.createElement('tr');
                        row.dataset.departamentoId = departamento.id;
                        row.innerHTML = `
                            <td>${departamento.id}</td>
                            <td>${departamento.nombre}</td>
                            <td>${departamento.empresas.map(e => e.nombre).join(', ')}</td>
                        `;
                        row.addEventListener('click', () => seleccionarDepartamento(departamento));
                        tbody.appendChild(row);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="3">No se encontraron departamentos.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const tbody = departamentoListContainer.querySelector('tbody');
                tbody.innerHTML = '<tr><td colspan="3">Hubo un error al obtener la lista de departamentos.</td></tr>';
            });
    } else {
        departamentoListContainer.style.display = 'none';
    }
}

function seleccionarDepartamento(departamento) {
    document.getElementById('departamento_id').value = departamento.id;
    document.getElementById('nombreDepartamento').value = departamento.nombre;
    
    // Mostrar la primera empresa asociada (si existe)
    if (departamento.empresas && departamento.empresas.length > 0) {
        document.getElementById('empresa_id').value = departamento.empresas[0].id;
        document.getElementById('nombreEmpresa').value = departamento.empresas[0].nombre;
    } else {
        document.getElementById('empresa_id').value = '';
        document.getElementById('nombreEmpresa').value = '';
    }

    document.getElementById('departamentoList').style.display = 'none';

    const mensajeElemento = document.getElementById('mensaje');
    mensajeElemento.textContent = `Departamento "${departamento.nombre}" seleccionado.`;
    mensajeElemento.style.color = 'blue';

    // Si hay múltiples empresas, mostrar un mensaje adicional
    if (departamento.empresas && departamento.empresas.length > 1) {
        mensajeElemento.textContent += ` Asociado a ${departamento.empresas.length} empresas.`;
        manejarGestionEmpresasSeleccionadasDepartamentos();
    }
}
function enviarFormularioDepartamento() {
    const nombreDepartamento = document.getElementById('nombreDepartamento').value;
    const empresaId = document.getElementById('empresa_id').value;

    fetch('/registroDepartamento', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: nombreDepartamento, empresaId: empresaId }),
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
