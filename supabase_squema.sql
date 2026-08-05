-- ==========================================
-- Base de datos: Reserva de Notebooks
-- ==========================================

CREATE TABLE profesores (
    id UUID not null primary KEY REFERENCES auth.users on delete cascade,
    nombre text NOT NULL,
    apellido text NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE cursos (
    id_curso INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL
);

CREATE TABLE cajas (
    id_caja INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    capacidad INT DEFAULT 5
);

CREATE TYPE estado_notebook AS ENUM ('DISPONIBLE', 'REPARACION', 'BAJA');

CREATE TABLE notebooks (
    id_notebook INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_inventario INT NOT NULL UNIQUE,
    id_caja INT NOT NULL,
    estado estado_notebook DEFAULT 'DISPONIBLE',
    
    FOREIGN KEY (id_caja) REFERENCES cajas(id_caja)
);

CREATE TYPE estado_reserva AS ENUM ('RESERVADA', 'DEVUELTA', 'CANCELADA');

CREATE TABLE reservas (
    id_reserva INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    id_profesor UUID NOT NULL,
    id_curso INT NOT NULL,

    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,

    cantidad_notebooks INT NOT NULL,

    estado estado_reserva DEFAULT 'RESERVADA',

    observaciones TEXT,

    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion TIMESTAMP NULL,

    FOREIGN KEY (id_profesor) REFERENCES profesores(id),
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
);

CREATE TABLE reserva_notebooks (
    id_reserva INT NOT NULL,
    id_notebook INT NOT NULL,

    PRIMARY KEY (id_reserva, id_notebook),

    FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva),
    FOREIGN KEY (id_notebook) REFERENCES notebooks(id_notebook)
);
