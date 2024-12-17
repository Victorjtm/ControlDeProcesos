// flowchart.js

// Función para procesar los datos
function procesarDatos(promesas) {
    console.log('Iniciando procesamiento de datos');
    console.log('Promesas recibidas:', promesas);

    // Crear un mapa de nodos para acceso rápido
    const nodosMap = new Map();

    // Crear nodos
    const nodos = promesas.map((promesa, index) => {
        const nodo = {
            id: promesa.id_promesa,
            nombre: promesa.nombre_promesa,
            tipo: promesa.tipo_promesa,
            orden: promesa.num_orden_promesa,
            index: index
        };
        nodosMap.set(promesa.id_promesa, nodo); // Agregar al mapa para acceso rápido
        return nodo;
    });

    console.log('Todos los nodos creados:', nodos);
    const enlaces = [];

    promesas.forEach(promesa => {
        console.log(`Procesando enlaces para promesa ${promesa.id_promesa}`);

        // Función auxiliar para crear enlaces
        const crearEnlace = (targetId, label) => {
            const sourceNode = nodosMap.get(promesa.id_promesa);
            const targetNode = nodosMap.get(targetId);
            if (sourceNode && targetNode) {
                enlaces.push({
                    source: sourceNode,
                    target: targetNode,
                    label: label,
                    direccion: promesa.direccion_flecha_id // Incluir dirección de flecha
                });
                console.log(`Enlace creado:`, { source: sourceNode, target: targetNode, label });
            } else {
                console.warn(`Enlace no creado: ${label} - Nodo fuente o destino no encontrado`);
                console.log('Nodo fuente:', sourceNode);
                console.log('Nodo destino:', targetNode);
            }
        };

        // Crear enlace "Siguiente" solo si el siguiente ID no está vacío
        if (promesa.siguiente_promesa_id && [1, 2, 3].includes(promesa.tipo_promesa)) {
            if (nodosMap.has(promesa.siguiente_promesa_id)) {
                crearEnlace(promesa.siguiente_promesa_id, 'Siguiente');
            } else {
                console.warn(`Promesa ${promesa.id_promesa} intenta enlazarse a un nodo inexistente (${promesa.siguiente_promesa_id}), ignorando...`);
            }
        }

        // Manejar nodos condicionales (tipo 6)
        if (promesa.tipo_promesa === 6) {
            if (!promesa.rama_verdadera_id || !promesa.rama_falsa_id) {
                console.error(`Error: Nodo condicional ${promesa.id_promesa} tiene ramas nulas.`);
                return; // No procesar más este nodo si falta información
            }
            if (nodosMap.has(promesa.rama_verdadera_id)) {
                crearEnlace(promesa.rama_verdadera_id, 'Sí');
            } else {
                console.warn(`Promesa ${promesa.id_promesa} intenta enlazarse a una rama verdadera inexistente (${promesa.rama_verdadera_id}), ignorando...`);
            }
            if (nodosMap.has(promesa.rama_falsa_id)) {
                crearEnlace(promesa.rama_falsa_id, 'No');
            } else {
                console.warn(`Promesa ${promesa.id_promesa} intenta enlazarse a una rama falsa inexistente (${promesa.rama_falsa_id}), ignorando...`);
            }
        }
    });

    console.log('Todos los enlaces creados:', enlaces);
    console.log('Procesamiento de datos completado');
    return { nodos, enlaces };
}

