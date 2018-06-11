const Exceptions = require('../system/exceptions.js')

class Simple {
  constructor(config){
    this.key = config.key
  }

  async authorize(request){
    let authorization = request.headers.authorization

    if(authorization !== this.key){
      return false
    }

    return true
  }
}

module.exports = Simple
