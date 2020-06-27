const { BasePlugin } = require('../../plugins')

class RandomSensor extends BasePlugin {
  constructor (definition) {
    super(definition)
    this._last = {
      temperature: 32.09,
      humidity: 34.851083883116694,
      pressure: 1010.918480644477
    }
  }

  _getNext (current, maxChange, min, max) {
    const delta = (Math.random() * maxChange) - (maxChange / 2)
    const next = Math.min(max, Math.max(min, current + delta))
    return next
  }

  read (attemptNum) {
    if (!this._definition.config.testMode || this._definition.config.testMode === 'normal' || (this._definition.config.testMode === 'fail-for-attempts-less-than-4' && attemptNum > 3)) {
      // Generate dummy data
      const next = {
        temperature: this._getNext(this._last.temperature, 1, -10, 40),
        humidity: this._getNext(this._last.humidity, 2, 0, 100),
        pressure: this._getNext(this._last.pressure, 50, 800, 1200)
      }
      this._last = next
      return Promise.resolve(next)
    } else if (this._definition.config.testMode === 'timeout') {
      return new Promise((resolve) => {})
    } else if (this._definition.config.testMode === 'fail') {
      return Promise.reject(new Error('Mock failure'))
    }
  }
}

module.exports = {
  RandomCollector: RandomSensor,
  create: (definition) => new RandomSensor(definition)
}
