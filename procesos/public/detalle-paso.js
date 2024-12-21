document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const pasoId = urlParams.get('id');

    if (pasoId) {
        fetch(`/api/detalle-paso?id=${pasoId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(paso => {
                mostrarDetallePaso(paso);
                mostrarArchivoAdjunto(paso.url_contenido);
                return paso;
            })
            .then(paso => {
                // Obtener y mostrar la información de la empresa
                return fetch(`/api/empresa/${paso.empresa_id}`)
                    .then(response => response.json())
                    .then(empresa => {
                        mostrarInfoEmpresa(paso.empresa_id, empresa.nombre);
                        return paso;
                    });
            })
            .then(paso => {
                // Aquí puedes añadir llamadas similares para departamento y proceso si es necesario
            })
            .catch(error => {
                console.error('Error al obtener detalles del paso:', error);
                const container = document.getElementById('detalle-paso-contenedor');
                if (container) {
                    container.innerHTML = '<p>Error al cargar los detalles del paso. Por favor, intente de nuevo más tarde.</p>';
                } else {
                    console.error('El contenedor de detalles del paso no se encontró en el DOM');
                }
            });
    } else {
        const container = document.getElementById('detalle-paso-contenedor');
        if (container) {
            container.innerHTML = '<p>No se proporcionó un ID de paso válido.</p>';
        } else {
            console.error('El contenedor de detalles del paso no se encontró en el DOM');
        }
    }
});

function mostrarInfoEmpresa(empresaId, empresaNombre) {
    const infoContainer = document.getElementById('proceso-info');
    if (!infoContainer) {
        console.error('El contenedor de información del proceso no se encontró en el DOM');
        return;
    }
    infoContainer.innerHTML = `
        <p>Empresa: <span id="empresa-id">${empresaId}</span> - <span id="empresa-nombre">${empresaNombre || 'No especificada'}</span></p>
        <!-- Puedes añadir aquí la información de departamento y proceso si es necesario -->
    `;
}

function mostrarDetallePaso(paso) {
    const detalleContainer = document.getElementById('detalle-paso-contenedor');
    if (!detalleContainer) {
        console.error('El contenedor de detalles del paso no se encontró en el DOM');
        return;
    }
    detalleContainer.innerHTML = `
        <h2>Detalles del Paso ${paso.orden}</h2>
        <div class="form-group">
            <label>Descripción Corta:</label>
            <span>${paso.descripcion_corta}</span>
        </div>
        <div class="form-group">
            <label>Descripción Detallada:</label>
            <p>${paso.descripcion_detallada}</p>
        </div>
        <div class="form-group">
            <label>Tipo de Contenido:</label>
            <span>${paso.tipo_contenido}</span>
        </div>
    `;
}

// La función mostrarArchivoAdjunto permanece sin cambios

// La función mostrarArchivoAdjunto permanece sin cambios
function mostrarArchivoAdjunto(url) {
    const archivoContainer = document.getElementById('archivo-adjunto-contenedor');
    if (!archivoContainer) {
        console.error('El contenedor de archivo adjunto no se encontró en el DOM');
        return;
    }

    if (!url) {
        archivoContainer.innerHTML = '<p>No hay archivo adjunto para este paso.</p>';
        return;
    }

    const extension = url.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        archivoContainer.innerHTML = `
            <h3>Archivo Adjunto</h3>
            <img src="${url}" alt="Imagen adjunta" style="max-width: 100%; height: auto;">
        `;
    } else if (['pdf'].includes(extension)) {
        archivoContainer.innerHTML = `
            <h3>Archivo Adjunto</h3>
            <embed src="${url}" type="application/pdf" width="100%" height="600px" />
        `;
    } else if (['mp4', 'webm'].includes(extension)) {
        archivoContainer.innerHTML = `
            <h3>Archivo Adjunto (Video)</h3>
            <video id="video-player" width="100%" controls preload="metadata">
                <source src="${url}" type="video/${extension}">
                Tu navegador no soporta el tag de video.
            </video>
        `;
        const videoPlayer = document.getElementById('video-player');
        if (videoPlayer) {
            videoPlayer.addEventListener('loadedmetadata', () => {
                console.log('Metadata cargada');
            });
            videoPlayer.addEventListener('canplay', () => {
                console.log('Video listo para reproducir');
            });
            videoPlayer.addEventListener('error', (e) => {
                console.error('Error al cargar el video:', e);
            });
            videoPlayer.addEventListener('timeupdate', () => {
                console.log('Tiempo actual:', videoPlayer.currentTime);
            });
        }
    } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
        archivoContainer.innerHTML = `
            <h3>Archivo Adjunto (Audio)</h3>
            <audio controls preload="metadata">
                <source src="${url}" type="audio/${extension}">
                Tu navegador no soporta el tag de audio.
            </audio>
        `;
    } else {
        archivoContainer.innerHTML = `
            <h3>Archivo Adjunto</h3>
            <p>Tipo de archivo no soportado para visualización directa.</p>
            <a href="${url}" target="_blank">Descargar archivo</a>
        `;
    }
}

function eliminarPaso(pasoId) {
    if (confirm('¿Estás seguro de que quieres eliminar este paso?')) {
        fetch(`/api/detalle-paso/${pasoId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            alert('Paso eliminado con éxito');
            
            // Intenta cerrar la ventana/pestaña
            const cerradoExitoso = window.close();
            
            // Si no se pudo cerrar, muestra un mensaje
            if (!cerradoExitoso) {
                alert('La operación se ha completado.');
            }
        })
        .catch(error => {
            console.error('Error al eliminar el paso:', error);
            alert('Error al eliminar el paso. Por favor, intente de nuevo.');
        });
    }
}
