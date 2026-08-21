import {getReservaPorId, getNotebooksDeReserva, actualizarEstadoReserva} from './backend.js';

// ============================================================
// ELEMENTOS 
// ============================================================
const tituloReserva = document.getElementById('tituloReserva');
const idReserva = document.getElementById('idReserva');
const estadoContainer = document.getElementById('estadoContainer');
const estadoIcono = document.getElementById('estadoIcono');
const estadoTexto = document.getElementById('estadoTexto');
const fechaReserva = document.getElementById('fechaReserva');
const horaReserva = document.getElementById('horaReserva');
const cursoReserva = document.getElementById('cursoReserva');
const cantidadReserva = document.getElementById('cantidadReserva');
const nombreProfesor = document.getElementById('nombreProfesor');
const inicialesProfesor = document.getElementById('inicialesProfesor');
const equipamientoContainer = document.getElementById('equipamientoContainer');
const observacionesSection = document.getElementById('observacionesSection');
const observacionesReserva = document.getElementById('observacionesReserva');
const mensajeEstado = document.getElementById('mensajeEstado');
const mensajeEstadoTexto = document.getElementById('mensajeEstadoTexto');
const btnCancelar = document.getElementById('btnCancelar');
const btnDevolver = document.getElementById('btnDevolver');
const mensajeFinalizada = document.getElementById('mensajeFinalizada');
const mensajeCancelada = document.getElementById('mensajeCancelada');
const btnVolver = document.getElementById('btnVolver');

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function obtenerIdReserva() {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get('id_reserva');
}

function formatearFecha(fecha) {
    if (!fecha) return '-';
    const partes = fecha.split('-');
    if (partes.length !== 3) return fecha;
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
}

function formatearHora(hora) {
    if (!hora) return '--:--';
    return hora.substring(0, 5);
}

function crearFechaHora(fecha, hora) {
    if (!fecha || !hora) return new Date(NaN);
    // Asegura el formato ISO YYYY-MM-THH:mm:ss
    const horaFormateada = hora.length === 5 ? `${hora}:00` : hora;
    return new Date(`${fecha}T${horaFormateada}`);
}

// ============================================================
// OBTENER ESTADO REAL
// ============================================================

function determinarEstado(reserva) {
    if (!reserva) return 'DESCONOCIDO';

    if (reserva.estado === 'CANCELADA') return 'CANCELADA';
    if (reserva.estado === 'DEVUELTA') return 'DEVUELTA';

    const ahora = new Date();
    const inicio = crearFechaHora(reserva.fecha, reserva.hora_inicio);

    // Todavía no empezó
    if (ahora < inicio) {
        return 'RESERVADA';
    }

    // Ya comenzó (permanece en curso hasta que se marque como DEVUELTA)
    return 'EN CURSO';
}

// ============================================================
// MOSTRAR ESTADO
// ============================================================

function resetearVisibilidadAcciones() {
    // Oculta todos los botones y avisos de estado antes de aplicar el nuevo
    btnCancelar.classList.add('hidden');
    btnCancelar.classList.remove('flex');

    btnDevolver.classList.add('hidden');
    btnDevolver.classList.remove('flex');

    mensajeFinalizada.classList.add('hidden');
    mensajeFinalizada.classList.remove('flex');

    mensajeCancelada.classList.add('hidden');
    mensajeCancelada.classList.remove('flex');
}

function mostrarEstado(estado) {
    resetearVisibilidadAcciones();

    // Limpiar clases anteriores del contenedor de badge
    estadoContainer.className = 'px-3 py-1 rounded-full flex items-center gap-xs';

    switch (estado) {
        case 'RESERVADA':
            estadoContainer.classList.add('bg-yellow-100', 'text-yellow-800');
            estadoIcono.textContent = 'schedule';
            estadoTexto.textContent = 'PENDIENTE';

            btnCancelar.classList.remove('hidden');
            btnCancelar.classList.add('flex');

            mensajeEstadoTexto.textContent =
                'La reserva todavía no comenzó. Podés cancelarla si ya no necesitás los equipos.';
            break;

        case 'EN CURSO':
            estadoContainer.classList.add('bg-sky-100', 'text-sky-800');
            estadoIcono.textContent = 'laptop_mac';
            estadoTexto.textContent = 'EN USO';

            btnDevolver.classList.remove('hidden');
            btnDevolver.classList.add('flex');

            mensajeEstadoTexto.textContent =
                'La reserva está actualmente en uso. Cuando termines, marcá los equipos como devueltos.';
            break;

        case 'DEVUELTA':
            estadoContainer.classList.add('bg-green-100', 'text-green-800');
            estadoIcono.textContent = 'check_circle';
            estadoTexto.textContent = 'DEVUELTA';

            mensajeFinalizada.classList.remove('hidden');
            mensajeFinalizada.classList.add('flex');

            mensajeEstadoTexto.textContent =
                'Esta reserva ya fue finalizada y los equipos fueron devueltos.';
            break;

        case 'CANCELADA':
            estadoContainer.classList.add('bg-red-100', 'text-red-800');
            estadoIcono.textContent = 'cancel';
            estadoTexto.textContent = 'CANCELADA';

            mensajeCancelada.classList.remove('hidden');
            mensajeCancelada.classList.add('flex');

            mensajeEstadoTexto.textContent =
                'Esta reserva fue cancelada y ya no se encuentra activa.';
            break;

        default:
            estadoContainer.classList.add('bg-slate-100', 'text-slate-800');
            estadoIcono.textContent = 'help';
            estadoTexto.textContent = 'DESCONOCIDO';
            mensajeEstadoTexto.textContent = 'Estado de reserva no reconocido.';
            break;
    }
}

