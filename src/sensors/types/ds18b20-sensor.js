const sensor = require('ds18b20-raspi')
const { BasePlugin } = require('../../plugins')

class DS18B20Sensor extends BasePlugin {
  read () {
    // Read DS18B20 sensor data
    return new Promise((resolve, reject) => {
      const deviceId = this._definition.config.deviceId
      if (deviceId) {
        // read specific sensor
        sensor.readC(deviceId, (err, temp) => {
          if (err) {
            reject(new Error(`Failed to read sensor data for deviceId=${deviceId}: ${err}`))
            return
          }
          if (!temp) {
            // bad result returned
            reject(new Error('Bad result returned (no data)'))
          }

          resolve({
            // Normalise
            temperature: temp
          })
        })
      } else {
        // expect only a single sensor
        sensor.readSimpleC((err, temp) => {
          if (err) {
            reject(new Error(`Failed to read sensor data: ${err}`))
            return
          }
          if (!temp) {
            // bad result returned
            reject(new Error('Bad result returned (no data)'))
          }

          resolve({
            // Normalise
            timestamp: (new Date()).toISOString(),
            temperature: temp
          })
        })
      }
    })
  }
}

module.exports = {
  DS18B20Sensor: DS18B20Sensor,
  create: (definition) => new DS18B20Sensor(definition)
}
