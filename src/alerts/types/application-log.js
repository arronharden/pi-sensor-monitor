const { BasePlugin } = require('../../plugins')

class ApplicationLogAlert extends BasePlugin {
  sendAlert (pluginWraper, alertToSend) {
    console.log(`${this._definition.config.prefix}: ${JSON.stringify(alertToSend.message)}`)
  }
}

module.exports = {
  ApplicationLogAlert,
  create: (definition) => new ApplicationLogAlert(definition)
}
