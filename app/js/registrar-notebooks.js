import {
    getCajas,
    crearCaja,
    crearNotebook
} from './backend.js';


// ============================================================
// ELEMENTOS DEL HTML
// ============================================================

const cajaSelect = document.getElementById('cajaSelect');

const btnNuevaCaja =
    document.getElementById('btnNuevaCaja');

const nuevaCajaContainer =
    document.getElementById('nuevaCajaContainer');

const btnCancelarCaja =
    document.getElementById('btnCancelarCaja');

const btnCrearCaja =
    document.getElementById('btnCrearCaja');

const nombreNuevaCaja =
    document.getElementById('nombreNuevaCaja');

const capacidadNuevaCaja =
    document.getElementById('capacidadNuevaCaja');


// ============================================================
// CARGAR CAJAS DESDE SUPABASE
// ============================================================

async function cargarCajas() {

    console.log('1. Iniciando carga de cajas...');

    try {

        const cajas = await getCajas();

        console.log(
            '2. Cajas recibidas desde backend:',
            cajas
        );


        // Limpiar el select

        cajaSelect.innerHTML = `
            <option value="" disabled selected>
                Seleccione una caja
            </option>
        `;


        // Agregar las cajas

        cajas.forEach(caja => {

            console.log(
                '3. Agregando caja:',
                caja
            );


            const option =
                document.createElement('option');


            option.value = caja.id;

            option.textContent =
                `${caja.nombre} (${caja.capacidad} notebooks)`;


            cajaSelect.appendChild(option);

        });


        console.log(
            '4. Cajas cargadas correctamente.'
        );


    } catch (error) {

        console.error(
            'ERROR AL CARGAR LAS CAJAS:',
            error
        );

        alert(
            'No se pudieron cargar las cajas.'
        );
    }
}


// ============================================================
// MOSTRAR FORMULARIO DE NUEVA CAJA
// ============================================================

btnNuevaCaja.addEventListener(
    'click',
    () => {

        console.log(
            'Botón Crear nueva caja presionado.'
        );


        // Mostrar formulario

        nuevaCajaContainer.classList.remove(
            'hidden'
        );


        // Llevar el cursor al nombre

        nombreNuevaCaja.focus();
    }
);


// ============================================================
// CANCELAR CREACIÓN DE CAJA
// ============================================================

btnCancelarCaja.addEventListener(
    'click',
    () => {

        console.log(
            'Creación de caja cancelada.'
        );


        // Ocultar formulario

        nuevaCajaContainer.classList.add(
            'hidden'
        );


        // Limpiar nombre

        nombreNuevaCaja.value = '';


        // Restaurar capacidad

        capacidadNuevaCaja.value = '5';
    }
);


// ============================================================
// CREAR NUEVA CAJA
// ============================================================

btnCrearCaja.addEventListener(
    'click',
    async () => {

        console.log(
            'Botón Crear caja presionado.'
        );


        // Obtener valores

        const nombre =
            nombreNuevaCaja.value.trim();

        const capacidad =
            Number(capacidadNuevaCaja.value);


        // ====================================================
        // VALIDACIONES
        // ====================================================

        if (!nombre) {

            alert(
                'Ingrese un nombre para la caja.'
            );

            nombreNuevaCaja.focus();

            return;
        }


        if (
            !Number.isInteger(capacidad) ||
            capacidad < 1
        ) {

            alert(
                'La capacidad debe ser un número mayor a 0.'
            );

            capacidadNuevaCaja.focus();

            return;
        }


        // ====================================================
        // DESHABILITAR BOTÓN MIENTRAS SE GUARDA
        // ====================================================

        btnCrearCaja.disabled = true;

        btnCrearCaja.textContent =
            'Creando...';


        try {

            console.log(
                'Creando caja:',
                {
                    nombre,
                    capacidad
                }
            );


            // =================================================
            // GUARDAR EN SUPABASE
            // =================================================

            const nuevaCaja =
                await crearCaja(
                    nombre,
                    capacidad
                );


            console.log(
                'Caja creada correctamente:',
                nuevaCaja
            );


            // =================================================
            // ACTUALIZAR DESPLEGABLE
            // =================================================

            await cargarCajas();


            // =================================================
            // SELECCIONAR AUTOMÁTICAMENTE LA NUEVA CAJA
            // =================================================

            cajaSelect.value =
                nuevaCaja.id;


            // =================================================
            // OCULTAR FORMULARIO
            // =================================================

            nuevaCajaContainer.classList.add(
                'hidden'
            );


            // =================================================
            // LIMPIAR FORMULARIO
            // =================================================

            nombreNuevaCaja.value = '';

            capacidadNuevaCaja.value = '5';


            // =================================================
            // MENSAJE
            // =================================================

            alert(
                `La caja "${nuevaCaja.nombre}" fue creada correctamente.`
            );


        } catch (error) {

            console.error(
                'ERROR AL CREAR LA CAJA:',
                error
            );


            alert(
                'No se pudo crear la caja. Revise la consola para más información.'
            );


        } finally {

            // =================================================
            // RESTAURAR BOTÓN
            // =================================================

            btnCrearCaja.disabled = false;

            btnCrearCaja.textContent =
                'Crear caja';
        }
    }
);