function calcularPosiciones(nodos, enlaces) {
    console.log('Iniciando cálculo de posiciones');
    console.log('Nodos recibidos:', nodos);
    console.log('Enlaces recibidos:', enlaces);

    const posiciones = new Map();
    const niveles = new Map();
    let maxNivel = 0;

    function asignarPosicion(nodo, x, y, nivel) {
        posiciones.set(nodo.id, { x, y });
        niveles.set(nodo.id, nivel);
        maxNivel = Math.max(maxNivel, nivel);
        console.log(`Posición asignada para nodo ${nodo.id}: (${x}, ${y}), nivel ${nivel}`);
    }

    function procesarNodo(nodo, x, y, nivel) {
        console.log(`Procesando nodo ${nodo.id} (${nodo.nombre})`);

        if (posiciones.has(nodo.id)) {
            console.log(`Nodo ${nodo.id} ya tiene posición asignada, omitiendo`);
            return;
        }

        asignarPosicion(nodo, x, y, nivel);

        const hijosEnlaces = enlaces.filter(e => e.source.id === nodo.id);
        console.log(`Enlaces hijos encontrados para nodo ${nodo.id}:`, hijosEnlaces);

        if (nodo.tipo === 6) { // Nodo condicional
            console.log(`Nodo ${nodo.id} es condicional, procesando ramas`);
            const enlaceSi = hijosEnlaces.find(e => e.label === 'Sí');
            const enlaceNo = hijosEnlaces.find(e => e.label === 'No');

            if (enlaceSi) {
                console.log(`Procesando rama 'Sí' del nodo ${nodo.id}`);
                procesarNodo(enlaceSi.target, x + 150, y + 180, nivel + 1);
            } else {
                console.log(`Nodo ${nodo.id} no tiene rama 'Sí'`);
            }

            if (enlaceNo) {
                console.log(`Procesando rama 'No' del nodo ${nodo.id}`);
                procesarNodo(enlaceNo.target, x - 150, y + 180, nivel + 1);
            } else {
                console.log(`Nodo ${nodo.id} no tiene rama 'No'`);
            }
        } else {
            const siguienteEnlace = hijosEnlaces[0];
            if (siguienteEnlace) {
                console.log(`Procesando siguiente nodo de ${nodo.id}`);
                procesarNodo(siguienteEnlace.target, x, y + 150, nivel + 1);
            } else {
                console.log(`Nodo ${nodo.id} no tiene nodo siguiente`);
            }
        }
    }

    console.log('Iniciando procesamiento desde el primer nodo');
    procesarNodo(nodos[0], 400, 50, 0);

    console.log('Nodos procesados. Comprobando nodos sin posición...');
    nodos.forEach(nodo => {
        if (!posiciones.has(nodo.id)) {
            console.warn(`Nodo ${nodo.id} (${nodo.nombre}) no tiene posición asignada`);
            // Asignar una posición por defecto
            asignarPosicion(nodo, 400, 50 + nodo.index * 100, nodo.index);
        }
    });

    console.log('Cálculo de posiciones completado');
    console.log('Posiciones finales:', Array.from(posiciones.entries()));
    console.log('Nivel máximo:', maxNivel);

    return { posiciones, maxNivel };
}

// Función para asignar formas a cada tipo de promesa
function obtenerForma(tipo) {
    switch (tipo) {
        case 1: // Inicio del algoritmo
        case 7: // Fin del algoritmo
            return 'oval'; // Representado por un óvalo
        case 2: // Solicitud de lectura
        case 3: // Solicitud de escritura
            return 'rectangle'; // Usaría rectángulos
        case 4: // Repetir mientras
        case 5: // Repetir hasta
        case 6: // Si entonces (condicional)
            return 'diamond'; // Usaría rombos para decisiones
        default:
            return 'rectangle'; // Por defecto, usar rectángulo
    }
}

function obtenerNombreTipo(tipo) {
    switch (tipo) {
        case 1: return "Inicio del algoritmo";
        case 2: return "Solicitud de lectura";
        case 3: return "Solicitud de escritura";
        case 4: return "Repetir mientras";
        case 5: return "Repetir hasta";
        case 6: return "Si entonces (condicional)";
        case 7: return "Fin del algoritmo";
        default: return "Tipo desconocido";
    }
}

function crearLeyenda(svg, width) {
    const leyenda = svg.append("g")
        .attr("class", "leyenda")
        .attr("transform", `translate(${width - 150}, 20)`);

    const items = [
        { color: "#555", label: "Flujo normal" },
        { color: "green", label: "Sí (Decisión)" },
        { color: "red", label: "No (Decisión)" }
    ];

    const itemHeight = 20;
    const itemPadding = 5;

    items.forEach((item, index) => {
        const g = leyenda.append("g")
            .attr("transform", `translate(0, ${index * (itemHeight + itemPadding)})`);

        g.append("line")
            .attr("x1", 0)
            .attr("y1", itemHeight / 2)
            .attr("x2", 30)
            .attr("y2", itemHeight / 2)
            .attr("stroke", item.color)
            .attr("stroke-width", 2)
            .attr("marker-end", `url(#arrowhead-${item.color})`);

        g.append("text")
            .attr("x", 35)
            .attr("y", itemHeight / 2)
            .attr("dy", "0.35em")
            .text(item.label)
            .attr("font-size", "12px");
    });
}

