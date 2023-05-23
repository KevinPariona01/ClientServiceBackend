const jwt = require('jsonwebtoken')
const encriptar = require('../common/encriptar')
const cnx = require('../common/appsettings')
const valida = require('../common/validatoken');
const { request, response } = require('express');
let pool = cnx.pool;

const login = (request, response) => {
    request.body.c_clave = encriptar.encriptarlogin(request.body.c_clave);
    pool.query('Select n_idseg_userprofile, c_username, c_nombre1,c_nombre2, c_appaterno, c_apmaterno, b_activo from seg_userprofile where n_borrado = 0 and c_username = $1 and c_clave = $2',
        [request.body.c_username, request.body.c_clave], (error, results) => {
            if (error) {
                response.status(200).json({ estado: false, mensaje: "error: usuario o contraseña inválidos!.", data: null })
            } else {
                if (results.rowCount > 0) {
                    if(results.rows[0].b_activo){
                        var tokenData = {
                            username: request.body.c_username
                        }
                        var token = jwt.sign(tokenData, 'Secret Password', {
                            expiresIn: 60 * 60 * 4 // expires in 4 hours
                        })
                        response.status(200).json({ estado: true, mensaje: "", data: results.rows[0], token: token })
                    }else{
                        response.status(200).json({ estado: false, mensaje: "DB: Usuario no Activo", data: null })
                    }
                    
                } else {
                    response.status(200).json({ estado: false, mensaje: "DB:usuario o contraseña inválidos!.", data: null })
                }
            }
        })
}

const get = (request, response) => {
    var obj = valida.validaToken(request)    
    if (obj.estado) {
        let cadena = 'Select u.n_idseg_userprofile, u.c_username, u.c_nombre1, u.c_nombre2, u.c_appaterno, u.c_apmaterno, u.c_dni, u.b_activo,r.n_idseg_rol, r.c_nombre, u.c_clave, u.n_id_usermodi from seg_userprofile as u  \n\r' +
            'left join seg_rol r on r.n_idseg_rol = u.n_idseg_rol and r.n_borrado = 0  \n\r' +            
            'where u.n_borrado = 0 and (u.n_idseg_rol = $1 or 0 = $1)\n\r ' +
            'order by r.c_nombre asc'
        pool.query(cadena,
            [request.body.n_idseg_rol],
            (error, results) => {
                if (error) {
                    response.status(200).json({ estado: false, mensaje: "DB: error1!.", data: null })    
                } else {
                    response.status(200).json({ estado: true, mensaje: "", data: results.rows })
                }
            })
    } else {
        response.status(200).json(obj)
    }
}
const getUserSinAsignacion = (request, response) => {
    var obj = valida.validaToken(request)    
    if (obj.estado) {
        let cadena = 'Select u.n_idseg_userprofile, u.c_username, u.c_nombre1, u.c_nombre2, u.c_appaterno, u.c_apmaterno, u.c_dni, u.b_activo,r.n_idseg_rol, r.c_nombre, u.c_clave, u.n_id_usermodi from seg_userprofile as u  \n\r' +
            'left join seg_rol r on r.n_idseg_rol = u.n_idseg_rol and r.n_borrado = 0  \n\r' +            
            'where u.n_borrado = 0 and (u.n_idseg_rol = $1 or 0 = $1) \n\r' +
            'order by r.c_nombre asc'
        pool.query(cadena,
            [request.body.n_idseg_rol],
            (error, results) => {
                if (error) {
                    console.log(error);
                    response.status(200).json({ estado: false, mensaje: "DB: error1!.", data: null })    
                } else {
                    response.status(200).json({ estado: true, mensaje: "", data: results.rows })
                }
            })
    } else {
        response.status(200).json(obj)
    }
}

const validarDatos = (request, response) => {
    var obj = valida.validaToken(request)    
    if(obj.estado){
        let cadena ='select c_username, c_dni from seg_userprofile where n_borrado = 0 ';

        pool.query(cadena,
            (error, results) => {
                if (error) {
                    console.log(error);
                    response.status(200).json({ estado: false, mensaje: "DB: error.", data: null })
                } else {
                    response.status(200).json({ estado: true, mensaje: "ERROR AL TRAER DATOS DE VAL...", data: results.rows })
                }
            })
    }else{
        response.status(200).json(obj)
    }    
}

