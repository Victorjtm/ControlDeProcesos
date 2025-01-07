document.addEventListener('DOMContentLoaded', function() {
    const page = document.body.dataset.page;
    if (page === 'rutas') {

        const selectProceso = document.getElementById('proceso');
        const selectEmpresa = document.getElementById('empresa_id_display');
        const selectDepartamento = document.getElementById('departamento');
        const ordenInput = document.getElementById('orden');

        function cargarProcesos() {
            const empresaId = selectEmpresa.textContent.split(' ')[0]; // Asumiendo que el ID está al principio
            const departamentoId = selectDepartamento.value;

            if (!empresaId || !departamentoId) {
                console.log('Empresa o departamento no seleccionados');
                return;
            }

            fetch(`/api/procesos-por-empresa-departamento/${empresaId}/${departamentoId}`)
                .then(response => response.json())
                .then(procesos => {
                    selectProceso.innerHTML = '<option value="">Seleccione un proceso</option>';
                    procesos.forEach(proceso => {
                        const option = document.createElement('option');
                        option.value = proceso.id;
                        option.textContent = proceso.nombre;
                        selectProceso.appendChild(option);
                    });
                    selectProceso.disabled = false;
                    console.log("Procesos cargados:", procesos);
                })
                .catch(error => {
                    console.error('Error al cargar los procesos:', error);
                });
        }

        // Evento para cargar procesos cuando se selecciona un departamento
        selectDepartamento.addEventListener('change', cargarProcesos);

        // Cargar procesos iniciales si ya hay una empresa y departamento seleccionados
        if (selectEmpresa.textContent && selectDepartamento.value) {
            cargarProcesos();
        }
    }
});

       // Verificar si el proceso está seleccionado y obtener su número
       function verificarProcesoSeleccionado() {
        const selectProceso = document.getElementById('proceso');
        if (selectProceso && selectProceso.selectedIndex > 0) {
            const procesoSeleccionado = selectProceso.value;
            console.log(`Proceso seleccionado: ${procesoSeleccionado}`);
            return procesoSeleccionado;
        } else {
            console.log('Ningún proceso seleccionado');
            return null;
        }
        };

