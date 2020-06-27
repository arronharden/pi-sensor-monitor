const BME280 = require('bme280-sensor')
const { BasePlugin } = require('../../plugins')

class BME280Sensor extends BasePlugin {
  constructor (definition) {
    super(definition)
    const normConfig = Object.assign({}, definition.config)
    if (typeof normConfig.i2cAddress === 'string') {
      normConfig.i2cAddress = parseInt(normConfig.i2cAddress)
    }
    this._bme280 = new BME280(normConfig)
  }

  read () {
    // Read BME280 sensor data
    return this._bme280.readSensorData()
      .then((data) => {
        if (!data || (!data.temperature_C && !data.humidity && !data.pressure_hPa)) {
          // bad result returned
          throw new Error('Bad result returned (no data)')
        }

        // Normalise
        return {
          temperature: data.temperature_C,
          humidity: data.humidity,
          pressure: data.pressure_hPa
        }
      })
  }

  init () {
    // Initialize the BME280 sensor
    return this._bme280.init()
  }
}

module.exports = {
  BME280Sensor: BME280Sensor,
  create: (definition) => new BME280Sensor(definition)
}
