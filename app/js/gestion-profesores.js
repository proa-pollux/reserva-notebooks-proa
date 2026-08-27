import {getProfesoresAdmin, actualizarProfesor, crearProfesor, darDeBajaProfesor, reactivarProfesor} from './backend.js';

// DATOS
let profesores = [];

// OBTENER ELEMENTOS DEL DOM DE FORMA DINÁMICA
const getDomElements = () => ({
    contenedorEditar: document.getElementById('lista-profesores-editar'),
    contenedorEliminar: document.getElementById('lista-profesores-eliminar'),
    contenedorInactivos: document.getElementById('lista-profesores-inactivos'),
    buscadorEditar: document.getElementById('buscar-profesor-editar'),
    buscadorEliminar: document.getElementById('buscar-profesor-eliminar'),
    buscadorInactivos: document.getElementById('buscar-profesor-inactivos'),
    formularioAgregar: document.getElementById('form-agregar-profesor')
});

// ============================================================
// CARGAR Y MOSTRAR PROFESORES
// ============================================================

async function cargarProfesores() {
    try {
        profesores = await getProfesoresAdmin();
        console.log('PROFESORES CARGADOS:', profesores);
        mostrarProfesores();
    } catch (error) {
        console.error('Error cargando profesores:', error);
        mostrarError('No se pudieron cargar los profesores.');
    }
}

function filtrarProfesores(activo, busqueda = '') {
    const termino = busqueda.trim().toLowerCase();
    return profesores.filter(p => {
        if (p.activo !== activo) return false;
        if (!termino) return true;
        return `${p.nombre} ${p.apellido}`.toLowerCase().includes(termino);
    });
}