const saveUser = (request, response) => {
    var obj = valida.validaToken(request)
    if (obj.estado) {

        let c_username = request.body.c_username;
        let c_clave = encriptar.encriptarlogin(request.body.c_clave);
        let c_nombre1 = request.body.c_nombre1;
        let c_nombre2 = request.body.c_nombre2;
        let c_appaterno = request.body.c_appaterno;
        let c_apmaterno = request.body.c_apmaterno;
        let c_dni = request.body.c_dni;
        let n_idseg_userprofile = request.body.n_idseg_userprofile;
        let n_idseg_rol = request.body.n_idseg_rol;
        let n_id_usermodi = request.body.n_id_usermodi;
        let cadena = 'do $$ \n\r' +
            'declare new_n_idseg_userprofile int; \n\r' +
            '   begin \n\r' +
            '       if(exists(select n_idseg_userprofile from seg_userprofile where n_borrado = 0 and n_idseg_userprofile =\'' + n_idseg_userprofile + '\')) then \n\r' +
            '           update seg_userprofile set c_nombre1= \'' + c_nombre1 + '\',c_nombre2= \'' + c_nombre2 + '\', c_appaterno=\'' + c_appaterno + '\', c_apmaterno=\'' + c_apmaterno + '\', c_dni=\'' + c_dni + '\', n_idseg_rol=' + n_idseg_rol +',c_username=\'' + c_username + '\', n_id_usermodi='+n_id_usermodi+', d_fechamodi= now() where n_idseg_userprofile =\'' + n_idseg_userprofile + '\'; \n\r' +
            '       else \n\r' +
            '           insert into seg_userprofile(n_idseg_userprofile,c_username,c_clave,c_nombre1,c_nombre2,c_appaterno,c_apmaterno,c_dni,b_activo,n_idseg_rol,n_borrado,d_fechacrea,n_id_usercrea) \n\r' +
            '           values (default,\'' + c_username + '\',\'' + c_clave + '\',\'' + c_nombre1 + '\',\'' + c_nombre2 + '\',\'' + c_appaterno + '\',\'' + c_apmaterno + '\',\'' + c_dni + '\',true, '+ n_idseg_rol +', 0,now(),'+n_id_usermodi+') \n\r' +
            '           RETURNING n_idseg_userprofile into new_n_idseg_userprofile; \n\r' +    

            //'           INSERT INTO pro_usuarioproyecto(n_idpro_usuarioproyecto, n_idseg_userprofile, n_idpro_proyecto, n_borrado, n_id_usercrea, d_fechacrea) \n\r' +
            //'           VALUES (default, new_n_idseg_userprofile, '+ n_idpro_proyecto +', 0, '+n_id_usermodi+', now()); \n\r' +
            '       end if; \n\r' +
            '   end \n\r' +
            '$$';

        pool.query(cadena,
            (error, results) => {
                if (error) {
                    console.log(error);
                    response.status(200).json({ estado: false, mensaje: "DB: error3!.", data: null })
                } else {
                    response.status(200).json({ estado: true, mensaje: "", data: null })
                }
            });
        
    } else {
        response.status(200).json(obj)
    }
}

const delete_usuario = (request, response) => {
    var obj = valida.validaToken(request)
    if (obj.estado) {
        let n_idseg_userprofile = request.body.n_idseg_userprofile;
        let n_id_usermodi = request.body.n_id_usermodi;
        pool.query('update seg_userprofile set n_borrado = 1, n_id_usermodi='+n_id_usermodi+', d_fechamodi= now()  where n_idseg_userprofile ='+n_idseg_userprofile+' ',             
            (error, results) => {
                if (error) {
                    console.log(error);
                    response.status(200).json({ estado: false, mensaje: "DB: error4!.", data: null })
                } else {
                    response.status(200).json({ estado: true, mensaje: "", data: results.rows })
                }
            })
    } else {
        response.status(200).json(obj)
    }
}

