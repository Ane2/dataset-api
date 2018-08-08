const Connection = require('../system/connection.js')
const sql = require('mssql')
//https://github.com/tediousjs/node-mssql
class Mssql extends Connection{

  constructor(configuration){
    super()

    this.pool = sql.connect(configuration)
  }

  async client(){
    let pool = await this.pool
    return pool.request()
  }

}

module.exports = Mssql