// ============================================================
// MOSTRAR EQUIPAMIENTO
// ============================================================

function mostrarEquipamiento(notebooks) {
    equipamientoContainer.innerHTML = '';

    if (!notebooks || notebooks.length === 0) {
        equipamientoContainer.innerHTML = `
            <p class="text-center text-on-surface-variant py-4">
                No hay notebooks asociadas a esta reserva.
            </p>
        `;
        return;
    }

    // Agrupar por caja
    const cajas = {};

    for (const registro of notebooks) {
        const notebook = registro.notebooks;
        if (!notebook) continue;

        const idCaja = notebook.id_caja ?? 'Sin caja';
        if (!cajas[idCaja]) {
            cajas[idCaja] = [];
        }
        cajas[idCaja].push(notebook);
    }

    // Título
    const titulo = document.createElement('h4');
    titulo.className = 'font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider';
    titulo.textContent = 'Cajas Asignadas';
    equipamientoContainer.appendChild(titulo);

    // Contenedor
    const contenedorCajas = document.createElement('div');
    contenedorCajas.className = 'flex flex-col gap-sm';

    // Recorrer cajas ordenadas numéricamente/alfabéticamente
    Object.entries(cajas)
        .sort(([a], [b]) => String(a).localeCompare(String(b), undefined, { numeric: true }))
        .forEach(([idCaja, notebooksCaja]) => {
            const caja = document.createElement('div');
            caja.className = 'bg-secondary-container/40 rounded-xl p-md border border-secondary-container';

            const cantidadText = `${notebooksCaja.length} notebook${notebooksCaja.length === 1 ? '' : 's'}`;

            caja.innerHTML = `
                <div class="flex items-center justify-between mb-sm">
                    <div class="flex items-center gap-sm">
                        <span class="material-symbols-outlined text-primary">inventory_2</span>
                        <span class="font-title-lg text-title-lg text-on-surface">
                            ${isNaN(idCaja) ? idCaja : 'Caja ' + idCaja}
                        </span>
                    </div>
                    <span class="font-label-lg text-label-lg text-on-surface-variant">
                        ${cantidadText}
                    </span>
                </div>
            `;

            // Lista de notebooks de esta caja
            const lista = document.createElement('div');
            lista.className = 'flex flex-wrap gap-2';

            notebooksCaja
                .sort((a, b) => (a.numero_inventario || 0) - (b.numero_inventario || 0))
                .forEach(notebook => {
                    const elemento = document.createElement('div');
                    elemento.className = 'px-3 py-1.5 bg-surface-container-lowest rounded-lg border border-outline-variant flex items-center gap-1 font-body-md text-on-surface';
                    elemento.innerHTML = `
                        <span class="material-symbols-outlined text-[18px]">laptop_mac</span>
                        Notebook ${notebook.numero_inventario}
                    `;
                    lista.appendChild(elemento);
                });

            caja.appendChild(lista);
            contenedorCajas.appendChild(caja);
        });

    equipamientoContainer.appendChild(contenedorCajas);
}

// ============================================================
// MOSTRAR DATOS DEL PROFESOR
// ============================================================

function mostrarProfesor(profesor) {
    if (!profesor) {
        nombreProfesor.textContent = 'Profesor desconocido';
        inicialesProfesor.textContent = '--';
        return;
    }

    nombreProfesor.textContent = `Prof. ${profesor.nombre ?? ''} ${profesor.apellido ?? ''}`.trim();

    const inicialNombre = profesor.nombre ? profesor.nombre.charAt(0).toUpperCase() : '';
    const inicialApellido = profesor.apellido ? profesor.apellido.charAt(0).toUpperCase() : '';

    inicialesProfesor.textContent = `${inicialNombre}${inicialApellido}` || '--';
}

// ============================================================
// CARGAR RESERVA
// ============================================================

