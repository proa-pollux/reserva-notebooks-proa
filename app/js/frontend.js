import { getProfesores, getCursos } from './backend.js';
import { verificarSesionYObtenerRol } from './auth.js';
// ============================================================
// ELEMENTOS
// ============================================================

const profesorSection = document.getElementById('profesorSection');
const profesorSelect = document.getElementById('profesorSelect');
const cursosContainer = document.getElementById('cursosContainer');

// ============================================================
// CARGAR PROFESORES
// ============================================================

async function cargarProfesores() {
    try {
        const datosUsuario = await verificarSesionYObtenerRol();

        if (!datosUsuario) {
            return;
        }

        // ====================================================
        // PROFESOR
        // ====================================================

        if (datosUsuario.rol === 'profesor') {
            // El profesor no necesita seleccionar su nombre.
            // Guardamos su ID en el select para que reservar.js
            // pueda utilizarlo al crear la reserva.

            profesorSelect.innerHTML = '';

            const opcion = document.createElement('option');
            opcion.value = datosUsuario.user.id;
            opcion.textContent = 'Profesor actual';
            opcion.selected = true;

            profesorSelect.appendChild(opcion);

            // Ocultar completamente el selector.
            profesorSection.classList.add('hidden');

            return;
        }

        // ====================================================
        // ADMIN
        // ====================================================

        if (datosUsuario.rol === 'admin') {
            profesorSection.classList.remove('hidden');

            const profesores = await getProfesores();

            profesorSelect.innerHTML =
                '<option value="">-- Seleccione un profesor --</option>';

            profesores.forEach(profe => {
                const opcion = document.createElement('option');

                opcion.value = profe.id;
                opcion.innerText =
                    `${profe.nombre} ${profe.apellido}`;

                profesorSelect.appendChild(opcion);
            });

            return;
        }

    } catch (error) {
        console.error('Error cargando profesores:', error);

        profesorSelect.innerHTML =
            '<option value="">Error cargando profesores</option>';
    }
}

// ============================================================
// CARGAR CURSOS
// ============================================================

async function cargarCursos() {
    try {
        const cursos = await getCursos();

        cursosContainer.innerHTML = '';

        cursos.forEach(curso => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('curso-option');

            wrapper.innerHTML = `
                <button
                    type="button"
                    data-curso="${curso.id}"
                    data-nombre="${curso.nombre}"
                    class="curso-btn bg-surface-container-lowest border border-outline-variant text-on-surface-variant rounded-lg py-3 flex items-center justify-center cursor-pointer">
                    ${curso.nombre}º
                </button>
            `;

            cursosContainer.appendChild(wrapper);
        });

    } catch (error) {
        console.error('Error cargando cursos:', error);
    }
}

// ============================================================
// INICIAR
// ============================================================

cargarProfesores();
cargarCursos();