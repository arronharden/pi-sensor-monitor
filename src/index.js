const { App } = require('./app')
const config = require('./config')
const argv = require('yargs').argv

const app = new App()

function forceExit () {
  setTimeout(() => {
    console.log('Clean exit not possible. Killing process.')
    process.exit(99)
  }, 2000)
}

function init () {
  console.log(`Process starting with PID=${process.pid}`)

  // add some exit handlers
  process.on('exit', function () {
    console.log(`Exit handler - process ${process.pid} finishing.`)
  })
  process.on('SIGINT', function () {
    // catch ctrl+c event and exit normally
    console.log(`SIGINT (ctrl-c) caught in process ${process.pid}.`)
    app.terminate()
    forceExit()
  })
  process.on('uncaughtException', function (e) {
    // catch uncaught exceptions
    console.error(`Uncaught exception in process ${process.pid}: ${e}.`, e)
    app.terminate()
    forceExit()
  })

  config.init([argv.app_config, process.env.APP_CONFIG])
  return app.init(config.get())
}

// start everything..
init()
  .catch((err) => {
    console.error(`Initialisation error.`, err)
    process.exit(20)
  })

// run forever..
setInterval(() => {}, 1000)
