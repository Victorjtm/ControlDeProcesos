function obtenerDatosRuta(pasoId) {
    return fetch(`/api/detalle-paso?id=${pasoId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener datos de la ruta');
            }
            return response.json();
        })
        .then(paso => {
            // Rellenar el formulario con los datos obtenidos
            document.getElementById('empresa_id_display').textContent = paso.empresa_id;

            // Obtener el nombre de la empresa usando su ID
            return fetch(`/api/empresa/${paso.empresa_id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al obtener datos de la empresa');
                    }
                    return response.json();
                })
                .then(empresa => {
                    // Mostrar el nombre de la empresa en el HTML
                    document.getElementById('empresa_nombre_display').textContent = empresa.nombre || 'No especificada';
                    return paso; // Retornar el objeto paso para usarlo más adelante
                });
        })
        .then(paso => {
            // Obtener los departamentos asociados a la empresa
            return fetch(`/api/departamentos-por-empresa/${paso.empresa_id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al obtener departamentos de la empresa');
                    }
                    return response.json();
                })
                .then(departamentos => {
                    const departamentoSelect = document.getElementById('departamento');

                    // Limpiar las opciones existentes
                    departamentoSelect.innerHTML = '';

                    // Rellenar el select con las opciones de departamentos
                    departamentos.forEach(departamento => {
                        const option = document.createElement('option');
                        option.value = departamento.id;
                        option.textContent = departamento.nombre;
                        departamentoSelect.appendChild(option);
                    });

                    // Seleccionar el departamento actual del paso
                    departamentoSelect.value = paso.departamento_id;

                    return paso; // Retornar el objeto paso para usarlo más adelante
                });
        })
        .then(paso => {
            // Ahora, obtenemos los procesos asociados al departamento seleccionado
            return fetch(`/api/procesos-por-departamento/${paso.departamento_id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al obtener procesos del departamento');
                    }
                    return response.json();
                })
                .then(procesos => {
                    const procesoSelect = document.getElementById('proceso');

                    // Limpiar las opciones existentes
                    procesoSelect.innerHTML = '';

                    // Rellenar el select con las opciones de procesos
                    procesos.forEach(proceso => {
                        const option = document.createElement('option');
                        option.value = proceso.id;
                        option.textContent = proceso.nombre;
                        procesoSelect.appendChild(option);
                    });

                    // Seleccionar el proceso actual del paso
                    procesoSelect.value = paso.proceso_id;

                    return paso; // Retornar el objeto paso para usarlo más adelante
                });
        })
        .then(paso => {
            // Rellenar los demás campos del formulario
            document.getElementById('orden').value = paso.orden;
            document.getElementById('descripcion_corta').value = paso.descripcion_corta;
            document.getElementById('descripcion_detallada').value = paso.descripcion_detallada;

            // Retornar el objeto paso completo
            return paso;
        });
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const pasoId = urlParams.get('id');
    if (pasoId) {
        obtenerDatosRuta(pasoId)
            .then(paso => {
                mostrarArchivoAdjunto(paso.url_contenido);
            })
            .catch(error => {
                console.error('Error al obtener datos de la ruta:', error);
                showMessage("Error al cargar los datos del paso.", "error");
            });
    } else {
        console.error('No se proporcionó un ID de paso');
        showMessage("No se proporcionó un ID de paso válido.", "error");
    }
});