async function cargarReserva() {
    const id = obtenerIdReserva();

    if (!id) {
        console.error('No se encontró id_reserva en la URL.');
        mensajeEstadoTexto.textContent = 'No se especificó una reserva válida.';
        return;
    }

    try {
        const reserva = await getReservaPorId(id);
        if (!reserva) {
            throw new Error('Reserva no encontrada');
        }

        const notebooks = await getNotebooksDeReserva(id);

        const profesor = reserva.profesores;
        const curso = reserva.cursos;

        tituloReserva.textContent = `Reserva #${reserva.id}`;
        idReserva.textContent = `ID: #RES-${reserva.id}`;
        fechaReserva.textContent = formatearFecha(reserva.fecha);
        horaReserva.textContent = `${formatearHora(reserva.hora_inicio)} - ${formatearHora(reserva.hora_fin)}`;
        cursoReserva.textContent = curso ? curso.nombre : '-';

        const cant = reserva.cantidad_notebooks ?? notebooks?.length ?? 0;
        cantidadReserva.textContent = `${cant} notebook${cant === 1 ? '' : 's'}`;

        mostrarProfesor(profesor);

        // Observaciones
        if (reserva.observaciones && reserva.observaciones.trim() !== '') {
            observacionesSection.classList.remove('hidden');
            observacionesReserva.textContent = reserva.observaciones;
        } else {
            observacionesSection.classList.add('hidden');
        }

        // Equipamiento
        mostrarEquipamiento(notebooks);

        // Estado
        const estadoCalculado = determinarEstado(reserva);

        // Actualizar BD si la reserva pasó a "EN CURSO" automáticamente
        if (reserva.estado === 'RESERVADA' && estadoCalculado === 'EN CURSO') {
            const actualizado = await actualizarEstadoReserva(id, 'EN CURSO');
            if (actualizado) {
                console.log(`Reserva ${id} actualizada a EN CURSO en backend.`);
            }
        }

        mostrarEstado(estadoCalculado);

    } catch (error) {
        console.error('Error cargando detalle de reserva:', error);
        mensajeEstadoTexto.textContent = 'No se pudo cargar la información de la reserva.';
        equipamientoContainer.innerHTML = `
            <p class="text-center text-error py-4">
                No se pudo cargar el equipamiento.
            </p>
        `;
    }
}

// ============================================================
// BOTÓN CANCELAR RESERVA
// ============================================================

btnCancelar.addEventListener('click', async () => {
    const id = obtenerIdReserva();
    if (!id) return;

    const confirmar = confirm('¿Estás seguro de que querés cancelar esta reserva?');
    if (!confirmar) return;

    btnCancelar.disabled = true;
    btnCancelar.innerHTML = `
        <span class="material-symbols-outlined animate-spin">progress_activity</span>
        Cancelando...
    `;

    try {
        const resultado = await actualizarEstadoReserva(id, 'CANCELADA');
        if (!resultado) {
            throw new Error('No se pudo cancelar la reserva.');
        }

        mostrarEstado('CANCELADA');
        alert('La reserva fue cancelada correctamente.');

    } catch (error) {
        console.error('Error cancelando reserva:', error);
        alert('No se pudo cancelar la reserva.');

        btnCancelar.disabled = false;
        btnCancelar.innerHTML = `
            <span class="material-symbols-outlined">cancel</span>
            Cancelar reserva
        `;
    }
});


// ============================================================
// BOTÓN MARCAR COMO DEVUELTA
// ============================================================

btnDevolver.addEventListener('click', async () => {
    const id = obtenerIdReserva();
    if (!id) return;

    const confirmar = confirm('¿Confirmás que las notebooks fueron devueltas?');
    if (!confirmar) return;

    btnDevolver.disabled = true;
    btnDevolver.innerHTML = `
        <span class="material-symbols-outlined animate-spin">progress_activity</span>
        Guardando...
    `;

    try {
        const resultado = await actualizarEstadoReserva(id, 'DEVUELTA');
        if (!resultado) {
            throw new Error('No se pudo actualizar la reserva.');
        }

        mostrarEstado('DEVUELTA');
        alert('La reserva fue marcada como devuelta correctamente.');

    } catch (error) {
        console.error('Error marcando reserva como devuelta:', error);
        alert('No se pudo marcar la reserva como devuelta.');

        btnDevolver.disabled = false;
        btnDevolver.innerHTML = `
            <span class="material-symbols-outlined">assignment_return</span>
            Marcar como devuelta
        `;
    }
});

// ============================================================
// BOTÓN VOLVER
// ============================================================

btnVolver.addEventListener('click', () => {
    window.location.href = 'ver-reservas.html';
});

// ============================================================
// INICIALIZACIÓN
// ============================================================

cargarReserva();