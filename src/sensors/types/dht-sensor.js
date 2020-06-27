const sensor = require('node-dht-sensor').promises
const { BasePlugin } = require('../../plugins')

class DHTSensor extends BasePlugin {
  read () {
    // Read DHTxx sensor data
    return sensor.read(this._definition.config.dhtType, this._definition.config.pin)
      .then(({ temperature, humidity }) => {
        if (!temperature && !humidity) {
          // bad result returned
          throw new Error('Bad result returned (no data)')
        }

        // Normalise
        return {
          temperature: temperature,
          humidity: humidity
        }
      })
  }
}

module.exports = {
  DHTSensor: DHTSensor,
  create: (definition) => new DHTSensor(definition)
}
