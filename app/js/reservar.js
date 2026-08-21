import { getNotebooksDisponibles, registrarReserva } from './backend.js';

// ============================================================
// ELEMENTOS
// ============================================================

const fechaReserva = document.getElementById('fechaReserva');
const horaInicio = document.getElementById('horaInicio');
const horaFin = document.getElementById('horaFin');
const profesorSelect = document.getElementById('profesorSelect');
const cursosContainer = document.getElementById('cursosContainer');
const notebooksDisponibles = document.getElementById('notebooks-disponibles');
const cantidadNotebooks = document.getElementById('cantidad-notebooks');
const btnRestar = document.getElementById('btn-restar');
const btnSumar = document.getElementById('btn-sumar');
const btnContinuar = document.getElementById('btn-continuar');
const barraContinuar = document.getElementById('barraContinuar');
const confirmacionSection = document.getElementById('confirmacionSection');
const btnVolverInicio = document.getElementById('btn-volver-inicio');
const btnVolverFlecha = document.getElementById('btn-flecha-volver');

// ============================================================
// DATOS
// ============================================================

let cantidad = 1;
let notebooksDisponiblesActuales = [];
let cursoSeleccionado = null;

// ============================================================
// FECHA ACTUAL
// ============================================================

function obtenerFechaActual() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
}

// ============================================================
// ACTUALIZAR CANTIDAD
// ============================================================

function actualizarCantidad() {
    cantidadNotebooks.textContent = cantidad;
    actualizarBotonesCantidad();
}

// ============================================================
// HABILITAR / DESHABILITAR BOTONES
// ============================================================

