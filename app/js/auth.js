import { supabase } from './db.js';

// ============================================================
// LOGIN
// ============================================================

export async function login(email, password) {

    const { data, error } =
        await supabase.auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        console.error(
            'Error iniciando sesión:',
            error.message
        );

        throw error;
    }

    return data;
}


// ============================================================
// LOGOUT
// ============================================================

export async function logout() {

    const { error } =
        await supabase.auth.signOut({
            scope: 'local'
        });

    if (error) {
        console.error(
            'Error cerrando sesión:',
            error.message
        );

        throw error;
    }
}


// ============================================================
// VERIFICAR SESIÓN
// ============================================================

export async function verificarSesion() {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = 'login.html';
        return false;
    }

    return true;
}


// ============================================================
// CONFIGURAR LOGOUT
// ============================================================

export function configurarLogout() {

    const botonesLogout =
        document.querySelectorAll('[data-logout]');

    botonesLogout.forEach(boton => {

        boton.addEventListener('click', async () => {

            try {

                boton.disabled = true;

                await logout();

                window.location.href = 'login.html';

            } catch (error) {

                console.error(
                    'No se pudo cerrar sesión:',
                    error
                );

                alert('No se pudo cerrar sesión.');

                boton.disabled = false;
            }
        });
    });
}