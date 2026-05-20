document.addEventListener('DOMContentLoaded', () => {
    // Buscar todos los botones de "mostrar/ocultar contraseña" en la página
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Encontrar el input que está junto al botón
            const input = button.parentElement.querySelector('input');
            const icon = button.querySelector('i');
            
            if (input) {
                // Alternar el tipo de input entre password y text
                if (input.type === 'password') {
                    input.type = 'text';
                    // Cambiar el ícono al ojito abierto
                    icon.classList.remove('ph-eye-slash');
                    icon.classList.add('ph-eye');
                } else {
                    input.type = 'password';
                    // Cambiar el ícono al ojito cerrado
                    icon.classList.remove('ph-eye');
                    icon.classList.add('ph-eye-slash');
                }
            }
        });
    });

    // Interceptar el envío del formulario de inicio de sesión
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Evitar recargar la página
            window.location.href = 'dashboard.html'; // Redirigir al dashboard
        });
    }
});