function crearDiagramaFlujo(promesas) {
    console.log('Iniciando creación del diagrama de flujo');
    

    // Procesar datos para obtener nodos y enlaces
    const { nodos, enlaces } = procesarDatos(promesas);
    console.log('Datos procesados:', { nodos, enlaces });

    // Calcular posiciones de los nodos
    const { posiciones, maxNivel } = calcularPosiciones(nodos, enlaces);

    // Limpiar el contenedor del diagrama
    d3.select('#flowchart-container').html('');
    console.log('Contenedor del diagrama limpiado');

    // Configuración de dimensiones del SVG
    const width = 800;
    const height = (maxNivel + 1) * 150; // 150 píxeles por nivel

    const svg = d3.select('#flowchart-container')
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`);

    console.log('SVG creado con dimensiones:', { width, height });

    const zoomBehavior = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
        svg.attr('transform', event.transform);
    });

    svg.call(zoomBehavior);

    function resetZoom() {
        svg.transition()
          .duration(750) // duración de la animación en milisegundos
          .call(zoomBehavior.transform, d3.zoomIdentity);
      }

      d3.select('body').on('keydown', (event) => {
        if (event.ctrlKey && event.key === '0') { // Ctrl + 0
          event.preventDefault();
          resetZoom();
        }
      });

    // Definir el marcador de flecha (arrowhead)
    svg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '-0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 6)  // Reducido de 8 a 6
    .attr('markerHeight', 6) // Reducido de 8 a 6
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#555');

    // Crear enlaces
    svg.selectAll('.link')
        .data(enlaces)
        .enter()
        .append('path') // Cambiar de 'line' a 'path' para mayor flexibilidad
        .attr('class', 'link')
        .attr('d', d => {
            const sourcePos = posiciones.get(d.source.id);
            const targetPos = posiciones.get(d.target.id);
            let startX = sourcePos.x;
            let startY = sourcePos.y;
            let endX = targetPos.x;
            let endY = targetPos.y;

            // Ajustar puntos de inicio y fin para nodos condicionales
            if (d.source.tipo === 6) {
                startX += d.label === 'Sí' ? 80 : -80;
            }

            // Calcular punto de control para curva
            const midY = (startY + endY) / 2;

            // Acortar la línea para que no entre en la forma de destino
            const dx = endX - startX;
            const dy = endY - startY;
            const length = Math.sqrt(dx * dx + dy * dy);
            const shortenAmount = 40; // Ajustar según sea necesario
            endX -= (dx / length) * shortenAmount;
            endY -= (dy / length) * shortenAmount;

            return `M${startX},${startY} Q${startX},${midY} ${endX},${endY}`;
        })
        .attr('stroke', d => d.label === 'Sí' ? 'green' : (d.label === 'No' ? 'red' : '#555'))
        .attr('stroke-width', 1,5)
        .attr('fill', 'none')
        .attr('marker-end', 'url(#arrowhead)');

        // Colorear las puntas de flecha según el tipo de enlace
        svg.selectAll('.link').each(function(d) {
        const color = d.label === 'Sí' ? 'green' : (d.label === 'No' ? 'red' : '#555');
        const markerId = `arrowhead-${color}`;
    
    if (!document.getElementById(markerId)) {
        svg.select('defs').append('marker')
            .attr('id', markerId)
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 14)  // Ajustar para que la flecha no quede separada
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 10)  // Tamaño de la flecha visible
            .attr('markerHeight', 10)  // Tamaño de la flecha visible
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', color)
            .style('stroke', 'none');
    }

    d3.select(this).attr('marker-end', `url(#${markerId})`);
});


    // Crear nodos
    console.log('Iniciando creación de nodos');
    const nodeGroup = svg.selectAll('.node')
        .data(nodos)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => {
            const pos = posiciones.get(d.id);
            return `translate(${pos.x},${pos.y})`;
        });

    // Añadir tooltips a los nodos
    nodeGroup.append("title")
    .text(d => `ID: ${d.id}\nTipo: ${obtenerNombreTipo(d.tipo)}\nOrden: ${d.orden}`);       

    // Dibujar formas según el tipo
    nodeGroup.each(function(d) {
        console.log('Dibujando nodo:', d);
        
        const node = d3.select(this);
        const forma = obtenerForma(d.tipo);

        if (forma === 'oval') {
            node.append('ellipse')
                .attr('rx', 60)
                .attr('ry', 30)
                .attr('class', 'node oval')
                .attr('fill', '#f0f0f0')
                .attr('stroke', '#333')
                .attr('stroke-width', 2);
        
        } else if (forma === 'rectangle') {
            node.append('rect')
                .attr('x', -70)
                .attr('y', -35)
                .attr('width', 140)
                .attr('height', 70)
                .attr('class', 'node rectangle')
                .attr('fill', '#f0f0f0')
                .attr('stroke', '#333')
                .attr('stroke-width', 2);
        
        } else if (forma === 'diamond') {
            node.append('polygon')
                .attr('points', '0,-40 80,0 0,40 -80,0')
                .attr('class', 'node diamond')
                .attr('fill', '#f0f0f0')
                .attr('stroke', '#333')
                .attr('stroke-width', 2);
        }

        // Añadir texto al nodo
        node.append("text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(d.nombre);

        console.log(`Texto añadido al nodo: ${d.nombre}`);
        
        // Añadir etiquetas "Sí" y "No" para los nodos de decisión (tipo condicional)
        if (d.tipo === 6) {
            node.append("text")
                .attr("x", -80) 
                .attr("y", 0)
                .text("No")
                .style("fill", "red");

            node.append("text")
                .attr("x", 80) 
                .attr("y", 0)
                .text("Sí")
                .style("fill", "green");
            
            console.log(`Etiquetas añadidas al nodo de decisión: ${d.nombre}`);
        }
    });

    crearLeyenda(svg, width);    
    console.log("Diagrama de flujo completado");
}