function actualizarBotonesCantidad() {
    btnRestar.disabled = cantidad <= 1;
    btnSumar.disabled = notebooksDisponiblesActuales.length === 0 || cantidad >= notebooksDisponiblesActuales.length;

    if (btnRestar.disabled) {
        btnRestar.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        btnRestar.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    if (btnSumar.disabled) {
        btnSumar.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        btnSumar.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

// ============================================================
// BUSCAR NOTEBOOKS DISPONIBLES
// ============================================================

async function cargarNotebooksDisponibles() {
    const fecha = fechaReserva.value;
    const inicio = horaInicio.value;
    const fin = horaFin.value;

    // Validaciones
    if (!fecha || !inicio || !fin) {
        notebooksDisponibles.textContent = '-';
        notebooksDisponiblesActuales = [];
        cantidad = 1;
        actualizarCantidad();
        return;
    }

    if (inicio >= fin) {
        notebooksDisponibles.textContent = 'Horario inválido';
        notebooksDisponiblesActuales = [];
        cantidad = 1;
        actualizarCantidad();
        return;
    }

    // Cargando
    notebooksDisponibles.textContent = '...';
    notebooksDisponiblesActuales = [];
    cantidad = 1;
    actualizarCantidad();

    try {
        const disponibles = await getNotebooksDisponibles(fecha, inicio, fin);

        notebooksDisponiblesActuales = disponibles;
        notebooksDisponibles.textContent = disponibles.length;

        console.log('Notebooks disponibles:', disponibles);

        // Si no hay notebooks
        if (disponibles.length === 0) {
            cantidad = 1;
            actualizarCantidad();
            return;
        }

        // Si había una cantidad mayor que la cantidad disponible
        if (cantidad > disponibles.length) {
            cantidad = disponibles.length;
        }

        actualizarCantidad();

    } catch (error) {
        console.error('Error obteniendo notebooks disponibles:', error);
        notebooksDisponibles.textContent = 'Error';
        notebooksDisponiblesActuales = [];
        cantidad = 1;
        actualizarCantidad();
    }
}

// ============================================================
// CAMBIO DE CANTIDAD
// ============================================================

btnSumar.addEventListener('click', () => {
    if (cantidad < notebooksDisponiblesActuales.length) {
        cantidad++;
        actualizarCantidad();
    }
});

btnRestar.addEventListener('click', () => {
    if (cantidad > 1) {
        cantidad--;
        actualizarCantidad();
    }
});

// ============================================================
// CAMBIO DE FECHA Y HORARIO
// ============================================================

fechaReserva.addEventListener('change', cargarNotebooksDisponibles);
horaInicio.addEventListener('change', cargarNotebooksDisponibles);
horaFin.addEventListener('change', cargarNotebooksDisponibles);

// ============================================================
// SELECCIONAR CURSO
// ============================================================

function configurarCursos() {
    const botonesCurso = document.querySelectorAll('.curso-btn');

    botonesCurso.forEach(boton => {
        boton.addEventListener('click', () => {
            // Quitar selección anterior
            botonesCurso.forEach(btn => {
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
            });

            // Activar seleccionado
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

            cursoSeleccionado = {
                id: boton.dataset.curso,
                nombre: boton.dataset.nombre
            };

            console.log('Curso seleccionado:', cursoSeleccionado);
        });
    });
}

// ============================================================
// OBSERVAR CUANDO SE CARGAN LOS CURSOS
// ============================================================

const observer = new MutationObserver(() => {
    configurarCursos();
});

observer.observe(cursosContainer, { childList: true });

// ============================================================
// CONFIRMAR RESERVA
// ============================================================

btnContinuar.addEventListener('click', async () => {
    const fecha = fechaReserva.value;
    const inicio = horaInicio.value;
    const fin = horaFin.value;
    const profesor = profesorSelect.value;

    // VALIDACIONES
    if (!fecha) {
        alert('Seleccione una fecha.');
        return;
    }

    if (!inicio || !fin) {
        alert('Seleccione el horario.');
        return;
    }

    if (inicio >= fin) {
        alert('La hora de inicio debe ser menor que la hora de fin.');
        return;
    }

    if (!cursoSeleccionado) {
        alert('Seleccione un curso.');
        return;
    }

    if (!profesor) {
        alert('Seleccione un profesor.');
        return;
    }

    if (notebooksDisponiblesActuales.length < cantidad) {
        alert('No hay suficientes notebooks disponibles.');
        return;
    }

    // Deshabilitar botón
    btnContinuar.disabled = true;
    btnContinuar.innerHTML = `
        <span class="material-symbols-outlined animate-spin">
            progress_activity
        </span>
        Creando reserva...
    `;

    try {
        // REGISTRAR RESERVA
        const resultado = await registrarReserva({
            fecha: fecha,
            horaInicio: inicio,
            horaFin: fin,
            idProfesor: profesor,
            idCurso: cursoSeleccionado.id,
            cantidad: cantidad
        });

        console.log('Reserva creada:', resultado);

        // MOSTRAR CONFIRMACIÓN
        mostrarConfirmacion(resultado);

    } catch (error) {
        console.error('Error creando reserva:', error);
        alert(error.message || 'No se pudo crear la reserva.');

        btnContinuar.disabled = false;
        btnContinuar.innerHTML = `
            Confirmar reserva
            <span class="material-symbols-outlined">
                arrow_forward
            </span>
        `;
    }
});

// ============================================================
// MOSTRAR CONFIRMACIÓN
// ============================================================

function mostrarConfirmacion(resultado) {
    document.getElementById('confirmacionFecha').textContent = fechaReserva.value;
    document.getElementById('confirmacionCurso').textContent = cursoSeleccionado.nombre;
    document.getElementById('confirmacionHorario').textContent = `${horaInicio.value} - ${horaFin.value}`;
    document.getElementById('confirmacionCantidad').textContent = `${cantidad} notebook${cantidad === 1 ? '' : 's'}`;

    const contenedorCajas = document.getElementById('confirmacionCajas');
    contenedorCajas.innerHTML = '';

    if (resultado.cajas && resultado.cajas.length > 0) {
        resultado.cajas.forEach(item => {
            const li = document.createElement('li');
            li.className = 'flex items-center gap-sm bg-surface-container-lowest/60 rounded-lg p-sm';
            li.innerHTML = `
                <span class="material-symbols-outlined">
                    inventory_2
                </span>
                <span class="font-body-md">
                    ${item.caja.nombre}
                </span>
                <span class="text-on-surface-variant ml-auto">
                    ${item.notebooks.length} notebook${item.notebooks.length === 1 ? '' : 's'}
                </span>
            `;
            contenedorCajas.appendChild(li);
        });
    } else {
        contenedorCajas.innerHTML = `
            <li class="text-on-surface-variant">
                No se encontraron cajas asignadas.
            </li>
        `;
    }

    // Ocultar formulario
    document.querySelector('main')
        .querySelectorAll('section:not(#confirmacionSection)')
        .forEach(section => {
            section.classList.add('hidden');
        });

    // Mostrar confirmación y ocultar barra inferior
    confirmacionSection.classList.remove('hidden');
    barraContinuar.classList.add('hidden');

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ============================================================
// VOLVER AL INICIO
// ============================================================

btnVolverInicio.addEventListener('click', () => {
    window.location.href = 'menu.html';
});

btnVolverFlecha.addEventListener('click', () => {
    window.location.href = 'menu.html';
});
// ============================================================
// INICIAR
// ============================================================

fechaReserva.value = obtenerFechaActual();
actualizarCantidad();
cargarNotebooksDisponibles();