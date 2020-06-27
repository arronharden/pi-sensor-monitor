class BasePlugin {
  constructor (definition) {
    this._definition = definition
  }

  init () {
    // no-op
  }
}

module.exports = {
  BasePlugin
}