const estadoUser = (request, response) => {
    var obj = valida.validaToken(request)
    if (obj.estado) {
        let n_idseg_userprofile = request.body.n_idseg_userprofile;
        let n_id_usermodi = request.body.n_id_usermodi;
        let b_activo = request.body.b_activo;
        pool.query('update seg_userprofile set b_activo = \''+ b_activo +'\', n_id_usermodi='+n_id_usermodi+', d_fechamodi= now()  where n_idseg_userprofile ='+n_idseg_userprofile+' ',             
            (error, results) => {
                if (error) {
                    console.log(error);
                    response.status(200).json({ estado: false, mensaje: "DB: error4!.", data: null })
                } else {
                    response.status(200).json({ estado: true, mensaje: "", data: results.rows })
                }
            })
    } else {
        response.status(200).json(obj)
    }
}

const getrole = (request, response) => {
    var obj = valida.validaToken(request)
    if (obj.estado) {
        pool.query('Select n_idseg_rol, c_nombre, n_nivel from seg_rol where n_borrado = 0 and (n_idseg_rol= $1 or 0 = $1) ',[request.body.n_idseg_rol],
            (error, results) => {
                if (error) {
                    response.status(200).json({ estado: false, mensaje: "DB: error2!.", data: null })
                } else {
                    response.status(200).json({ estado: true, mensaje: "", data: results.rows })
                }
            })
    } else {
        response.status(200).json(obj)
    }
}

const getRolUser = (request, response) => {
    var obj = valida.validaToken(request);
    if (obj.estado) {
        let cadena = 'select us.c_username, rol.n_idseg_rol, rol.c_nombre from seg_userprofile us \n\r' +
            'inner join seg_rol rol on rol.n_idseg_rol = us.n_idseg_rol \n\r' + 
            'where us.n_idseg_userprofile = $1'  
        pool.query(cadena,[request.body.n_idseg_userprofile],
            (error, results) => {
                if (error) {
                    response.status(200).json({ estado: false, mensaje: "DB: error UserRol!.", data: null })
                } else {
                    response.status(200).json({ estado: true, mensaje: "", data: results.rows })
                }
            })
    } else {
        response.status(200).json(obj)
    }
}

const saveRol = (request, response)=>{
    
    var obj = valida.validaToken(request)
    if (obj.estado) {
        let n_idseg_rol = request.body.n_idseg_rol;
        let c_nombre = request.body.c_nombre;  
        let n_id_usermodi = request.body.n_id_usermodi;  
        let cadena = 'do $$ \n\r' +
            '   begin \n\r' +
            '       if(exists(select n_idseg_rol from seg_rol where n_idseg_rol =\'' + n_idseg_rol + '\')) then \n\r' +
            '           update seg_rol set c_nombre= \'' + c_nombre + '\', n_id_usermodi='+n_id_usermodi+', d_fechamodi= now() where n_idseg_rol = \''+n_idseg_rol+'\' ; \n\r' +
            '       else \n\r' +
            '           insert into seg_rol(n_idseg_rol, c_nombre,n_borrado,d_fechacrea,n_id_usercrea) \n\r' +
            '           values (default,\'' + c_nombre + '\',0 ,now(), '+n_id_usermodi+'); \n\r' +
            '       end if; \n\r' +
            '   end \n\r' +
            '$$';
        pool.query(cadena,
            (error, results) => {
                if (error) {
                    console.log(error);
                    response.status(200).json({ estado: false, mensaje: "DB: error3!.", data: null })
                } else {
                    response.status(200).json({ estado: true, mensaje: "", data: results.rows })
                }
            })
    } else {
        response.status(200).json(obj)
    }
}

