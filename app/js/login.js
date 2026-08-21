import { login, redireccionarSiAutenticado } from './auth.js';

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Redirigir al menú si ya existe una sesión activa
    await redireccionarSiAutenticado('menu.html');

    // 2. Obtener referencias a elementos del DOM
    const formulario = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const mensajeError = document.getElementById('mensajeError');
    const mensajeErrorTexto = document.getElementById('mensajeErrorTexto');
    const botonLogin = document.getElementById('btnLogin');
    const togglePassword = document.getElementById('togglePassword');
    const togglePasswordIcon = document.getElementById('togglePasswordIcon');

    if (!formulario) return;

    // ============================================================
    // FUNCIONES AUXILIARES DE INTERFAZ
    // ============================================================

    function mostrarCargando(cargando) {
        if (!botonLogin) return;

        if (cargando) {
            botonLogin.disabled = true;
            botonLogin.innerHTML = `
                <span class="material-symbols-outlined animate-spin">progress_activity</span>
                <span>Iniciando sesión...</span>
            `;
        } else {
            botonLogin.disabled = false;
            botonLogin.innerHTML = `
                <span id="btnText">Iniciar sesión</span>
                <span class="material-symbols-outlined" id="btnIcon">arrow_forward</span>
            `;
        }
    }

    function mostrarError(mensaje) {
        if (!mensajeError) return;
        
        if (mensajeErrorTexto) {
            mensajeErrorTexto.textContent = mensaje;
        }
        mensajeError.classList.remove('hidden');
    }

    function ocultarError() {
        if (!mensajeError) return;
        mensajeError.classList.add('hidden');
        if (mensajeErrorTexto) {
            mensajeErrorTexto.textContent = '';
        }
    }

    // ============================================================
    // MOSTRAR / OCULTAR CONTRASEÑA
    // ============================================================

    if (togglePassword && passwordInput && togglePasswordIcon) {
        togglePassword.addEventListener('click', () => {
            const esPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', esPassword ? 'text' : 'password');
            togglePasswordIcon.textContent = esPassword ? 'visibility_off' : 'visibility';
        });
    }

    // Limpiar mensaje de error cuando el usuario vuelva a escribir
    emailInput?.addEventListener('input', ocultarError);
    passwordInput?.addEventListener('input', ocultarError);

    // ============================================================
    // PROCESAMIENTO DEL FORMULARIO
    // ============================================================

    formulario.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = emailInput?.value.trim();
        const password = passwordInput?.value;

        // Validaciones locales
        if (!email || !password) {
            mostrarError('Por favor, completá todos los campos.');
            return;
        }

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            mostrarError('Por favor, ingresá un correo electrónico válido.');
            return;
        }

        ocultarError();
        mostrarCargando(true);

        try {
            await login(email, password);
            console.log('Inicio de sesión correcto.');
            window.location.href = 'menu.html';

        } catch (error) {
            console.error('Error en login:', error);
            
            // Muestra el mensaje mapeado proveniente de auth.js o un fallback genérico
            const mensaje = error.message || 'Correo o contraseña incorrectos.';
            mostrarError(mensaje);

            mostrarCargando(false);
        }
    });
});