const sensors = require('../sensors')
const sqlite3Client = require('../persistence/sqlite3-client')
const alerts = require('../alerts')

class App {
  constructor () {
    this._alertMgr = null
    this._sensorMgr = null
  }

  init (appConfig) {
    return sqlite3Client.init(appConfig)
      .then(() => {
        this._alertMgr = new alerts.AlertManager(appConfig.alerts, this._sensorMgr)
        this._sensorMgr = new sensors.SensorManager(appConfig.sensors,
          sqlite3Client.insertSensorMeasurement,
          (alertsToSend) => this._alertMgr.sendAlerts(alertsToSend))
        return Promise.all([this._sensorMgr.init(), this._alertMgr.init()])
      })
  }

  terminate () {
    if (this._sensorMgr) {
      this._sensorMgr.terminate()
    }
    if (this._alertMgr) {
      this._alertMgr.terminate()
    }
    console.info(`Stopped application`)
  }
}

module.exports = {
  App
}
