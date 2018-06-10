const Config = require('./system/config.js')

Config.load('access.yaml')
Config.load('connection.yaml')
Config.load('default.yaml')
Config.load('storage.yaml')
Config.load('virtualization.yaml')
Config.load('network.yaml')

const express = require('express')
const fs = require('fs')

const Connections = require('./system/connections.js')
const Exceptions = require('./system/exceptions.js')

const https = require('https')
const http = require('http')
const url = require('url')

const network = Config.network

const app = express()

if(Config.network.https.enabled){
  let server = https.createServer({
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt')
  }, app)

  if(Config.network.https.force){
    let redirect_server = http.createServer((request, response) => {
      let request_url = url.format({
        protocol: 'https',
        host: request.headers.host,
        pathname: request.url
      })

      response.writeHead(302, { Location: request_url })
      response.end()
    })

    redirect_server.listen(network.http.port, network.http.host, (e) => {
      if(e) return Logger.error(e)

      Logger.log('Http force SSL server listens on %s:%s', network.http.host, network.http.port)
    })
  }

  server.listen(network.https.port, network.https.host, (e) => {
    if(e) return Logger.error(e)

    Logger.log('Server listening on %s:%s', network.https.host, network.https.port)
  })

  server.on('error', e => {
    Logger.error(e)
  })
}else{
  app.listen(network.http.port, network.http.host, (e) => {
    if(e) return Logger.error(e)

    Logger.log('Server listening on %s:%s', network.http.host, network.http.port)
  })
}

const body_parser = require('body-parser')

const Logger = require('./system/logger.js')
const Versioning = require('./system/versioning.js')
const Cli = require('./system/cli.js')

app.disable('x-powered-by')

app.use(body_parser.urlencoded({ extended: false }))
app.use(body_parser.json())

app.use((request, response, next) => {
  let type = request.headers['content-type'] || 'application/json'

  if( type !== 'application/x-www-form-urlencoded' &&
      type !== 'application/json')
  {
    throw new Exceptions.BAD_REQUEST
  }

  next()
})

// TODO: Add access middleware to Cli.
Cli.setup(app)

Versioning.setup(app)

app.use((e, request, response, next) => {
  // TODO: 3 types of error responses.
  // INTERNAL_ERROR:
  // RESPONSE_ERROR:
  // REQUEST_ERROR:
  // Each of the types will include its own unique error code.
  // {error: e.type, code: e.code, message: e.message}
  // One general error code, for things we are not able to track or define with the code?

  Logger.error(e.message)
  Logger.trace(e.stack)

  if(e.code === undefined) e.code = 500

  response.status(e.code).json({error: e.type, message: e.message})
})
