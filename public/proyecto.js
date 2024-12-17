
function cargarProyectoSeleccionado() {
    console.log('Iniciando cargarProyectoSeleccionado');
    console.log('sessionStorage actual:', JSON.stringify(sessionStorage));

    // Obtener los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const proyectoIdDesdeUrl = urlParams.get('id');
    const vieneDePaginaDesdeUrl = urlParams.get('vieneDe');

    // Leer del sessionStorage
    const proyectoId = sessionStorage.getItem('proyectoSeleccionado');
    const vieneDePagina = sessionStorage.getItem('vieneDePagina');

    console.log('Valores leídos:', { proyectoId, vieneDePagina });

    // Determinar el ID del proyecto y la página de origen
    let idParaCargar;
    let paginaOrigen;

    if (proyectoId && (vieneDePagina === 'promesas' || vieneDePagina === 'diagramaFlujo')) {
        // Cargar desde sessionStorage
        idParaCargar = proyectoId;
        paginaOrigen = vieneDePagina;
    } else if (proyectoIdDesdeUrl && vieneDePaginaDesdeUrl === 'diagramaFlujo') {
        // Cargar desde URL
        idParaCargar = proyectoIdDesdeUrl;
        paginaOrigen = 'diagramaFlujo';
    } else {
        console.log('No hay proyecto para cargar o la página de origen no es válida');
        return; // Salir si no hay un ID válido
    }

    console.log("Cargando proyecto:", idParaCargar, "viene de la página:", paginaOrigen);

    // Cargar el proyecto
    fetch(`/api/proyectos/${idParaCargar}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(proyecto => {
        console.log('Proyecto recibido de la API:', proyecto);
        
        const proyectoCompleto = {
            id_proyecto: proyecto.id,
            nombre_proyecto: proyecto.nombre_proyecto,
            descripcion_proyecto: proyecto.descripcion_proyecto || ''
        };

        seleccionarProyecto(proyectoCompleto);
        showMessage(`Proyecto cargado desde la página de ${paginaOrigen}`, 'success');

        // Limpiar el sessionStorage después de cargar el proyecto
        sessionStorage.removeItem('proyectoSeleccionado');
        sessionStorage.removeItem('vieneDePagina');
    })
    .catch(error => {
        console.error('Error al cargar el proyecto:', error);
        showMessage('Error al cargar el proyecto', 'error');
    });
}


function verificarProyecto() {
    const nombreProyecto = document.getElementById('nombre_proyecto').value.trim();
    const descripcionProyectoInput = document.getElementById('descripcion_proyecto');
    const registrarButton = document.querySelector('#proyectoForm button[type="submit"]');
    const modificarButton = document.getElementById('modificarProyecto');
    
    if (!nombreProyecto) {
        showMessage('El nombre del proyecto es obligatorio', 'error');
        return;
    }

    fetch('/api/proyectos', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(proyectos => {
        const proyectoExistente = proyectos.find(p => p.nombre_proyecto.toLowerCase() === nombreProyecto.toLowerCase());
        
        if (proyectoExistente) {
            showMessage(`El proyecto "${nombreProyecto}" ya existe.`, 'warning');
            descripcionProyectoInput.value = proyectoExistente.descripcion_proyecto || '';
            const proyectoIdDisplay = document.getElementById('proyecto_id_display');
            const proyectoNombreDisplay = document.getElementById('proyecto_nombre_display');
            proyectoIdDisplay.textContent = proyectoExistente.id_proyecto;
            proyectoNombreDisplay.textContent = proyectoExistente.nombre_proyecto;

            registrarButton.style.display = 'none';
            modificarButton.style.display = 'block';
        } else {
            showMessage(`El proyecto "${nombreProyecto}" está disponible.`, 'success');
            registrarButton.style.display = 'block';
            modificarButton.style.display = 'none';

            document.getElementById('proyecto_id_display').textContent = 'No seleccionado';
            document.getElementById('proyecto_nombre_display').textContent = '';
        }
    })
    .catch(error => {
        console.error('Error al verificar el proyecto:', error);
        showMessage('Error al verificar el proyecto', 'error');
    });
}

async function verificarDescripcionProyecto() {
    const nombreProyecto = document.getElementById('nombre_proyecto').value.trim();
    const descripcionProyecto = document.getElementById('descripcion_proyecto').value.trim();
    const maxLength = 500;
    const registrarButton = document.querySelector('#proyectoForm button[type="submit"]');
    const modificarButton = document.getElementById('modificarProyecto');

    // Verificar la longitud de la descripción
    if (descripcionProyecto.length > maxLength) {
        showMessage(`La descripción del proyecto no puede exceder los ${maxLength} caracteres.`, 'error');
        document.getElementById('descripcion_proyecto').focus();
        return false;
    }

    // Verificar si existe un nombre de proyecto
    if (nombreProyecto.length === 0) {
        showMessage('Debe introducir un nombre de proyecto primero.', 'error');
        document.getElementById('nombre_proyecto').focus();
        return false;
    }

    try {
        const response = await fetch('/api/proyectos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        const proyectos = await response.json();
        const proyectoExistente = proyectos.find(p => p.nombre_proyecto.toLowerCase() === nombreProyecto.toLowerCase());

        if (proyectoExistente) {
            if (proyectoExistente.descripcion_proyecto !== descripcionProyecto) {
                // La descripción ha sido modificada
                registrarButton.style.display = 'none';
                modificarButton.style.display = 'inline-block';
                showMessage('La descripción ha sido modificada. Utilice el botón "Modificar Proyecto" para guardar los cambios.', 'warning');
            } else {
                // La descripción no ha sido modificada
                registrarButton.style.display = 'none';
                modificarButton.style.display = 'none';
            }
        } else {
            // El proyecto no existe, mostrar botón de registrar
            registrarButton.style.display = 'inline-block';
            modificarButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Error al verificar el proyecto:', error);
        showMessage('Error al verificar el proyecto', 'error');
    }

    return true;
}

function manejarGestionProyectos() {
    const proyectoList = document.getElementById('proyectoList');
    if (proyectoList.style.display === 'block') {
        // Si la lista está visible, la ocultamos
        proyectoList.style.display = 'none';
    } else {
        // Si la lista está oculta, la mostramos
        console.log('Mostrando lista de proyectos...');
        fetch('/api/proyectos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(proyectos => {
            mostrarProyectosEnTabla(proyectos);
            proyectoList.style.display = 'block';
        })
        .catch(error => {
            console.error('Error al obtener la lista de proyectos:', error);
            showMessage('Error al cargar los proyectos', 'error');
        });
    }
}

function mostrarProyectosEnTabla(proyectos) {
    console.log("Mostrando proyectos en consola:", proyectos);
    const tabla = document.querySelector('#proyectoList table tbody');
    if (!tabla) {
        console.error("No se encontró la tabla de proyectos");
        return;
    }
    tabla.innerHTML = ''; // Limpiar la tabla existente

    proyectos.forEach(proyecto => {
        const fila = tabla.insertRow();
        fila.innerHTML = `
            <td>${proyecto.id || ''}</td>
            <td>${proyecto.nombre_proyecto || ''}</td>
        `;
        
        // Añadir event listener a cada fila
        fila.addEventListener('click', () => seleccionarProyecto(proyecto));
    });

    // Hacer visible la lista de proyectos
    document.getElementById('proyectoList').style.display = 'block';
}

function seleccionarProyecto(proyecto) {
    console.log('Proyecto recibido:', proyecto); // Para depuración

    // Actualizar los campos del formulario
    const proyectoIdDisplay = document.getElementById('proyecto_id_display');
    const proyectoNombreDisplay = document.getElementById('proyecto_nombre_display');
    const nombreProyectoInput = document.getElementById('nombre_proyecto');
    const descripcionProyectoInput = document.getElementById('descripcion_proyecto');

    if (proyectoIdDisplay && proyectoNombreDisplay) {
        proyectoIdDisplay.textContent = proyecto.id_proyecto || proyecto.id || 'ID no disponible';
        proyectoNombreDisplay.textContent = proyecto.nombre_proyecto || 'Nombre no disponible';
        console.log('Proyecto seleccionado:', proyectoIdDisplay.textContent, proyectoNombreDisplay.textContent);
    } else {
        console.error('Elementos de visualización del proyecto no encontrados');
    }

    // Rellenar los campos del formulario para edición
    if (nombreProyectoInput) {
        nombreProyectoInput.value = proyecto.nombre_proyecto || '';
    }
    if (descripcionProyectoInput) {
        descripcionProyectoInput.value = proyecto.descripcion_proyecto || '';
        console.log('Descripción del proyecto:', descripcionProyectoInput.value); // Para depuración
    }

    // Cambiar el estilo del botón de submit para indicar modo de edición
    const submitButton = document.querySelector('#proyectoForm button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Actualizar Proyecto';
        submitButton.dataset.mode = 'edit';
    }

    // Mostrar el botón de modificar y ocultar el de registrar
    const registrarButton = document.getElementById('registrarProyecto');
    const modificarButton = document.getElementById('modificarProyecto');
    if (registrarButton) registrarButton.style.display = 'none';
    if (modificarButton) modificarButton.style.display = 'inline-block';

    // Hacer scroll hasta el formulario
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Ocultar la lista de proyectos
    const proyectoList = document.getElementById('proyectoList');
    if (proyectoList) {
        proyectoList.style.display = 'none';
    }

    console.log('Formulario actualizado con datos del proyecto');
}

function limpiarFormularioProyecto() {
    // Limpiar los campos del formulario
    document.getElementById('nombre_proyecto').value = '';
    document.getElementById('descripcion_proyecto').value = '';

    // Restablecer los displays de proyecto actual
    document.getElementById('proyecto_id_display').textContent = 'No seleccionado';
    document.getElementById('proyecto_nombre_display').textContent = '';

    // Restablecer el botón de submit a su estado original
    const submitButton = document.querySelector('#proyectoForm button[type="submit"]');
    submitButton.textContent = 'Registrar Proyecto';
    submitButton.dataset.mode = 'create';

    // Limpiar cualquier mensaje de error o éxito
    const messageBox = document.getElementById('message-box');
    if (messageBox) {
        messageBox.textContent = '';
        messageBox.className = 'message';
    }

    // Opcional: Ocultar la lista de proyectos si está visible
    const proyectoList = document.getElementById('proyectoList');
    if (proyectoList) {
        proyectoList.style.display = 'none';
    }

    console.log('Formulario de proyecto limpiado');
    showMessage('Formulario limpiado', 'success');
}

async function actualizarProyecto(id) {
    const nombreProyecto = document.getElementById('nombre_proyecto').value;
    const descripcionProyecto = document.getElementById('descripcion_proyecto').value;
    
    console.log('Actualizando proyecto con ID:', id);
    
    try {
      const response = await fetch(`/api/proyectos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nombre_proyecto: nombreProyecto,
          descripcion_proyecto: descripcionProyecto
        })
      });
  
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
  
      const data = await response.json();
      console.log('Proyecto actualizado:', data);
      showMessage('Proyecto actualizado con éxito', 'success');
      limpiarFormularioProyecto();
    } catch (error) {
      console.error('Error al actualizar el proyecto:', error);
      showMessage('Error al actualizar el proyecto', 'error');
    }
  }

