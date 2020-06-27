const { BasePlugin } = require('../../../src/plugins')

class TestPlugin extends BasePlugin {
}

module.exports.create = (definition) => new TestPlugin(definition)
