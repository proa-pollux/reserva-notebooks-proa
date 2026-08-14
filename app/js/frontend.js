import { getProfesores, getCursos } from './backend.js';

const profesorSelect = document.getElementById( 'profesorSelect');

// ==========================
// CARGAR PROFESORES
// ==========================
async function cargarProfesores() {
    try {
        const profesores = await getProfesores();
        profesorSelect.innerHTML = '<option value="">-- Seleccione un profesor --</option>';
        profesores.forEach(profe => {
            const opcion = document.createElement('option');

            opcion.value = profe.id;
            opcion.innerText = `${profe.nombre} ${profe.apellido}`;
            profesorSelect.appendChild( opcion);
        });

    } catch (error) {

        console.error(
            'Error cargando profesores:',
            error
        );
    }
}

// ==========================
// CARGAR CURSOS
// ==========================
async function cargarCursos() {

    const cursosContainer = document.getElementById('cursosContainer');
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

        // ==========================
        // SELECCIÓN DE CURSO
        // ==========================
        const botonesCurso = document.querySelectorAll('.curso-btn');

        botonesCurso.forEach(boton => {
            boton.addEventListener(
                'click',
                () => {

                    // Quitar selección anterior.
                    botonesCurso.forEach(
                        btn => {
                            btn.classList.remove(
                                'bg-primary-container',
                                'text-on-primary-container',
                                'border-transparent',
                                'shadow-sm',
                                'ring-2',
                                'ring-primary-container',
                                'ring-offset-1',
                                'ring-offset-background'
                            );

                            btn.classList.add(
                                'bg-surface-container-lowest',
                                'border-outline-variant',
                                'text-on-surface-variant'
                            );
                        }
                    );

                    // Activar seleccionado.
                    boton.classList.remove(
                        'bg-surface-container-lowest',
                        'border-outline-variant',
                        'text-on-surface-variant'
                    );

                    boton.classList.add(
                        'bg-primary-container',
                        'text-on-primary-container',
                        'border-transparent',
                        'shadow-sm',
                        'ring-2',
                        'ring-primary-container',
                        'ring-offset-1',
                        'ring-offset-background'
                    );

                    console.log(
                        'Curso seleccionado:',
                        boton.dataset.curso
                    );
                }
            );
        });

    } catch (error) {
        console.error(
            'Error cargando cursos:',
            error
        );
    }
}

// ==========================
// INICIAR
// ==========================

cargarProfesores();
cargarCursos();
