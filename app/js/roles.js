import { verificarSesionYObtenerRol } from './auth.js';


// ============================================================
// PERMISOS DEL ADMINISTRADOR
// ============================================================

export const PERMISOS_ADMIN = [

    // Reservas
    'registrar_reserva',
    'ver_reservas',
    'ver_mis_reservas',

    // Profesores
    'crear_profesores',
    'editar_profesores',
    'eliminar_profesores',

    // Inventario
    'ver_notebooks',
    'gestionar_notebooks'

];


// ============================================================
// PERMISOS DEL PROFESOR
// ============================================================

export const PERMISOS_PROFESOR = [

    // Reservas
    'registrar_reserva',
    'ver_mis_reservas'

];


// ============================================================
// OBTENER PERMISOS SEGÚN ROL
// ============================================================

export function obtenerPermisosRol(rol) {

    if (!rol) {
        return [];
    }

    const rolNormalizado = rol.toLowerCase();

    if (rolNormalizado === 'admin') {
        return PERMISOS_ADMIN;
    }

    if (rolNormalizado === 'profesor') {
        return PERMISOS_PROFESOR;
    }

    return [];
}


// ============================================================
// COMPROBAR SI UN ROL TIENE UN PERMISO
// ============================================================

export function tienePermiso(rol, permiso) {

    const permisos = obtenerPermisosRol(rol);

    return permisos.includes(permiso);
}


// ============================================================
// PÁGINAS RESTRINGIDAS A ADMINISTRADORES
// ============================================================

const PAGINAS_SOLO_ADMIN = new Set([

    'listado-notebooks.html',
    'ver-reservas.html',
    'gestion-profesores.html'

]);


// ============================================================
// CONTROLAR ACCESO A LA PÁGINA ACTUAL
// ============================================================

export async function controlarAccesoPorRol() {

    try {

        const datosUsuario =
            await verificarSesionYObtenerRol();

        if (!datosUsuario) {
            return null;
        }

        const rol =
            datosUsuario.rol?.toLowerCase();

        const paginaActual =
            window.location.pathname
                .split('/')
                .pop()
                .toLowerCase() || 'index.html';


        // ----------------------------------------------------
        // VERIFICAR SI LA PÁGINA REQUIERE ADMIN
        // ----------------------------------------------------

        if (
            PAGINAS_SOLO_ADMIN.has(paginaActual) &&
            rol !== 'admin'
        ) {

            console.warn(
                `Acceso denegado a "${paginaActual}" para el rol "${rol}".`
            );

            window.location.href = 'menu.html';

            return null;
        }


        // ----------------------------------------------------
        // FILTRAR ELEMENTOS SEGÚN ROL
        // ----------------------------------------------------

        document
            .querySelectorAll('[data-roles]')
            .forEach(elemento => {

                const rolesPermitidos =
                    elemento.dataset.roles
                        .toLowerCase()
                        .split(/[\s,]+/)
                        .filter(Boolean);


                if (
                    !rolesPermitidos.includes(rol)
                ) {

                    elemento.remove();

                }

            });


        return datosUsuario;

    } catch (error) {

        console.error(
            'Error durante el control de acceso:',
            error
        );

        return null;
    }
}


// ============================================================
// INICIAR CONTROL DE ACCESO
// ============================================================

await controlarAccesoPorRol();