// Función para manejar la obtención y visualización de la lista de empresas
function manejarGestionEmpresasRutas() {
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
                        row.addEventListener('click', () => seleccionarEmpresaRuta(empresa));
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

function seleccionarEmpresaRuta(empresa) {
    // Actualizar los elementos de visualización con la información de la empresa
    document.getElementById('empresa_id_display').textContent = empresa.id;
    document.getElementById('empresa_nombre_display').textContent = empresa.nombre;

    // Ocultar la tabla de empresas después de seleccionar
    document.getElementById('empresaList').style.display = 'none';

    console.log("La empresa seleccionada es: ", empresa.id);

    // Habilitar todos los campos del formulario
    habilitarCamposFormulario();

    // Opcional: Guardar la selección en localStorage para persistencia
    localStorage.setItem('empresaSeleccionada', JSON.stringify(empresa));

    // Cargar los departamentos asociados a la empresa seleccionada
    cargarDepartamentos(empresa.id);
}

function cargarDepartamentos(empresaId) {
    fetch(`/api/departamentos-por-empresa/${empresaId}`)
        .then(response => response.json())
        .then(departamentos => {
            const departamentoSelect = document.getElementById('departamento');
            departamentoSelect.innerHTML = '<option value="">Seleccione un departamento</option>';
            departamentos.forEach(dept => {
                departamentoSelect.innerHTML += `<option value="${dept.id}">${dept.nombre}</option>`;
            });
            departamentoSelect.disabled = false;
        })
        .catch(error => {
            console.error('Error al cargar departamentos:', error);
            mostrarMensaje('Error al cargar departamentos', true);
        });
}



// Modificar la función habilitarCamposFormulario para incluir el event listener del proceso
function habilitarCamposFormulario() {
    const formElements = document.querySelectorAll('#rutaForm select, #rutaForm input, #rutaForm textarea, #rutaForm button');
    const selectProceso = document.getElementById('proceso');

    formElements.forEach(element => {
        if (element.id === 'proceso') {
            element.disabled = false;

            if (!element.querySelector('option[value=""]')) {
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Seleccione un proceso';
                defaultOption.selected = true;
                defaultOption.disabled = true;
                element.insertBefore(defaultOption, element.firstChild);
            }

            element.value = '';
        } else {
            element.disabled = !selectProceso.value;
        }
    });

    // Añadir event listener al select de procesos
    selectProceso.addEventListener('change', function() {
        const procesoSeleccionado = this.value;
        formElements.forEach(element => {
            if (element.id !== 'proceso') {
                element.disabled = !procesoSeleccionado;
            }
        });

        if (procesoSeleccionado) {
            actualizarOrdenProceso(); // Llamar a la nueva función cuando se selecciona un proceso
        }
    });
}


// Función opcional para deshabilitar campos si se necesita
function deshabilitarCamposFormulario() {
    const formElements = document.querySelectorAll('#rutaForm select, #rutaForm input, #rutaForm textarea, #rutaForm button');
    formElements.forEach(element => {
        if (element.id !== 'empresa_id' && element.id !== 'empresa_nombre') {
            element.disabled = true;
        }
    });
}

function actualizarOrdenProceso() {
    const selectProceso = document.getElementById('proceso');
    const ordenInput = document.getElementById('orden');
    const procesoId = selectProceso.value;
    const empresaId = document.getElementById('empresa_id_display').textContent.split(' ')[0];
    const departamentoId = document.getElementById('departamento').value;
    const mensajeElement = document.getElementById('mensaje');

    console.log("Proceso seleccionado:", procesoId);
    console.log('Empresa seleccionada:', empresaId);
    console.log('Departamento seleccionado:', departamentoId);

    if (procesoId && empresaId && departamentoId) {
        fetch(`/api/obtenerOrdenMaximo?proceso=${procesoId}&empresa_id=${empresaId}&departamento_id=${departamentoId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener el máximo orden');
                }
                return response.json();
            })
            .then(data => {
                const nuevoOrden = data.maxOrden + 1;
                ordenInput.value = nuevoOrden;
                
                ordenInput.addEventListener('change', function() {
                    const valorIngresado = parseInt(ordenInput.value);
                    if (valorIngresado < nuevoOrden) {
                        // Llamar a la función para obtener y rellenar datos de la ruta específica
                        obtenerDatosRuta(empresaId, departamentoId, procesoId, valorIngresado);
                    } else if (valorIngresado > nuevoOrden) {
                        mensajeElement.textContent = "El número de orden no se puede alterar manualmente salvo para modificaciones anteriores.";
                        ordenInput.value = nuevoOrden;
                    }
                });
            })
            .catch(error => {
                console.error('Error:', error);
                ordenInput.value = '1'; // Establecer 1 como valor por defecto en caso de error
                mensajeElement.textContent = "Error al obtener el orden máximo. Se ha establecido el valor 1 por defecto.";
            });
    } else {
        ordenInput.value = '';
        mensajeElement.textContent = "Por favor, seleccione proceso, empresa y departamento.";
    }
}

function obtenerDatosRuta(empresaId, departamentoId, procesoId, orden) {
    fetch(`/api/obtener-datos-ruta?empresaId=${empresaId}&departamentoId=${departamentoId}&procesoId=${procesoId}&orden=${orden}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener datos de la ruta');
            }
            return response.json();
        })
        .then(data => {
            // Rellenar el formulario con los datos obtenidos
            document.getElementById('descripcion_corta').value = data.descripcion_corta;
            document.getElementById('descripcion_detallada').value = data.descripcion_detallada;
            // Actualizar otros campos según sea necesario
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('mensaje').textContent = "Error al obtener datos de la ruta especificada.";
        });
}

