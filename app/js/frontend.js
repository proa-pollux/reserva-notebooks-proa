import { getProfesores } from './backend.js';
import { getCursos } from './backend.js'; 

// Seleccionamos el elemento del HTML por su ID
const profesorSelect = document.getElementById('profesorSelect'); 

async function cargarProfesores() {
    // Llamamos a la función de backend que conecta con Supabase
    const profesores = await getProfesores(); 

    profesorSelect.innerHTML = '<option value="">-- Seleccione un profesor --</option>'; 

    // Recorremos el arreglo de profesores
    profesores.forEach(profe => { // Iteración/Array 
        const opcion = document.createElement('option'); // Creamos un nuevo nodo/elemento 
        opcion.value = profe.id; // El ID (UUID) que usará Supabase como clave foránea 
        opcion.innerText = `${profe.nombre} ${profe.apellido}`; 
        // Lo inyectamos en el documento para hacerlo visible
        profesorSelect.appendChild(opcion); 
    });
}

async function cargarCursos() {
    const cursosContainer = document.getElementById('cursosContainer');
    const cursos = await getCursos(); 

    cursosContainer.innerHTML = ''; 

    // Usamos 'curso' en singular para referirnos a un solo elemento
    cursos.forEach(curso => { 
        const wrapper = document.createElement('div');
        wrapper.classList.add('curso-option'); 

        wrapper.innerHTML = `
            <input type="button" 
                   name="curso_seleccionado" 
                   id="curso-${curso.id}" 
                   class="hidden-radio">
            <label for="curso-${curso.id}" 
                   class="btn-estilizado curso-btn bg-surface-container-lowest border border-outline-variant text-on-surface-variant rounded-lg py-3 flex items-center justify-center font-title-lg text-title-lg transition-colors active:scale-95 cursor-pointer">
                ${curso.nombre}º
            </label>
        `;

        // SELECCIÓN DINÁMICA
        const label = wrapper.querySelector('label');
        
        label.onclick = () => {
            document.querySelectorAll('.curso-btn').forEach(l => {
                l.classList.remove('bg-primary', 'text-on-primary', 'activa'); // Clases de ejemplo para resaltar
                l.classList.add('bg-surface-container-lowest', 'text-on-surface-variant'); // Clases originales
            });

            label.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant');
            label.classList.add('bg-primary', 'text-on-primary', 'activa');
            
            console.log("Curso seleccionado ID:", curso.id);
        };

        cursosContainer.appendChild(wrapper);
    });
}

// Asegurarnos de que se ejecute al cargar la página
window.addEventListener('load', () => {
    cargarCursos();
});

// Se ejecuta al cargar la ventana para llenar el select de profesores
window.onload = cargarProfesores; // Concepto: Eventos de Ventana
