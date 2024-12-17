// Función para generar un NIF aleatorio
function generarNIF() {
    // Generar 8 dígitos aleatorios
    const numeros = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    
    // Array de letras utilizadas para el cálculo del NIF
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    
    // Calcular la letra correspondiente
    const letra = letras[numeros % 23];
    
    // Concatenar los números y la letra para formar el NIF
    const nif = numeros + letra;
    
    return nif;
}

// Imprimir el NIF generado en la consola
console.log(generarNIF());