const deleteRol=(request, response)=>{
    var obj = valida.validaToken(request)
    if (obj.estado) {
        let n_idseg_rol = request.body.n_idseg_rol;
        let n_id_usermodi = request.body.n_id_usermodi;
        let c_nombre = request.body.c_nombre;

        pool.query('select u.c_username,u.n_idseg_rol, r.c_nombre from seg_userprofile u ' +
                    'inner join seg_rol r on  r.n_idseg_rol = u.n_idseg_rol and r.n_borrado = 0 '+
                    'where u.n_borrado = 0 and u.b_activo = true and r.n_idseg_rol = '+n_idseg_rol+' ',          
            (error, results) => {
                if (error) {
                    console.log(error);
                    response.status(200).json({ estado: false, mensaje: "DB: error al Eliminar!.", data: null })
                } else {
                    if(results.rowCount == 0){
                        pool.query('update seg_rol set n_borrado = 1, n_id_usermodi='+n_id_usermodi+', d_fechamodi= now() where n_idseg_rol ='+n_idseg_rol+' ',          
                        (error, results) => {
                            if (error) {
                                console.log(error);
                                response.status(200).json({ estado: false, mensaje: "DB: error al Eliminar2!.", data: null })
                            } else {
                                response.status(200).json({ estado: true, mensaje: "Rol Eliminado", data: results.rows })
                            }
                        })                        
                    }else{
                        response.status(200).json({ estado: true, mensaje: "Existen Usuarios activos con el rol "+c_nombre, data: results.rows })
                    }                    
                }
            })
    } else {
        response.status(200).json(obj)
    }
}

const resetearclave = (request, response) => {
    
    var obj = valida.validaToken(request)
    if (obj.estado) {
        let c_username = request.body.username;
        let c_clave = encriptar.encriptarlogin(request.body.password);
        let c_oldpassword = encriptar.encriptarlogin(request.body.oldpassword);
        let esreset = request.body.esreset;
        if (!esreset) {
            pool.query('Select n_idseg_userprofile from seg_userprofile where n_borrado = 0 and c_username = $1 and c_clave = $2',
                [c_username, c_oldpassword], (error, results) => {
                    if (error) {
                        response.status(200).json({ estado: false, mensaje: "error: usuario o contraseña inválidos!.", data: null })
                    } else {
                        if (results.rowCount > 0) {
                            pool.query('update seg_userprofile set c_clave = $2 where c_username = $1;', [c_username, c_clave],
                                (error, results) => {
                                    if (error) {
                                        response.status(200).json({ estado: false, mensaje: "DB: error!5.", data: null })
                                    } else {
                                        response.status(200).json({ estado: true, mensaje: "", data: results.rows })
                                    }
                                })
                        } else {
                            response.status(200).json({ estado: false, mensaje: "DB: Contraseña no válida!.", data: null })
                        }
                    }
                })
        } else {
            pool.query('update seg_userprofile set c_clave = $2 where c_username = $1;', [c_username, c_clave],
                (error, results) => {
                    if (error) {
                        response.status(200).json({ estado: false, mensaje: "DB: error6!.", data: null })
                    } else {
                        response.status(200).json({ estado: true, mensaje: "", data: results.rows })
                    }
                })
        }


    } else {
        response.status(200).json(obj)
    }
}

const getPantallaRol = (request, response) => {
    var obj = valida.validaToken(request)
    if (obj.estado) {
        let cadena = 'select ptr.n_idseg_pantalla,pt.c_codigo, ptr.n_idseg_rol, ptr.c_permiso from seg_pantallarol ptr \n\r' +
            'inner join seg_pantalla pt on pt.n_idseg_pantalla = ptr.n_idseg_pantalla \n\r' + 
            'inner join seg_userprofile usu on usu.n_idseg_rol = ptr.n_idseg_rol \n\r' + 
            'where ptr.n_borrado = 0 and usu.n_idseg_userprofile = $1'  
        pool.query(cadena,[request.body.n_idseg_userprofile],
            (error, results) => {
                if (error) {
                    response.status(200).json({ estado: false, mensaje: "DB: error2!.", data: null })
                } else {
                    response.status(200).json({ estado: true, mensaje: "", data: results.rows })
                }
            })
    } else {
        response.status(200).json(obj)
    }
}

