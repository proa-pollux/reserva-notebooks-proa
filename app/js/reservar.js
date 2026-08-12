const botonesCurso = document.querySelectorAll('.curso-btn');

const btnRestar = document.getElementById('btn-restar');
const btnSumar = document.getElementById('btn-sumar');
const cantidadNotebooks = document.getElementById('cantidad-notebooks');

let cantidad = 25;

btnSumar.addEventListener('click', () => {
    cantidad++;
    cantidadNotebooks.textContent = cantidad;
});

btnRestar.addEventListener('click', () => {
    if (cantidad > 1) {
        cantidad--;
        cantidadNotebooks.textContent = cantidad;
    }
});

botonesCurso.forEach(boton => {
    boton.addEventListener('click', () => {

        // Quitar el estado activo de todos
        botonesCurso.forEach(btn => {
            btn.classList.remove(
                'bg-primary-container',
                'text-on-primary-container',
                'border-transparent',
                'shadow-sm',
                'ring-2',
                'ring-primary-container',
                'ring-offset-1',
                'ring-offset-background'
            );

            btn.classList.add(
                'bg-surface-container-lowest',
                'border-outline-variant',
                'text-on-surface-variant'
            );
        });

        // Activar el botón seleccionado
        boton.classList.remove(
            'bg-surface-container-lowest',
            'border-outline-variant',
            'text-on-surface-variant'
        );

        boton.classList.add(
            'bg-primary-container',
            'text-on-primary-container',
            'border-transparent',
            'shadow-sm',
            'ring-2',
            'ring-primary-container',
            'ring-offset-1',
            'ring-offset-background'
        );

        // Curso seleccionado
        const cursoSeleccionado = boton.dataset.curso;

        console.log('Curso seleccionado:', cursoSeleccionado);
    });
});

