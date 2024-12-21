function cargarTiposPromesa() {
    console.log('Iniciando carga de tipos de promesa');
    fetch('/api/tipos-promesa', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Respuesta recibida:', response.status);
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Error del servidor: ${response.status}. Detalles: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Datos recibidos:', data);
        const tipoPromesaSelect = document.getElementById('tipo_promesa');
        if (tipoPromesaSelect) {
            tipoPromesaSelect.innerHTML = '<option value="">Seleccione un tipo</option>';
            
            if (Array.isArray(data)) {
                data.forEach(tipo => {
                    const option = document.createElement('option');
                    option.value = tipo.id_tipo;
                    option.textContent = tipo.descripcion;
                    tipoPromesaSelect.appendChild(option);
                });
                console.log('Tipos de promesa cargados en el select');
            } else {
                console.warn('Los datos recibidos no son un array:', data);
                if (data.message) {
                    console.log(data.message);
                }
            }
        } else {
            console.warn('El elemento select "tipo_promesa" no se encontró en el DOM.');
        }
    })
    .catch(error => {
        console.error('Error al cargar los tipos de promesa:', error);
        const mensajeError = document.getElementById('mensaje-error');
        if (mensajeError) {
            mensajeError.textContent = `Error: ${error.message}`;
            mensajeError.style.display = 'block';
        }
    });
}

function cargarTiposFlechas() {
    console.log('Iniciando carga de tipos de flecha');
    fetch('/api/tipos-flecha', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Respuesta recibida:', response.status);
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Error del servidor: ${response.status}. Detalles: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Datos de tipos de flecha recibidos:', data);
        const direccionFlechaSelect = document.getElementById('direccion_flecha_id');
        if (direccionFlechaSelect) {
            direccionFlechaSelect.innerHTML = '<option value="">Seleccione una dirección</option>';
            data.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.id_direccion;
                option.textContent = tipo.descripcion;
                direccionFlechaSelect.appendChild(option);
            });
            console.log('Tipos de flecha cargados en el select');
        } else {
            console.error('Elemento select de dirección de flecha no encontrado');
        }
    })
    .catch(error => {
        console.error('Error al cargar los tipos de flecha:', error);
        showMessage('Error al cargar los tipos de flecha', 'error');
    });
}

// Función para mostrar/ocultar campos según el tipo de promesa
function toggleConditionalFields() {
    const tipoPromesa = document.getElementById('tipo_promesa').value;
    const ramaVerdaderaContainer = document.getElementById('rama_verdadera_container');
    const ramaFalsaContainer = document.getElementById('rama_falsa_container');
    const inicioBucleContainer = document.getElementById('inicio_bucle_container');
    const finBucleContainer = document.getElementById('fin_bucle_container');

    // Ocultar todos los campos condicionales por defecto
    ramaVerdaderaContainer.style.display = 'none';
    ramaFalsaContainer.style.display = 'none';
    inicioBucleContainer.style.display = 'none';
    finBucleContainer.style.display = 'none';

    // Mostrar campos según el tipo de promesa seleccionado
    switch(tipoPromesa) {
        case '6': // Asumiendo que 6 es el ID para "Si entonces"
            ramaVerdaderaContainer.style.display = 'block';
            ramaFalsaContainer.style.display = 'block';
            break;
        case '4': // Asumiendo que 4 es el ID para "Repetir mientras"
        case '5': // Asumiendo que 5 es el ID para "Repetir hasta"
            inicioBucleContainer.style.display = 'block';
            finBucleContainer.style.display = 'block';
            break;
    }
}

