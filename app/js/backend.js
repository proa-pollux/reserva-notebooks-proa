import { supabase } from './db.js'

export async function getNotebooks() {
    const { data, error } = await supabase
        .from('notebooks')
        .select('numero_inventario, id_caja, estado')

    if (error) {
        console.error('Error al obtener notebooks:', error.message)
        return []
    }
    return data
}

export async function getCajas() {
    const { data, error } = await supabase
        .from('cajas')
        .select('id, nombre, capacidad')

    if (error) {
        console.error('Error al obtener cajas:', error.message)
        return []
    }
    return data
}

export async function getCursos() {
    const { data, error } = await supabase
        .from('cursos')
        .select('id, nombre,')

    if (error) {
        console.error('Error al obtener cursos:', error.message)
        return []
    }
    return data
}

export async function getProfesores() {
    const { data, error } = await supabase
        .from('profesores')
        .select('id, nombre, apellido, activo')

    if (error) {
        console.error('Error al obtener profesores:', error.message)
        return []
    }
    return data
}
