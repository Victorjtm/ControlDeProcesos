function obtenerNivelPrivilegio() {
    console.log('entra en la funcion para obtener el nivel de priviligeio'); 
    return fetch('/check-auth')
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error en la autenticación') });
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos completos recibidos de /check-auth:', data);
            if (data.username && data.nivel_privilegio !== undefined) {
                return {
                    username: data.username,
                    nivel_privilegio: data.nivel_privilegio
                };
            } else {
                console.error('Datos incompletos recibidos:', data);
                throw new Error('Información de usuario incompleta');
            }
        });
}