import { supabase } from './db.js';

// ============================================================
// OBTENER NOTEBOOKS
// ============================================================

export async function getNotebooks() {

    const { data, error } = await supabase
        .from('notebooks')
        .select(`
            id,
            numero_inventario,
            id_caja,
            estado,
            observaciones
        `)
        .order('numero_inventario');

    if (error) {

        console.error(
            'Error al obtener notebooks:',
            error.message
        );
        return [];
    }
    return data;
}



// ============================================================
// OBTENER CAJAS
// ============================================================

export async function getCajas() {

    const { data, error } = await supabase
        .from('cajas')
        .select(`
            id,
            nombre,
            capacidad
        `)
        .order('id');

    if (error) {

        console.error(
            'Error al obtener cajas:',
            error.message
        );

        return [];
    }

    return data;
}
// ============================================================
// OBTENER CURSOS
// ============================================================

export async function getCursos() {

    const { data, error } = await supabase
        .from('cursos')
        .select('id, nombre');

    if (error) {
        console.error(
            'Error al obtener cursos:',
            error.message
        );
        return [];
    }

    return data;
}


// ============================================================
// OBTENER PROFESORES
// ============================================================

export async function getProfesores() {

    const { data, error } = await supabase
        .from('profesores')
        .select('id, nombre, apellido, activo')
        .eq('activo', true);

    if (error) {
        console.error(
            'Error al obtener profesores:',
            error.message
        );
        return [];
    }

    return data;
}

// ============================================================
// ACTUALIZAR ESTADO DE NOTEBOOK
// ============================================================

export async function actualizarEstadoNotebook(
    idNotebook,
    estado
) {

    const { error } = await supabase
        .from('notebooks')
        .update({
            estado: estado
        })
        .eq('id', idNotebook);

    if (error) {

        console.error(
            'Error actualizando estado de notebook:',
            error.message
        );

        return false;
    }

    return true;
}


// ============================================================
// ACTUALIZAR OBSERVACIÓN DE NOTEBOOK
// ============================================================

export async function actualizarObservacionNotebook(
    idNotebook,
    observaciones
) {

    const { error } = await supabase
        .from('notebooks')
        .update({
            observaciones: observaciones
        })
        .eq('id', idNotebook);

    if (error) {

        console.error(
            'Error actualizando observación:',
            error.message
        );

        return false;
    }

    return true;
}

// ============================================================
// OBTENER NOTEBOOKS DISPONIBLES
// ============================================================

export async function getNotebooksDisponibles(
    fecha,
    horaInicio,
    horaFin
) {

    // Buscar reservas que se superponen con el horario elegido.
    const { data: reservas, error: errorReservas } =
        await supabase
            .from('reservas')
            .select('id')
            .eq('fecha', fecha)
            .eq('estado', 'RESERVADA')
            .lt('hora_inicio', horaFin)
            .gt('hora_fin', horaInicio);

    if (errorReservas) {

        console.error(
            'Error buscando reservas:',
            errorReservas.message
        );

        return [];
    }


    // Obtener los IDs de las reservas.

    const idsReservas = reservas.map(
        reserva => reserva.id
    );

    let idsOcupadas = [];


    // Buscar notebooks de esas reservas.

    if (idsReservas.length > 0) {

        const {
            data: notebooksReservadas,
            error
        } = await supabase
            .from('reserva_notebooks')
            .select('id_notebook')
            .in('id_reserva', idsReservas);

        if (error) {

            console.error(
                'Error buscando notebooks reservadas:',
                error.message
            );

            return [];
        }

        idsOcupadas = notebooksReservadas.map(
            notebook => notebook.id_notebook
        );
    }

    // Buscar notebooks disponibles físicamente.
    let query = supabase
        .from('notebooks')
        .select(
            'id, numero_inventario, id_caja, estado'
        )
        .eq('estado', 'DISPONIBLE')
        .order('numero_inventario');


    // Excluir notebooks que ya están ocupadas.

    if (idsOcupadas.length > 0) {

        query = query.not(
            'id',
            'in',
            `(${idsOcupadas.join(',')})`
        );
    }


    const {
        data: disponibles,
        error: errorDisponibles
    } = await query;


    if (errorDisponibles) {

        console.error(
            'Error buscando notebooks disponibles:',
            errorDisponibles.message
        );

        return [];
    }

    return disponibles;
}


