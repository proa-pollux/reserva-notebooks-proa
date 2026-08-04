-- ==========================================
-- Base de datos: Reserva de Notebooks
-- ==========================================

CREATE TABLE profesores (
    id_profesor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    primer_ingreso BOOLEAN DEFAULT TRUE,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL
);

CREATE TABLE cajas (
    id_caja INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    capacidad INT DEFAULT 5
);

CREATE TABLE notebooks (
    id_notebook INT AUTO_INCREMENT PRIMARY KEY,
    numero_inventario INT NOT NULL UNIQUE,
    id_caja INT NOT NULL,
    estado ENUM('DISPONIBLE','REPARACION','BAJA') DEFAULT 'DISPONIBLE',

    FOREIGN KEY (id_caja) REFERENCES cajas(id_caja)
);

CREATE TABLE reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,

    id_profesor INT NOT NULL,
    id_curso INT NOT NULL,

    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,

    cantidad_notebooks INT NOT NULL,

    estado ENUM('RESERVADA','DEVUELTA','CANCELADA')
        DEFAULT 'RESERVADA',

    observaciones TEXT,

    fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion DATETIME NULL,

    FOREIGN KEY (id_profesor) REFERENCES profesores(id_profesor),
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
);

CREATE TABLE reserva_notebooks (
    id_reserva INT NOT NULL,
    id_notebook INT NOT NULL,

    PRIMARY KEY (id_reserva, id_notebook),

    FOREIGN KEY (id_reserva)
        REFERENCES reservas(id_reserva),

    FOREIGN KEY (id_notebook)
        REFERENCES notebooks(id_notebook)
);