function eliminarProyecto(id) {
    console.log(`Eliminando proyecto con ID: ${id}`);
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
        fetch(`/api/proyectos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al eliminar el proyecto');
            }
            return response.json();
        })
        .then(data => {
            showMessage('Proyecto eliminado con éxito', 'success');
            manejarGestionProyectos(); // Recargar la lista de proyectos
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error al eliminar el proyecto', 'error');
        });
    }
}

async function validarFormularioProyecto(modo = 'crear') {
    console.log('Validando formulario de proyecto...');

    const nombreProyecto = document.getElementById('nombre_proyecto').value.trim();
    const descripcionProyecto = document.getElementById('descripcion_proyecto').value.trim();

    // Validaciones comunes para crear y modificar
    if (nombreProyecto === '') {
        showMessage('El nombre del proyecto es obligatorio', 'error');
        document.getElementById('nombre_proyecto').focus();
        return false;
    }

    if (nombreProyecto.length > 30) {
        showMessage('El nombre del proyecto no puede exceder los 30 caracteres', 'error');
        document.getElementById('nombre_proyecto').focus();
        return false;
    }

    const nombreRegex = /^[a-zA-Z0-9\s-]+$/;
    if (!nombreRegex.test(nombreProyecto)) {
        showMessage('El nombre del proyecto solo puede contener letras, números, espacios y guiones', 'error');
        document.getElementById('nombre_proyecto').focus();
        return false;
    }

    if (descripcionProyecto.length > 500) {
        showMessage('La descripción del proyecto no puede exceder los 500 caracteres', 'error');
        document.getElementById('descripcion_proyecto').focus();
        return false;
    }

    // Verificación específica para el modo de creación
    if (modo === 'crear') {
        try {
            const response = await fetch(`/api/verificar-proyecto?nombre=${encodeURIComponent(nombreProyecto)}`);
            const data = await response.json();
            if (data.existeProyecto) {
                showMessage(`El proyecto "${nombreProyecto}" ya existe.`, 'error');
                document.getElementById('nombre_proyecto').focus();
                return false;
            }
        } catch (error) {
            console.error('Error al verificar el proyecto:', error);
            showMessage('Error al verificar el proyecto', 'error');
            return false;
        }
    }

    return true;
}

async function enviarFormularioProyecto(modo = 'crear') {
    const nombreProyecto = document.getElementById('nombre_proyecto').value.trim();
    const descripcionProyecto = document.getElementById('descripcion_proyecto').value.trim();
    const proyectoId = document.getElementById('proyecto_id_display').textContent;

    const proyectoData = {
        nombre_proyecto: nombreProyecto,
        descripcion_proyecto: descripcionProyecto
    };

    let url = '/registroProyectos';
    let method = 'POST';

    if (modo === 'modificar') {
        url = `/api/proyectos/${proyectoId}`;
        method = 'PUT';
    }

    console.log('URL de la solicitud:', url); // Para depuración

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(proyectoData)
        });

        if (response.status === 409) {
            const data = await response.json();
            throw new Error(data.error || 'Ya existe un proyecto con ese nombre.');
        }

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        console.log('Proyecto procesado con éxito:', data);
        
        // Mostrar mensaje de éxito
        await showMessage(modo === 'crear' ? 'Proyecto registrado con éxito' : 'Proyecto actualizado con éxito', 'success');
        
        // Esperar un momento antes de limpiar el formulario
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Limpiar el formulario
        limpiarFormularioProyecto();
    } catch (error) {
        console.error('Error al procesar el proyecto:', error);
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
    }, 5000); // Aumentado a 5 segundos para que sea más visible
}

function limpiarFormularioProyecto() {
    // Limpiar los campos del formulario
    document.getElementById('nombre_proyecto').value = '';
    document.getElementById('descripcion_proyecto').value = '';

    // Limpiar los campos de proyecto-info
    document.getElementById('proyecto_id_display').textContent = 'No seleccionado';
    document.getElementById('proyecto_nombre_display').textContent = '';

    // Restablecer el botón de submit a su estado original
    const submitButton = document.querySelector('#proyectoForm button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Registrar Proyecto';
        submitButton.dataset.mode = 'create';
    }

    // Ocultar botones de registrar y modificar
    const registrarButton = document.getElementById('registrarProyecto');
    const modificarButton = document.getElementById('modificarProyecto');
    if (registrarButton) registrarButton.style.display = 'none';
    if (modificarButton) modificarButton.style.display = 'none';

    // Limpiar cualquier mensaje de error o éxito
    const messageBox = document.getElementById('message-box');
    if (messageBox) {
        messageBox.textContent = '';
        messageBox.className = 'message';
    }

    // Opcional: Ocultar la lista de proyectos si está visible
    const proyectoList = document.getElementById('proyectoList');
    if (proyectoList) {
        proyectoList.style.display = 'none';
    }

    console.log('Formulario de proyecto limpiado');
    //showMessage('Formulario limpiado', 'success');
}

document.addEventListener('DOMContentLoaded', function() {
    // ... otros event listeners ...

    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', volverPaginaAnterior);
    }
});

function volverPaginaAnterior() {
    window.history.back();
}

function manejarGestionPromesas() {
    const proyectoIdElement = document.getElementById('proyecto_id_display');
    const proyectoId = proyectoIdElement ? proyectoIdElement.textContent.trim() : null;

    console.log('Elemento proyecto_id_display:', proyectoIdElement); // Para depuración
    console.log('ID del proyecto seleccionado:', proyectoId);

    if (proyectoId && proyectoId !== 'No seleccionado') {
        // Redirigir a la página de gestión de promesas con el ID del proyecto
        window.location.href = `/registroPromesas?proyectoId=${proyectoId}`;
    } else {
        console.log('Proyecto actual:', document.getElementById('proyecto_nombre_display').textContent);
        showMessage('Por favor, selecciona un proyecto antes de gestionar promesas', 'error');
    }
}