function mostrarArchivoAdjunto(url) {
    const archivoContainer = document.getElementById('archivo-adjunto-contenedor');
    const archivoInput = document.getElementById('archivo');
    const archivoActualLabel = document.createElement('p');
    archivoActualLabel.id = 'archivo-actual-label';

    if (!archivoContainer || !archivoInput) {
        console.error('Elementos de archivo no encontrados en el DOM');
        return;
    }

    // Limpiar el contenedor
    archivoContainer.innerHTML = '';

    if (!url) {
        archivoActualLabel.textContent = 'No hay archivo adjunto para este paso.';
    } else {
        const fileName = url.split('/').pop();
        archivoActualLabel.textContent = `Archivo actual: ${fileName}`;
        
        // Crear un enlace para ver/descargar el archivo actual
        const archivoLink = document.createElement('a');
        archivoLink.href = url;
        archivoLink.textContent = 'Ver/Descargar archivo actual';
        archivoLink.target = '_blank';
        archivoContainer.appendChild(archivoLink);
    }

    // Añadir el label del archivo actual
    archivoContainer.appendChild(archivoActualLabel);

    // Añadir el input de archivo después del label
    archivoContainer.appendChild(archivoInput);

    // Listener para cuando se seleccione un nuevo archivo
    archivoInput.addEventListener('change', function(event) {
        if (event.target.files.length > 0) {
            archivoActualLabel.textContent = `Nuevo archivo seleccionado: ${event.target.files[0].name}`;
        }
    });
}

async function validarFormularioModificacion() {
    // Obtener valores de los campos de entrada del formulario
    const departamento = document.getElementById("departamento").value.trim();
    const proceso = document.getElementById("proceso").value.trim();
    const empresaId = document.getElementById("empresa_id_display").textContent.trim();
    const orden = document.getElementById("orden").value.trim();
    const descripcionCorta = document.getElementById("descripcion_corta").value.trim();
    const descripcionDetallada = document.getElementById("descripcion_detallada").value.trim();
    const archivo = document.getElementById("archivo").files[0];

    // Variables para control de errores
    let departamentoValido = false;
    let procesoValido = false;
    let ordenValido = false;
    let descripcionCortaValida = false;
    let descripcionDetalladaValida = true; // Opcional
    let archivoValido = true; // Opcional

    // Validación de selección de departamento
    if (departamento !== "" && departamento !== "Seleccione un departamento") {
        departamentoValido = true;
        document.getElementById("departamentoError").style.display = "none";
    } else {
        document.getElementById("departamentoError").textContent = "Debe seleccionar un departamento.";
        document.getElementById("departamentoError").style.display = "block";
    }

    // Validación de selección de proceso
    if (proceso !== "" && proceso !== "Seleccione un proceso") {
        procesoValido = true;
        document.getElementById("procesoError").style.display = "none";
    } else {
        document.getElementById("procesoError").textContent = "Debe seleccionar un proceso.";
        document.getElementById("procesoError").style.display = "block";
    }

    // Validación de número de orden
    const ordenNumero = parseInt(orden, 10);
    if (ordenNumero > 0 && Number.isInteger(ordenNumero)) {
        try {
            const response = await fetch(`/api/obtenerOrdenMaximo?proceso=${proceso}&empresa_id=${empresaId}`);
            const data = await response.json();
            if (ordenNumero <= data.maxOrden + 1) {
                ordenValido = true;
                document.getElementById("ordenError").style.display = "none";
            } else {
                document.getElementById("ordenError").textContent = "El número de orden no es válido.";
                document.getElementById("ordenError").style.display = "block";
            }
        } catch (error) {
            console.error('Error al validar el número de orden:', error);
            document.getElementById("ordenError").textContent = "Error al validar el número de orden.";
            document.getElementById("ordenError").style.display = "block";
        }
    } else {
        document.getElementById("ordenError").textContent = "El número de orden debe ser un número entero positivo.";
        document.getElementById("ordenError").style.display = "block";
    }

    // Validación de descripción corta
    if (descripcionCorta.length >= 10 && descripcionCorta.length <= 255) {
        descripcionCortaValida = true;
        document.getElementById("descripcion_cortaError").style.display = "none";
    } else {
        document.getElementById("descripcion_cortaError").textContent = "La descripción corta debe tener entre 10 y 255 caracteres.";
        document.getElementById("descripcion_cortaError").style.display = "block";
    }

    // Validación de descripción detallada (opcional)
    if (descripcionDetallada.length > 0 && descripcionDetallada.length <= 1000) {
        descripcionDetalladaValida = true;
        document.getElementById("descripcion_detalladaError").style.display = "none";
    } else if (descripcionDetallada.length > 1000) {
        descripcionDetalladaValida = false;
        document.getElementById("descripcion_detalladaError").textContent = "La descripción detallada no debe exceder los 1000 caracteres.";
        document.getElementById("descripcion_detalladaError").style.display = "block";
    }

// Validación de archivo adjunto (opcional)
if (archivo) {
    const tipoArchivo = archivo.type;
    const tiposPermitidos = [
        'image/jpeg', 
        'image/png', 
        'video/mp4', 
        'audio/mpeg', 
        'video/avi', 
        'video/x-matroska', 
        'image/gif',
        'video/webm'  // Añadido para permitir archivos WebM
    ];
    if (tiposPermitidos.includes(tipoArchivo)) {
        archivoValido = true;
        document.getElementById("archivoError").style.display = "none";
    } else {
        archivoValido = false;
        document.getElementById("archivoError").textContent = "El archivo adjunto debe ser una imagen, video, audio o animación válidos.";
        document.getElementById("archivoError").style.display = "block";
        console.log("Tipo de archivo no permitido:", tipoArchivo); // Para depuración
    }
}

    
    let mensajeError = '';

    if (!departamentoValido) {
        mensajeError = "Debe seleccionar un departamento válido.";
    } else if (!procesoValido) {
        mensajeError = "Debe seleccionar un proceso válido.";
    } else if (!ordenValido) {
        mensajeError = "El número de orden no es válido.";
    } else if (!descripcionCortaValida) {
        mensajeError = "La descripción corta debe tener entre 10 y 255 caracteres.";
    } else if (!descripcionDetalladaValida) {
        mensajeError = "La descripción detallada no debe exceder los 1000 caracteres.";
    } else if (!archivoValido) {
        mensajeError = "El archivo adjunto debe ser una imagen, video, audio o animación válidos.";
    }

    // Verificar si todos los campos requeridos son válidos
    const esValido = departamentoValido && procesoValido && ordenValido && descripcionCortaValida && descripcionDetalladaValida && archivoValido;
    
    console.log('Resultado de la validación:', esValido);
    console.log('Departamento válido:', departamentoValido);
    console.log('Proceso válido:', procesoValido);
    console.log('Orden válido:', ordenValido);
    console.log('Descripción corta válida:', descripcionCortaValida);
    console.log('Descripción detallada válida:', descripcionDetalladaValida);
    console.log('Archivo válido:', archivoValido);

    return esValido;
}