function verificarOrden() {
    const ordenInput = document.getElementById('orden');
    const orden = parseInt(ordenInput.value);
    const empresaId = document.getElementById('empresa_id_display').textContent.split(' ')[0];
    const departamentoId = document.getElementById('departamento').value;
    const procesoId = document.getElementById('proceso').value;
    const mensajeElement = document.getElementById('mensaje');

    // Verificar que todos los campos necesarios estén llenos
    if (!empresaId || !departamentoId || !procesoId) {
        mensajeElement.textContent = 'Por favor, seleccione empresa, departamento y proceso antes de asignar un orden.';
        mensajeElement.style.color = 'red';
        ordenInput.value = '';
        return;
    }

    // Obtener el orden máximo actual
    fetch(`/api/max-orden?empresaId=${empresaId}&departamentoId=${departamentoId}&procesoId=${procesoId}`)
        .then(response => response.json())
        .then(data => {
            const maxOrden = data.maxOrden;

            if (orden > maxOrden + 1) {
                mensajeElement.textContent = `No se puede crear un número de orden mayor que ${maxOrden + 1}.`;
                mensajeElement.style.color = 'red';
                ordenInput.value = maxOrden + 1;
            } else if (orden < maxOrden + 1) {
                // Buscar la ruta con ese orden
                fetch(`/api/ruta?empresaId=${empresaId}&departamentoId=${departamentoId}&procesoId=${procesoId}&orden=${orden}`)
                    .then(response => response.json())
                    .then(ruta => {
                        if (ruta) {
                            // Rellenar el formulario con los datos de la ruta encontrada
                            document.getElementById('descripcion_corta').value = ruta.descripcion_corta;
                            document.getElementById('descripcion_detallada').value = ruta.descripcion_detallada;
                            // Aquí puedes añadir más campos si es necesario

                            mensajeElement.textContent = 'Se ha cargado la información de la ruta existente.';
                            mensajeElement.style.color = 'blue';
                        } else {
                            mensajeElement.textContent = 'No se encontró una ruta con ese número de orden.';
                            mensajeElement.style.color = 'orange';
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        mensajeElement.textContent = 'Error al buscar la ruta.';
                        mensajeElement.style.color = 'red';
                    });
            } else {
                mensajeElement.textContent = 'Número de orden válido.';
                mensajeElement.style.color = 'green';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mensajeElement.textContent = 'Error al verificar el orden máximo.';
            mensajeElement.style.color = 'red';
        });
}
function enviarFormularioRuta(event) {
    event.preventDefault();

    const empresaIdInput = document.querySelector('input[name="empresa_id"]');
    if (!empresaIdInput) {
        mostrarMensaje('Error: No se pudo obtener el ID de la empresa. Por favor, seleccione una empresa.', true);
        return;
    }
    const empresa_id = empresaIdInput.value.trim();

    if (!empresa_id) {
        mostrarMensaje('Por favor, seleccione una empresa antes de enviar el formulario.', true);
        return;
    }

    const proceso_id = document.getElementById('proceso').value.trim();
    const departamento_id = document.getElementById('departamento').value.trim();
    const orden = document.getElementById('orden').value.trim();
    const descripcion_corta = document.getElementById('descripcion_corta').value.trim();
    const descripcion_detallada = document.getElementById('descripcion_detallada').value.trim();
    const archivo = document.getElementById('archivo').files[0];

    if (!proceso_id || !departamento_id || !orden || !descripcion_corta) {
        mostrarMensaje('Por favor, complete todos los campos obligatorios.', true);
        return;
    }

    // Definir formData aquí
    const formData = new FormData();
    formData.append('empresa_id', empresa_id);
    formData.append('proceso_id', proceso_id);
    formData.append('departamento_id', departamento_id);
    formData.append('orden', orden);
    formData.append('descripcion_corta', descripcion_corta);
    formData.append('descripcion_detallada', descripcion_detallada);

    if (archivo) {
        formData.append('archivo', archivo);
    }

    console.log('Datos a enviar:', Object.fromEntries(formData));

    fetch('/registroRutas', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        mostrarMensaje(data.message || 'Ruta registrada con éxito.', false);

        localStorage.setItem('empresaId', empresa_id);
        localStorage.setItem('procesoId', proceso_id);
        localStorage.setItem('departamentoId', departamento_id);
        
        setTimeout(() => {
            document.getElementById('descripcion_corta').value = '';
            document.getElementById('descripcion_detallada').value = '';
            document.getElementById('archivo').value = '';
    
            actualizarOrdenProceso();
    
            mostrarMensaje('Puede seguir grabando pasos en el proceso.', false);
        }, 3000);
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarMensaje(error.message || 'Error al registrar la ruta.', true);
    });
}

function mostrarMensaje(mensaje, esError) {
    const mensajeElement = document.getElementById('mensaje');
    mensajeElement.textContent = mensaje;
    mensajeElement.style.color = esError ? 'red' : 'green';
}
function cargarInformacionGuardadaSiExiste() {
    const empresaId = localStorage.getItem('empresaId');
    const procesoId = localStorage.getItem('procesoId');

    if (empresaId || procesoId) {
        if (empresaId) {
            const empresaIdInput = document.getElementById('empresa_id_display');
            if (empresaIdInput) {
                empresaIdInput.textContent = empresaId;
                // Asumiendo que hay un campo oculto para el ID de la empresa
                const empresaIdHidden = document.querySelector('input[name="empresa_id"]');
                if (empresaIdHidden) {
                    empresaIdHidden.value = empresaId;
                }
            }
        }

        if (procesoId) {
            const procesoSelect = document.getElementById('proceso');
            if (procesoSelect) {
                procesoSelect.value = procesoId;
                // Disparar el evento change para actualizar el orden
                procesoSelect.dispatchEvent(new Event('change'));
            }
        }

        console.log('Información cargada del localStorage');
        
        // Actualizar el orden después de cargar la información
        actualizarOrdenProceso();
    } else {
        console.log('No hay información guardada en localStorage');
    }
}

function esMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
} 

