document.addEventListener('DOMContentLoaded', function() {
    const page = document.body.dataset.page;
    if (page === 'pasosProceso') {
        cargarDatosProceso();
    }
});

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && document.body.dataset.page === 'pasosProceso') {
        cargarDatosProceso();
    }
});

function cargarDatosProceso() {
    const urlParams = new URLSearchParams(window.location.search);
    const empresaId = urlParams.get('empresaId');
    const departamentoId = urlParams.get('departamentoId');
    const procesoId = urlParams.get('procesoId');
    const empresaNombre = decodeURIComponent(urlParams.get('empresaNombre') || '');
    const departamentoNombre = decodeURIComponent(urlParams.get('departamentoNombre') || '');
    const procesoNombre = decodeURIComponent(urlParams.get('procesoNombre') || '');

    console.log('Empresa:', empresaId, empresaNombre);
    console.log('Departamento:', departamentoId, departamentoNombre);
    console.log('Proceso:', procesoId, procesoNombre);

    // Introducir los datos en el HTML
    document.getElementById('empresa-nombre').textContent = empresaNombre;
    document.getElementById('departamento-nombre').textContent = departamentoNombre;
    document.getElementById('proceso-nombre').textContent = procesoNombre;

    // Cargar y mostrar tabla de pasos
    cargarTablapasos(empresaId, departamentoId, procesoId);

    // Cargar y mostrar visualización de pasos
    cargarVisualizacionPasos(empresaId, departamentoId, procesoId);
}

function cargarTablapasos(empresaId, departamentoId, procesoId) {
    console.log('Cargando pasos para:', empresaId, departamentoId, procesoId);
    fetch(`/api/pasos?empresaId=${empresaId}&departamentoId=${departamentoId}&procesoId=${procesoId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener los pasos');
        }
        return response.json();
    })
    .then(pasos => {
        // Mostrar todos los datos recibidos en la consola
        console.log('Datos recibidos de la API:', pasos);

        const tbody = document.querySelector('#pasos-tabla tbody');
        tbody.innerHTML = '';
        
        if (!pasos || pasos.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="2">No hay pasos disponibles para este proceso.</td>';
            tbody.appendChild(tr);
            return;
        }

        pasos.forEach(paso => {
            // Solo cargar pasos donde ruta_id no es null
            if (paso.id !== null) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${paso.orden || 'N/A'}</td>
                    <td>${paso.descripcion_corta || 'Sin descripción'}</td>
                `;
                tr.addEventListener('click', () => seleccionarPaso(paso.id));
                tbody.appendChild(tr);
            }
        });
    })
    .catch(error => {
        console.error('Error al cargar pasos:', error);
        mostrarMensaje('Error al cargar los pasos del proceso', 'error');
        const tbody = document.querySelector('#pasos-tabla tbody');
        tbody.innerHTML = '<tr><td colspan="2">Error al cargar los pasos. Por favor, intente de nuevo más tarde.</td></tr>';
    });
}




function cargarVisualizacionPasos(empresaId, departamentoId, procesoId) {
    fetch(`/api/pasos?empresaId=${empresaId}&departamentoId=${departamentoId}&procesoId=${procesoId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(pasos => {
            // Mostrar todos los datos recibidos en la consola
            console.log('Datos recibidos de la API:', pasos);

            const visualContainer = document.querySelector('.pasos-visual');
            visualContainer.innerHTML = '';

            if (!pasos || pasos.length === 0) {
                visualContainer.innerHTML = '<p>No hay pasos disponibles para este proceso.</p>';
                return;
            }

            pasos.forEach(paso => {
                // Solo mostrar los pasos cuyo ruta_id no sea null
                if (paso.id !== null) {
                    const contenidoUrl = paso.url_contenido;
                    console.log('URL del contenido:', contenidoUrl);
                    const pasoElement = document.createElement('div');
                    pasoElement.className = 'paso-visual';

                    // Determinar si es una imagen o un video basado en la extensión del archivo
                    const esVideo = contenidoUrl && /\.(mp4|webm|ogg)$/i.test(contenidoUrl);

                    pasoElement.innerHTML = `
                        <div class="orden-sopa">Paso ${paso.orden || 'N/A'}</div>
                        <div class="descripcion-corta">${paso.descripcion_corta || 'Sin descripción'}</div>
                        <div class="imagen-container">
                            ${contenidoUrl 
                                ? (esVideo 
                                    ? `<div class="video-wrapper">
                                         <video src="${contenidoUrl}" preload="metadata">
                                           Tu navegador no soporta el elemento de video.
                                         </video>
                                         <div class="video-overlay">
                                           <span class="play-icon">▶</span>
                                         </div>
                                       </div>`
                                    : `<img src="${contenidoUrl}" alt="Paso ${paso.orden || 'N/A'}" onerror="this.onerror=null; this.src='/ruta/a/imagen-por-defecto.jpg';">`)
                                : '<p>No hay contenido multimedia disponible</p>'
                            }
                        </div>
                    `;

                    // Agregar evento de clic al elemento del paso
                    pasoElement.addEventListener('click', (event) => {
                        if (esVideo && event.target.closest('.video-overlay')) {
                            event.preventDefault();
                            const video = pasoElement.querySelector('video');
                            const overlay = pasoElement.querySelector('.video-overlay');
                            if (video.paused) {
                                video.play();
                                overlay.style.display = 'none';
                            } else {
                                video.pause();
                                overlay.style.display = 'flex';
                            }
                        } else if (paso.id) {
                            seleccionarPaso(paso.id);
                        }
                    });

                    visualContainer.appendChild(pasoElement);
                }
            });
        })
        .catch(error => {
            console.error('Error al cargar visualización de pasos:', error);
            const visualContainer = document.querySelector('.pasos-visual');
            visualContainer.innerHTML = '<p>Error al cargar los pasos. Por favor, intente de nuevo más tarde.</p>';
        });
}



function seleccionarPaso(pasoId) {
    const detalleVentana = window.open(`/detalle-paso?id=${pasoId}`, '_blank');
    
    // Verificar periódicamente si la ventana se ha cerrado
    const checkCerrado = setInterval(() => {
        if (detalleVentana.closed) {
            clearInterval(checkCerrado);
            cargarDatosProceso(); // Recargar datos cuando se cierra la ventana de detalles
        }
    }, 1000); // Verificar cada segundo
}