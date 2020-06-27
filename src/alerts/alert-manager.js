const plugins = require('../plugins')

class AlertManager {
  constructor (alertDefns, sensorMgr) {
    this._pluginMgr = new plugins.PluginManager(`${__dirname}/types`, alertDefns)
    this._sensorMgr = sensorMgr
  }

  init () {
    return this._pluginMgr.init()
  }

  sendAlerts (alertsToSend) {
    const proms = []
    alertsToSend.forEach((alertToSend) => {
      proms.push(this._pluginMgr.invokeAll('sendAlert', alertToSend))
    })
    return Promise.all(proms)
  }

  terminate () {
    // no-op
    console.info(`Stopped alert manager`)
  }
}

module.exports = {
  AlertManager
}
