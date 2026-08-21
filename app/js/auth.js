import { supabase } from './db.js';

function mapearErrorAuth(error) {
    if (!error) return 'Ocurrió un error inesperado.';

    switch (error.message) {
        case 'Invalid login credentials':
            return 'Correo electrónico o contraseña incorrectos.';
        case 'Email not confirmed':
            return 'El correo electrónico aún no ha sido confirmado.';
        case 'User not found':
            return 'No existe una cuenta registrada con este correo.';
        case 'Too many requests':
            return 'Demasiados intentos fallidos. Por favor, aguardá unos minutos.';
        default:
            return error.message || 'Error al procesar la autenticación.';
    }
}

// ============================================================
// LOGIN
// ============================================================
export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Error iniciando sesión:', error.message);
        throw new Error(mapearErrorAuth(error));
    }

    return data;
}

// ============================================================
// LOGOUT
// ============================================================
export async function logout() {
    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) {
        console.error('Error cerrando sesión:', error.message);
        throw new Error(mapearErrorAuth(error));
    }
}

// ============================================================
// VERIFICAR SESIÓN (Para páginas protegidas)
// ============================================================
export async function verificarSesion() {
    // getUser() valida de forma segura contra el servidor de Supabase
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        window.location.href = 'login.html';
        return null;
    }

    return user; // Retorna el usuario autenticado para usar sus datos
}

// ============================================================
// REDIRECCIONAR SI YA TIENE SESIÓN (Para la vista login.html)
// ============================================================
export async function redireccionarSiAutenticado(destino = 'ver-reservas.html') {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        window.location.href = destino;
    }
}

// ============================================================
// CONFIGURAR LOGOUT EN BOTONES
// ============================================================
export function configurarLogout() {
    const botonesLogout = document.querySelectorAll('[data-logout]');

    botonesLogout.forEach(boton => {
        boton.addEventListener('click', async () => {
            try {
                boton.disabled = true;
                await logout();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('No se pudo cerrar sesión:', error.message);
                alert('No se pudo cerrar sesión. Por favor, reintentá.');
                boton.disabled = false;
            }
        });
    });
}