// ============================================================
// ELEGIR NOTEBOOKS
// ============================================================

export async function elegirNotebooks(
    fecha,
    horaInicio,
    horaFin,
    cantidadSolicitada
) {

    const notebooksDisponibles =
        await getNotebooksDisponibles(
            fecha,
            horaInicio,
            horaFin
        );


    // Verificar que haya suficientes.

    if (
        notebooksDisponibles.length <
        cantidadSolicitada
    ) {

        throw new Error(
            `Solo hay ${notebooksDisponibles.length} notebooks disponibles.`
        );
    }


    // Obtener cajas.

    const cajas = await getCajas();

    const cajasDisponibles = [];


    // Relacionar notebooks con cajas.

    for (const caja of cajas) {

        const notebooksDeCaja =
            notebooksDisponibles.filter(
                notebook =>
                    notebook.id_caja === caja.id
            );

        cajasDisponibles.push({
            caja: caja,
            notebooks: notebooksDeCaja,
            cantidadDisponibles:
                notebooksDeCaja.length
        });
    }


    // Ordenar cajas de mayor a menor cantidad disponible.

    cajasDisponibles.sort(
        (a, b) =>
            b.cantidadDisponibles -
            a.cantidadDisponibles
    );


    let cantidadRestante = cantidadSolicitada;

    const notebooksSeleccionadas = [];
    const cajasSeleccionadas = [];


    // ========================================================
    // BUSCAR CAJAS COMPLETAS
    // ========================================================

    for (const item of cajasDisponibles) {

        if (cantidadRestante === 0) {
            break;
        }

        if (
            item.cantidadDisponibles ===
            item.caja.capacidad &&

            item.cantidadDisponibles <=
            cantidadRestante
        ) {

            notebooksSeleccionadas.push(
                ...item.notebooks
            );

            cajasSeleccionadas.push({
                caja: item.caja,
                notebooks: item.notebooks
            });

            cantidadRestante -=
                item.notebooks.length;
        }
    }


    // ========================================================
    // COMPLETAR CON CAJA INCOMPLETA
    // ========================================================

    if (cantidadRestante > 0) {

        const cajasIncompletas =
            cajasDisponibles
                .filter(item => {

                    const yaSeleccionada =
                        cajasSeleccionadas.some(
                            seleccionada =>
                                seleccionada.caja.id ===
                                item.caja.id
                        );

                    return (
                        !yaSeleccionada &&
                        item.cantidadDisponibles >=
                        cantidadRestante
                    );
                })
                .sort(
                    (a, b) =>
                        a.cantidadDisponibles -
                        b.cantidadDisponibles
                );


        if (cajasIncompletas.length > 0) {
            const mejorCaja =  cajasIncompletas[0];
            const notebooksAUsar = mejorCaja.notebooks.slice(
                0,
                cantidadRestante
            );
            notebooksSeleccionadas.push( ...notebooksAUsar);
            cajasSeleccionadas.push({ caja: mejorCaja.caja, notebooks: notebooksAUsar});
            cantidadRestante = 0;
        }
    }


    // ========================================================
    // VERIFICAR QUE SE COMPLETÓ
    // ========================================================

    if (cantidadRestante > 0) {

        throw new Error(
            'No se pudieron encontrar las cajas necesarias para completar la reserva.'
        );
    }


    return {
        notebooks: notebooksSeleccionadas,
        cajas: cajasSeleccionadas
    };
}


// ============================================================
// REGISTRAR RESERVA
// ============================================================

