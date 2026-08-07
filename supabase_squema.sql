-- ==========================================
-- Base de datos: Reserva de Notebooks CORREGIDO
-- ==========================================

-- SE BORRA CUALQUIER DATO EXISTENTE ANTES DE EMPEZAR CON LAS TABLAS Y LOS DATOS.
DROP TABLE IF EXISTS reserva_notebooks CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS notebooks CASCADE;
DROP TABLE IF EXISTS cajas CASCADE;
DROP TABLE IF EXISTS cursos CASCADE;
DROP TABLE IF EXISTS profesores CASCADE;

DROP TYPE IF EXISTS estado_notebook;
DROP TYPE IF EXISTS estado_reserva;

--CREACIÓN TABLA PROFESORES CON UUID
CREATE TABLE profesores (
  id UUID primary key references auth.users(id) on delete cascade,
  nombre text not null,
  apellido text not null,
  activo boolean default true
);

--CREACIÓN TABLA CURSOS
CREATE TABLE cursos (
  id INT generated always as identity primary key,
  nombre VARCHAR(5) not null
);

--CREACIÓN TABLA CAJAS
CREATE TABLE cajas (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    capacidad INT DEFAULT 5
);

CREATE TYPE estado_notebook AS ENUM ('DISPONIBLE', 'REPARACION', 'BAJA');

--CREACIÓN TABLA NOTEBOOKS
CREATE TABLE notebooks (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_inventario INT NOT NULL UNIQUE,
    id_caja INT NOT NULL,
    estado estado_notebook DEFAULT 'DISPONIBLE',
    
    FOREIGN KEY (id_caja) REFERENCES cajas(id)
);

CREATE TYPE estado_reserva AS ENUM ('RESERVADA', 'DEVUELTA', 'CANCELADA');

--CREACIÓN TABLA RESERVAS
CREATE TABLE reservas (
  id INT generated always as identity primary key,
  id_profesor UUID not null,
  id_curso INT not null,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,

  cantidad_notebooks INT NOT NULL,
  estado estado_reserva DEFAULT 'RESERVADA',
  observaciones TEXT,

  fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  fecha_devolucion TIMESTAMP NULL,
  foreign key (id_profesor) references profesores(id),
  foreign key (id_curso) references cursos(id)
);

--CREACIÓN TABLA RESERVA_NOTEBOOKS
CREATE TABLE reserva_notebooks (
    id_reserva INT NOT NULL,
    id_notebook INT NOT NULL,

    PRIMARY KEY (id_reserva, id_notebook),

    FOREIGN KEY (id_reserva) REFERENCES reservas(id),
    FOREIGN KEY (id_notebook) REFERENCES notebooks(id)
);
