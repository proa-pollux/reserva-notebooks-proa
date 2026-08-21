import { getReservasPorFecha } from './backend.js';

// ============================================================
// ELEMENTOS
// ============================================================
const selectorFecha = document.getElementById('selectorFecha');
const reservasContainer = document.getElementById('reservasContainer');
const mensajeReservas = document.getElementById('mensajeReservas');

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
// CONVERTIR FECHA
// ============================================================
function convertirFecha(fecha) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
}


// ============================================================
// CONFIGURAR RANGO DE FECHA
// ============================================================
function configurarRangoFecha() {
    const hoy = new Date();

    // 15 días atrás
    const minimo = new Date(hoy);
    minimo.setDate(hoy.getDate() - 15);

    // 15 días adelante
    const maximo = new Date(hoy);

    maximo.setDate(hoy.getDate() + 15);
    selectorFecha.min = convertirFecha(minimo);
    selectorFecha.max = convertirFecha(maximo);

    // Seleccionar hoy
    selectorFecha.value =obtenerFechaActual();
}

// ============================================================
// FORMATEAR HORA
// ============================================================
function formatearHora(hora) {
    if (!hora) {
        return '--:--';
    }
    return hora.substring(0, 5);
}

// ============================================================
// CLASES DEL ESTADO
// ============================================================
function obtenerClasesEstado(estado) {
    switch (estado) {
        case 'RESERVADA':
            return `
                bg-yellow-100
                text-yellow-800
            `;

        case 'EN CURSO':
            return `
                bg-sky-100
                text-sky-800
            `;

        case 'DEVUELTA':
            return `
                bg-green-100
                text-green-800
            `;

        case 'CANCELADA':
            return `
                bg-red-100
                text-red-800
            `;

        default:
            return `
                bg-surface-variant
                text-on-surface-variant
            `;
    }
}


// ============================================================
// CARGAR RESERVAS
// ============================================================
async function cargarReservas() {
    const fecha = selectorFecha.value;
    if (!fecha) {
        return;
    }
    // Limpiar reservas anteriores
    reservasContainer.innerHTML = '';
    mensajeReservas.textContent =
        'Cargando reservas...';

    try {

        // ====================================================
        // OBTENER RESERVAS
        // ====================================================
        const reservas =
            await getReservasPorFecha(
                fecha
            );
        console.log(
            'Reservas obtenidas:',
            reservas
        );

        // ====================================================
        // SI NO HAY RESERVAS
        // ====================================================
        if (reservas.length === 0) {

            mensajeReservas.textContent =
                'No hay reservas para este día.';

            return;
        }

        // ====================================================
        // MENSAJE
        // ====================================================
        mensajeReservas.textContent =
            `${reservas.length} reserva${
                reservas.length === 1
                    ? ''
                    : 's'
            } encontrada${
                reservas.length === 1
                    ? ''
                    : 's'
            }.`;

        // ====================================================
        // CREAR TARJETAS
        // ====================================================
        reservas.forEach(
            reserva => {

                crearTarjetaReserva(
                    reserva
                );
            }
        );


    } catch (error) {
        console.error(
            'Error cargando reservas:',
            error
        );
        mensajeReservas.textContent =
            'No se pudieron cargar las reservas.';
    }
}

// ============================================================
// CREAR TARJETA
// ============================================================
function crearTarjetaReserva(
    reserva
) {
    const tarjeta = document.createElement('div');

    tarjeta.className = 'cursor-pointer bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-variant flex flex-col gap-sm relative overflow-hidden hover:shadow-md transition-shadow';


    // ========================================================
    // PROFESOR
    // ========================================================
    const profesor =reserva.profesores;
    const nombreProfesor = profesor ? `${profesor.nombre} ${profesor.apellido}` : 'Profesor desconocido';

    // ========================================================
    // CURSO
    // ========================================================
    const curso =reserva.cursos;
    const nombreCurso = curso ? curso.nombre : '-';

    // ========================================================
    // ESTADO
    // ========================================================
    const estado =reserva.estado || 'RESERVADA';
    const clasesEstado = obtenerClasesEstado(estado);


    // ========================================================
    // HTML DE LA TARJETA
    // ========================================================

    tarjeta.innerHTML = `
        <div class="absolute top-0 right-0 w-16 h-16 bg-primary opacity-5 rounded-bl-full">
        </div>

        <div class="flex justify-between items-start">
            <div class="flex items-center gap-sm">
                <div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span class="material-symbols-outlined">
                        person
                    </span>
                </div>

                <div>
                    <p class="font-title-lg">
                        Prof. ${nombreProfesor}
                    </p>

                    <p class="font-body-md text-on-surface-variant">
                        ${nombreCurso}° Año
                    </p>
                </div>
            </div>

            <span class="inline-flex items-center px-2 py-1 rounded-full ${clasesEstado} font-label-lg">
                ${estado}
            </span>
        </div>
        <div class="mt-sm pt-sm border-t border-outline-variant flex justify-between items-end">
            <div>
                <div class="flex items-center gap-xs text-on-surface-variant">
                    <span class="material-symbols-outlined text-[18px]">
                        schedule
                    </span>
                    <span>
                        ${formatearHora(reserva.hora_inicio)}
                        ${formatearHora(reserva.hora_fin)}
                    </span>
                </div>

                <div class="flex items-center gap-xs text-on-surface-variant">
                    <span class="material-symbols-outlined text-[18px]">
                        laptop_mac
                    </span>

                    <span>

                        ${reserva.cantidad_notebooks}
                        Equipo${
                            reserva.cantidad_notebooks === 1
                                ? ''
                                : 's'
                        }
                    </span>
                </div>
            </div>
        </div>
    `;
    // ========================================================
    // CLICK EN LA TARJETA
    // ========================================================

    tarjeta.addEventListener('click', () => {

    window.location.href =
        `detalle-reservas.html?id_reserva=${reserva.id}`;

    });


    // ========================================================
    // AGREGAR TARJETA
    // ========================================================

    reservasContainer.appendChild(tarjeta);
}
// ============================================================
// EVENTO CAMBIO DE FECHA
// ============================================================

selectorFecha.addEventListener(
    'change',
    cargarReservas
);
// ============================================================
// INICIAR
// ============================================================
configurarRangoFecha();
cargarReservas();