export async function registrarReserva({
    fecha,
    horaInicio,
    horaFin,
    idProfesor,
    idCurso,
    cantidad
}) {

    // Primero elegir notebooks.

    const seleccion = await elegirNotebooks(fecha,horaInicio,horaFin,cantidad);

    // ========================================================
    // INSERTAR RESERVA
    // ========================================================
    const {
        data: reserva,
        error: errorReserva
    } = await supabase
        .from('reservas')
        .insert({
            fecha: fecha,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            // Por ahora todas empiezan como RESERVADA.
            estado: 'RESERVADA',
            id_profesor: idProfesor,
            id_curso: idCurso,
            cantidad_notebooks: cantidad
        })
        .select('id')
        .single();
    if (errorReserva) {
        console.error(
            'Error creando reserva:',
            errorReserva.message
        );
        throw new Error(
            'No se pudo crear la reserva.'
        );
    }
    // ========================================================
    // RELACIÓN RESERVA - NOTEBOOK
    // ========================================================
    const registrosNotebooks =
        seleccion.notebooks.map(
            notebook => ({
                id_reserva: reserva.id,
                id_notebook: notebook.id
            })
        );

    const {error: errorNotebooks} = await supabase.from('reserva_notebooks').insert(registrosNotebooks);

    if (errorNotebooks) {
        console.error(
            'Error guardando notebooks:',
            errorNotebooks.message
        );
        throw new Error(
            'No se pudieron guardar las notebooks de la reserva.'
        );
    }

    // ========================================================
    // DEVOLVER RESULTADO
    // ========================================================
    return {
        idReserva: reserva.id,
        notebooks: seleccion.notebooks,
        cajas: seleccion.cajas
    };
}
// ============================================================
// ACTUALIZAR ESTADO DE UNA RESERVA
// ============================================================

export async function actualizarEstadoReserva(
    idReserva,
    estado
) {
    const { error } = await supabase
        .from('reservas')
        .update({
            estado: estado
        })
        .eq('id', idReserva);


    if (error) {

        console.error(
            'Error actualizando estado:',
            error.message
        );

        return false;
    }
    return true;
}
// ============================================================
// OBTENER RESERVAS POR FECHA
// ============================================================

export async function getReservasPorFecha(fecha) {

    // ========================================================
    // OBTENER RESERVAS
    // ========================================================

    const {
        data: reservas,
        error
    } = await supabase
        .from('reservas')
        .select(`
            id,
            fecha,
            hora_inicio,
            hora_fin,
            cantidad_notebooks,
            estado,
            observaciones,

            profesores (
                id,
                nombre,
                apellido
            ),

            cursos (
                id,
                nombre
            )
        `)
        .eq('fecha', fecha)
        .order('hora_inicio', {
            ascending: true
        });


    if (error) {

        console.error(
            'Error obteniendo reservas:',
            error.message
        );

        throw new Error(
            'No se pudieron obtener las reservas.'
        );
    }

    // ========================================================
    // ACTUALIZAR AUTOMÁTICAMENTE LAS RESERVAS VENCIDAS
    // ========================================================

    const ahora = new Date();

    for (const reserva of reservas) {

        if (reserva.estado !== 'RESERVADA') {
            continue;
        }

        // Crear fecha y hora de finalización
        const fechaFin = new Date(
            `${reserva.fecha}T${reserva.hora_fin}`
        );

        // Agregar 15 minutos al horario de finalización
        const limiteDevolucion = new Date(
            fechaFin.getTime() +
            15 * 60 * 1000
        );

        // Si ya pasaron los 15 minutos:
        if (ahora >= limiteDevolucion) {

            console.log(
                `Reserva ${reserva.id} finalizada automáticamente.`
            );
            const { error: errorActualizacion } =
                await supabase
                    .from('reservas')
                    .update({
                        estado: 'DEVUELTA'
                    })
                    .eq('id', reserva.id);


            if (errorActualizacion) {

                console.error(
                    `Error actualizando reserva ${reserva.id}:`,
                    errorActualizacion.message
                );

            } else {

                // Actualizamos también el objeto local para que la tarjeta muestre DEVUELTA
                reserva.estado = 'DEVUELTA';
            }
        }
    }
// Devolver reservas actualizadas
    return reservas;
}
