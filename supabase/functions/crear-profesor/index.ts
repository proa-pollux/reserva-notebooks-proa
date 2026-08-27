import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceRoleKey
);


// ============================================================
// CORS
// ============================================================

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods":
        "POST, OPTIONS"
};


// ============================================================
// RESPUESTA JSON
// ============================================================

function respuestaJSON(
    datos: unknown,
    status = 200
) {
    return new Response(
        JSON.stringify(datos),
        {
            status,
            headers: {
                ...corsHeaders,
                "Content-Type":
                    "application/json"
            }
        }
    );
}


// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

Deno.serve(async (req) => {

    // ========================================================
    // CORS
    // ========================================================

    if (req.method === "OPTIONS") {

        return new Response(
            "ok",
            {
                headers: corsHeaders
            }
        );
    }


    // ========================================================
    // VERIFICAR MÉTODO
    // ========================================================

    if (req.method !== "POST") {

        return respuestaJSON(
            {
                error:
                    "Método no permitido."
            },
            405
        );
    }


    try {

        // ====================================================
        // LEER BODY
        // ====================================================

        const body = await req.json();

        console.log(
            "BODY RECIBIDO:",
            body
        );


        // ====================================================
        // OBTENER DATOS
        // ====================================================

        const accion =
            typeof body?.accion === "string"
                ? body.accion
                : "crear";

        const nombre =
            typeof body?.nombre === "string"
                ? body.nombre.trim()
                : "";

        const apellido =
            typeof body?.apellido === "string"
                ? body.apellido.trim()
                : "";

        const email =
            typeof body?.email === "string"
                ? body.email.trim()
                : "";

        const password =
            typeof body?.password === "string"
                ? body.password
                : "";

        const idProfesor =
            body?.idProfesor;


        console.log(
            "ACCIÓN RECIBIDA:",
            accion
        );


        // ====================================================
        // ====================================================
        // CREAR PROFESOR
        // ====================================================
        // ====================================================

        if (accion === "crear") {

            console.log(
                "ACCIÓN: CREAR"
            );


            // ------------------------------------------------
            // VALIDAR DATOS
            // ------------------------------------------------

            if (
                !nombre ||
                !apellido ||
                !email ||
                !password
            ) {

                return respuestaJSON(
                    {
                        error:
                            "Nombre, apellido, email y contraseña son obligatorios."
                    },
                    400
                );
            }


            // ------------------------------------------------
            // CREAR USUARIO AUTH
            // ------------------------------------------------

            const {
                data: usuario,
                error: errorAuth
            } =
                await supabaseAdmin
                    .auth
                    .admin
                    .createUser({

                        email,

                        password,

                        email_confirm:
                            true,

                        user_metadata: {

                            nombre,

                            apellido,

                            rol:
                                "profesor"
                        }
                    });


            if (errorAuth) {

                console.error(
                    "Error creando usuario:",
                    errorAuth
                );

                return respuestaJSON(
                    {
                        error:
                            errorAuth.message
                    },
                    400
                );
            }


            // ------------------------------------------------
            // VERIFICAR USUARIO
            // ------------------------------------------------

            if (!usuario.user) {

                return respuestaJSON(
                    {
                        error:
                            "No se pudo obtener el usuario creado."
                    },
                    500
                );
            }


            // ------------------------------------------------
            // CREAR PROFESOR
            // ------------------------------------------------

            const {
                data: profesor,
                error: errorProfesor
            } =
                await supabaseAdmin
                    .from("profesores")
                    .insert({

                        nombre,

                        apellido,

                        activo:
                            true,

                        id_usuario:
                            usuario.user.id
                    })
                    .select(
                        "id, nombre, apellido, activo, id_usuario"
                    )
                    .single();


            // ------------------------------------------------
            // SI FALLA LA CREACIÓN
            // ------------------------------------------------

            if (errorProfesor) {

                console.error(
                    "Error creando profesor:",
                    errorProfesor
                );


                await supabaseAdmin
                    .auth
                    .admin
                    .deleteUser(
                        usuario.user.id
                    );


                return respuestaJSON(
                    {
                        error:
                            errorProfesor.message,

                        details:
                            errorProfesor.details,

                        hint:
                            errorProfesor.hint,

                        code:
                            errorProfesor.code
                    },
                    500
                );
            }


            // ------------------------------------------------
            // RESPUESTA
            // ------------------------------------------------

            return respuestaJSON({

                success:
                    true,

                mensaje:
                    "Profesor creado correctamente.",

                usuario:
                    usuario.user,

                profesor
            });
        }


        // ====================================================
        // ====================================================
        // EDITAR PROFESOR
        // ====================================================
        // ====================================================

        if (accion === "editar") {

            console.log(
                "ACCIÓN: EDITAR"
            );


            // ------------------------------------------------
            // VALIDAR
            // ------------------------------------------------

            if (
                !idProfesor ||
                !nombre ||
                !apellido
            ) {

                return respuestaJSON(
                    {
                        error:
                            "ID, nombre y apellido son obligatorios."
                    },
                    400
                );
            }


            // ------------------------------------------------
            // BUSCAR PROFESOR
            // ------------------------------------------------

            const {
                data: profesor,
                error: errorProfesor
            } =
                await supabaseAdmin
                    .from("profesores")
                    .select(
                        "id, nombre, apellido, activo, id_usuario"
                    )
                    .eq(
                        "id",
                        idProfesor
                    )
                    .single();


            if (errorProfesor) {

                console.error(
                    "Error buscando profesor:",
                    errorProfesor
                );

                return respuestaJSON(
                    {
                        error:
                            "No se pudo encontrar el profesor.",

                        details:
                            errorProfesor.message,

                        code:
                            errorProfesor.code
                    },
                    404
                );
            }


            // ------------------------------------------------
            // VERIFICAR AUTH
            // ------------------------------------------------

            if (!profesor.id_usuario) {

                return respuestaJSON(
                    {
                        error:
                            "El profesor no tiene un usuario de Auth asociado."
                    },
                    400
                );
            }


            // ------------------------------------------------
            // ACTUALIZAR TABLA PROFESORES
            // ------------------------------------------------

            const {
                data: profesorActualizado,
                error: errorActualizacion
            } =
                await supabaseAdmin
                    .from("profesores")
                    .update({

                        nombre,

                        apellido

                    })
                    .eq(
                        "id",
                        idProfesor
                    )
                    .select(
                        "id, nombre, apellido, activo, id_usuario"
                    )
                    .single();


            if (errorActualizacion) {

                console.error(
                    "Error actualizando profesor:",
                    errorActualizacion
                );

                return respuestaJSON(
                    {
                        error:
                            "No se pudo actualizar el profesor.",

                        details:
                            errorActualizacion.message,

                        code:
                            errorActualizacion.code
                    },
                    500
                );
            }


            // ------------------------------------------------
            // DATOS AUTH
            // ------------------------------------------------

            const datosAuth: {
                user_metadata: {
                    nombre: string;
                    apellido: string;
                    rol: string;
                };
                password?: string;
            } = {

                user_metadata: {

                    nombre,

                    apellido,

                    rol:
                        "profesor"
                }
            };


            if (
                password.trim() !== ""
            ) {

                datosAuth.password =
                    password;
            }


            // ------------------------------------------------
            // ACTUALIZAR AUTH
            // ------------------------------------------------

            const {
                data: usuarioActualizado,
                error: errorAuth
            } =
                await supabaseAdmin
                    .auth
                    .admin
                    .updateUserById(
                        profesor.id_usuario,
                        datosAuth
                    );


            if (errorAuth) {

                console.error(
                    "Error actualizando Auth:",
                    errorAuth
                );


                // Revertir cambios

                await supabaseAdmin
                    .from("profesores")
                    .update({

                        nombre:
                            profesor.nombre,

                        apellido:
                            profesor.apellido

                    })
                    .eq(
                        "id",
                        idProfesor
                    );


                return respuestaJSON(
                    {
                        error:
                            "No se pudo actualizar el usuario de Auth.",

                        details:
                            errorAuth.message
                    },
                    500
                );
            }


            return respuestaJSON({

                success:
                    true,

                mensaje:
                    "Profesor actualizado correctamente.",

                profesor:
                    profesorActualizado,

                usuario:
                    usuarioActualizado.user
            });
        }


        // ====================================================
        // ====================================================
        // DAR DE BAJA PROFESOR
        // ====================================================
        // ====================================================

        if (accion === "baja") {

            console.log(
                "ACCIÓN: BAJA"
            );


            // ------------------------------------------------
            // VALIDAR ID
            // ------------------------------------------------

            if (!idProfesor) {

                return respuestaJSON(
                    {
                        error:
                            "El ID del profesor es obligatorio."
                    },
                    400
                );
            }


            // ------------------------------------------------
            // BUSCAR PROFESOR
            // ------------------------------------------------

            const {
                data: profesor,
                error: errorProfesor
            } =
                await supabaseAdmin
                    .from("profesores")
                    .select(
                        "id, nombre, apellido, activo, id_usuario"
                    )
                    .eq(
                        "id",
                        idProfesor
                    )
                    .single();


            if (errorProfesor) {

                console.error(
                    "Error buscando profesor:",
                    errorProfesor
                );

                return respuestaJSON(
                    {
                        error:
                            "No se pudo encontrar el profesor.",

                        details:
                            errorProfesor.message,

                        code:
                            errorProfesor.code
                    },
                    404
                );
            }


            // ------------------------------------------------
            // VERIFICAR AUTH
            // ------------------------------------------------

            if (!profesor.id_usuario) {

                return respuestaJSON(
                    {
                        error:
                            "El profesor no tiene un usuario de Auth asociado."
                    },
                    400
                );
            }


            // ------------------------------------------------
            // DESACTIVAR PROFESOR
            // ------------------------------------------------

            const {
                data: profesorActualizado,
                error: errorActualizacion
            } =
                await supabaseAdmin
                    .from("profesores")
                    .update({

                        activo:
                            false

                    })
                    .eq(
                        "id",
                        idProfesor
                    )
                    .select(
                        "id, nombre, apellido, activo, id_usuario"
                    )
                    .single();


            if (errorActualizacion) {

                console.error(
                    "Error dando de baja profesor:",
                    errorActualizacion
                );

                return respuestaJSON(
                    {
                        error:
                            "No se pudo dar de baja al profesor.",

                        details:
                            errorActualizacion.message,

                        code:
                            errorActualizacion.code
                    },
                    500
                );
            }


            // ------------------------------------------------
            // BLOQUEAR AUTH
            // ------------------------------------------------

            const {
                error: errorBan
            } =
                await supabaseAdmin
                    .auth
                    .admin
                    .updateUserById(
                        profesor.id_usuario,
                        {
                            ban_duration:
                                "876000h"
                        }
                    );


            if (errorBan) {

                console.error(
                    "Error aplicando bloqueo:",
                    errorBan
                );


                // Revertir

                await supabaseAdmin
                    .from("profesores")
                    .update({

                        activo:
                            true

                    })
                    .eq(
                        "id",
                        idProfesor
                    );


                return respuestaJSON(
                    {
                        error:
                            "No se pudo bloquear el usuario de Auth.",

                        details:
                            errorBan.message
                    },
                    500
                );
            }


            return respuestaJSON({

                success:
                    true,

                mensaje:
                    "Profesor dado de baja correctamente.",

                profesor:
                    profesorActualizado
            });
        }


        // ====================================================
        // ====================================================
        // REACTIVAR PROFESOR
        // ====================================================
        // ====================================================

        if (accion === "reactivar") {

            console.log(
                "ACCIÓN: REACTIVAR"
            );


            // ------------------------------------------------
            // VALIDAR ID
            // ------------------------------------------------

            if (!idProfesor) {

                return respuestaJSON(
                    {
                        error:
                            "El ID del profesor es obligatorio."
                    },
                    400
                );
            }


            // ------------------------------------------------
            // BUSCAR PROFESOR
            // ------------------------------------------------

            const {
                data: profesor,
                error: errorProfesor
            } =
                await supabaseAdmin
                    .from("profesores")
                    .select(
                        "id, nombre, apellido, activo, id_usuario"
                    )
                    .eq(
                        "id",
                        idProfesor
                    )
                    .single();


            if (errorProfesor) {

                console.error(
                    "Error buscando profesor:",
                    errorProfesor
                );

                return respuestaJSON(
                    {
                        error:
                            "No se pudo encontrar el profesor.",

                        details:
                            errorProfesor.message,

                        code:
                            errorProfesor.code
                    },
                    404
                );
            }


            // ------------------------------------------------
            // VERIFICAR AUTH
            // ------------------------------------------------

            if (!profesor.id_usuario) {

                return respuestaJSON(
                    {
                        error:
                            "El profesor no tiene un usuario de Auth asociado."
                    },
                    400
                );
            }


            // ------------------------------------------------
            // REACTIVAR PROFESOR
            // ------------------------------------------------

            const {
                data: profesorActualizado,
                error: errorActualizacion
            } =
                await supabaseAdmin
                    .from("profesores")
                    .update({

                        activo:
                            true

                    })
                    .eq(
                        "id",
                        idProfesor
                    )
                    .select(
                        "id, nombre, apellido, activo, id_usuario"
                    )
                    .single();


            if (errorActualizacion) {

                console.error(
                    "Error reactivando profesor:",
                    errorActualizacion
                );

                return respuestaJSON(
                    {
                        error:
                            "No se pudo reactivar al profesor.",

                        details:
                            errorActualizacion.message,

                        code:
                            errorActualizacion.code
                    },
                    500
                );
            }


            // ------------------------------------------------
            // DESBLOQUEAR AUTH
            // ------------------------------------------------

            const {
                error: errorDesban
            } =
                await supabaseAdmin
                    .auth
                    .admin
                    .updateUserById(
                        profesor.id_usuario,
                        {
                            ban_duration:
                                "none"
                        }
                    );


            if (errorDesban) {

                console.error(
                    "Error desbloqueando Auth:",
                    errorDesban
                );


                // Revertir

                await supabaseAdmin
                    .from("profesores")
                    .update({

                        activo:
                            false

                    })
                    .eq(
                        "id",
                        idProfesor
                    );


                return respuestaJSON(
                    {
                        error:
                            "No se pudo desbloquear el usuario de Auth.",

                        details:
                            errorDesban.message
                    },
                    500
                );
            }


            return respuestaJSON({

                success:
                    true,

                mensaje:
                    "Profesor reactivado correctamente.",

                profesor:
                    profesorActualizado
            });
        }


        // ====================================================
        // ACCIÓN DESCONOCIDA
        // ====================================================

        return respuestaJSON(
            {
                error:
                    `Acción no válida: ${accion}`
            },
            400
        );


    } catch (error) {

        console.error(
            "ERROR COMPLETO:",
            error
        );


        return respuestaJSON(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : String(error)
            },
            500
        );
    }

});