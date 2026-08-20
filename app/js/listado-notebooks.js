import { getNotebooks, getCajas, actualizarEstadoNotebook, actualizarObservacionNotebook } from './backend.js';

// ============================================================
// ELEMENTOS
// ============================================================
const listaCajas = document.getElementById('cajasContainer');
const buscador = document.getElementById('buscador');
const totalEquipos = document.getElementById('totalEquipos');
const totalDisponibles = document.getElementById('equiposDisponibles');
const totalProblemas = document.getElementById('equiposNoDisponibles');

// ============================================================
// DATOS
// ============================================================
let notebooks = [];
let cajas = [];

// ============================================================
// CARGAR INVENTARIO
// ============================================================
async function cargarInventario() {
    try {
        listaCajas.innerHTML = `
            <p class="text-center text-on-surface-variant py-8">
                Cargando inventario...
            </p>
        `;

        // Obtener notebooks y cajas desde Supabase
        notebooks = await getNotebooks();
        cajas = await getCajas();

        console.log('Notebooks:', notebooks);
        console.log('Cajas:', cajas);

        // Actualizar números superiores
        actualizarResumen();

        // Mostrar cajas
        mostrarCajas();
    } catch (error) {
        console.error('Error cargando inventario:', error);

        listaCajas.innerHTML = `
            <p class="text-center text-error py-8">
                No se pudo cargar el inventario.
            </p>
        `;
    }
}

// ============================================================
// ACTUALIZAR RESUMEN
// ============================================================
function actualizarResumen() {
    const total = notebooks.length;

    const disponibles = notebooks.filter(
        notebook => normalizarEstado(notebook.estado) === 'DISPONIBLE'
    ).length;

    const problemas = notebooks.filter(notebook => {
        const estado = normalizarEstado(notebook.estado);
        return estado === 'REPARACION' || estado === 'BAJA';
    }).length;

    totalEquipos.textContent = total;
    totalDisponibles.textContent = disponibles;
    totalProblemas.textContent = problemas;
}
// ============================================================
// MOSTRAR CAJAS
// ============================================================