function capturarFoto() {
    const canvas = document.getElementById('canvas');
    const archivoInput = document.getElementById('archivo');

    // Verificar si hay cámaras disponibles
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            console.log('Dispositivos de cámara detectados:', videoDevices);

            if (videoDevices.length === 0) {
                alert('No hay cámaras disponibles en este dispositivo.');
                return;
            }

            if (esMobile()) {
                // Código para dispositivos móviles
                if ('capture' in HTMLInputElement.prototype) {
                    archivoInput.capture = 'user';
                    archivoInput.accept = 'image/*';
                    archivoInput.click();
                } else {
                    alert('Tu dispositivo no soporta la captura de imágenes directamente.');
                }
            } else {
                // Código para PC
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
                                }, 'image/jpeg');
                            }, 1000);
                        });
                    })
                    .catch(function(err) {
                        console.error("Error al acceder a la cámara:", err.name, err.message);

                        if (err.name === 'NotFoundError') {
                            alert('No se encontró ninguna cámara conectada.');
                        } else if (err.name === 'NotAllowedError') {
                            alert('No se otorgaron permisos para acceder a la cámara.');
                        } else {
                            alert('Ocurrió un error al intentar acceder a la cámara.');
                        }
                    });
            }
        })
        .catch(err => {
            console.error('Error al enumerar dispositivos:', err);
            alert('No se pudieron verificar los dispositivos de cámara. Por favor, intenta nuevamente.');
        });
}


let mediaRecorder;
let recordedChunks = [];

function grabarVideo() {
    const videoPreview = document.getElementById('video-preview');
    const archivoInput = document.getElementById('archivo');
    const grabarVideoBtn = document.getElementById('grabarVideo');

    if (esMobile()) {
        // En dispositivos móviles, usar el input de archivo nativo
        archivoInput.accept = "video/*";
        archivoInput.capture = "camcorder";
        archivoInput.click();
    } else {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            // Iniciar grabación
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(function(stream) {
                    videoPreview.srcObject = stream;
                    videoPreview.style.display = 'block';
                    videoPreview.play();

                    mediaRecorder = new MediaRecorder(stream);
                    recordedChunks = [];

                    mediaRecorder.ondataavailable = function(e) {
                        if (e.data.size > 0) {
                            recordedChunks.push(e.data);
                        }
                    };

                    mediaRecorder.onstop = function() {
                        const blob = new Blob(recordedChunks, { type: 'video/webm' });
                        const file = new File([blob], "video.webm", { type: "video/webm" });

                        // Crear un nuevo objeto FileList con el archivo
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        archivoInput.files = dataTransfer.files;

                        // Detener el stream de video
                        stream.getTracks().forEach(track => track.stop());

                        // Mostrar el video grabado
                        videoPreview.src = URL.createObjectURL(blob);
                        videoPreview.style.display = 'block';
                    };

                    mediaRecorder.start();
                    grabarVideoBtn.textContent = 'Detener Grabación';
                })
                .catch(function(err) {
                    console.log("Ocurrió un error: " + err);
                });
        } else {
            // Detener grabación
            mediaRecorder.stop();
            grabarVideoBtn.textContent = 'Grabar Video';
        }
    }
}

// Función para manejar el inicio y detención de la grabación
function toggleGrabacionVideo() {
    grabarVideo();
}