const getPantalla = (request, response) => {
    var obj = valida.validaToken(request);
    if (obj.estado) {
        let cadena = 'select pt.n_idseg_pantalla, pt.c_codigo, pt.c_nombre,ptr.n_idseg_rol, ptr.c_permiso from seg_pantalla pt \n\r' +
        'left join seg_pantallarol ptr on ptr.n_idseg_pantalla = pt.n_idseg_pantalla and ptr.n_idseg_rol = $1 \n\r' + 
        'where pt.n_borrado = 0 order by pt.c_codigo asc, pt.c_nombre asc '  
        pool.query(cadena,[request.body.n_idseg_rol],
            (error, results) => {
                if (error) {
                    response.status(200).json({ estado: false, mensaje: "DB: error2!.", data: null })
                } else {                    
                    response.status(200).json({ estado: true, mensaje: "", data: results.rows })
                }
            })
    } else {
        response.status(200).json(obj)
    }
}

const updatePantallaRol = (request, response)=>{    
    var obj = valida.validaToken(request)
    let n_idseg_pantalla = request.body.n_idseg_pantalla;
    let n_idseg_rol = request.body.n_idseg_rol;
    let c_permiso = request.body.c_permiso;
    let n_id_usermodi = request.body.n_id_usermodi;
    if (obj.estado) {        
        let cadena = 'do $$ \n\r' +
            '   begin \n\r' +
            '       if(exists(select n_idseg_pantalla, n_idseg_rol from seg_pantallarol where n_idseg_pantalla = '+ n_idseg_pantalla +' and n_idseg_rol = '+ n_idseg_rol +')) then \n\r' +
            '           update seg_pantallarol set c_permiso = \''+c_permiso+'\', n_id_usermodi='+n_id_usermodi+' where n_idseg_pantalla = '+ n_idseg_pantalla +' and n_idseg_rol = '+ n_idseg_rol +'; \n\r' +
            '       else \n\r' +
            '           INSERT INTO seg_pantallarol(n_idseg_pantallarol, n_idseg_pantalla, n_idseg_rol, c_permiso, n_borrado, n_id_usercrea, d_fechacrea, d_fechamodi) \n\r' +
            '           VALUES (default, '+ n_idseg_pantalla +', '+ n_idseg_rol +', \''+c_permiso+'\',0, '+n_id_usermodi+',  now(), now()); \n\r' +
            '       end if; \n\r' +
            '   end \n\r' +
            '$$';
        pool.query(cadena,
            (error, results) => {
                if (error) {
                    console.log(error);
                    response.status(200).json({ estado: false, mensaje: "DB: error3!.", data: null })
                } else {
                    response.status(200).json({ estado: true, mensaje: "", data: results.rows })
                }
            })
    } else {
        response.status(200).json(obj)
    }
    
}

const getDataUser = (request, response)=>{    
    var obj = valida.validaToken(request);
    if (obj.estado) {
        let cadena = 'select u.c_nombre1, u.c_nombre2, u.c_appaterno, u.c_apmaterno, u.c_dni, r.c_nombre, u.b_activo, r.c_nombre from seg_userprofile u \n\r' +
        'inner join seg_rol r on r.n_idseg_rol = u.n_idseg_rol and r.n_borrado = 0 \n\r' + 
        'where u.n_borrado = 0 \n\r' +   
        'order by u.c_nombre1 asc, u.c_appaterno asc, u.c_apmaterno asc ';
        pool.query(cadena,
            (error, results) => {
                if (error) {
                    response.status(200).json({ estado: false, mensaje: "DB: error!.", data: null })
                } else {                    
                    response.status(200).json({ estado: true, mensaje: "", data: results.rows })
                }
            })
    } else {
        response.status(200).json(obj)
    }
    
}


module.exports = {
    login,
    get,
    getUserSinAsignacion,
    getrole,
    getRolUser,
    validarDatos,
    saveUser,
    resetearclave,
    delete_usuario,
    estadoUser,
    saveRol,
    deleteRol,
    getPantallaRol,
    getPantalla,
    updatePantallaRol,
    getDataUser
}