function mostrarCajas(
    textoBusqueda = ''
) {
    listaCajas.innerHTML = '';
    const busqueda = textoBusqueda.trim().toLowerCase();
    for (const caja of cajas) {
        // Notebooks pertenecientes a esta caja
        const notebooksDeCaja = notebooks.filter(notebook => notebook.id_caja === caja.id);

        // Filtrar por buscador
        const notebooksFiltradas = notebooksDeCaja.filter( notebook => {
            const numero = String( notebook.numero_inventario).toLowerCase();
            const nombreCaja = String(caja.nombre).toLowerCase();
            return (numero.includes(busqueda) || nombreCaja.includes(busqueda));
        }
        );

        // Si estamos buscando y no hay coincidencias, no mostrar esta caja.
        if (busqueda && notebooksFiltradas.length === 0) {
            continue;
        }

        // Cantidad disponible de la caja
        const disponibles = notebooksDeCaja.filter(
            notebook =>
                normalizarEstado(
                        notebook.estado
                ) === 'DISPONIBLE'
        ).length;

        // Crear elemento de la caja
        const cajaElemento = document.createElement('div');
        cajaElemento.className = 'bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden';

        // BOTÓN DEL ACORDEÓN
        const boton = document.createElement('button');
        boton.className = 'w-full px-md py-4 flex items-center justify-between bg-surface-container-lowest hover:bg-surface-container-low transition-colors accordion-toggle';
        boton.setAttribute('aria-expanded','true');

        boton.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                    <span class="material-symbols-outlined">
                        inventory
                    </span>
                </div>
                <div class="text-left">
                    <h3 class="font-title-lg text-title-lg text-on-surface">
                        ${caja.nombre}
                    </h3>
                    <p class="font-body-md text-body-md text-on-surface-variant">
                        ${notebooksDeCaja.length}
                        Equipo${notebooksDeCaja.length === 1 ? '' : 's'}
                        •
                        ${disponibles}
                        Disponible${disponibles === 1 ? '' : 's'}
                    </p>
                </div>
            </div>
            <span class="material-symbols-outlined text-on-surface-variant transition-transform duration-300 transform rotate-180 indicator">
                expand_more
            </span>
        `;

        // CONTENIDO DEL ACORDEÓN
        const contenido = document.createElement('div');
        contenido.className = 'accordion-content is-open';

        const interno = document.createElement('div');
        interno.className = 'accordion-inner bg-surface-container-lowest border-t border-outline-variant/30';

        const contenedor = document.createElement('div');
        contenedor.className = 'p-md space-y-4';

        // ENCABEZADO DE TABLA
        contenedor.innerHTML = `
            <div class="hidden md:grid grid-cols-12 gap-4 pb-2 border-b border-outline-variant/30 px-2">
                <div class="col-span-3 font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider">
                    Identificador
                </div>
                <div class="col-span-3 font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider">
                    Estado
                </div>
                <div class="col-span-6 font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider">
                    Observaciones
                </div>
            </div>
        `;

        // NOTEBOOKS A MOSTRAR
        const notebooksAMostrar = busqueda ? notebooksFiltradas : notebooksDeCaja;

        // CREAR FILAS
        for (
            const notebook of notebooksAMostrar
        ) {
            const fila = crearFilaNotebook(notebook);
            contenedor.appendChild(fila);
        }

        // ARMAR ESTRUCTURA
        interno.appendChild(contenedor);
        contenido.appendChild(interno);

        cajaElemento.appendChild(boton);
        cajaElemento.appendChild(contenido);

        listaCajas.appendChild(cajaElemento);

        // EVENTO DEL ACORDEÓN

        boton.addEventListener(
            'click',
            () => {
                const abierto = boton.getAttribute('aria-expanded') === 'true';

                const indicador = boton.querySelector('.indicator');

                if (abierto) {
                    boton.setAttribute('aria-expanded', 'false');
                    contenido.classList.remove('is-open');
                    indicador.classList.remove('rotate-180');

                } else {

                    boton.setAttribute('aria-expanded', 'true');

                    contenido.classList.add('is-open');

                    indicador.classList.add('rotate-180');
                }
            }
        );
    }

    // SIN RESULTADOS
    if (
        listaCajas.children.length === 0
    ) {
        listaCajas.innerHTML = `
            <div class="text-center py-10">
                <span class="material-symbols-outlined text-4xl text-on-surface-variant">
                    search_off
                </span>
                <p class="mt-2 text-on-surface-variant">
                    No se encontraron equipos.
                </p>
            </div>
        `;
    }
}

// CREAR FILA DE NOTEBOOK
function crearFilaNotebook(notebook) {
    const fila = document.createElement('div');
    const estado = normalizarEstado(notebook.estado);

    fila.className = obtenerClaseFila(estado);

    // IDENTIFICADOR
    const identificador = document.createElement('div');
    identificador.className = 'col-span-3 flex items-center gap-3 w-full';
    identificador.innerHTML = `
        <span class="material-symbols-outlined ${obtenerClaseIcono(estado)} notebook-icon">
            laptop_mac
        </span>
        <span class="font-title-lg text-title-lg md:font-body-lg md:text-body-lg font-semibold text-on-surface">
            Notebook ${notebook.numero_inventario}
        </span>
    `;

    const icono = identificador.querySelector('.notebook-icon');

    // SELECT ESTADO

    const contenedorEstado = document.createElement('div');
    contenedorEstado.className ='col-span-3 w-full relative select-wrapper';

    const select = document.createElement('select');
    select.className =
        'w-full bg-surface-container-highest border border-outline-variant rounded-md px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary h-10';
    select.innerHTML = `
        <option value="DISPONIBLE">
            Disponible
        </option>
        <option value="REPARACION">
            En Reparación
        </option>
        <option value="BAJA">
            Baja
        </option>
    `;
    select.value =
        estado;
    
    
    // CAMBIAR ESTADO
    select.addEventListener('change', async () => {
        const nuevoEstado = select.value;
        const estadoAnterior = notebook.estado;

        select.disabled = true;

        try {
            const actualizado = await actualizarEstadoNotebook(notebook.id, nuevoEstado);

            if (actualizado) {
                notebook.estado = nuevoEstado;
                actualizarResumen();
                fila.className = obtenerClaseFila(nuevoEstado);
                icono.className = `material-symbols-outlined ${obtenerClaseIcono(nuevoEstado)}`;
            } else {
                select.value = normalizarEstado(estadoAnterior);
                alert('No se pudo actualizar el estado.');
            }
        } catch (error) {
            console.error('Error actualizando estado:', error);
            select.value = normalizarEstado(estadoAnterior);
            alert('No se pudo actualizar el estado.');
        } finally {
            select.disabled = false;
        }
    });

    contenedorEstado.appendChild(select);

    // OBSERVACIÓN
    const contenedorObservacion = document.createElement('div');
    contenedorObservacion.className = 'col-span-6 w-full';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = notebook.observaciones || '';
    input.placeholder = 'Añadir observación...';
    input.className = 'w-full bg-surface border border-outline-variant rounded-md px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary h-10 placeholder:text-outline/70';

    // GUARDAR OBSERVACIÓN
    let temporizador;

    input.addEventListener('input', () => {
        clearTimeout(temporizador);

        temporizador = setTimeout(async () => {
            try {
                const actualizado = await actualizarObservacionNotebook(notebook.id, input.value);
                if (actualizado) {
                notebook.observaciones = input.value;
                }
            } catch (error) {
                console.error('Error actualizando observación:', error);
            }
        }, 700);
    });

    contenedorObservacion.appendChild(input);

    // ARMAR FILA
    fila.appendChild(identificador);
    fila.appendChild(contenedorEstado);
    fila.appendChild(contenedorObservacion);

    return fila;
    }

    // ============================================================
    // NORMALIZAR ESTADO
    // ============================================================
    function normalizarEstado(estado) {
    if (!estado) return 'DISPONIBLE';
    return String(estado).toUpperCase();
    }

    // ============================================================
    // CLASE DE LA FILA
    // ============================================================
    function obtenerClaseFila(estado) {
    let clases = 'flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center p-3 rounded-lg hover:bg-surface-container-low transition-colors border border-outline-variant/20 md:border-none';

    if (estado === 'REPARACION') {
        clases += ' bg-error-container/10';
    }

    if (estado === 'BAJA') {
        clases += ' bg-error-container/20';
    }

    return clases;
    }

    // ============================================================
    // CLASE DEL ICONO
    // ============================================================
    function obtenerClaseIcono(estado) {
    switch (estado) {
        case 'REPARACION':
        case 'BAJA':
            return 'text-error';
        default:
            return 'text-outline';
    }
    }

    // ============================================================
    // BUSCADOR
    // ============================================================
    buscador.addEventListener('input', () => {
    mostrarCajas(buscador.value);
    });

// ============================================================
// INICIAR
// ============================================================
cargarInventario();
