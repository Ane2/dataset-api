// const Access = require('./access.js')
// const Storages = require('./storages.js')
// const Exceptions = require('./exceptions.js')
// const Connections = require('./connections.js')
// const Validator = new (require('jsonschema').Validator)

const path = require('path')

class Sandbox {
  constructor(request, response) {
    this.console = console
    this.Connections = require('./connections.js')
    this.Exceptions = require('./exceptions.js')
    this.Storages = require('./storages.js')
    this.Logger = require('./logger.js')

    this.ROOT = process.cwd()

    this.Request = request
    this.Response = response

    this.Form = request.body
    this.Query = request.query
    this.Param = request.params

    this.require = (...args) => {
      args.unshift('/')

      let abs = path.join.apply(path, args).replace(path.sep, '')
      let result

      try {
        result = require(abs)
      } catch (e) {
        result = require(path.join(process.cwd(), abs))
      }

      return result
    }
  }
}

module.exports = Sandbox