// ============================================================
// INICIAR PÁGINA
// ============================================================

cargarCajas();

// ============================================================
// GUARDAR NUEVA NOTEBOOK
// ============================================================

const formNuevaNotebook =
    document.getElementById('formNuevaNotebook');

const numeroInventario =
    document.getElementById('numeroInventario');

const estadoSelect =
    document.getElementById('estadoSelect');

const btnGuardarNotebook =
    document.getElementById('btnGuardarNotebook');


formNuevaNotebook.addEventListener(
    'submit',
    async (event) => {

        // Evitar que el formulario recargue la página
        event.preventDefault();


        // ====================================================
        // OBTENER DATOS
        // ====================================================

        const numero =
            Number(numeroInventario.value);

        const idCaja =
            cajaSelect.value;

        const estado =
            estadoSelect.value;


        console.log(
            'Datos de la notebook:',
            {
                numero,
                idCaja,
                estado
            }
        );


        // ====================================================
        // VALIDAR NÚMERO DE INVENTARIO
        // ====================================================

        if (
            !Number.isInteger(numero) ||
            numero < 1
        ) {

            alert(
                'Ingrese un número de inventario válido.'
            );

            numeroInventario.focus();

            return;
        }


        // ====================================================
        // VALIDAR CAJA
        // ====================================================

        if (!idCaja) {

            alert(
                'Seleccione una caja.'
            );

            cajaSelect.focus();

            return;
        }


        // ====================================================
        // VALIDAR ESTADO
        // ====================================================

        if (!estado) {

            alert(
                'Seleccione el estado inicial de la notebook.'
            );

            estadoSelect.focus();

            return;
        }


        // ====================================================
        // DESHABILITAR BOTÓN
        // ====================================================

        btnGuardarNotebook.disabled = true;

        btnGuardarNotebook.innerHTML = `
            <span class="material-symbols-outlined">
                progress_activity
            </span>
            Guardando...
        `;


        try {

            // =================================================
            // CREAR NOTEBOOK EN SUPABASE
            // =================================================

            const notebook =
                await crearNotebook(
                    numero,
                    Number(idCaja),
                    estado
                );


            console.log(
                'Notebook creada correctamente:',
                notebook
            );


            // =================================================
            // MENSAJE DE ÉXITO
            // =================================================

            alert(
                `La notebook ${notebook.numero_inventario} fue registrada correctamente.`
            );


            // =================================================
            // LIMPIAR FORMULARIO
            // =================================================

            numeroInventario.value = '';

            cajaSelect.value = '';

            estadoSelect.value = '';


            // Volver al campo número de inventario

            numeroInventario.focus();


        } catch (error) {

            console.error(
                'ERROR AL GUARDAR NOTEBOOK:',
                error
            );


            // =================================================
            // ERROR DE NOTEBOOK REPETIDA
            // =================================================

            if (
                error.code === '23505'
            ) {

                alert(
                    'Ya existe una notebook con ese número de inventario.'
                );

            } else {

                alert(
                    'No se pudo guardar la notebook. Revise la consola para más información.'
                );
            }


        } finally {

            // =================================================
            // RESTAURAR BOTÓN
            // =================================================

            btnGuardarNotebook.disabled = false;

            btnGuardarNotebook.innerHTML = `
                <span class="material-symbols-outlined">
                    save
                </span>
                Guardar Notebook
            `;
        }
    }
);