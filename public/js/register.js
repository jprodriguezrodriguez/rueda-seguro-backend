document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    if (!registerForm) {
        console.error('Formulario de registro no encontrado');
        return;
    }
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const messageDiv = document.getElementById('message');
        
        // Validación básica en el frontend
        if (password !== confirmPassword) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Las contraseñas no coinciden';
            return;
        }
        
        // Mostrar loading
        showLoading('Creando tu cuenta...');
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, confirmPassword })
            });
            
            const data = await response.json();
            
            if (data.success) {
                updateLoadingText('¡Cuenta creada! Redirigiendo...');
                messageDiv.className = 'message success';
                messageDiv.textContent = data.message;
                
                // Redirigir al dashboard después de registro exitoso
                setTimeout(() => {
                    globalThis.location.href = '/dashboard';
                }, 1500);
            } else {
                hideLoading();
                messageDiv.className = 'message error';
                if (data.errors && typeof data.errors === 'object') {
                    // Mostrar errores específicos de validación
                    const errorMessages = Object.values(data.errors).join('. ');
                    messageDiv.textContent = errorMessages;
                } else {
                    messageDiv.textContent = data.message || 'Error en el registro';
                }
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