function renderizarLista(contenedor, lista, accion, mensajeVacio) {
    if (!contenedor) return;
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        contenedor.innerHTML = `
            <p class="col-span-full text-center text-on-surface-variant py-8">
                ${mensajeVacio}
            </p>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    lista.forEach(profesor => {
        fragment.appendChild(crearTarjetaProfesor(profesor, accion));
    });
    contenedor.appendChild(fragment);
}

function mostrarProfesores() {
    const dom = getDomElements();

    if (dom.contenedorEditar) {
        const lista = filtrarProfesores(true, dom.buscadorEditar?.value);
        renderizarLista(dom.contenedorEditar, lista, 'editar', 'No se encontraron profesores activos.');
    }

    if (dom.contenedorEliminar) {
        const lista = filtrarProfesores(true, dom.buscadorEliminar?.value);
        renderizarLista(dom.contenedorEliminar, lista, 'eliminar', 'No se encontraron profesores activos.');
    }

    if (dom.contenedorInactivos) {
        const lista = filtrarProfesores(false, dom.buscadorInactivos?.value);
        renderizarLista(dom.contenedorInactivos, lista, 'reactivar', 'No hay profesores inactivos.');
    }
}

// ============================================================
// CREAR TARJETA DOM
// ============================================================

function crearTarjetaProfesor(profesor, accion) {
    const tarjeta = document.createElement('div');
    tarjeta.className =
        'bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md ' +
        'border border-outline-variant/50 p-md flex flex-col gap-md transition-shadow relative overflow-hidden group';

    const estadoBadge = profesor.activo
        ? `<span class="inline-flex items-center gap-1 text-label-md text-primary bg-primary/10 px-2 py-1 rounded-full">
            <span class="w-2 h-2 rounded-full bg-primary"></span> Activo
           </span>`
        : `<span class="inline-flex items-center gap-1 text-label-md text-error bg-error-container px-2 py-1 rounded-full">
            <span class="w-2 h-2 rounded-full bg-error"></span> Inactivo
           </span>`;

    const botonesAccion = {
        editar: `
            <button type="button" class="btn-editar-profesor p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors" data-id="${profesor.id}" title="Editar">
                <span class="material-symbols-outlined">edit</span>
            </button>`,
        eliminar: `
            <button type="button" class="btn-eliminar-profesor p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full transition-colors" data-id="${profesor.id}" title="Dar de baja">
                <span class="material-symbols-outlined">person_remove</span>
            </button>`,
        reactivar: `
            <button type="button" class="btn-reactivar-profesor p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors" data-id="${profesor.id}" title="Reactivar">
                <span class="material-symbols-outlined">person_add</span>
            </button>`
    };

    tarjeta.innerHTML = `
        <div class="flex items-start justify-between">
            <div class="flex items-center gap-md">
                <div class="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                    ${obtenerIniciales(profesor)}
                </div>
                <div>
                    <h3 class="font-title-lg text-title-lg text-on-surface">
                        ${escapeHtml(profesor.nombre)} ${escapeHtml(profesor.apellido)}
                    </h3>
                    <p class="font-body-md text-body-md text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <span class="material-symbols-outlined text-[16px]">person</span> Profesor
                    </p>
                    <div class="mt-2">${estadoBadge}</div>
                </div>
            </div>
            ${botonesAccion[accion] || ''}
        </div>
    `;

    return tarjeta;
}

// ============================================================
// MODAL DE EDICIÓN
// ============================================================

function abrirModalEditar(idProfesor) {
    const profesor = profesores.find(p => String(p.id) === String(idProfesor));
    if (!profesor) return console.error('No se encontró el profesor:', idProfesor);

    document.getElementById('editar-profesor-id').value = profesor.id;
    document.getElementById('editar-nombre').value = profesor.nombre;
    document.getElementById('editar-apellido').value = profesor.apellido;
    document.getElementById('editar-password').value = '';

    document.getElementById('modal-editar-profesor')?.classList.remove('hidden');
}

function cerrarModalEditar() {
    document.getElementById('modal-editar-profesor')?.classList.add('hidden');
}

async function guardarEdicionProfesor(event) {
    if (event) event.preventDefault();

    const id = document.getElementById('editar-profesor-id')?.value;
    const nombre = document.getElementById('editar-nombre')?.value.trim();
    const apellido = document.getElementById('editar-apellido')?.value.trim();
    const password = document.getElementById('editar-password')?.value;

    if (!id || !nombre || !apellido) {
        alert('Completá el nombre y el apellido.');
        return;
    }

    const boton = document.getElementById('btn-guardar-edicion');
    if (boton) boton.disabled = true;

    try {
        const profesorActualizado = await actualizarProfesor(id, nombre, apellido, password);
        const indice = profesores.findIndex(p => String(p.id) === String(id));

        if (indice !== -1) {
            profesores[indice] = profesorActualizado;
        }

        cerrarModalEditar();
        mostrarProfesores();
        alert('Profesor actualizado correctamente.');
    } catch (error) {
        console.error('Error actualizando profesor:', error);
        alert(error.message || 'No se pudo actualizar el profesor.');
    } finally {
        if (boton) boton.disabled = false;
    }
}

// ============================================================
// ACCIONES: DAR DE BAJA Y REACTIVAR
// ============================================================

async function eliminarProfesor(idProfesor) {
    const profesor = profesores.find(p => String(p.id) === String(idProfesor));
    if (!profesor) return;

    if (!profesor.activo) {
        alert('Este profesor ya está dado de baja.');
        return;
    }

    if (!confirm(`¿Seguro que querés dar de baja a ${profesor.nombre} ${profesor.apellido}?`)) {
        return;
    }

    try {
        await darDeBajaProfesor(idProfesor);
        profesor.activo = false;
        mostrarProfesores();
        alert('Profesor dado de baja correctamente.');
    } catch (error) {
        console.error('Error dando de baja al profesor:', error);
        alert(error.message || 'No se pudo dar de baja al profesor.');
    }
}

async function activarProfesor(idProfesor) {
    const profesor = profesores.find(p => String(p.id) === String(idProfesor));
    if (!profesor) return;

    if (profesor.activo) {
        alert('Este profesor ya está activo.');
        return;
    }

    if (!confirm(`¿Querés reactivar a ${profesor.nombre} ${profesor.apellido}?`)) {
        return;
    }

    try {
        const profesorActualizado = await reactivarProfesor(idProfesor);
        const indice = profesores.findIndex(p => String(p.id) === String(idProfesor));

        if (indice !== -1) {
            profesores[indice] = profesorActualizado;
        }

        mostrarProfesores();
        alert('Profesor reactivado correctamente.');
    } catch (error) {
        console.error('Error reactivando al profesor:', error);
        alert(error.message || 'No se pudo reactivar al profesor.');
    }
}

// ============================================================
// TABS & AUXILIARES
// ============================================================

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('hidden');
    });

    document.querySelectorAll('.tab-btn').forEach(boton => {
        boton.classList.remove('border-primary', 'text-primary', 'font-bold');
        boton.classList.add('border-transparent', 'text-on-surface-variant');
    });

    const tab = document.getElementById(tabId);
    const boton = document.getElementById(`btn-${tabId}`);

    if (tab) {
        tab.classList.remove('hidden');
        tab.classList.add('active');
    }

    if (boton) {
        boton.classList.remove('border-transparent', 'text-on-surface-variant');
        boton.classList.add('border-primary', 'text-primary', 'font-bold');
    }
}

function obtenerIniciales(profesor) {
    const nombre = profesor.nombre?.charAt(0) || '';
    const apellido = profesor.apellido?.charAt(0) || '';
    return (nombre + apellido).toUpperCase();
}

function escapeHtml(texto) {
    if (!texto) return '';
    return String(texto).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function mostrarError(mensaje) {
    const errorHtml = `<p class="col-span-full text-center text-error py-8">${mensaje}</p>`;
    const dom = getDomElements();

    if (dom.contenedorEditar) dom.contenedorEditar.innerHTML = errorHtml;
    if (dom.contenedorEliminar) dom.contenedorEliminar.innerHTML = errorHtml;
    if (dom.contenedorInactivos) dom.contenedorInactivos.innerHTML = errorHtml;
}

// ============================================================
// INICIALIZACIÓN Y EVENTOS
// ============================================================

function inicializarEventos() {
    const dom = getDomElements();

    document.addEventListener('click', event => {
        const btnEditar = event.target.closest('.btn-editar-profesor');
        if (btnEditar) return abrirModalEditar(btnEditar.dataset.id);

        const btnEliminar = event.target.closest('.btn-eliminar-profesor');
        if (btnEliminar) return eliminarProfesor(btnEliminar.dataset.id);

        const btnReactivar = event.target.closest('.btn-reactivar-profesor');
        if (btnReactivar) return activarProfesor(btnReactivar.dataset.id);
    });

    dom.buscadorEditar?.addEventListener('input', mostrarProfesores);
    dom.buscadorEliminar?.addEventListener('input', mostrarProfesores);
    dom.buscadorInactivos?.addEventListener('input', mostrarProfesores);

    if (dom.formularioAgregar) {
        dom.formularioAgregar.addEventListener('submit', async event => {
            event.preventDefault();

            const nombre = document.getElementById('nuevo-nombre')?.value.trim();
            const apellido = document.getElementById('nuevo-apellido')?.value.trim();
            const email = document.getElementById('nuevo-email')?.value.trim();
            const password = document.getElementById('nuevo-password')?.value;

            if (!nombre || !apellido || !email || !password) {
                alert('Completá todos los campos.');
                return;
            }

            const boton = document.getElementById('btn-agregar-profesor');
            if (boton) boton.disabled = true;

            try {
                await crearProfesor({ nombre, apellido, email, password });
                alert('Profesor creado correctamente.');
                dom.formularioAgregar.reset();
                await cargarProfesores();
            } catch (error) {
                console.error('Error creando profesor:', error);
                alert(error.message || 'No se pudo crear el profesor.');
            } finally {
                if (boton) boton.disabled = false;
            }
        });
    }
}

// Exponer funciones necesarias globalmente para llamadas desde el HTML
window.switchTab = switchTab;
window.cerrarModalEditar = cerrarModalEditar;
window.guardarEdicionProfesor = guardarEdicionProfesor;

// Carga inicial
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        inicializarEventos();
        await cargarProfesores();
    });
} else {
    inicializarEventos();
    await cargarProfesores();
}