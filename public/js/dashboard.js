document.addEventListener('DOMContentLoaded', async () => {
    showLoading('Cargando información del usuario...');

    setupEventListeners();

    try {
        const response = await fetch('/api/auth/user', {
            method: 'GET',
            credentials: 'include' // Importante: incluir cookies
        });

        const data = await response.json();

        if (data.success) {
            const dataUser = data.data.user;
            const userInfoElement = document.getElementById('userInfo');
            const userDetailsElement = document.getElementById('userDetails');

            userInfoElement.textContent = `Hola, ${dataUser.username}`;

            userDetailsElement.innerHTML = `
                <div class="detail-item">
                    <strong>Usuario:</strong> ${dataUser.username}
                </div>
                <div class="detail-item">
                    <strong>Email:</strong> ${dataUser.email}
                </div>
                <div class="detail-item">
                    <strong>Miembro desde:</strong> ${new Date(dataUser.created_at).toLocaleDateString()}
                </div>
                ${dataUser.last_login ? `
                <div class="detail-item">
                    <strong>Último acceso:</strong> ${new Date(dataUser.last_login).toLocaleString()}
                </div>
                ` : ''}
            `;

            // Ocultar loading después de cargar los datos
            hideLoading();
        } else {
            console.error('Usuario no autenticado, redirigiendo al login:', data.message);
            updateLoadingText('Redirigiendo al login...');
            // Si no está autenticado, redirigir al login
            setTimeout(() => {
                globalThis.location.href = '/';
            }, 3000);
        }
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        alert(
            'Error de conexión. Por favor, inicia sesión de nuevo.' + error.message
        );
        setTimeout(() => {
            globalThis.location.href = '/';
        }, 3000);
    }
});

// Configurar todos los event listeners
function setupEventListeners() {
    // Botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Botones de funcionalidades
    const motosBtn = document.getElementById('motosBtn');
    if (motosBtn) {
        motosBtn.addEventListener('click', () => {
            alert('Funcionalidad de Gestión de Motos próximamente');
        });
    }

    const clientesBtn = document.getElementById('clientesBtn');
    if (clientesBtn) {
        clientesBtn.addEventListener('click', () => {
            alert('Funcionalidad de Clientes próximamente');
        });
    }

    const reportesBtn = document.getElementById('reportesBtn');
    if (reportesBtn) {
        reportesBtn.addEventListener('click', () => {
            alert('Funcionalidad de Reportes próximamente');
        });
    }

    const configBtn = document.getElementById('configBtn');
    if (configBtn) {
        configBtn.addEventListener('click', () => {
            alert('Funcionalidad de Configuración próximamente');
        });
    }
}

async function logout() {
    try {
        showLoading('Cerrando sesión...');

        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include' // Importante: incluir cookies para el logout
        });

        const data = await response.json();

        if (data.success) {
            updateLoadingText('Redirigiendo...');
            setTimeout(() => {
                globalThis.location.href = '/';
            }, 1000);
        } else {
            console.error('Error en logout:', data.message);
            updateLoadingText('Error cerrando sesión, redirigiendo...');
            // Redirigir de todas formas
            setTimeout(() => {
                globalThis.location.href = '/';
            }, 2000);
        }
    } catch (error) {
        console.error('Error en logout:', error);
        updateLoadingText('Error de conexión, redirigiendo...');
        // Redirigir de todas formas
        setTimeout(() => {
            globalThis.location.href = '/';
        }, 2000);
    }
}

// Funciones para manejar el loading overlay
function showLoading(text = 'Cargando...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');

    if (loadingText) {
        loadingText.textContent = text;
    }

    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function updateLoadingText(text) {
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
        loadingText.textContent = text;
    }
}