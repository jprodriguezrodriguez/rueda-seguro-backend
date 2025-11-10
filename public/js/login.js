document.addEventListener('DOMContentLoaded', function () {

    const loginForm = document.getElementById('loginForm');

    if (!loginForm) {
        console.error("¡FORMULARIO NO ENCONTRADO!");
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('message');

        // Mostrar loading
        showLoading('Iniciando sesión...');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Importante: incluir cookies
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                updateLoadingText('¡Bienvenido! Redirigiendo...');
                messageDiv.className = 'message success';
                messageDiv.textContent = data.message;

                // Redirigir al dashboard
                setTimeout(() => {
                    globalThis.location.href = '/dashboard';
                }, 1500);
            } else {
                console.error("Login falló:", data.message);
                hideLoading();
                messageDiv.className = 'message error';
                messageDiv.textContent = data.message;
            }
        } catch (error) {
            console.error('Error:', error);
            hideLoading();
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Error de conexión. Inténtalo de nuevo.';
        }
    });
});

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