// Función auxiliar para ajustar el texto dentro de los nodos
function wrap(text, width, lineHeight = 1.1) {
    text.each(function() {
        const textElement = d3.select(this);
        const words = textElement.text().split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const y = textElement.attr("y");
        const dy = parseFloat(textElement.attr("dy"));
        
        // Crear el primer tspan
        let tspan = textElement.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            
            // Comprobar si el ancho del tspan excede el límite
            if (tspan.node().getComputedTextLength() > width) {
                line.pop(); // Retirar la última palabra
                tspan.text(line.join(" ")); // Actualizar el tspan con las palabras ajustadas
                line = [word]; // Comenzar una nueva línea con la palabra actual
                tspan = textElement.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

// Función para mostrar mensajes
function showMessage(message, type, duration = 5000) {
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

    // Ocultar el mensaje después de un tiempo solo si hay un mensaje
    if (message) {
        setTimeout(() => {
            messageBox.style.display = 'none';
            messageBox.className = 'message'; // Restablecer a la clase base
        }, duration); // Tiempo configurable
    }
}

// Función para mostrar el diagrama de flujo
function mostrarDiagramaFlujo(proyectoId) {
    // Obtener el contenedor del diagrama
    const flowchartContainer = document.getElementById('flowchart-container');
    if (!flowchartContainer) {
        console.error('El contenedor del diagrama no se encontró en el DOM.');
        showMessage('Error al cargar el diagrama.', 'error');
        return;
    }

    // Limpiar el contenedor
    flowchartContainer.innerHTML = '';

    // Mostrar un mensaje de carga
    showMessage('Cargando diagrama...', 'info');

    // Cargar los datos del proyecto
    fetch(`/api/promesas-proyecto/${proyectoId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            // Limpiar el mensaje de carga
            showMessage('', '');

            // Validar datos antes de crear el diagrama
            if (!Array.isArray(data) || data.length === 0) {
                showMessage('No se encontraron datos para el diagrama.', 'error');
                return;
            }

            // Crear el diagrama
            crearDiagramaFlujo(data);
        })
        .catch(error => {
            console.error('Error al cargar los datos:', error);
            showMessage('Error al cargar el diagrama.', 'error');
        });
}

// Exporta las funciones para que estén disponibles en otros archivos
window.mostrarDiagramaFlujo = mostrarDiagramaFlujo;
window.showMessage = showMessage;