## Requerimientos

- Autenticación mediante supabase para los profesores
- Base de datos para los profesores
- Base de datos con stock completo(todas las notebooks que estén en funcionamiento, cargadores y zapatillas)

## Funcionalidades

1. Reservar
2. Elegir el día
3. Elegir cantidad de notebooks
4. Elegir curso
5. Elegir horario
6. Marcar como devuelta
7. Observaciones
8. Cancelar reserva
9. Ver reservas del día que quieras(máximo 1 mes atrás)

## Historias de usuario - Profesor
1. Como profesor, quiero reservar notebooks para mi clase para poder utilizarlas durante el horario de la materia.
2. Como profesor, quiero seleccionar el día de la reserva para organizar el uso de las notebooks.
3. Como profesor, quiero indicar la cantidad de notebooks que necesito para que se reserven las suficientes.
4. Como profesor, quiero seleccionar el curso que utilizará las notebooks para identificar la reserva.
5. Como profesor, quiero elegir el horario de la reserva para evitar conflictos con otras reservas.
6. Como profesor, quiero marcar las notebooks como devueltas para informar que ya fueron entregadas.
7. Como profesor, quiero agregar observaciones a la reserva para comunicar información importante (por ejemplo, si una notebook presenta una falla).
8. Como profesor, quiero cancelar una reserva cuando ya no la necesite para que otro profesor pueda utilizar las notebooks.
9. Como profesor, quiero consultar las reservas de cualquier día de hasta un mes atrás para revisar el historial de uso.

## Historias de usuario - Directivo
1. Como directivo, quiero consultar las reservas de cualquier día de hasta un mes atrás para controlar el uso de las notebooks.

## Usuarios que usan la app
- Profesores y directivos

### Aclaraciones

Dependiendo de la cantidad de notebooks que se soliciten hay que revisarlo ya que hay cajas que están incompletas, y en caso que la cantidad solicitada sea != a 5 o 0 la opción mas conveniente es que le de una caja que no este llena para completar y que no sobren ni falten computadoras

