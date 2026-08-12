import { getProfesores } from './backend.js';

// Seleccionamos el elemento del HTML por su ID
const profesorSelect = document.getElementById('profesorSelect'); // Concepto: Selector 

async function cargarProfesores() { // Concepto: Asincronía 
    // Llamamos a la función de backend que conecta con Supabase
    const profesores = await getProfesores(); 

    // Limpiamos el select y añadimos una opción inicial
    profesorSelect.innerHTML = '<option value="">-- Seleccione un profesor --</option>'; // Concepto: Manipulación DOM 

    // Recorremos el arreglo de profesores
    profesores.forEach(profe => { // Concepto: Iteración/Array 
        const opcion = document.createElement('option'); // Creamos un nuevo nodo/elemento 
        opcion.value = profe.id; // El ID (UUID) que usará Supabase como clave foránea 
        opcion.innerText = `${profe.nombre} ${profe.apellido}`; // Concepto: Template String 
        // Lo inyectamos en el documento para hacerlo visible
        profesorSelect.appendChild(opcion); 
    });
}

// Ejecutar cuando la página termine de cargar
window.onload = cargarProfesores; // Concepto: Eventos de Ventana
