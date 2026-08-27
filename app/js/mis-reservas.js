import { verificarSesion } from './auth.js';
import { getMisReservas } from './backend.js';

// ============================================================
// ELEMENTOS
// ============================================================

const reservasContainer = document.getElementById('reservasContainer');

// ============================================================
// FORMATEAR FECHA
// ============================================================

function formatearFecha(fecha) {
    if (!fecha) {
        return '-';
    }

    const partes = fecha.split('-');

    if (partes.length !== 3) {
        return fecha;
    }

    const anio = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    const fechaObjeto = new Date(anio, mes - 1, dia);

    return fechaObjeto.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// ============================================================
// OBTENER TEXTO DE FECHA
// ============================================================

function obtenerTextoFecha(fecha) {
    if (!fecha) {
        return '-';
    }

    const partes = fecha.split('-');

    if (partes.length !== 3) {
        return formatearFecha(fecha);
    }

    const fechaReserva = new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);
    fechaReserva.setHours(0, 0, 0, 0);

    const diferencia = Math.round(
        (fechaReserva.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Hoy
    if (diferencia === 0) {
        return `Hoy, ${fechaReserva.toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short'
        })}`;
    }

    // Mañana
    if (diferencia === 1) {
        return `Mañana, ${fechaReserva.toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short'
        })}`;
    }

    // Ayer
    if (diferencia === -1) {
        return `Ayer, ${fechaReserva.toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short'
        })}`;
    }

    // Otra fecha
    return formatearFecha(fecha);
}

// ============================================================
// CREAR FECHA Y HORA
// ============================================================

function crearFechaHora(fecha, hora) {
    if (!fecha || !hora) {
        return new Date(NaN);
    }

    const horaFormateada = hora.length === 5 ? `${hora}:00` : hora;

    return new Date(`${fecha}T${horaFormateada}`);
}

// ============================================================
// DETERMINAR ESTADO REAL
// ============================================================

function determinarEstado(reserva) {
    if (!reserva) {
        return 'DESCONOCIDO';
    }

    if (reserva.estado === 'CANCELADA') {
        return 'CANCELADA';
    }

    if (reserva.estado === 'DEVUELTA') {
        return 'DEVUELTA';
    }

    const ahora = new Date();
    const inicio = crearFechaHora(reserva.fecha, reserva.hora_inicio);

    if (ahora < inicio) {
        return 'RESERVADA';
    }

    return 'EN_CURSO';
}

// ============================================================
// OBTENER TEXTO DEL ESTADO
// ============================================================

function obtenerTextoEstado(estado) {
    switch (estado) {
        case 'RESERVADA':
            return 'PENDIENTE';

        case 'EN_CURSO':
            return 'EN CURSO';

        case 'DEVUELTA':
            return 'DEVUELTA';

        case 'CANCELADA':
            return 'CANCELADA';

        default:
            return estado || 'SIN ESTADO';
    }
}

// ============================================================
// OBTENER CLASES DEL ESTADO
// ============================================================

function obtenerClasesEstado(estado) {
    switch (estado) {
        case 'RESERVADA':
            return {
                badge: 'bg-tertiary-container text-on-tertiary-container',
                tarjeta: ''
            };

        case 'EN_CURSO':
            return {
                badge: 'bg-primary-container text-on-primary-container',
                tarjeta: ''
            };

        case 'DEVUELTA':
            return {
                badge: 'bg-surface-variant text-on-surface-variant',
                tarjeta: 'opacity-75 hover:opacity-100'
            };

        case 'CANCELADA':
            return {
                badge: 'bg-error-container text-on-error-container',
                tarjeta: 'opacity-75'
            };

        default:
            return {
                badge: 'bg-surface-variant text-on-surface-variant',
                tarjeta: ''
            };
    }
}

// ============================================================
// CREAR TARJETA DE RESERVA
// ============================================================

function crearTarjetaReserva(reserva) {
    const tarjeta = document.createElement('div');

    tarjeta.dataset.idReserva = reserva.id;
    tarjeta.setAttribute('role', 'button');
    tarjeta.setAttribute('tabindex', '0');
    tarjeta.classList.add('cursor-pointer');

    const estadoReal = determinarEstado(reserva);
    const estilos = obtenerClasesEstado(estadoReal);

    tarjeta.className = `
        bg-surface-container-lowest
        shadow-sm
        rounded-xl
        p-md
        border
        border-outline-variant/30
        hover:shadow-md
        transition-all
        hover:shadow-lg
        hover:-translate-y-0.5
        ${estilos.tarjeta}
    `;

    // CURSO
    const nombreCurso = reserva.cursos?.nombre
        ? `${reserva.cursos.nombre}º`
        : 'Curso no disponible';

    // CANTIDAD
    const cantidad = reserva.cantidad_notebooks ?? 0;
    const textoCantidad = `${cantidad} notebook${cantidad === 1 ? '' : 's'}`;

    // ESTADO
    const textoEstado = obtenerTextoEstado(estadoReal);

    // FECHA
    const fechaTexto = obtenerTextoFecha(reserva.fecha);

    // HORARIOS
    const horaInicio = reserva.hora_inicio
        ? reserva.hora_inicio.substring(0, 5)
        : '--:--';

    const horaFin = reserva.hora_fin
        ? reserva.hora_fin.substring(0, 5)
        : '--:--';

    // HTML DE LA TARJETA
    tarjeta.innerHTML = `
        <div class="flex justify-between items-start mb-sm">
            <div class="flex items-center gap-sm">
                <div class="bg-primary-container/20 p-2 rounded-lg text-primary">
                    <span class="material-symbols-outlined">
                        laptop_mac
                    </span>
                </div>

                <div>
                    <h3 class="font-title-lg text-title-lg">
                        ${nombreCurso}
                    </h3>

                    <p class="font-body-md text-on-surface-variant">
                        ${textoCantidad}
                    </p>
                </div>
            </div>

            <span class="${estilos.badge} px-3 py-1 rounded-full font-label-lg whitespace-nowrap">
                ${textoEstado}
            </span>
        </div>

        <div class="grid grid-cols-2 gap-sm mt-md pt-md border-t border-outline-variant/20">
            <div class="flex items-center gap-xs">
                <span class="material-symbols-outlined text-[18px]">
                    calendar_today
                </span>

                <span>
                    ${fechaTexto}
                </span>
            </div>

            <div class="flex items-center gap-xs">
                <span class="material-symbols-outlined text-[18px]">
                    schedule
                </span>

                <span>
                    ${horaInicio} - ${horaFin}
                </span>
            </div>
        </div>
    `;

    tarjeta.addEventListener('