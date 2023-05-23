const express = require('express')
var cors = require('cors');
const app = express()
const port = 3200
const server = require('http').Server(app);
const ruta = '/archivos';
const icon = '/icons';
var bodyParser = require('body-parser');

//MIDDLEWARES
app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1000mb' }));
app.use(cors());
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use('/archivos', express.static(__dirname + ruta));
app.use('/icons', express.static(__dirname + icon));


/****IMPORTACIONES DAL****/
const dbSeguridad = require('./dal/seguridad')
const dbMovil = require('./dal/movil')


/****SOCKET****/
const options = {
  cors: {
    origin: 'http://localhost:4200',
  },
};
const io = require('socket.io')(server, options);
io.on('connection', function (socket) {
  const handshake = socket.id;
  let  nameRoom  = socket.handshake.query;
  console.log(handshake);
  console.log(nameRoom);  
  socket.join(nameRoom)
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

});


/****RUTAS****/
app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})



/****SEGURIDAD****/
app.post('/api/seguridad/login', dbSeguridad.login)
app.post('/api/seguridad/get', dbSeguridad.get)
app.post('/api/seguridad/getUserSinAsignacion',dbSeguridad.getUserSinAsignacion)
app.post('/api/seguridad/getrole', dbSeguridad.getrole) 
app.post('/api/seguridad/getRolUser', dbSeguridad.getRolUser)
app.post('/api/seguridad/validarDatos', dbSeguridad.validarDatos)
app.post('/api/seguridad/saveUser', dbSeguridad.saveUser)
app.post('/api/seguridad/resetearclave', dbSeguridad.resetearclave)
app.post('/api/seguridad/delete_usuario', dbSeguridad.delete_usuario) 
app.post('/api/seguridad/estadoUser', dbSeguridad.estadoUser)
app.post('/api/seguridad/saveRol', dbSeguridad.saveRol)
app.post('/api/seguridad/deleteRol',dbSeguridad.deleteRol) 
app.post('/api/seguridad/getPantallaRol',dbSeguridad.getPantallaRol) 
app.post('/api/seguridad/getPantalla',dbSeguridad.getPantalla) 
app.post('/api/seguridad/updatePantallaRol',dbSeguridad.updatePantallaRol)
app.post('/api/seguridad/getDataUser',dbSeguridad.getDataUser) 

/* Movil */
app.get('/api/movil/getusuario', dbMovil.getusuario)














server.listen(port, () => {
  console.log('\n')
  console.log(`App running on port ${port}.`)
})

