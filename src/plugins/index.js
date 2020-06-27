const pluginManager = require('./plugin-manager')
const basePlugin = require('./base-plugin')

module.exports = {
  ...pluginManager,
  ...basePlugin
}
