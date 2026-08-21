import { login } from './auth.js';

// ============================================================
// ELEMENTOS
// ============================================================

const formulario =
    document.getElementById('loginForm');

const emailInput =
    document.getElementById('email');

const passwordInput =
    document.getElementById('password');

const mensajeError =
    document.getElementById('mensajeError');

const mensajeErrorTexto =
    document.getElementById('mensajeErrorTexto');

const botonLogin =
    document.getElementById('btnLogin');


// ============================================================
// INICIO DE SESIÓN
// ============================================================

if (formulario) {

    formulario.addEventListener(
        'submit',
        async (event) => {

            // Evitar que el formulario recargue la página
            event.preventDefault();

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            // ====================================================
            // LIMPIAR ERROR
            // ====================================================

            mensajeError.classList.add('hidden');

            mensajeErrorTexto.textContent = '';


            // ====================================================
            // DESACTIVAR BOTÓN
            // ====================================================

            botonLogin.disabled = true;

            botonLogin.innerHTML = `
                <span class="material-symbols-outlined animate-spin">
                    progress_activity
                </span>

                Iniciando sesión...
            `;


            // ====================================================
            // LOGIN
            // ====================================================

            try {

                await login(
                    email,
                    password
                );

                console.log('Inicio de sesión correcto.');

                // Ir al menú
                window.location.href = 'menu.html';


            } catch (error) {

                console.error(
                    'Error en login:',
                    error
                );


                // Mostrar error
                mensajeErrorTexto.textContent =
                    'Correo o contraseña incorrectos.';

                mensajeError.classList.remove(
                    'hidden'
                );


                // Volver a activar botón
                botonLogin.disabled = false;

                botonLogin.innerHTML = `
                    <span id="btnText">
                        Iniciar sesión
                    </span>

                    <span
                        class="material-symbols-outlined"
                        id="btnIcon">
                        arrow_forward
                    </span>
                `;
            }
        }
    );
}