// Función para eliminar una promesa
function eliminarPromesa(promesaId) {
    if (confirm('¿Está seguro de que desea eliminar esta promesa?')) {
        fetch(`/api/eliminar-promesa/${promesaId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            console.log('Promesa eliminada:', data);
            showMessage('Promesa eliminada con éxito', 'success');
            limpiarFormularioPromesa();
            manejarGestionPromesas(); // Actualiza la lista de promesas
        })
        .catch(error => {
            console.error('Error al eliminar la promesa:', error);
            showMessage('Error al eliminar la promesa: ' + (error.message || 'Error desconocido'), 'error');
        });
    }
}

function verificarPromesa() {
    const nombrePromesa = document.getElementById('nombre_promesa').value.trim();
    const numOrdenPromesaInput = document.getElementById('num_orden_promesa');
    const tipoPromesaSelect = document.getElementById('tipo_promesa');
    const siguientePromesaIdInput = document.getElementById('siguiente_promesa_id');
    const direccionFlechaIdSelect = document.getElementById('direccion_flecha_id');
    const registrarButton = document.getElementById('registrarPromesa');
    const modificarButton = document.getElementById('modificarPromesa');
    const mensajeElement = document.getElementById('mensaje-promesa');

    // Logging para depuración
    console.log('Verificando promesa:', nombrePromesa);
    console.log('Número de orden actual:', numOrdenPromesaInput.value);
    console.log('Tipo de promesa actual:', tipoPromesaSelect.value);
    console.log('ID de siguiente promesa actual:', siguientePromesaIdInput.value);
    console.log('ID de dirección de flecha actual:', direccionFlechaIdSelect.value);

    if (!nombrePromesa) {
        showMessage('El nombre de la promesa es obligatorio', 'error');
        ocultarBotones();
        return;
    }

    // Obtener el ID del proyecto
    const proyectoIdElement = document.getElementById('proyecto_id_display');
    const proyectoId = proyectoIdElement ? proyectoIdElement.textContent.trim() : null;

    // Verificar si se ha seleccionado un proyecto
    if (!proyectoId || proyectoId === 'No seleccionado') {
        showMessage('Debe seleccionar un proyecto antes de verificar la promesa.', 'error');
        return;
    }

    fetch(`/api/verificar-promesa?nombre=${encodeURIComponent(nombrePromesa)}&proyecto=${encodeURIComponent(proyectoId)}`)
        .then(response => {
            if (!response.ok) {
                console.error('Error en la respuesta del servidor:', response.statusText);
                throw new Error(`Error al verificar la promesa: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.existePromesa) {
                showMessage(`La promesa "${nombrePromesa}" ya existe.`, 'warning');
                
                const numOrdenActual = numOrdenPromesaInput.value;
                const tipoActual = tipoPromesaSelect.value;
                const siguientePromesaIdActual = siguientePromesaIdInput.value;
                const direccionFlechaIdActual = direccionFlechaIdSelect.value;
                
                let cambios = false;
                let mensajeCambios = [];

                // Verificar cambios solo si los campos tienen valores
                if (numOrdenActual && numOrdenActual !== data.num_orden) {
                    cambios = true;
                    mensajeCambios.push("número de orden");
                }
                if (tipoActual && tipoActual !== data.tipo_id) {
                    cambios = true;
                    mensajeCambios.push("tipo de promesa");
                }
                if (siguientePromesaIdActual && siguientePromesaIdActual !== data.siguiente_promesa_id) {
                    cambios = true;
                    mensajeCambios.push("siguiente promesa");
                }
                if (direccionFlechaIdActual && direccionFlechaIdActual !== data.direccion_flecha_id) {
                    cambios = true;
                    mensajeCambios.push("dirección de flecha");
                }

                if (cambios) {
                    mostrarBotonModificar();
                    showMessage(`Se han detectado cambios en ${mensajeCambios.join(", ")}. Utilice el botón "Modificar Promesa" para guardar los cambios.`, 'info');
                } else {
                    mostrarBotonEliminar();
                }
                
                // Actualizar campos solo si están vacíos
                if (!numOrdenPromesaInput.value) {
                    numOrdenPromesaInput.value = data.num_orden || '';
                }
                if (!tipoPromesaSelect.value) {
                    tipoPromesaSelect.value = data.tipo_id || '';
                }
                if (!siguientePromesaIdInput.value) {
                    siguientePromesaIdInput.value = data.siguiente_promesa_id || '';
                }
                if (!direccionFlechaIdSelect.value) {
                    direccionFlechaIdSelect.value = data.direccion_flecha_id || '';
                }
            } else {
                showMessage(`La promesa "${nombrePromesa}" está disponible.`, 'success');
                mostrarBotonRegistrar();
            }
        })
        .catch(error => {
            console.error('Error al verificar la promesa:', error);
            showMessage('Error al verificar la promesa', 'error');
            ocultarBotones();
        });
}
function actualizarInterfazSegunTipo() {
    const tipoPromesaSelect = document.getElementById('tipo_promesa');
    const nombrePromesa = document.getElementById('nombre_promesa').value.trim();
    const numOrdenPromesa = document.getElementById('num_orden_promesa').value.trim();
    const siguientePromesaId = document.getElementById('siguiente_promesa_id').value.trim();
    const direccionFlechaId = document.getElementById('direccion_flecha_id').value;
    const ramaVerdaderaContainer = document.getElementById('rama_verdadera_container');
    const ramaFalsaContainer = document.getElementById('rama_falsa_container');
    const inicioBucleContainer = document.getElementById('inicio_bucle_container');
    const finBucleContainer = document.getElementById('fin_bucle_container');

    if (!tipoPromesaSelect) {
        console.error('El elemento select "tipo_promesa" no se encontró en el DOM.');
        return;
    }

    const tipoSeleccionado = tipoPromesaSelect.value;

    // Verificar si se han ingresado los datos necesarios
    if (nombrePromesa.length === 0 || numOrdenPromesa.length === 0) {
        showMessage('Debe introducir un nombre y número de orden para la promesa primero.', 'error');
        ocultarBotones();
        return;
    }

    // Logging para depuración
    console.log('Verificando promesa:', nombrePromesa);
    console.log('Número de orden actual:', numOrdenPromesa);
    console.log('Tipo de promesa seleccionado:', tipoSeleccionado);
    console.log('ID de siguiente promesa:', siguientePromesaId);
    console.log('ID de dirección de flecha:', direccionFlechaId);

    // Ocultar todos los campos condicionales por defecto
    ramaVerdaderaContainer.style.display = 'none';
    ramaFalsaContainer.style.display = 'none';
    inicioBucleContainer.style.display = 'none';
    finBucleContainer.style.display = 'none';

    // Mostrar campos según el tipo de promesa seleccionado
    switch(tipoSeleccionado) {
        case '6': // Asumiendo que 6 es el ID para "Si entonces"
            ramaVerdaderaContainer.style.display = 'block';
            ramaFalsaContainer.style.display = 'block';
            break;
        case '4': // Asumiendo que 4 es el ID para "Repetir mientras"
        case '5': // Asumiendo que 5 es el ID para "Repetir hasta"
            inicioBucleContainer.style.display = 'block';
            finBucleContainer.style.display = 'block';
            break;
    }

    // Verificar si la promesa ya existe y si el tipo ha sido modificado
    fetch(`/api/verificar-promesa?nombre=${encodeURIComponent(nombrePromesa)}&proyecto=${encodeURIComponent(document.getElementById('proyecto_id_display').textContent.trim())}`)
        .then(response => {
            if (!response.ok) {
                console.error('Error en la respuesta del servidor:', response.statusText);
                throw new Error(`Error al verificar la promesa: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.existePromesa) {
                if (data.tipo_id !== tipoSeleccionado) {
                    // El tipo ha sido modificado
                    mostrarBotonModificar();
                    showMessage('El tipo de promesa ha sido modificado. Utilice el botón "Modificar Promesa" para guardar los cambios.', 'warning');
                } else {
                    // El tipo no ha sido modificado
                    ocultarBotones();
                }
            } else {
                // La promesa no existe, mostrar botón de registrar
                mostrarBotonRegistrar();
            }
        })
        .catch(error => {
            console.error('Error al verificar la promesa:', error);
            showMessage('Error al verificar la promesa', 'error');
            ocultarBotones();
        });
}

function verificarOrdenPromesa() {
    const nombrePromesa = document.getElementById('nombre_promesa').value.trim();
    const numOrdenPromesa = document.getElementById('num_orden_promesa').value.trim();
    const proyectoIdElement = document.getElementById('proyecto_id_display');
    const proyectoId = proyectoIdElement ? proyectoIdElement.textContent.trim() : null;

    // Verificaciones iniciales
    console.log('Verificando orden de promesa:');
    console.log('Nombre de la promesa:', nombrePromesa);
    console.log('Número de orden:', numOrdenPromesa);
    console.log('ID del proyecto:', proyectoId);

    // Verificar si se ha seleccionado un proyecto
    if (!proyectoId || proyectoId === 'No seleccionado') {
        showMessage('Debe seleccionar un proyecto antes de verificar el orden de la promesa.', 'error');
        ocultarBotones();
        return false;
    }

    // Verificar si se ha ingresado un número de orden
    if (numOrdenPromesa.length === 0) {
        showMessage('Debe introducir un número de orden para la promesa.', 'error');
        document.getElementById('num_orden_promesa').focus();
        ocultarBotones();
        return false;
    }

    // Verificar si existe un nombre de promesa
    if (nombrePromesa.length === 0) {
        showMessage('Debe introducir un nombre de promesa primero.', 'error');
        document.getElementById('nombre_promesa').focus();
        ocultarBotones();
        return false;
    }

    // Verificar si la promesa ya existe y si el orden ha sido modificado
    fetch(`/api/verificar-promesa?nombre=${encodeURIComponent(nombrePromesa)}&proyecto=${encodeURIComponent(proyectoId)}`)
        .then(response => {
            if (!response.ok) {
                console.error('Error en la respuesta del servidor:', response.statusText);
                throw new Error(`Error al verificar la promesa: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.existePromesa) {
                if (data.num_orden !== numOrdenPromesa) {
                    // Verificar si el nuevo número de orden está disponible
                    verificarOrdenDisponible(numOrdenPromesa, proyectoId, true);
                } else {
                    ocultarBotones();
                    showMessage('No se han realizado cambios en el número de orden.', 'info');
                }
            } else {
                // La promesa no existe, verificar si el orden está disponible para una nueva promesa
                verificarOrdenDisponible(numOrdenPromesa, proyectoId, false);
            }
        })
        .catch(error => {
            console.error('Error al verificar la promesa:', error);
            showMessage('Error al verificar la promesa', 'error');
            ocultarBotones();
        });

    return true;
}

function verificarOrdenDisponible(numOrdenPromesa, proyectoId, esModificacion) {
    fetch(`/api/verificar-orden-promesa?num_orden_promesa=${encodeURIComponent(numOrdenPromesa)}&id_proyecto=${encodeURIComponent(proyectoId)}`)
        .then(response => response.json())
        .then(ordenData => {
            if (ordenData.ordenExiste) {
                showMessage('Este número de orden ya está en uso por otra promesa. Por favor, elija otro.', 'error');
                ocultarBotones();
            } else {
                if (esModificacion) {
                    mostrarBotonModificar();
                    showMessage('El nuevo número de orden está disponible. Puede modificar la promesa.', 'success');
                } else {
                    mostrarBotonRegistrar();
                    showMessage('El número de orden está disponible para una nueva promesa.', 'success');
                }
            }
        })
        .catch(error => {
            console.error('Error al verificar el orden de la promesa:', error);
            showMessage('Error al verificar el orden de la promesa', 'error');
            ocultarBotones();
        });
}

async function manejarGestionPromesas() {
    const promesaList = document.getElementById('promesaList');
    const proyectoIdDisplay = document.getElementById('proyecto_id_display');
    
    const proyectoId = proyectoIdDisplay.textContent;
    
    if (proyectoId === 'No seleccionado') {
        showMessage('Por favor, seleccione un proyecto primero', 'warning');
        return;
    }

    // Comprobar si la tabla de promesas está visible
    if (promesaList.style.display === 'block') {
        // Si está visible, la ocultamos
        promesaList.style.display = 'none';
        return; // Terminamos la función aquí
    }

    try {
        // Fetch tipos de promesa, tipos de flecha, y promesas del proyecto en paralelo
        const [tiposPromesaResponse, tiposFlechaResponse, promesasResponse] = await Promise.all([
            fetch('/api/tipos-promesa', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }),
            fetch('/api/tipos-flecha', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }),
            fetch(`/api/promesas-proyecto/${proyectoId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
        ]);

        if (!tiposPromesaResponse.ok) {
            throw new Error('Error al obtener los tipos de promesa');
        }
        if (!tiposFlechaResponse.ok) {
            throw new Error('Error al obtener los tipos de flecha');
        }
        if (!promesasResponse.ok) {
            if (promesasResponse.status === 404) {
                throw new Error('No se encontraron promesas para este proyecto');
            }
            throw new Error('Error en la respuesta del servidor');
        }

        const tiposPromesa = await tiposPromesaResponse.json();
        const tiposFlecha = await tiposFlechaResponse.json();
        const promesas = await promesasResponse.json();

        if (promesas.length === 0) {
            showMessage('No hay promesas para este proyecto', 'info');
            promesaList.style.display = 'none';
        } else {
            mostrarPromesasEnTabla(promesas, tiposPromesa, tiposFlecha);
            promesaList.style.display = 'block';
        }
    } catch (error) {
        console.error('Error al obtener la lista de promesas:', error);
        showMessage(error.message, 'error');
        promesaList.style.display = 'none';
    }
}

function mostrarPromesasEnTabla(promesas, tiposPromesa, tiposFlecha) {
    console.log("Mostrando promesas en consola:", promesas);
    console.log("Tipos de promesa:", tiposPromesa);
    console.log("Tipos de flecha:", tiposFlecha);
    const tabla = document.querySelector('#promesaList table tbody');
    if (!tabla) {
        console.error("No se encontró la tabla de promesas");
        return;
    }
    tabla.innerHTML = ''; // Limpiar la tabla existente

    // Crear mapas para búsqueda rápida
    const tiposPromesaMap = new Map(tiposPromesa.map(tipo => [tipo.id_tipo, tipo.descripcion]));
    const tiposFlechaMap = new Map(tiposFlecha.map(flecha => [flecha.id_direccion, flecha.descripcion]));

    promesas.forEach(promesa => {
        console.log("Procesando promesa:", promesa);
        console.log("Dirección de flecha ID:", promesa.direccion_flecha_id);

        let nombreDireccionFlecha = 'No especificada';
        if (promesa.direccion_flecha_id !== undefined && promesa.direccion_flecha_id !== null) {
            nombreDireccionFlecha = tiposFlechaMap.get(promesa.direccion_flecha_id) || 'Desconocida';
        }
        console.log("Nombre de dirección de flecha:", nombreDireccionFlecha);

        const fila = tabla.insertRow();
        fila.innerHTML = `
            <td>${promesa.id_promesa || ''}</td>
            <td>${promesa.num_orden_promesa || ''}</td>
            <td>${promesa.nombre_promesa || ''}</td>
            <td>${tiposPromesaMap.get(promesa.tipo_promesa) || ''}</td>
            <td>${promesa.siguiente_promesa_nombre || '-'}</td>
            <td>${nombreDireccionFlecha}</td>
            <td>${promesa.rama_verdadera_nombre || '-'}</td>
            <td>${promesa.rama_falsa_nombre || '-'}</td>
            <td>${promesa.inicio_bucle_nombre || '-'}</td>
            <td>${promesa.fin_bucle_nombre || '-'}</td>
        `;
        
        // Añadir event listener a cada fila
        fila.addEventListener('click', () => seleccionarPromesa(promesa));
    });

    // Hacer visible la lista de promesas
    document.getElementById('promesaList').style.display = 'block';
}
function seleccionarPromesa(promesa) {
    console.log('Promesa recibida:', promesa);

    // Actualizar el campo oculto con el ID de la promesa
    const promesaIdDisplay = document.getElementById('promesa_id_display');
    if (promesaIdDisplay) {
        promesaIdDisplay.value = promesa.id_promesa;
    } else {
        console.error('Elemento promesa_id_display no encontrado');
    }

    // Guardar el ID de la promesa en un atributo data del formulario
    const form = document.getElementById('promesaForm');
    form.dataset.promesaId = promesa.id_promesa;

    // Rellenar los campos del formulario para edición
    document.getElementById('nombre_promesa').value = promesa.nombre_promesa;
    document.getElementById('num_orden_promesa').value = promesa.num_orden_promesa;
    
    // Seleccionar el tipo de promesa correcto en el select
    const tipoPromesaSelect = document.getElementById('tipo_promesa');
    if (tipoPromesaSelect) {
        const tipoPromesa = promesa.tipo_promesa || promesa.tipo_id;
        
        for (let i = 0; i < tipoPromesaSelect.options.length; i++) {
            if (tipoPromesaSelect.options[i].value == tipoPromesa) {
                tipoPromesaSelect.selectedIndex = i;
                break;
            }
        }
    } else {
        console.error('Select de tipo de promesa no encontrado');
    }

    // Rellenar los nuevos campos
    document.getElementById('siguiente_promesa_id').value = promesa.siguiente_promesa_id || '';

    // Cargar y seleccionar la dirección de la flecha
    cargarYSeleccionarDireccionFlecha(promesa.direccion_flecha_id);

    // Mostrar y rellenar campos condicionales según el tipo de promesa
    actualizarCamposCondicionales(promesa);

    // Mostrar botones de modificar y eliminar, ocultar botón de registrar
    mostrarBotonesEdicion();

    // Cambiar el estilo del botón de submit para indicar modo de edición
    const submitButton = document.querySelector('#promesaForm button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Actualizar Promesa';
        submitButton.dataset.mode = 'edit';
    }

    // Hacer scroll hasta el formulario
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Ocultar la lista de promesas
    const promesaList = document.getElementById('promesaList');
    if (promesaList) {
        promesaList.style.display = 'none';
    }

    console.log('Promesa seleccionada:', promesa.id_promesa, promesa.nombre_promesa);
}

function cargarYSeleccionarDireccionFlecha(direccionFlechaId) {
    fetch('/api/tipos-flecha', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(tiposFlechas => {
        const direccionFlechaSelect = document.getElementById('direccion_flecha_id');
        if (direccionFlechaSelect) {
            // Limpiar opciones existentes
            direccionFlechaSelect.innerHTML = '<option value="">Seleccione una dirección</option>';
            
            // Añadir nuevas opciones
            tiposFlechas.forEach(tipoFlecha => {
                const option = document.createElement('option');
                option.value = tipoFlecha.id_direccion;
                option.textContent = tipoFlecha.descripcion;
                direccionFlechaSelect.appendChild(option);
            });

            // Seleccionar la dirección de flecha correspondiente
            if (direccionFlechaId) {
                direccionFlechaSelect.value = direccionFlechaId;
            }
        } else {
            console.error('Select de dirección de flecha no encontrado');
        }
    })
    .catch(error => {
        console.error('Error al cargar tipos de flecha:', error);
    });
}

function actualizarCamposCondicionales(promesa) {
    const ramaVerdaderaContainer = document.getElementById('rama_verdadera_container');
    const ramaFalsaContainer = document.getElementById('rama_falsa_container');
    const inicioBucleContainer = document.getElementById('inicio_bucle_container');
    const finBucleContainer = document.getElementById('fin_bucle_container');

    // Ocultar todos los campos condicionales primero
    ramaVerdaderaContainer.style.display = 'none';
    ramaFalsaContainer.style.display = 'none';
    inicioBucleContainer.style.display = 'none';
    finBucleContainer.style.display = 'none';

    // Mostrar campos según el tipo de promesa
    const tipoPromesa = promesa.tipo_promesa || promesa.tipo_id;
    if (tipoPromesa == '6') { // Si entonces
        ramaVerdaderaContainer.style.display = 'block';
        ramaFalsaContainer.style.display = 'block';
        document.getElementById('rama_verdadera_id').value = promesa.rama_verdadera_id || '';
        document.getElementById('rama_falsa_id').value = promesa.rama_falsa_id || '';
    } else if (tipoPromesa == '4' || tipoPromesa == '5') { // Repetir mientras o Repetir hasta
        inicioBucleContainer.style.display = 'block';
        finBucleContainer.style.display = 'block';
        document.getElementById('inicio_bucle_id').value = promesa.inicio_bucle_id || '';
        document.getElementById('fin_bucle_id').value = promesa.fin_bucle_id || '';
    }
}

function mostrarBotonesEdicion() {
    const registrarButton = document.getElementById('registrarPromesa');
    const modificarButton = document.getElementById('modificarPromesa');
    const eliminarButton = document.getElementById('eliminarPromesa');

    if (registrarButton) registrarButton.style.display = 'none';
    if (modificarButton) modificarButton.style.display = 'inline-block';
    if (eliminarButton) eliminarButton.style.display = 'inline-block';
}

function limpiarFormularioPromesa() {
    function limpiarElemento(id, accion) {
        const elemento = document.getElementById(id);
        if (elemento) {
            accion(elemento);
        }
    }

    limpiarElemento('nombre_promesa', el => el.value = '');
    limpiarElemento('num_orden_promesa', el => el.value = '');
    limpiarElemento('tipo_promesa', el => el.value = '');

    limpiarElemento('message-box', el => {
        el.textContent = '';
        el.className = 'message';
    });

    limpiarElemento('promesaList', el => el.style.display = 'none');

    console.log('Formulario de promesa limpiado');
    if (typeof showMessage === 'function') {
        showMessage('Formulario limpiado', 'success');
    }
}

async function validarFormularioPromesa(modo = 'crear') {
    console.log('Validando formulario de promesa...');

    const nombrePromesa = document.getElementById('nombre_promesa').value.trim();
    const numOrdenPromesa = document.getElementById('num_orden_promesa').value.trim();
    const tipoPromesa = document.getElementById('tipo_promesa').value;
    const proyectoId = document.getElementById('proyecto_id_display').textContent;
    const siguientePromesaId = document.getElementById('siguiente_promesa_id').value.trim();
    const direccionFlechaId = document.getElementById('direccion_flecha_id').value;
    const ramaVerdaderaId = document.getElementById('rama_verdadera_id').value.trim();
    const ramaFalsaId = document.getElementById('rama_falsa_id').value.trim();
    const inicioBucleId = document.getElementById('inicio_bucle_id').value.trim();
    const finBucleId = document.getElementById('fin_bucle_id').value.trim();

    // Validaciones comunes para crear y modificar
    if (nombrePromesa === '' || numOrdenPromesa === '' || tipoPromesa === '' || proyectoId === 'No seleccionado' || direccionFlechaId === '') {
        showMessage('Todos los campos obligatorios deben estar llenos', 'error');
        return false;
    }

    if (nombrePromesa.length > 20) {
        showMessage('El nombre de la promesa no puede exceder los 20 caracteres', 'error');
        document.getElementById('nombre_promesa').focus();
        return false;
    }

    const nombreRegex = /^[a-zA-Z0-9\s-]+$/;
    if (!nombreRegex.test(nombrePromesa)) {
        showMessage('El nombre de la promesa solo puede contener letras, números, espacios y guiones', 'error');
        document.getElementById('nombre_promesa').focus();
        return false;
    }

    if (numOrdenPromesa === '') {
        showMessage('El número de orden es obligatorio', 'error');
        document.getElementById('num_orden_promesa').focus();
        return false;
    }

    if (isNaN(numOrdenPromesa) || parseInt(numOrdenPromesa) <= 0) {
        showMessage('El número de orden debe ser un número positivo', 'error');
        document.getElementById('num_orden_promesa').focus();
        return false;
    }

    if (tipoPromesa === '') {
        showMessage('Debe seleccionar un tipo de promesa', 'error');
        document.getElementById('tipo_promesa').focus();
        return false;
    }

    if (proyectoId === 'No seleccionado') {
        showMessage('Debe seleccionar un proyecto antes de crear una promesa', 'error');
        return false;
    }

        // Validación para dirección_flecha_id
        if (direccionFlechaId === '') {
            showMessage('Debe seleccionar una dirección de flecha', 'error');
            document.getElementById('direccion_flecha_id').focus();
            return false;
        }
    
// Validaciones condicionales basadas en el tipo de promesa
if (tipoPromesa === '6') { // Asumiendo que 6 es el ID para "Si entonces"
    if (ramaVerdaderaId !== '' || ramaFalsaId !== '') {
        console.log('Se han proporcionado ramas para "Si entonces":', { ramaVerdaderaId, ramaFalsaId });
    }
} else if (tipoPromesa === '4' || tipoPromesa === '5') { // Asumiendo que 4 y 5 son para bucles
    if (inicioBucleId !== '' || finBucleId !== '') {
        console.log('Se han proporcionado IDs de inicio o fin de bucle:', { inicioBucleId, finBucleId });
    }
}

    // Validaciones específicas según el modo
    if (modo === 'crear') {
        try {
            const response = await fetch(`/api/verificar-promesa?nombre=${encodeURIComponent(nombrePromesa)}&proyecto=${encodeURIComponent(proyectoId)}&orden=${encodeURIComponent(numOrdenPromesa)}`);
            const data = await response.json();
            if (data.existePromesa) {
                showMessage(`La promesa "${nombrePromesa}" ya existe en este proyecto.`, 'error');
                document.getElementById('nombre_promesa').focus();
                return false;
            }
            if (data.ordenExiste) {
                showMessage(`El número de orden ${numOrdenPromesa} ya está en uso en este proyecto.`, 'error');
                document.getElementById('num_orden_promesa').focus();
                return false;
            }
        } catch (error) {
            console.error('Error al verificar la promesa:', error);
            showMessage('Error al verificar la promesa', 'error');
            return false;
        }
    } else if (modo === 'modificar') {
        // Aquí puedes añadir validaciones específicas para el modo de modificación
        // Por ejemplo, verificar si el nuevo nombre o número de orden no están en uso por otras promesas
        // excepto la que se está modificando
    }

    // Verificaciones opcionales para IDs de promesas relacionadas
    const idsAVerificar = [siguientePromesaId, ramaVerdaderaId, ramaFalsaId, inicioBucleId, finBucleId].filter(id => id !== '');
    for (const id of idsAVerificar) {
        try {
            const verificacionResponse = await fetch(`/api/verificar-promesa-existente?id=${encodeURIComponent(id)}&proyecto=${encodeURIComponent(proyectoId)}`);
            const verificacionData = await verificacionResponse.json();
            if (!verificacionData.existePromesa) {
                showMessage(`La promesa con ID ${id} no existe en este proyecto. Esto no detiene el proceso, pero se recomienda verificar.`, 'warning');
            }
        } catch (error) {
            console.error('Error al verificar promesa relacionada:', error);
            showMessage(`Error al verificar la promesa relacionada con ID ${id}`, 'warning');
        }
    }

    return true; // Si todas las validaciones pasan
}

async function enviarFormularioPromesa() {
    const form = document.getElementById('promesaForm');
    const nombrePromesa = document.getElementById('nombre_promesa')?.value.trim() ?? '';
    const numOrdenPromesa = document.getElementById('num_orden_promesa')?.value.trim() ?? '';
    const tipoPromesa = document.getElementById('tipo_promesa')?.value ?? '';
    const proyectoId = document.getElementById('proyecto_id_display')?.textContent ?? '';
    const siguientePromesaId = document.getElementById('siguiente_promesa_id')?.value.trim() ?? '';
    const direccionFlechaId = document.getElementById('direccion_flecha_id')?.value ?? '';
    const ramaVerdaderaId = document.getElementById('rama_verdadera_id')?.value.trim() ?? '';
    const ramaFalsaId = document.getElementById('rama_falsa_id')?.value.trim() ?? '';
    const inicioBucleId = document.getElementById('inicio_bucle_id')?.value.trim() ?? '';
    const finBucleId = document.getElementById('fin_bucle_id')?.value.trim() ?? '';

    // Validaciones
    if (!nombrePromesa || !numOrdenPromesa || !tipoPromesa || !proyectoId || !direccionFlechaId) {
        showMessage('Por favor, complete todos los campos requeridos', 'error');
        return;
    }

    const promesaData = {
        nombre_promesa: nombrePromesa,
        num_orden_promesa: numOrdenPromesa,
        tipo_id: tipoPromesa,
        id_proyecto: proyectoId,
        siguiente_promesa_id: siguientePromesaId || null,
        direccion_flecha_id: direccionFlechaId
    };

 // Añadir campos condicionales según el tipo de promesa
if (tipoPromesa === '6') { // Si entonces
    promesaData.rama_verdadera_id = ramaVerdaderaId || null;
    promesaData.rama_falsa_id = ramaFalsaId || null;
} else if (tipoPromesa === '4' || tipoPromesa === '5') { // Repetir mientras o Repetir hasta
    promesaData.inicio_bucle_id = inicioBucleId || null;
    promesaData.fin_bucle_id = finBucleId || null;
}

    try {
        const response = await fetch('/registroPromesas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(promesaData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la respuesta del servidor');
        }

        const data = await response.json();
        console.log('Promesa registrada con éxito:', data);
        
        showMessage('Promesa registrada con éxito', 'success');
        
        setTimeout(() => {
            limpiarFormularioPromesa();
            manejarGestionPromesas();
        }, 1000);
    } catch (error) {
        console.error('Error al registrar la promesa:', error);
        showMessage(error.message, 'error');
    }
}

async function modificarPromesa() {
    const form = document.getElementById('promesaForm');
    const nombrePromesa = document.getElementById('nombre_promesa')?.value.trim() ?? '';
    const numOrdenPromesa = document.getElementById('num_orden_promesa')?.value.trim() ?? '';
    const tipoPromesa = document.getElementById('tipo_promesa')?.value ?? '';
    const proyectoId = document.getElementById('proyecto_id_display')?.textContent ?? '';
    const promesaId = form.dataset.promesaId;
    const siguientePromesaId = document.getElementById('siguiente_promesa_id')?.value.trim() ?? '';
    const direccionFlechaId = document.getElementById('direccion_flecha_id')?.value ?? '';
    const ramaVerdaderaId = document.getElementById('rama_verdadera_id')?.value.trim() ?? '';
    const ramaFalsaId = document.getElementById('rama_falsa_id')?.value.trim() ?? '';
    const inicioBucleId = document.getElementById('inicio_bucle_id')?.value.trim() ?? '';
    const finBucleId = document.getElementById('fin_bucle_id')?.value.trim() ?? '';

    if (!promesaId) {
        showMessage('No se puede modificar: ID de promesa no encontrado', 'error');
        return;
    }

    // Validaciones
    if (!nombrePromesa || !numOrdenPromesa || !tipoPromesa || !proyectoId || !direccionFlechaId) {
        showMessage('Por favor, complete todos los campos requeridos', 'error');
        return;
    }

    const promesaData = {
        id_promesa: promesaId,
        nombre_promesa: nombrePromesa,
        num_orden_promesa: numOrdenPromesa,
        tipo_id: tipoPromesa,
        id_proyecto: proyectoId,
        siguiente_promesa_id: siguientePromesaId || null,
        direccion_flecha_id: direccionFlechaId,
        rama_verdadera_id: ramaVerdaderaId || null,
        rama_falsa_id: ramaFalsaId || null,
        inicio_bucle_id: inicioBucleId || null,
        fin_bucle_id: finBucleId || null
    };

    try {
        const response = await fetch(`/api/promesas/${promesaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(promesaData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la respuesta del servidor');
        }

        const data = await response.json();
        console.log('Promesa modificada con éxito:', data);
        
        showMessage('Promesa actualizada con éxito', 'success');
        
        setTimeout(() => {
            limpiarFormularioPromesa();
            manejarGestionPromesas(); // Actualizar la lista de promesas
        }, 1000);
    } catch (error) {
        console.error('Error al modificar la promesa:', error);
        showMessage(error.message, 'error');
    }
}

function showMessage(message, type) {
    const messageBox = document.getElementById('message-box');
    if (!messageBox) {
        console.error('Elemento message-box no encontrado');
        return;
    }

    // Limpiar clases existentes y aplicar nuevas
    messageBox.className = 'message ' + type;
    messageBox.textContent = message;
    messageBox.style.display = 'block';

    console.log('Mensaje mostrado:', message, 'Tipo:', type); // Para depuración

    // Ocultar el mensaje después de un tiempo
    setTimeout(() => {
        messageBox.style.display = 'none';
        messageBox.className = 'message'; // Restablecer a la clase base
    }, 2000); // 5 segundos para que sea más visible
}


function mostrarBotonRegistrar() {
    const registrarButton = document.getElementById('registrarPromesa');
    const modificarButton = document.getElementById('modificarPromesa');
    const eliminarButton = document.getElementById('eliminarPromesa');
    
    if (registrarButton) registrarButton.style.display = 'inline-block';
    if (modificarButton) modificarButton.style.display = 'none';
    if (eliminarButton) eliminarButton.style.display = 'none';
}

function mostrarBotonModificar() {
    const registrarButton = document.getElementById('registrarPromesa');
    const modificarButton = document.getElementById('modificarPromesa');
    const eliminarButton = document.getElementById('eliminarPromesa');
    
    if (registrarButton) registrarButton.style.display = 'none';
    if (modificarButton) modificarButton.style.display = 'inline-block';
    if (eliminarButton) eliminarButton.style.display = 'inline-block';
}

function mostrarBotonEliminar() {
    const registrarButton = document.getElementById('registrarPromesa');
    const modificarButton = document.getElementById('modificarPromesa');
    const eliminarButton = document.getElementById('eliminarPromesa');
    
    if (registrarButton) registrarButton.style.display = 'none';
    if (modificarButton) modificarButton.style.display = 'none';
    if (eliminarButton) eliminarButton.style.display = 'inline-block';
}

function ocultarBotones() {
    const registrarButton = document.getElementById('registrarPromesa');
    const modificarButton = document.getElementById('modificarPromesa');
    const eliminarButton = document.getElementById('eliminarPromesa');
    
    if (registrarButton) registrarButton.style.display = 'none';
    if (modificarButton) modificarButton.style.display = 'none';
    if (eliminarButton) eliminarButton.style.display = 'none';
}