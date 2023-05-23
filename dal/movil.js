const cnx = require('../common/appsettings')
const fs = require('fs');
let pool = cnx.pool;


const getusuario = async (request, response) => {
    let queryUsuario = await pool.query('select n_idseg_userprofile n_ID_Usuario,c_username c_Usuario,c_nombre1 c_Nombre1,coalesce(c_nombre2,\'\') c_Nombre2,c_appaterno c_ApPaterno,c_apmaterno c_ApMaterno,c_nombre1||	\' \'||c_appaterno||\' \'||c_apmaterno c_NombreCompleto,c_clave c_PasswordMovil from seg_userprofile where n_borrado = 0');
   
    response.status(200).json({
        usuarios: queryUsuario.rows,
    })

}

module.exports = {
    getusuario
}