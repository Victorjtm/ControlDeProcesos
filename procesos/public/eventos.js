document.addEventListener('DOMContentLoaded', function() {
    const page = document.body.dataset.page;
    console.log('Página cargada:', page);

    // Iniciar la verificación del token para todas las páginas
    if (typeof startTokenExpirationTimer === 'function') {
        startTokenExpirationTimer();
    } else {
        console.error('La función startTokenExpirationTimer no está definida');
    }

    // Resto del código específico de cada página...
});

document.addEventListener('DOMContentLoaded', function() {
    const page = document.body.dataset.page;

    // Funciones auxiliares
    function addEventIfElementExists(id, event, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Elemento con ID "${id}" no encontrado.`);
        }
    }
});
//Eventos para login
document.addEventListener('DOMContentLoaded', function() {
    const page = document.body.dataset.page;
    
    if (page === 'login') {
        console.log('Cargando eventos para la página de login');

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        } else {
            console.error('El formulario de login no se encontró en el DOM.');
        }

        // Iniciar el temporizador para verificar la expiración del token
        startTokenExpirationTimer();
    }
});
//Eventos para login
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired para login');
    const page = document.body.dataset.page;
    console.log('La página es: ', page);

    if (page === 'login') {
        console.log('Configurando el manejo del formulario de login');
        
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        } else {
            console.error('El formulario de login no se encontró en el DOM');
        }
    }
});
// Eventos para handlelogin
async function handleLogin(event) {
    event.preventDefault();
    localStorage.clear();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.success) {
                // Almacenar el token
                localStorage.setItem('token', data.token);
                
                // Establecer la fecha de expiración
                const expirationTime = Date.now() + (60 * 60 * 1000); // 1 hora 
                localStorage.setItem('tokenExpiration', expirationTime.toString());
                
                // Almacenar el tiempo en que se estableció el token
                localStorage.setItem('tokenSetTime', Date.now().toString());

                window.showMessage(data.message, false);
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        } else {
            window.showMessage(data.message, true);
        }
    } catch (error) {
        window.showMessage('Error en el servidor', true);
    }
}

// Eventos que se ejecuta cuando el DOM está completamente cargado empresas usuarios
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired asigna empresas usuarios');
    const page = document.body.dataset.page;
    console.log('la pagina es: ', page);

    if (page === 'asignar_empresas_usuarios') {
        console.log('Cargando datos para la página de asignación de empresas a usuarios');
        
        // Cargar usuarios
        if (typeof cargarUsuarios === 'function') {
            cargarUsuarios();
        } else {
            console.error('La función cargarUsuarios no está definida');
        }

        // Cargar empresas
        if (typeof cargarEmpresas === 'function') {
            cargarEmpresas();
        } else {
            console.error('La función cargarEmpresas no está definida');
        }

        // Configurar el evento del botón de asignación
        const asignarBtn = document.getElementById('asignarBtn');
        if (asignarBtn) {
            asignarBtn.addEventListener('click', function() {
                if (typeof asignarUsuariosAEmpresa === 'function') {
                    asignarUsuariosAEmpresa();
                } else {
                    console.error('La función asignarUsuariosAEmpresa no está definida');
                }
            });
        } else {
            console.error('El botón de asignar no se encontró en el DOM');
        }
    }
});
// Eventos que se ejecuta cuando el DOM está completamente cargado registro usuarios
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired usuarios');
    const page = document.body.dataset.page;
    console.log('la pagina es: ',page);
    const page_ = document.body.getAttribute('data-page'); 
    if (page === 'registroUsuarios'){
        console.log('La página es:', page_);
            //eventos usuario
         document.getElementById('username').addEventListener('blur', verificarUsuario);
         document.getElementById('email').addEventListener('blur', verificarEmail);
         const mostrarUsuarios = document.getElementById('mostrarUsuarios');
         console.log(mostrarUsuarios);
         mostrarUsuarios.addEventListener('click', manejarGestionUsuarios);

    // Añadir event listener para enviar el formulario
        document.getElementById('registroForm').addEventListener('submit', enviarFormulario);
        document.getElementById('eliminar').addEventListener('click', eliminarUsuario);
        document.getElementById('modificar').addEventListener('click', modificarUsuario);
        const volverBtn = document.getElementById('volverButton');
if (volverBtn) {
    volverBtn.addEventListener('click', function() {
        window.history.back();
    });
} else {
    console.error('El botón "Volver" no se encontró en el DOM.');
}
        mostrarMensajeRegistro();
    }
});
// Eventos para menu usuario longeado 2
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired menuUsuarioLongeado2');
    const page = document.body.dataset.page;
    console.log('la pagina es: ', page);
    
    if (page === 'menuUsuarioLongeado2') {
        console.log('Cargando eventos para el menú de usuario logueado 2');

        verificarYObtenerTokenEmpresa()
            .then(() => {
                console.log('Token de empresa verificado o nuevo token obtenido');
                actualizarEmpresaEnHeader(); // Llamar a la nueva función
            })
            .catch(error => {
                console.error('Error en la verificación o obtención del token de empresa:', error);
                mostrarMensajeError('Hubo un problema al acceder a tus empresas. Por favor, intenta de nuevo más tarde.');
            });
            const eleccionEmpresasLink = document.getElementById('eleccion-empresas');
            if (eleccionEmpresasLink) {
                eleccionEmpresasLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    mostrarListaEmpresas();
                });
            }
    }
});


 document.addEventListener('DOMContentLoaded', function() {// Eventos que se ejecuta cuando el DOM está completamente cargado registro empresas
    console.log('DOMContentLoaded event fired empresas');
    const page = document.body.dataset.page;
    console.log('la pagina es: ', page);
    if (page === 'registroEmpresas') {
        const formulario = document.getElementById('registroEmpresaForm');
        if (formulario) {
            formulario.addEventListener('submit', function(event) {
                event.preventDefault(); // Prevenir el envío por defecto
                if (validarFormularioEmpresa()) {
                    console.log('Formulario válido, enviando...');
                    enviarFormularioRegistro(); // Llamar a la función para enviar el formulario
                } else {
                    console.log('Formulario no válido, por favor corrige los errores.');
                }
            });
        } else {
            console.error('El formulario de registro de empresas no se encontró en el DOM.');
        }

        const nombreInput = document.getElementById('nombreEmpresa');
        if (nombreInput) {
            nombreInput.addEventListener('blur', verificarNombreEmpresa);
        }

        document.getElementById('modificarEmpresa').addEventListener('click', modificarEmpresa);
        document.getElementById('eliminarEmpresa').addEventListener('click', eliminarEmpresa);
    }
});


document.addEventListener('DOMContentLoaded', function() {// Eventos que se ejecutan cuando el DOM está completamente cargado index
    console.log('DOMContentLoaded event fired index');
    const page = document.body.dataset.page;
    if (page === 'index') {
        
        var startButton = document.getElementById('start-button');
        
        if (startButton) {
            console.log('sabemos que es la pagina index ', startButton);
            startButton.addEventListener('click', function() {
            // Llamada a la función para obtener el nivel de privilegio del usuario
            obtenerNivelPrivilegio()
             .then(data => {
                console.log('el nivel de privilegio es: ', data.nivel_privilegio);
                switch (data.nivel_privilegio) {
                    case 1:
                        window.location.href = '/menuUsuarioLongeado';
                        break;
                    case 2:
                        window.location.href = '/menuUsuarioLongeado2';
                        break;
                    case 3:
                        window.location.href = '/menuUsuarioLongeado3';
                        break;
                    case 4:
                        window.location.href = '/menuUsuarioLongeado4';
                        break;
                    case 5:
                        window.location.href = '/menuUsuarioLongeado5';
                        break;
                    default:
                        window.location.href = '/gestion-rutas';
                        break;
                }
             })
            .catch(error => {
                console.error('Error al obtener el nivel de privilegio:', error);
            });
        });
        } else {
            console.error('El botón de inicio no se encontró en el DOM');
        }
    }
});



document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired registro empresas');
    const page = document.body.dataset.page;
    if (page === 'registroEmpresas') {
        const mostrarEmpresasBtn = document.getElementById('mostrarEmpresas');
        if (mostrarEmpresasBtn) {
            mostrarEmpresasBtn.addEventListener('click', manejarGestionEmpresas);
        } else {
            console.log('El botón "Mostrar Empresas" no se encontró en el DOM.');
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {// eventos gestion de vistas
    console.log('DOMContentLoaded event fired gestión de Vistas');
    const page = document.body.dataset.page;
    if (page === 'gestionVistas') {
        const mostrarEmpresasBtn = document.getElementById('mostrarEmpresas'); 
        const mostrarDepartamentosBtn = document.getElementById('mostrarDepartamentos');
        const mostarProcesosBtn = document.getElementById('mostrarProcesos');
        const verPasosProcesoBtn = document.getElementById('verPasosProceso');
        if (mostrarEmpresasBtn) {
            mostrarEmpresasBtn.addEventListener('click', manejarGestionEmpresas);
        } else {
            console.log('El botón "Mostrar Empresas" no se encontró en el DOM.');
        }
        if (mostrarDepartamentosBtn) {
            mostrarDepartamentosBtn.addEventListener('click', manejarGestionDepartamentos);
        } else {
            console.log('El botón "Mostrar Departamentos" no se encontró en el DOM.');
        }
        if (mostarProcesosBtn) {
            mostarProcesosBtn.addEventListener('click', manejarGestionProcesos);
        } else {
            console.log('El botón "Mostrar Procesos" no se encontró en el DOM.');
        }
        if (verPasosProcesoBtn) {
            verPasosProcesoBtn.addEventListener('click', function() {
                const procesoId = document.getElementById('proceso_id_display').textContent;
                const departamentoId = document.getElementById('departamento_id_display').textContent;
                const empresaId = document.getElementById('empresa_id_display').textContent;
                const procesoNombre = document.getElementById('proceso_nombre_display').textContent;
                const departamentoNombre = document.getElementById('departamento_nombre_display').textContent;
                const empresaNombre = document.getElementById('empresa_nombre_display').textContent;
                console.log(procesoId, departamentoId, empresaId, procesoNombre, departamentoNombre, empresaNombre);
                if (procesoId !== 'No seleccionado' && empresaId !== 'No seleccionada' && departamentoId !== 'No seleccionado') {
                    const url = `/pasos-proceso?empresaId=${empresaId}&departamentoId=${departamentoId}&procesoId=${procesoId}&empresaNombre=${empresaNombre}&departamentoNombre=${departamentoNombre}&procesoNombre=${procesoNombre}`;
                    console.log(url);
                    window.location.href = url;
                } else {
                    alert('Por favor, asegúrese de haber seleccionado una empresa, un departamento y un proceso.');
                }
            });
        } else {
            console.log('El botón "Ver Pasos del Proceso" no se encontró en el DOM.');
        }
    // Botón Volver en sección de Empresa
    const volverEmpresaBtn = document.getElementById('volverEmpresa');
    if (volverEmpresaBtn) {
        volverEmpresaBtn.addEventListener('click', function() {
            // Redirigir al menú de usuario logueado
            window.location.href = '/menuUsuarioLongeado';
        });
    }

    // Botón Volver en sección de Departamento
    const volverDepartamentoBtn = document.getElementById('volverDepartamento');
    if (volverDepartamentoBtn) {
        volverDepartamentoBtn.addEventListener('click', function() {
            // Ocultar sección de departamento y proceso
            document.getElementById('departamento-section').style.display = 'none';
            document.getElementById('proceso-section').style.display = 'none';
            
            // Limpiar selección de proceso
            document.getElementById('proceso').value = '';
            
            // Mostrar lista de empresas
            document.getElementById('empresaList').style.display = 'block';
        });
    }

    // Botón Volver en sección de Proceso
    const volverProcesoBtn = document.getElementById('volverProceso');
    if (volverProcesoBtn) {
        volverProcesoBtn.addEventListener('click', function() {
            // Ocultar sección de proceso
            document.getElementById('proceso-section').style.display = 'none';
            
            // Mostrar lista de departamentos
            document.getElementById('departamentosList').style.display = 'block';
        });
    }
    }
});


document.addEventListener('DOMContentLoaded', () => {// Inicializar las listas al cargar la página asociacion empresas usuarios
    console.log('DOMContentLoaded event fired asignacion empresas usuarios');
    const page = document.body.dataset.page;
    if (page === 'asignacionEmpresasUsuarios') {
        alert('Primero debe seleccionar una empresa para asignar usuarios.');
        cargarUsuarios();
        cargarEmpresas();
        // Asociar la función al botón de asignación
        document.getElementById('asignarBtn').addEventListener('click', asignarUsuariosAEmpresa);
    }
});


document.addEventListener('DOMContentLoaded', function() {// eventos rutas
    const page = document.body.dataset.page;
    if (page === 'rutas') {
        // Llamar a la función para cargar información guardada
        

        const form = document.getElementById('rutaForm');
        if (form) {
            form.addEventListener('submit', enviarFormularioRuta);
        } else {
            console.error('El formulario de rutas no se encontró en el DOM');
        }

        const ordenInput = document.getElementById('orden');
        if (ordenInput) {
            ordenInput.addEventListener('blur', verificarOrden);
        } else {
            console.log('El campo "orden" no se encontró en el DOM.');
        }

        const grabarPantallaBtn = document.getElementById('grabarPantalla');
        if (grabarPantallaBtn) {
            grabarPantallaBtn.addEventListener('click', grabarPantalla);
        } else {
            console.log('El botón "Grabar Pantalla" no se encontró en el DOM.');
        }

        const grabarVideoBtn = document.getElementById('grabarVideo');
        if (grabarVideoBtn) {
            grabarVideoBtn.addEventListener('click', toggleGrabacionVideo);
        } else {
            console.log('El botón "Grabar Video" no se encontró en el DOM.');
        }

        const mostrarEmpresasRutasBtn = document.getElementById('mostrarEmpresasRutas');
        if (mostrarEmpresasRutasBtn) {
            mostrarEmpresasRutasBtn.addEventListener('click', manejarGestionEmpresasRutas);
        } else {
            console.log('El botón "Mostrar Empresas Rutas" no se encontró en el DOM.');
        }

        const tomarFotoBtn = document.getElementById('tomarFoto');
        if (tomarFotoBtn) {
            tomarFotoBtn.addEventListener('click', capturarFoto);
        } else {
            console.log('El botón "Tomar Foto" no se encontró en el DOM.');
        }

        const btnCancelar = document.getElementById('btnCancelar');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', function() {
                console.log('Información guardada limpiada.');
                // Aquí puedes añadir cualquier otra acción que desees realizar al cancelar
            });
        } else {
            console.log('El botón "Cancelar" no se encontró en el DOM.');
        }

        const eliminarBtn = document.getElementById('eliminar');
        if (eliminarBtn) {
            eliminarBtn.addEventListener('click', eliminarRuta);
        } else {
            console.log('El botón "Eliminar" no se encontró en el DOM.');
        }

        const modificarBtn = document.getElementById('modificar');
        if (modificarBtn) {
            modificarBtn.addEventListener('click', modificarRuta);
        } else {
            console.log('El botón "Modificar" no se encontró en el DOM.');
        }

        const procesoSelect = document.getElementById('proceso');
        if (procesoSelect) {
            procesoSelect.addEventListener('change', function() {
                actualizarOrdenProceso();
            });
        }
    
        const selectorEmpresa = document.getElementById('selectorEmpresa');
        if (selectorEmpresa) {
            selectorEmpresa.addEventListener('change', limpiarInformacionGuardada);
        }
        // dictado
        const dictarCortaBtn = document.getElementById('dictarCorta');
        const dictarDetalladaBtn = document.getElementById('dictarDetallada');
        const descripcionCortaInput = document.getElementById('descripcion_corta');
        const descripcionDetalladaTextarea = document.getElementById('descripcion_detallada');
    
        // Verificar si el navegador soporta la API de reconocimiento de voz
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'es-ES'; // Establecer el idioma a español
            recognition.interimResults = false; // No mostrar resultados intermedios
            recognition.maxAlternatives = 1; // Solo la mejor alternativa
    
            // Función para dictar la descripción corta
            dictarCortaBtn.addEventListener('click', function() {
                descripcionCortaInput.value = ''; // Limpiar el campo antes de dictar
                descripcionCortaInput.focus(); // Enfocar el campo antes de iniciar el dictado
                recognition.start();
                console.log('Iniciando dictado para descripción corta...');
            });
    
            // Función para dictar la descripción detallada
            dictarDetalladaBtn.addEventListener('click', function() {
                descripcionDetalladaTextarea.value = ''; // Limpiar el campo antes de dictar
                descripcionDetalladaTextarea.focus(); // Enfocar el textarea antes de iniciar el dictado
                recognition.start();
                console.log('Iniciando dictado para descripción detallada...');
            });
    
            // Manejar el resultado del reconocimiento
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript; // Obtener el texto reconocido
                
                // Comprobar cuál campo está activo y añadir el texto reconocido
                if (document.activeElement === descripcionCortaInput) {
                    descripcionCortaInput.value += transcript; // Añadir al input de descripción corta
                } else if (document.activeElement === descripcionDetalladaTextarea) {
                    descripcionDetalladaTextarea.value += transcript; // Añadir al textarea de descripción detallada
                }
                console.log('Texto reconocido: ', transcript);
            };
    
            // Manejar errores
            recognition.onerror = function(event) {
                console.error('Error en el reconocimiento de voz: ', event.error);
            };
        } else {
            console.error('La API de reconocimiento de voz no es compatible con este navegador.');
        }  
    }
});

document.addEventListener('DOMContentLoaded', function() {//eventos registro departamentos
    console.log('DOMContentLoaded event fired departamentos');
    const page = document.body.dataset.page;
    
    if (page === 'registroDepartamentos') {
        console.log('Cargando eventos para la página de registro de departamentos');

        // Event listener para borrlar datos del formulario.
        const limpiarFormularioBtn = document.getElementById('limpiarFormulario');
        if (limpiarFormularioBtn) {
            limpiarFormularioBtn.addEventListener('click', limpiarFormulario);
        }

        // Event listener para el campo de ID de empresa
        const empresaIdInput = document.getElementById('empresa_id');
        if (empresaIdInput) {
            empresaIdInput.addEventListener('blur', verificarEmpresa);
        } else {
            console.error('El elemento con ID "empresa_id" no existe.');
        }

        // Event listener para el campo de nombre de empresa
        const nombreEmpresaInput = document.getElementById('nombreEmpresa');
        if (nombreEmpresaInput) {
            nombreEmpresaInput.addEventListener('blur', verificarEmpresa);
        } else {
            console.error('El elemento con ID "nombreEmpresa" no existe.');
        }

          // Event listener para el campo de ID de departamento
          const departamentoIdInput = document.getElementById('departamento_id');
          if (departamentoIdInput) {
              departamentoIdInput.addEventListener('blur', verificarDepartamento);
          } else {
              console.error('El elemento con ID "departamento_id" no existe.');
          }
  
          // Event listener para el campo de nombre de departamento
          const nombreDepartamentoInput = document.getElementById('nombreDepartamento');
          if (nombreDepartamentoInput) {
              nombreDepartamentoInput.addEventListener('blur', verificarDepartamento);
          } else {
              console.error('El elemento con ID "nombreDepartamento" no existe.');
          }

          // Event listener para el boton asignado
            const asignadoBtn = document.getElementById('asignado');
            if (asignadoBtn) {
                asignadoBtn.addEventListener('click', verificarAsociacion);
            } else {
                console.error('El botón "asignado" no se encontró en el DOM.');
            }

        // Event listener para botón mostrar empresas
        const mostrarEmpresasDepartamentosBtn = document.getElementById('mostrarEmpresasDepartamentos');
        if (mostrarEmpresasDepartamentosBtn) {
            mostrarEmpresasDepartamentosBtn.addEventListener('click', manejarGestionEmpresasDepartamentos);
        } else {
            console.log('El botón "Mostrar Empresas Departamentos" no se encontró en el DOM.');
        }

        // Event listener para botón mostrar departamentos
        const mostrarDepartamentosBtn = document.getElementById('mostrarDepartamentos');
        if (mostrarDepartamentosBtn) {
            mostrarDepartamentosBtn.addEventListener('click', manejarGestionDepartamentos);
        } else {
            console.log('El botón "Mostrar Departamentos" no se encontró en el DOM.');
        }

        // Event listener para el formulario de registro de departamentos
        const formulario = document.getElementById('registroDepartamentoForm');
        if (formulario) {
            formulario.addEventListener('submit', function(event) {
                event.preventDefault(); // Prevenir el envío por defecto
                if (validarFormularioDepartamento()) {
                    console.log('Formulario válido, enviando...');
                    enviarFormularioDepartamento();
                } else {
                    console.log('Formulario no válido, por favor corrige los errores.');
                }
            });
        } else {
            console.error('El formulario de registro de departamentos no se encontró en el DOM.');
        }

        // Event listeners para la eliminacion de departamentos
        const eliminarDepartamentoBtn = document.getElementById('eliminarDepartamento');
        if (eliminarDepartamentoBtn) {
            eliminarDepartamentoBtn.addEventListener('click', manejarEliminacionDepartamento);
        } else {
            console.error('El botón "eliminarDepartamento" no se encontró en el DOM.');
        }

        //mostrarMensajeRegistroDepartamento();
    }
});

 

document.addEventListener('DOMContentLoaded', function() {// eventos registo procesos
    console.log('DOMContentLoaded event fired procesos');
    const page = document.body.dataset.page;
    
    if (page === 'registroProcesos') {
        console.log('Cargando eventos para la página de registro de procesos');

        // Event listener para el campo de ID de empresa
        const empresaIdInput = document.getElementById('empresa_id');
        if (empresaIdInput) {
            empresaIdInput.addEventListener('blur', verificarEmpresa);
        } else {
            console.error('El elemento con ID "empresa_id" no existe.');
        }

        // Event listener para el campo de nombre de empresa
        const nombreEmpresaInput = document.getElementById('nombreEmpresa');
        if (nombreEmpresaInput) {
            nombreEmpresaInput.addEventListener('blur', verificarEmpresa);
        } else {
            console.error('El elemento con ID "nombreEmpresa" no existe.');
        }

        // Event listener para el campo de ID de departamento
        const departamentoIdInput = document.getElementById('departamento_id');
        if (departamentoIdInput) {
            departamentoIdInput.addEventListener('blur', verificarDepartamento);
        } else {
            console.error('El elemento con ID "departamento_id" no existe.');
        }

        // Event listener para el campo de nombre de departamento
        const nombreDepartamentoInput = document.getElementById('nombreDepartamento');
        if (nombreDepartamentoInput) {
            nombreDepartamentoInput.addEventListener('blur', verificarDepartamento);
        } else {
            console.error('El elemento con ID "nombreDepartamento" no existe.');
        }

        // Event listener para el campo de ID de proceso
        const procesoIdInput = document.getElementById('proceso_id');
        if (procesoIdInput) {
            procesoIdInput.addEventListener('blur', verificarProceso);
        } else {
            console.error('El elemento con ID "proceso_id" no existe.');
        }

        // Event listener para el campo de nombre de proceso
        const nombreProcesoInput = document.getElementById('nombreProceso');
        if (nombreProcesoInput) {
            nombreProcesoInput.addEventListener('blur', verificarProceso);
        } else {
            console.error('El elemento con ID "nombreProceso" no existe.');
        }

        // Event listener para el boton asignado
        const asignadoBtn = document.getElementById('asignado');
        if (asignadoBtn) {
            asignadoBtn.addEventListener('click', verificarAsociacionProceso);
        } else {
            console.error('El botón "asignado" no se encontró en el DOM.');
        }

        // Event listener para botón mostrar departamentos
        const mostrarDepartamentosBtn = document.getElementById('mostrarDepartamentosProcesos');
        if (mostrarDepartamentosBtn) {
            mostrarDepartamentosBtn.addEventListener('click', manejarGestionDepartamentosProcesos);
        } else {
            console.log('El botón "Mostrar Departamentos Procesos" no se encontró en el DOM.');
        }

        // Nuevo event listener para el botón Volver
const volverBtn = document.getElementById('volverButton');
if (volverBtn) {
    volverBtn.addEventListener('click', function() {
        window.history.back();
    });
} else {
    console.error('El botón "Volver" no se encontró en el DOM.');
}

        // Event listener para botón mostrar empresas de procesos
const mostrarEmpresasProcesosBtn = document.getElementById('mostrarEmpresasProcesos');
if (mostrarEmpresasProcesosBtn) {
    mostrarEmpresasProcesosBtn.addEventListener('click', manejarGestionEmpresasProcesos);
} else {
    console.log('El botón "Mostrar Empresas Procesos" no se encontró en el DOM.');
}

        // Event listener para botón mostrar procesos
        const mostrarProcesosBtn = document.getElementById('mostrarProcesos');
        if (mostrarProcesosBtn) {
            mostrarProcesosBtn.addEventListener('click', manejarGestionProcesos);
        } else {
            console.log('El botón "Mostrar Procesos" no se encontró en el DOM.');
        }

        // Event listener para el formulario de registro de procesos
        const formulario = document.getElementById('registroProcesoForm');
        if (formulario) {
            formulario.addEventListener('submit', function(event) {
                event.preventDefault(); // Prevenir el envío por defecto
                if (validarFormularioProceso()) {
                    console.log('Formulario válido, enviando...');
                    enviarFormularioProceso();
                } else {
                    console.log('Formulario no válido, por favor corrige los errores.');
                }
            });
        } else {
            console.error('El formulario de registro de procesos no se encontró en el DOM.');
        }

        // Event listeners para la eliminacion de procesos
        const eliminarProcesoBtn = document.getElementById('eliminarProceso');
        if (eliminarProcesoBtn) {
            eliminarProcesoBtn.addEventListener('click', manejarEliminacionProceso);
        } else {
            console.error('El botón "eliminarProceso" no se encontró en el DOM.');
        }

        //mostrarMensajeRegistroProceso();
    }
});

document.addEventListener('DOMContentLoaded', function() {// Eventos para la pagina pasosProceso
    console.log('DOMContentLoaded event fired pasosProceso');
    const page = document.body.dataset.page;
    
    if (page === 'pasosProceso') {
        console.log('Cargando eventos para la página de pasos del proceso');

        const toggleTablaBtn = document.getElementById('toggle-tabla');
        const toggleVisualBtn = document.getElementById('toggle-visual');
        const tabla = document.getElementById('pasos-tabla');
        const visual = document.querySelector('.pasos-visual');
        const pasosVisuales = document.querySelectorAll('.paso-visual');
        const pasosLista = document.querySelector('.pasos-lista');

        function ajustarVentanas(tablaVisible) {
            if (tablaVisible) {
                visual.style.width = '48%';
                pasosVisuales.forEach(paso => {
                    paso.style.width = 'calc(50% - 30px)';
                    paso.style.transform = 'scale(1)';
                    paso.style.margin = '15px';
                });
            } else {
                visual.style.width = '100%';
                pasosVisuales.forEach(paso => {
                    paso.style.width = 'calc(50% - 45px)'; // Ajustado para 2 por fila
                    paso.style.transform = 'scale(1.5)';
                    paso.style.margin = '30px';
                });
            }
            // Forzar un reflow para aplicar los cambios inmediatamente
            visual.offsetHeight;
        }

        if (toggleTablaBtn && tabla && pasosLista) {
            toggleTablaBtn.addEventListener('click', function() {
                if (pasosLista.style.display === 'none') {
                    pasosLista.style.display = 'block';
                    this.textContent = 'Ocultar Tabla';
                    ajustarVentanas(true);
                } else {
                    pasosLista.style.display = 'none';
                    this.textContent = 'Mostrar Tabla';
                    ajustarVentanas(false);
                }
            });
        } else {
            console.error('El botón "toggle-tabla", la tabla o el contenedor de la lista no se encontraron en el DOM.');
        }

        if (toggleVisualBtn && visual) {
            toggleVisualBtn.addEventListener('click', function() {
                if (visual.style.display === 'none') {
                    visual.style.display = 'flex';
                    this.textContent = 'Ocultar Ventanas';
                } else {
                    visual.style.display = 'none';
                    this.textContent = 'Mostrar Ventanas';
                }
            });
        } else {
            console.error('El botón "toggle-visual" o el contenedor visual no se encontraron en el DOM.');
        }

        // Ajuste inicial
        ajustarVentanas(true);
    }
    // Event listener para el botón Volver
const volverBtn = document.getElementById('volver');
if (volverBtn) {
    volverBtn.addEventListener('click', function() {
        // Regresar a la página anterior en el historial
        window.history.back();
    });
} else {
    console.error('El botón "Volver" no se encontró en el DOM.');
}
});

document.addEventListener('DOMContentLoaded', function() {// Eventos para la pagina proyectos
    console.log('DOMContentLoaded event fired proyectos');
    const page = document.body.dataset.page;
    console.log('la pagina es: ', page);
    if (page === 'proyectos') {

        cargarProyectoSeleccionado();

        // Evento blur para el nombre del proyecto
        const nombreProyectoInput = document.getElementById('nombre_proyecto');
        if (nombreProyectoInput) {
            nombreProyectoInput.addEventListener('blur', verificarProyecto);
        } else {
            console.warn('El campo "nombre_proyecto" no se encontró en el DOM.');
        }

        // Evento blur para la descripción del proyecto
        const descripcionProyectoInput = document.getElementById('descripcion_proyecto');
        if (descripcionProyectoInput) {
            descripcionProyectoInput.addEventListener('blur', verificarDescripcionProyecto);
        } else {
            console.warn('El campo "descripcion_proyecto" no se encontró en el DOM.');
        }

        // Botón "Mostrar Proyectos"
        const mostrarProyectosBtn = document.getElementById('mostrarProyectos');
        if (mostrarProyectosBtn) {
            mostrarProyectosBtn.addEventListener('click', manejarGestionProyectos);
            console.log('Evento click añadido al botón Mostrar Proyectos');
        } else {
            console.warn('El botón "Mostrar Proyectos" no se encontró en el DOM.');
        }  

        // Botón "Limpiar Formulario"
        const limpiarFormularioBtn = document.getElementById('limpiarFormulario');
        if (limpiarFormularioBtn) {
            limpiarFormularioBtn.addEventListener('click', limpiarFormularioProyecto);
            console.log('Evento click añadido al botón Limpiar Formulario');
        } else {
            console.warn('El botón "Limpiar Formulario" no se encontró en el DOM.');
        }

        // Evento para el botón de submit (crear proyecto)
        const formulario = document.getElementById('proyectoForm');
        if (formulario) {
            formulario.addEventListener('submit', async function(event) {
                event.preventDefault();
                if (await validarFormularioProyecto('crear')) {
                    enviarFormularioProyecto('crear');
                }
            });
        }

        // Evento para el botón de modificar proyecto
        const modificarProyectoBtn = document.getElementById('modificarProyecto');
        if (modificarProyectoBtn) {
            modificarProyectoBtn.addEventListener('click', async function() {
                if (await validarFormularioProyecto('modificar')) {
                    enviarFormularioProyecto('modificar');
                }
            });
        }

        // Evento para el botón de ver diagrama de flujo
        const verDiagramaFlujoBtn = document.getElementById('verDiagramaFlujo');
        if (verDiagramaFlujoBtn) {
            verDiagramaFlujoBtn.addEventListener('click', function() {
                const proyectoId = document.getElementById('proyecto_id_display').textContent;
                const proyectoNombre = document.getElementById('proyecto_nombre_display').textContent;
                
                if (proyectoId === 'No seleccionado' || !proyectoNombre) {
                    showMessage('Por favor, seleccione un proyecto primero', 'error');
                    return;
                }

                // Redirigir a la página de diagrama de flujo con los parámetros del proyecto
                window.location.href = `/diagramaFlujo?id=${encodeURIComponent(proyectoId)}&nombre=${encodeURIComponent(proyectoNombre)}`;
            });
            console.log('Evento click añadido al botón Ver Diagrama de Flujo');
        } else {
            console.warn('El botón "Ver Diagrama de Flujo" no se encontró en el DOM.');
        }
        
        const gestionarPromesasBtn = document.getElementById('gestionarPromesas');
        if (gestionarPromesasBtn) {
            gestionarPromesasBtn.addEventListener('click', function() {
                const proyectoId = document.getElementById('proyecto_id_display').textContent;
                const proyectoNombre = document.getElementById('proyecto_nombre_display').textContent;
                
                if (proyectoId === 'No seleccionado' || !proyectoNombre) {
                    showMessage('Por favor, seleccione un proyecto primero', 'error');
                    return;
                }
    
                // Redirigir a la página de gestión de promesas con los parámetros del proyecto
                window.location.href = `/gestion-promesas?id=${encodeURIComponent(proyectoId)}&nombre=${encodeURIComponent(proyectoNombre)}`;
            });
            console.log('Evento click añadido al botón Gestionar Promesas');
        } else {
            console.warn('El botón "Gestionar Promesas" no se encontró en el DOM.');
        }
    }
});
document.addEventListener('DOMContentLoaded', function() {// Eventos para la pagina promesas
    console.log('DOMContentLoaded event fired promesas');
    const page = document.body.dataset.page;
    console.log('La página es:', page);

    if (page === 'promesas') {
        console.log('Entrando en la lógica de promesas');

        // botnon volver a proyectos.
        const btnCancelar = document.getElementById('btnVolverProyectos');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', function() {
                const proyectoIdElement = document.getElementById('proyecto_id_display');
                const proyectoId = proyectoIdElement ? proyectoIdElement.textContent.trim() : null;
        
                if (proyectoId && proyectoId !== 'No seleccionado') {
                    sessionStorage.setItem('proyectoSeleccionado', proyectoId);
                    sessionStorage.setItem('vieneDePagina', 'promesas');
                }
        
                window.location.href = '/gestion-proyectos'; // Ajusta esta URL según tu estructura
            });
        } else {
            console.warn('El botón "Volver a Proyectos" no se encontró en el DOM.');
        }

        // Función para obtener parámetros de la URL
        function getUrlParameter(name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        }

        // Obtener el ID y nombre del proyecto de la URL
        const proyectoId = getUrlParameter('id');
        const proyectoNombre = getUrlParameter('nombre');

        console.log("El ID del proyecto es:", proyectoId);
        console.log("El nombre del proyecto es:", proyectoNombre);

        if (proyectoId) {
            fetch(`/api/proyectos/${proyectoId}`, { 
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            }) 
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener los detalles del proyecto');
                }
                return response.json(); // Asegúrate de que esto esté presente
            })
            .then(proyecto => {
                console.log('Respuesta completa del servidor:', proyecto); // Para depuración
            
                // Verificar que proyecto tenga las propiedades esperadas
                if (!proyecto.id || !proyecto.nombre_proyecto) {
                    throw new Error('La respuesta del servidor no contiene la información esperada del proyecto');
                }
            
                // Actualizar el HTML con la información del proyecto
                const proyectoIdDisplay = document.getElementById('proyecto_id_display');
                const proyectoNombreDisplay = document.getElementById('proyecto_nombre_display');
            
                if (proyectoIdDisplay && proyectoNombreDisplay) {
                    proyectoIdDisplay.textContent = proyecto.id;
                    proyectoNombreDisplay.textContent = proyecto.nombre_proyecto;
                    console.log('Información del proyecto cargada:', { id: proyecto.id, nombre: proyecto.nombre_proyecto });
                } else {
                    console.warn('Elementos de visualización del proyecto no encontrados');
                }
            })
            .catch(error => {
                console.error('Error:', error); 
                // Mostrar un mensaje de error al usuario
                const proyectoIdDisplay = document.getElementById('proyecto_id_display');
                if (proyectoIdDisplay) {
                    proyectoIdDisplay.textContent = 'Error al cargar el proyecto';
                }
            });
        } else {
            // Si no hay ID de proyecto, mostrar "No seleccionado"
            const proyectoIdDisplay = document.getElementById('proyecto_id_display');
            if (proyectoIdDisplay) {
                proyectoIdDisplay.textContent = 'No seleccionado';
            }
        }


        // Llamar a la función para cargar los tipos de promesa y tipos de flecha
        cargarTiposPromesa();
        cargarTiposFlechas();
        toggleConditionalFields();

        // Evento change para el tipo de promesa
        const tipoPromesaSelectElement = document.getElementById('tipo_promesa');
        if (tipoPromesaSelectElement) {
            tipoPromesaSelectElement.addEventListener('change', toggleConditionalFields);
            console.log('Evento change añadido a tipo_promesa para manejar campos condicionales');
        } else {
            console.warn('El campo "tipo_promesa" no se encontró en el DOM.');
        }

        // Evento blur para el nombre de la promesa
        const nombrePromesaInput = document.getElementById('nombre_promesa');
        if (nombrePromesaInput) {
            nombrePromesaInput.addEventListener('blur', verificarPromesa);
            console.log('Evento blur añadido a nombre_promesa');
        } else {
            console.warn('El campo "nombre_promesa" no se encontró en el DOM.');
        }

        // Evento blur para el número de orden de la promesa
        const numOrdenPromesaInput = document.getElementById('num_orden_promesa');
        if (numOrdenPromesaInput) {
            numOrdenPromesaInput.addEventListener('blur', verificarOrdenPromesa);
            console.log('Evento blur añadido a num_orden_promesa');
        } else {
            console.warn('El campo "num_orden_promesa" no se encontró en el DOM.');
        }        

        // Evento change para el tipo de promesa
        const tipoPromesaSelect = document.getElementById('tipo_promesa');
        if (tipoPromesaSelect) {
            tipoPromesaSelect.addEventListener('change', actualizarInterfazSegunTipo);
            console.log('Evento change añadido a tipo_promesa');
        } else {
            console.warn('El campo "tipo_promesa" no se encontró en el DOM.');
        }

        // Evento submit para el formulario de promesa
        const formularioPromesa = document.getElementById('promesaForm');
        if (formularioPromesa) {
            formularioPromesa.addEventListener('submit', async function(event) {
                event.preventDefault();
                console.log('Formulario de promesa enviado');
                if (await validarFormularioPromesa()) {
                    enviarFormularioPromesa();
                }
            });
            console.log('Evento submit añadido al formulario de promesa');
        } else {
            console.warn('El formulario de promesa no se encontró en el DOM.');
        }

        // Botón "Mostrar Promesas"
        const mostrarPromesasBtn = document.getElementById('mostrarPromesas');
        if (mostrarPromesasBtn) {
            mostrarPromesasBtn.addEventListener('click', manejarGestionPromesas);
            console.log('Evento click añadido al botón Mostrar Promesas');
        } else {
            console.warn('El botón "Mostrar Promesas" no se encontró en el DOM.');
        }

        // Botón "Limpiar Formulario"
        const limpiarFormularioBtn = document.getElementById('limpiarFormulario');
        if (limpiarFormularioBtn) {
            limpiarFormularioBtn.addEventListener('click', limpiarFormularioPromesa);
            console.log('Evento click añadido al botón Limpiar Formulario');
        } else {
            console.warn('El botón "Limpiar Formulario" no se encontró en el DOM.');
        }
// Botón "Eliminar Promesa"
const eliminarPromesaBtn = document.getElementById('eliminarPromesa');
if (eliminarPromesaBtn) {
    eliminarPromesaBtn.addEventListener('click', function() {
        const promesaId = document.getElementById('promesa_id_display').value;
        console.log('ID de promesa a eliminar:', promesaId);
        if (promesaId && promesaId !== '') {
            eliminarPromesa(promesaId);
        } else {
            showMessage('Por favor, seleccione una promesa para eliminar', 'error');
        }
    });
    console.log('Evento click añadido al botón Eliminar Promesa');
} else {
    console.warn('El botón "Eliminar Promesa" no se encontró en el DOM.');
}

// Botón "Modificar Promesa"
const modificarPromesaBtn = document.getElementById('modificarPromesa');
if (modificarPromesaBtn) {
    modificarPromesaBtn.addEventListener('click', async function() {
        console.log('Botón Modificar Promesa clickeado');
        if (await validarFormularioPromesa('modificar')) {
            modificarPromesa(); // Llamar a la nueva función modificarPromesa
        }
    });
    console.log('Evento click añadido al botón Modificar Promesa');
} else {
    console.warn('El botón "Modificar Promesa" no se encontró en el DOM.');
}

console.log('Finalizada la configuración de eventos para promesas');
    } else {
        console.log('La página no es "promesas", no se ejecuta la lógica específica');
    }
    
});

document.addEventListener('DOMContentLoaded', function() {// Eventos paa fowchart...    
    console.log('DOMContentLoaded event fired para flowchart');
    const page = document.body.dataset.page;
    if (page === 'flowchart') {
        console.log('Cargando eventos para la página de diagrama de flujo');

        // Obtener los parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const proyectoId = urlParams.get('id');
        const proyectoNombre = urlParams.get('nombre');

        if (proyectoId && proyectoNombre) {
            // Mostrar la información del proyecto
            const proyectoInfo = document.getElementById('proyecto-info');
            const proyectoNombreElement = document.getElementById('proyecto-nombre');
            if (proyectoInfo && proyectoNombreElement) {
                proyectoInfo.style.display = 'block';
                proyectoNombreElement.textContent = `Proyecto: ${proyectoNombre} (ID: ${proyectoId})`;
            }

            // Llamar a la función para mostrar el diagrama de flujo
            if (typeof mostrarDiagramaFlujo === 'function') {
                mostrarDiagramaFlujo(proyectoId);
            } else {
                console.error('La función mostrarDiagramaFlujo no está definida');
            }
        } else {
            showMessage('No se proporcionó un proyecto válido', 'error');
        }

        // Evento para el botón de imprimir
        const printDiagramBtn = document.getElementById('print-diagram');
        if (printDiagramBtn) {
            printDiagramBtn.addEventListener('click', function() {
                window.print();
            });
        } else {
            console.warn('El botón "Imprimir Diagrama" no se encontró en el DOM.');
        }

        const volverLink = document.getElementById('volver-proyectos');
        if (volverLink) {
            volverLink.addEventListener('click', function(e) {
                e.preventDefault();
        
                const proyectoInfo = document.getElementById('proyecto-info');
                const proyectoNombreElement = document.getElementById('proyecto-nombre');
                
        
                if (proyectoId && proyectoId !== 'No seleccionado') {
                    console.log('Redirigiendo con parámetros:', { proyectoId, proyectoNombre });
                    window.location.href = `/gestion-proyectos?id=${encodeURIComponent(proyectoId)}&nombre=${encodeURIComponent(proyectoNombre)}&vieneDe=diagramaFlujo`;
                } else {
                    console.warn('No se pudo obtener el ID del proyecto');
                    window.location.href = '/gestion-proyectos';
                }
            });
        } else {
            console.warn('El enlace "Volver a Gestión de Proyectos" no se encontró en el DOM.');
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {// Eventos de detalles paso...
    console.log('DOMContentLoaded event fired para detalle-paso');
    const page = document.body.dataset.page;
    
    if (page === 'detallePaso') {
        console.log('Cargando eventos para la página de detalle de paso');

        const urlParams = new URLSearchParams(window.location.search);
        const pasoId = urlParams.get('id');

// Event listener para el botón Modificar
const modificarBtn = document.getElementById('modificar');
if (modificarBtn) {
    modificarBtn.addEventListener('click', function() {
        // Redirigir a la página de modificación con el ID del paso
        window.location.href = `/modificar-paso?id=${pasoId}`;
    });
} else {
    console.error('El botón "Modificar" no se encontró en el DOM.');
}
        // Event listener para el botón Eliminar
        const eliminarBtn = document.getElementById('eliminar');
        if (eliminarBtn) {
            eliminarBtn.addEventListener('click', function() {
                eliminarPaso(pasoId);
            });
        } else {
            console.error('El botón "Eliminar" no se encontró en el DOM.');
        }

// Event listener para el botón Volver
const volverBtn = document.getElementById('volver');
if (volverBtn) {
    volverBtn.addEventListener('click', function() {
        // Intenta cerrar la pestaña actual
        const cerradoExitoso = window.close();
        
        // Si no se pudo cerrar la pestaña, muestra un mensaje al usuario
        if (!cerradoExitoso) {
            alert('No se pudo cerrar la pestaña automáticamente. Por favor, ciérrela manualmente.');
        }
    });
} else {
    console.error('El botón "Volver" no se encontró en el DOM.');
}

        // Event listener para manejar errores de carga de imagen
        const imagenPaso = document.getElementById('imagen-paso');
        const errorImagen = document.getElementById('error-imagen');
        if (imagenPaso) {
            imagenPaso.addEventListener('error', function() {
                this.style.display = 'none';
                if (errorImagen) {
                    errorImagen.style.display = 'block';
                }
            });
        }

        // Event listener para el reproductor de video (si existe)
        const videoPlayer = document.getElementById('video-player');
        if (videoPlayer) {
            videoPlayer.addEventListener('loadedmetadata', () => {
                console.log('Metadata del video cargada');
            });
            videoPlayer.addEventListener('canplay', () => {
                console.log('Video listo para reproducir');
            });
            videoPlayer.addEventListener('error', (e) => {
                console.error('Error al cargar el video:', e);
            });
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {// Evebtis de modificar paso
    const page = document.body.dataset.page;

    if (page === 'modificarPaso') {
        console.log('Cargando eventos para la página de modificación de paso');

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

        // Event listener para el formulario de modificación
        const modificarPasoForm = document.getElementById('modificarPasoForm');
        if (modificarPasoForm) {
            modificarPasoForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                if (await validarFormularioModificacion()) {
                    enviarDatosModificados(event);
                }
            });
        } else {
            console.error('El formulario de modificación no se encontró en el DOM.');
        }

// Event listener para el botón Cancelar
const btnCancelar = document.getElementById('btnCancelar');
if (btnCancelar) {
    btnCancelar.addEventListener('click', function() {
        // Intenta cerrar la pestaña actual
        const cerradoExitoso = window.close();
        
        // Si no se pudo cerrar la pestaña, muestra un mensaje al usuario
        if (!cerradoExitoso) {
            alert('No se pudo cerrar la pestaña automáticamente. Por favor, ciérrela manualmente.');
        }
    });
} else {
    console.error('El botón "Cancelar" no se encontró en el DOM.');
}

        // Event listeners para los botones de captura multimedia
        const tomarFotoBtn = document.getElementById('tomarFoto');
        if (tomarFotoBtn) {
            tomarFotoBtn.addEventListener('click', capturarFoto);
        }

        const grabarPantallaBtn = document.getElementById('grabarPantalla');
        if (grabarPantallaBtn) {
            grabarPantallaBtn.addEventListener('click', grabarPantalla);
        }

        const grabarVideoBtn = document.getElementById('grabarVideo');
        if (grabarVideoBtn) {
            grabarVideoBtn.addEventListener('click', grabarVideo);
        }

        const archivoInput = document.getElementById('archivo');
        if (archivoInput) {
            archivoInput.addEventListener('change', function(event) {
                const fileName = event.target.files[0]?.name;
                if (fileName) {
                    document.getElementById('archivo-actual-label').textContent = `Nuevo archivo seleccionado: ${fileName}`;
                }
            });
        }
    }
});