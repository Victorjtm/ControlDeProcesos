
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]); // Decodificar la cadena Base64
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]; // Obtener el tipo MIME

    // Crear un ArrayBuffer
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    // Copiar los bytes en el Uint8Array
    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    // Crear un Blob con el ArrayBuffer
    return new Blob([uint8Array], { type: mimeString });
}

function mostrarVistaPrevia(imagenURL) {
    // Abrir una nueva pestaña o ventana para mostrar la vista previa
    const previewWindow = window.open("", '_blank');

    // Escribir el HTML para mostrar la imagen
    previewWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Vista Previa</title>
</head>
<body>
    <img src="${imagenURL}" alt="Vista Previa" style="width: 100%; height: auto;">
</body>
</html>
    `);

    // Cerrar el documento para que se muestre el contenido
    previewWindow.document.close();
}


function iniciarCaptura(event) {
    event.preventDefault();

    navigator.mediaDevices.getDisplayMedia({ video: true })
        .then(stream => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                stream.getTracks().forEach(track => track.stop());

                canvas.toBlob(blob => {
                    const file = new File([blob], "captura.png", { type: "image/png" });

                    const fileInput = document.getElementById('archivo');
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    fileInput.files = dataTransfer.files;

                    console.log("Captura guardada y añadida al formulario");

                    // Crear botón "Visualizar Recorte"
                    const visualizarRecorteBtn = document.createElement('button');
                    visualizarRecorteBtn.textContent = 'Visualizar Recorte';
                    visualizarRecorteBtn.type = 'button';
                    visualizarRecorteBtn.onclick = () => visualizarRecorte(URL.createObjectURL(blob));
                    document.getElementById('rutaForm').appendChild(visualizarRecorteBtn);

                    // Crear botón "Sustituir Captura"
                    const replaceCaptureBtn = document.createElement('button');
                    replaceCaptureBtn.textContent = '¿Deseas sustituir la captura por el recorte?';
                    replaceCaptureBtn.type = 'button';
                    replaceCaptureBtn.style.display = 'none'; // Inicialmente oculto
                    replaceCaptureBtn.onclick = () => {
                        const recorteDataURI = localStorage.getItem('recorte');
                        if (recorteDataURI) {
                            try {
                                const blob = dataURItoBlob(recorteDataURI);
                                const file = new File([blob], "captura_recortada.png", { type: "image/png" });
                                const dataTransfer = new DataTransfer();
                                dataTransfer.items.add(file);
                                fileInput.files = dataTransfer.files;
                                console.log("Captura reemplazada por el recorte");
                                mostrarVistaPrevia(URL.createObjectURL(file));
                            } catch (err) {
                                console.error("Error al reemplazar la captura: " + err);
                            }
                        } else {
                            console.error("No se encontró el recorte guardado.");
                        }
                    };
                    
                    // Función auxiliar para convertir data URI a Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
}
                    document.getElementById('rutaForm').appendChild(replaceCaptureBtn);

                    // Escuchar el mensaje de la ventana emergente
                    window.addEventListener('message', (event) => {
                        if (event.data.type === 'recorteGuardado') {
                            // Mostrar el botón de sustituir captura
                            replaceCaptureBtn.style.display = 'block';
                        }
                    });

                    mostrarVistaPrevia(URL.createObjectURL(file));

                    // Enfocar la ventana del formulario
                    window.focus();

                    // Opcional: desplazarse al formulario
                    document.getElementById('rutaForm').scrollIntoView({ behavior: 'smooth' });
                }, 'image/png');
            };
            video.play();
        })
        .catch(err => {
            console.error("Error: " + err);
            // Asegurar que la ventana del formulario se enfoque incluso si hay un error
            window.focus();
        });
}



function visualizarRecorte(imagenURL) {
    const previewWindow = window.open("", '_blank');
    previewWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' blob: data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
    <title>Recortar, Resaltar y Añadir Texto a la Imagen</title>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { border: 1px solid black; display: block; }
        .controls { position: fixed; bottom: 10px; left: 10px; }
        button { margin-right: 10px; }
    </style>
</head>
<body>
    <canvas id="cropCanvas"></canvas>
    <div class="controls">
        <button id="confirmButton">Confirmar Recorte</button>
        <button id="saveButton" style="display:none;">Guardar Recorte</button>
        <button id="undoButton" style="display:none;">Deshacer</button>
        <button id="highlightButton">Modo Resaltado</button>
        <button id="textButton">Añadir Texto</button>
    </div>
    <script>
        const canvas = document.getElementById('cropCanvas');
        const ctx = canvas.getContext('2d');
        const image = new Image();
        image.src = "${imagenURL}";

        let isDrawing = false;
        let startX, startY, endX, endY;
        let originalImageData;
        let scale;
        let isHighlightMode = false;
        let lastPoint = { x: -1, y: -1 };
        let textToAdd = '';
        let textPosition = { x: 0, y: 0 };
        let isTextMode = false;
        let textColor = 'blue';
        let textSize = 20;
        let textFont = 'Arial';

        image.onload = () => {
            scale = Math.min(window.innerWidth / image.width, window.innerHeight / image.height);
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const scaledWidth = image.width * scale;
            const scaledHeight = image.height * scale;
            const x = (canvas.width - scaledWidth) / 2;
            const y = (canvas.height - scaledHeight) / 2;
            ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        };

        canvas.onmousedown = (e) => {
            if (isTextMode) {
                textPosition.x = e.offsetX;
                textPosition.y = e.offsetY;
                addText();
                return;
            }
            isDrawing = true;
            if (isHighlightMode) {
                lastPoint = { x: e.offsetX, y: e.offsetY };
            } else {
                startX = e.offsetX;
                startY = e.offsetY;
            }
        };

        canvas.onmousemove = (e) => {
            if (!isDrawing) return;
            if (isHighlightMode) {
                drawHighlight(e.offsetX, e.offsetY);
            } else {
                endX = e.offsetX;
                endY = e.offsetY;
                redrawCanvas();
            }
        };

        canvas.onmouseup = () => {
            isDrawing = false;
            if (isHighlightMode) {
                lastPoint = { x: -1, y: -1 };
            }
        };

        function redrawCanvas() {
            ctx.putImageData(originalImageData, 0, 0);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, startY, endX - startX, endY - startY);
            drawText();
        }

        function drawHighlight(x, y) {
            if (lastPoint.x !== -1 && lastPoint.y !== -1) {
                ctx.beginPath();
                ctx.moveTo(lastPoint.x, lastPoint.y);
                ctx.lineTo(x, y);
                ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)'; // Reducir opacidad
                ctx.lineWidth = 15; // Reducir grosor
                ctx.lineCap = 'round';
                ctx.stroke();
            }
            lastPoint = { x, y };
        }

        function addText() {
            const textConfig = prompt(\`
Introduce el texto (formato: texto|color|tamaño|fuente)
Ejemplo: Importante|blue|24|Arial
            \`);

            if (textConfig !== null && textConfig.trim() !== '') {
                const [texto, color, tamano, fuente] = textConfig.split('|');
                
                textToAdd = texto.trim();
                textColor = color || 'blue';
                textSize = parseInt(tamano) || 20;
                textFont = fuente || 'Arial';

                drawText();
                isTextMode = false;
            }
        }

        function drawText() {
            ctx.fillStyle = textColor;
            ctx.font = \`\${textSize}px \${textFont}\`;
            ctx.fillText(textToAdd, textPosition.x, textPosition.y);
        }

        document.getElementById('confirmButton').onclick = () => {
            if (confirm('¿Deseas recortar la imagen?')) {
                const width = Math.abs(endX - startX);
                const height = Math.abs(endY - startY);
                const cropStartX = Math.min(startX, endX);
                const cropStartY = Math.min(startY, endY);

                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                const tempCtx = tempCanvas.getContext('2d');
                
                tempCtx.drawImage(canvas, cropStartX, cropStartY, width, height, 0, 0, width, height);

                if (textToAdd) {
                    tempCtx.fillStyle = textColor;
                    tempCtx.font = \`\${textSize}px \${textFont}\`;
                    tempCtx.fillText(textToAdd, textPosition.x - cropStartX, textPosition.y - cropStartY);
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(tempCanvas, 0, 0);

                document.getElementById('confirmButton').style.display = 'none';
                document.getElementById('saveButton').style.display = 'inline';
                document.getElementById('undoButton').style.display = 'inline';
                
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }
        };

        document.getElementById('saveButton').onclick = () => {
            const dataURL = canvas.toDataURL('image/png');
            localStorage.setItem('recorte', dataURL);
            window.opener.postMessage({ type: 'recorteGuardado', dataURL: dataURL }, '*');
            window.close();
        };

        document.getElementById('undoButton').onclick = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.putImageData(originalImageData, 0, 0);
            
            document.getElementById('confirmButton').style.display = 'inline';
            document.getElementById('saveButton').style.display = 'none';
            document.getElementById('undoButton').style.display = 'none';
            
            textToAdd = '';
        };

        document.getElementById('highlightButton').onclick = () => {
            isHighlightMode = !isHighlightMode;
            document.getElementById('highlightButton').textContent = isHighlightMode ? 'Modo Recorte' : 'Modo Resaltado';
            isTextMode = false;
        };

        document.getElementById('textButton').onclick = () => {
            isTextMode = !isTextMode;
            document.getElementById('textButton').textContent = isTextMode ? "Cancelar Texto" : "Añadir Texto";
        };
    </script>
</body>
</html>
    `);
}


// Modificar el event listener del botón de captura
document.addEventListener('DOMContentLoaded', function() {
    const page = document.body.dataset.page;
    if (page === 'rutas') {
        const botonCaptura = document.createElement('button');
        botonCaptura.textContent = 'Capturar pantalla';
        botonCaptura.type = 'button'; // Asegura que no envíe el formulario
        botonCaptura.onclick = iniciarCaptura;
        document.getElementById('rutaForm').appendChild(botonCaptura);
    }
});
