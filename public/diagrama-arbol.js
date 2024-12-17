document.addEventListener('DOMContentLoaded', function() {
    const empresaSelect = document.getElementById('empresa-select');
    const toggleProcesosBtn = document.getElementById('toggle-procesos');
    let empresas = [];
    let mostrarProcesos = true; 
    let departamentosConProcesos = [];

    const volverAdminLink = document.getElementById('volver-admin');
    
    volverAdminLink.addEventListener('click', function(event) {
        event.preventDefault(); // Evita el comportamiento predeterminado del enlace
        window.history.back(); // Regresa a la página anterior en el historial
    });

    
    // Definir la función cargarDatosEmpresa al principio
    function cargarDatosEmpresa(empresaId) {
        const empresa = empresas.find(emp => emp.id == empresaId);
        
        if (empresa) {
            document.getElementById('empresa-nombre').textContent = `ID: ${empresa.id} - Nombre: ${empresa.nombre}`;
            document.getElementById('empresa-info').style.display = 'block';
            
            cargarDepartamentos(empresaId);
        }
    }

    // Función para cargar las empresas
    function cargarEmpresas() {
        fetch('/api/empresas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener las empresas');
            }
            return response.json();
        })
        .then(data => {
            empresas = data;
            actualizarSelectorEmpresas();
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error al cargar las empresas', 'error');
        });
    }

    // Función para actualizar el selector de empresas
    function actualizarSelectorEmpresas() {
        empresaSelect.innerHTML = '<option value="">Seleccione una empresa</option>';
        empresas.forEach(empresa => {
            const option = document.createElement('option');
            option.value = empresa.id;
            option.textContent = empresa.nombre;
            empresaSelect.appendChild(option);
        });
    }

    
    // Evento para cuando se selecciona una empresa
    empresaSelect.addEventListener('change', function() {
        const empresaId = this.value;
        if (empresaId) {
            cargarDatosEmpresa(empresaId);
            toggleProcesosBtn.style.display = 'inline-block'; // Mostrar el botón
        } else {
            limpiarDiagrama();
            toggleProcesosBtn.style.display = 'none'; // Ocultar el botón
        }
    });

    // Evento para el botón de mostrar/ocultar procesos
    toggleProcesosBtn.addEventListener('click', function() {
        mostrarProcesos = !mostrarProcesos;
        const empresaId = empresaSelect.value;
        if (empresaId) {
            crearDiagramaArbol(empresaId, departamentosConProcesos, mostrarProcesos);
        }
    });

    // Función para cargar los datos de la empresa seleccionada
    function cargarDepartamentos(empresaId) {
        fetch(`/api/departamentos-por-empresa/${empresaId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los departamentos');
            }
            return response.json();
        })
        .then(departamentos => {
            // Cargar procesos para cada departamento
            Promise.all(departamentos.map(departamento => 
                cargarProcesosDepartamentosEmpresa(empresaId, departamento.id)
                    .then(procesos => ({ ...departamento, procesos }))
            ))
            .then(depConProcesos => {
                departamentosConProcesos = depConProcesos; // Guardar los datos
                crearDiagramaArbol(empresaId, departamentosConProcesos, mostrarProcesos);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error al cargar los departamentos', 'error');
        });
    }

    // Función para cargar los procesos de un departamento específico
    function cargarProcesosDepartamentosEmpresa(empresaId, departamentoId) {
        console.log(`Intentando cargar procesos para empresa ${empresaId}, departamento ${departamentoId}`);
        return fetch(`/api/procesos-por-empresa-departamento/${empresaId}/${departamentoId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los procesos del departamento');
            }
            return response.json();
        })
        .then(procesos => {
            console.log(`Procesos cargados para el departamento ${departamentoId}:`, procesos);
            return procesos;
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error al cargar los procesos del departamento', 'error');
            return [];
        });
    }
  

        // Función para actualizar el diagrama con los procesos
        function actualizarDiagramaConProcesos(empresaId, departamentoId, procesos) {
            // Aquí implementarías la lógica para actualizar el diagrama
            // Por ejemplo, podrías añadir los procesos como nodos hijos del departamento correspondiente
            console.log(`Actualizando diagrama con procesos para empresa ${empresaId}, departamento ${departamentoId}`);
            // TODO: Implementar la actualización del diagrama
        }

    // Función para crear el diagrama de árbol
    function crearDiagramaArbol(empresaId, departamentos, mostrarProcesos) {
        const width = 1200;
        const height = 800;
        const margin = {top: 20, right: 120, bottom: 30, left: 120};
    
        // Limpiar el contenedor del diagrama
        d3.select("#tree-container").selectAll("*").remove();
    
        const svg = d3.select("#tree-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    
        // Obtener el nombre de la empresa
        const empresaNombre = document.getElementById('empresa-nombre').textContent.split('Nombre: ')[1];
    
        // Crear la estructura de datos jerárquica
        const root = d3.hierarchy({
            name: empresaNombre, // Usar el nombre de la empresa en lugar del ID
            children: departamentos.map(d => ({
                name: d.nombre,
                id: d.id,
                children: mostrarProcesos ? d.procesos.map(p => ({ name: p.nombre, id: p.id })) : []
            }))
        });

        const treeLayout = d3.tree().size([height, width - 300]);
        treeLayout(root);

        // Agregar enlaces
        svg.selectAll(".link")
            .data(root.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x));

        // Agregar nodos
        const node = svg.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
            .attr("transform", d => `translate(${d.y},${d.x})`);

        node.append("circle")
            .attr("r", d => d.depth === 0 ? 15 : d.depth === 1 ? 10 : 5);

        node.append("text")
            .attr("dy", ".35em")
            .attr("x", d => d.children ? -13 : 13)
            .style("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.data.name)
            .style("font-size", d => d.depth === 0 ? "14px" : d.depth === 1 ? "12px" : "10px");
    }

    // Función para limpiar el diagrama
    function limpiarDiagrama() {
        // Aquí implementaremos la lógica para limpiar el diagrama existente
        console.log('Limpiando diagrama');
        // TODO: Implementar la limpieza del diagrama
    }

    // Función para mostrar mensajes
    function mostrarMensaje(mensaje, tipo) {
        const messageBox = document.getElementById('message-box');
        messageBox.textContent = mensaje;
        messageBox.className = `message ${tipo}`;
        messageBox.style.display = 'block';
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    }

    // Iniciar carga de empresas
    cargarEmpresas();

});