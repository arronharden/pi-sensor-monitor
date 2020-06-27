const alertConditions = require('./alert-conditions')
const plugins = require('../plugins')
const utils = require('../utils')

const DEFAULT_READ_PERIOD_SECS = 10 * 60 // 10 mins
const DEFAULT_READ_RETRY_DELAY = 5000 // 5 secs in ms
const DEFAULT_READ_RETRY_MAX_ATTEMPTS = 5
const DEFAULT_READ_TIMEOUT = 5000 // 5 secs in ms

class SensorManager {
  constructor (sensorDefns, notifyMeasurementFn, notifyAlertFn) {
    this._pluginMgr = new plugins.PluginManager(`${__dirname}/types/`, sensorDefns)
    this._notifyMeasurementFn = notifyMeasurementFn
    this._notifyAlertFn = notifyAlertFn
    this._invokeOnSchedules = []
  }

  _createAndStartPluginSchedules (sensorPluginWrapper) {
    const proms = []
    const defn = sensorPluginWrapper.definition

    const readPeriodSecs = defn.config.readPeriodSecs || DEFAULT_READ_PERIOD_SECS
    const readSchedule = new utils.InvokeOnSchedule(() => this._readAndNotifyMeasurement(sensorPluginWrapper), readPeriodSecs * 1000, `${defn.alias} (sensor read)`)
    this._invokeOnSchedules.push(readSchedule)
    proms.push(readSchedule.start())

    if (defn.alertConditions) {
      const alertSchedule = new utils.InvokeOnSchedule(() => alertConditions.evaluateAlertConditions(defn.alias, defn.type, defn.alertConditions, this._notifyAlertFn), readPeriodSecs * 1000, `${defn.alias} (alert)`)
      this._invokeOnSchedules.push(alertSchedule)
      proms.push(alertSchedule.start(true))
    }
    return Promise.all(proms)
  }

  _readAndNotifyMeasurement (sensorPluginWrapper) {
    const defn = sensorPluginWrapper.definition
    const timeoutMS = defn.config.timeoutMS || DEFAULT_READ_TIMEOUT
    const retryDelayMS = defn.config.retryDelayMS || DEFAULT_READ_RETRY_DELAY
    const retryMaxAttempts = defn.config.retryMaxAttempts || DEFAULT_READ_RETRY_MAX_ATTEMPTS
    return utils.invokeWithTimeoutAndRetry(() => sensorPluginWrapper.instance.read(), timeoutMS, retryMaxAttempts, retryDelayMS)
      .catch((err) => {
        // log and continue
        console.warn(`Failed to read from sensor alias='${defn.alias}' after ${retryMaxAttempts} retries.`, err)
      })
      .then((data) => {
        if (!data) {
          console.debug(`No measurements for sensor alias '${defn.alias}' - skipping`)
        } else {
          if (this._notifyMeasurementFn) {
            return this._notifyMeasurementFn(Object.assign({}, data, {
              alias: defn.alias,
              type: defn.type,
              timestamp: (new Date()).toISOString()
            }))
          } else {
            console.debug(`No notify measurement function configured.' - skipping`)
          }
        }
      })
  }

  init () {
    return this._pluginMgr.init()
      .then(() => {
        // for each plugin setup the scheduled measurement read
        return this._pluginMgr.invokeAll((sensorPluginWrapper) => this._createAndStartPluginSchedules(sensorPluginWrapper))
      })
  }

  terminate () {
    this._invokeOnSchedules.forEach((invokeOnSchedule) => {
      invokeOnSchedule.stop()
    })
    this._invokeOnSchedules = []
    console.info(`Stopped sensor manager`)
  }
}

module.exports = {
  SensorManager: SensorManager
}