async function enviarDatosModificados(event) {
    console.log('Función enviarDatosModificados iniciada');
    event.preventDefault();

    console.log('Iniciando validación del formulario');
    if (await validarFormularioModificacion()) {
        console.log('Formulario validado correctamente');
        const formData = new FormData(document.getElementById('modificarPasoForm'));
        const pasoId = new URLSearchParams(window.location.search).get('id');

        // Obtener el ID de la empresa desde el span
        const empresaId = document.getElementById('empresa_id_display').textContent.trim();
        formData.append('empresa_id', empresaId);

        // Imprimir los datos que se van a enviar
        console.log('Datos que se enviarán:');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        try {
            const response = await fetch(`/api/modificar-paso/${pasoId}`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    // No incluyas 'Content-Type' aquí, el navegador lo configurará automáticamente para FormData
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en la respuesta del servidor');
            }

            const result = await response.json();
            showMessage(result.message, 'success');

            // Redirigir a la página de detalles del paso
            setTimeout(() => {
                window.location.href = `/detalle-paso?id=${pasoId}`;
            }, 2000); // Esperar 2 segundos antes de redirigir

        } catch (error) {
            console.error('Error al modificar el paso:', error);
            showMessage(error.message, 'error');
        }
    } else {
        console.log('La validación del formulario falló');
        showMessage('Por favor, corrija los errores en el formulario antes de enviarlo.', 'error');
    }
}

function esMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function capturarFoto() {
    const archivoInput = document.getElementById('archivo');

    if (esMobile()) {
        // En dispositivos móviles, usar el input de archivo nativo
        archivoInput.accept = "image/*";
        archivoInput.capture = "camera";
        archivoInput.click();
    } else {
        // Código existente para PC
        const canvas = document.getElementById('canvas');
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();

                video.addEventListener('loadedmetadata', function() {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    setTimeout(() => {
                        canvas.getContext('2d').drawImage(video, 0, 0);
                        canvas.toBlob(function(blob) {
                            const file = new File([blob], "foto.jpg", { type: "image/jpeg" });
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(file);
                            archivoInput.files = dataTransfer.files;

                            stream.getTracks().forEach(track => track.stop());
                            
                            document.getElementById('archivo-actual-label').textContent = `Nuevo archivo seleccionado: foto.jpg`;
                        }, 'image/jpeg');
                    }, 1000);
                });
            })
            .catch(function(err) {
                console.log("Error al acceder a la cámara: " + err);
            });
    }
}

let mediaRecorder;
let recordedChunks = [];

function grabarVideo() {
    const archivoInput = document.getElementById('archivo');
    const grabarVideoBtn = document.getElementById('grabarVideo');
    const videoPreview = document.getElementById('video-preview');

    if (esMobile()) {
        // En dispositivos móviles, usar el input de archivo nativo
        archivoInput.accept = "video/*";
        archivoInput.capture = "camcorder";
        archivoInput.click();
    } else {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(function(stream) {
                    // Mostrar el video en el elemento de vista previa
                    videoPreview.srcObject = stream;
                    videoPreview.style.display = 'block';
                    videoPreview.play();

                    // Inicializar el MediaRecorder
                    mediaRecorder = new MediaRecorder(stream);
                    recordedChunks = []; // Limpiar los chunks grabados

                    mediaRecorder.ondataavailable = function(e) {
                        if (e.data.size > 0) {
                            recordedChunks.push(e.data);
                        }
                    };

                    mediaRecorder.onstop = function() {
                        const blob = new Blob(recordedChunks, { type: 'video/webm' });
                        const file = new File([blob], "video.webm", { type: "video/webm" });

                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        archivoInput.files = dataTransfer.files;

                        // Detener el stream de video
                        stream.getTracks().forEach(track => track.stop());

                        // Actualizar el label del archivo
                        document.getElementById('archivo-actual-label').textContent = `Nuevo archivo seleccionado: video.webm`;

                        // Reiniciar el botón
                        grabarVideoBtn.textContent = 'Grabar Video'; // Cambiar texto del botón
                    };

                    // Iniciar la grabación
                    mediaRecorder.start();
                    console.log("Grabación iniciada");
                    grabarVideoBtn.textContent = 'Detener Grabación'; // Cambiar texto del botón

                })
                .catch(function(err) {
                    console.log("Error al acceder a la cámara y micrófono: " + err);
                });
        } else if (mediaRecorder.state === 'recording') {
            // Detener la grabación si ya está en curso
            mediaRecorder.stop();
            console.log("Grabación detenida");
        }
    }
}

function grabarPantalla() {
    if (esMobile()) {
        alert("La grabación de pantalla no está disponible en dispositivos móviles.");
        return;
    }
    const archivoInput = document.getElementById('archivo');

    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        console.log("Grabación detenida");
    } else {
        const grabarAudio = confirm("¿Deseas grabar audio mientras grabas la pantalla?");

        navigator.mediaDevices.getDisplayMedia({ video: true, audio: grabarAudio })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunks, { type: 'video/webm' });
                    const file = new File([blob], "grabacion-pantalla.webm", { type: "video/webm" });

                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    archivoInput.files = dataTransfer.files;

                    recordedChunks = [];
                    stream.getTracks().forEach(track => track.stop());

                    // Actualizar el label del archivo
                    document.getElementById('archivo-actual-label').textContent = `Nuevo archivo seleccionado: grabacion-pantalla.webm`;
                };

                mediaRecorder.start();
                console.log("Grabación iniciada");
            })
            .catch(err => {
                console.error("Error al acceder a la pantalla: ", err);
            });
    }
}

// Añadir un event listener para manejar la selección de archivo en dispositivos móviles
document.getElementById('archivo').addEventListener('change', function(e) {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        document.getElementById('archivo-actual-label').textContent = `Nuevo archivo seleccionado: ${file.name}`;
    }
});