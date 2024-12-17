function obtenerUsuarioLogueado() {
    return fetch('/check-auth')
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            if (data.username && data.nivel_privilegio !== undefined) {
                return {
                    username: data.username,
                    nivel_privilegio: data.nivel_privilegio
                };
            } else {
                throw new Error('No hay usuario logueado o falta información');
            }
        });
}

