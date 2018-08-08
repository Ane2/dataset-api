const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const Util = require('./util.js')

const Exceptions = require('./exceptions.js')

class Access{
  constructor() {
    this.access_path = path.resolve('./config/access.yaml')

    console.log('constructing new access')

    this.list = yaml.safeLoad(fs.readFileSync(this.access_path, 'utf-8'))
  }

  async authorize(request, name) {
    let access = this.list[name]

    if(access === undefined){
      throw new Exceptions.UNDEFINED_ACCESS(name)
    }

    let driver_path = path.join(process.cwd(), 'access', access.driver)

    console.log('creating new driver')

    let driver

    try{
      driver = require(driver_path)
    }catch(e){
      throw new Exceptions.ACCESS_UNDEFINED_DRIVER(access.driver)
    }

    let result
    try{
      result = new driver(access)
    }catch(e){
      throw new Exceptions.ACCESS_DRIVER_CONSTRUCTOR(access.driver, e.message)
    }

    if(result.authorize === undefined){
      throw new Exceptions.ACCESS_AUTHORIZE(path.join('access', access.driver))
    }

    let authority = result.authorize(request)

    if (!authority || (!authority instanceof Util.AsyncFunction && !authority instanceof Promise)) {
      throw new Exceptions.ACCESS_AUTHORITY(path.join('access', access.driver))
    }

    return authority
  }

  async for(request, entry) {
    if (!entry.access) return null

    let names = Array.isArray(entry.access) ? entry.access : [entry.access]

    for (let name of names) {
      let authority = await this.authorize(request, name)

      if (authority) {
        return name
      }
    }

    throw new Exceptions.BAD_AUTHORIZATION
  }

  reload() {
    this.list = yaml.safeLoad(fs.readFileSync(this.access_path, 'utf-8'))
  }
}

module.exports = new Access