let stopRecordingButton;

function showStopButton() {
    if (!stopRecordingButton) {
        stopRecordingButton = document.createElement('button');
        stopRecordingButton.textContent = 'Detener Grabación';
        stopRecordingButton.style.position = 'fixed';
        stopRecordingButton.style.top = '10px';
        stopRecordingButton.style.right = '10px';
        stopRecordingButton.style.zIndex = 1000;
        stopRecordingButton.style.padding = '10px 20px';
        stopRecordingButton.style.fontSize = '16px';
        stopRecordingButton.style.backgroundColor = 'red';
        stopRecordingButton.style.color = 'white';
        stopRecordingButton.style.border = 'none';
        stopRecordingButton.style.borderRadius = '5px';
        stopRecordingButton.style.cursor = 'pointer';
        
        stopRecordingButton.addEventListener('click', () => {
            if (mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.stop();
                console.log("Grabación detenida manualmente");
                stopRecordingButton.style.display = 'none'; // Ocultar el botón al detener la grabación
            }
        });

        document.body.appendChild(stopRecordingButton);
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
        console.log("Grabación detenida manualmente");
        stopRecordingButton.style.display = 'none'; // Ocultar el botón cuando se detiene la grabación
    } else {
        const grabarAudio = confirm("¿Deseas grabar audio mientras grabas la pantalla?");

        const displayMediaOptions = {
            video: {
                cursor: "always"
            },
            audio: grabarAudio
        };

        navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
            .then(screenStream => {
                console.log("Pantalla capturada con éxito");
                showStopButton(); // Mostrar el botón de detener la grabación
                if (grabarAudio) {
                    return navigator.mediaDevices.getUserMedia({ audio: true })
                        .then(audioStream => {
                            console.log("Audio capturado con éxito");
                            const combinedStream = new MediaStream([
                                ...screenStream.getVideoTracks(),
                                ...audioStream.getAudioTracks()
                            ]);
                            return { stream: combinedStream, screenStream, audioStream };
                        });
                }
                return { stream: screenStream, screenStream };
            })
            .then(({ stream, screenStream, audioStream }) => {
                console.log("Iniciando MediaRecorder");
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });

                mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                        console.log(`Chunk grabado: ${event.data.size} bytes`);
                    }
                };

                mediaRecorder.onstop = () => {
                    console.log("MediaRecorder detenido");
                    const blob = new Blob(recordedChunks, { type: 'video/webm' });
                    console.log(`Tamaño total del blob: ${blob.size} bytes`);

                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const arrayBuffer = e.target.result;
                        const file = new File([arrayBuffer], "grabacion-pantalla-audio.webm", { type: "video/webm" });
                        console.log(`Archivo creado: ${file.name}, tamaño: ${file.size} bytes`);

                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        archivoInput.files = dataTransfer.files;

                        console.log("Archivo asignado al input");
                        console.log("Archivo guardado:", archivoInput.files[0]);

                        archivoInput.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log("Evento change disparado en el input");
                    };
                    reader.readAsArrayBuffer(blob);

                    recordedChunks = [];
                    stream.getTracks().forEach(track => track.stop());
                    if (audioStream) audioStream.getTracks().forEach(track => track.stop());
                    stopRecordingButton.style.display = 'none'; // Ocultar el botón cuando la grabación termina
                };

                screenStream.getVideoTracks()[0].onended = () => {
                    console.log("Usuario dejó de compartir la pantalla");
                    if (mediaRecorder.state === "recording") {
                        mediaRecorder.stop();
                    }
                };

                mediaRecorder.start(1000); // Grabar en chunks de 1 segundo
                console.log("Grabación iniciada");
            })
            .catch(err => {
                console.error("Error al acceder a la pantalla o al micrófono: ", err);
                alert("Hubo un error al iniciar la grabación. Por favor, intenta de nuevo.");
            });
    }
}

    // Manejar la selección de archivos desde dispositivos móviles
    const archivoInput = document.getElementById('archivo');
    archivoInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('video/')) {
                const videoPreview = document.getElementById('video-preview');
                videoPreview.src = URL.createObjectURL(file);
                videoPreview.style.display = 'block';
            } else if (file.type.startsWith('image/')) {
                const canvas = document.getElementById('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                };
                img.src = URL.createObjectURL(file);
            }
        }
    });