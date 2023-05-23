const Pool = require('pg').Pool
let local = {
  user: 'postgres',
  host: 'localhost',
  database: 'client_service_001',//'sol_redes_backup',
  password: '123',
  port: 5432
}

let prod = {
  user: 'postgres',
  host: 'solredespostgres.cluster-c2xs6vpymflg.us-east-1.rds.amazonaws.com',
  database: 'SolRedesProd',
  password: 'Candwi202288',
  port: 5432
}

const pool = new Pool(local)



module.exports={
    pool
}
