const deepcopy = require('deepcopy')

class PluginManager {
  constructor (pluginCodeDir, definitions) {
    this._pluginCodeDir = pluginCodeDir
    this._pluginWrappers = definitions.map((definition) => {
      definition = deepcopy(definition)
      return {
        definition: definition,
        instance: this._createPlugin(definition)
      }
    })
  }

  _createPlugin (definition) {
    const requirePath = `${this._pluginCodeDir}/${definition.type}`
    const plugin = require(requirePath)
    if (typeof plugin.create !== 'function') {
      throw new Error(`Plugin type'=${definition.type}' (from ${requirePath}) does not export create() method.`)
    }
    return plugin.create(definition)
  }

  _invoke (pluginWrappers, fn, args) {
    return Promise.all(pluginWrappers.map((pluginWrapper) => {
      if (typeof fn === 'function') {
        return fn(Object.assign({}, pluginWrapper), args)
      }
      if (typeof pluginWrapper.instance[fn] === 'function') {
        return pluginWrapper.instance[fn](Object.assign({}, pluginWrapper), args)
      }
      return Promise.reject(new Error(`Plugin alias='${pluginWrapper.definition.alias}' does not have a method named '${fn}'`))
    }))
  }

  init () {
    return this.invokeAll('init')
      .then(() => {
        this._pluginWrappers.forEach((pluginWrapper) => {
          console.info(`Initialised plugin. definition=${JSON.stringify(pluginWrapper.definition)}.`)
        })
      })
  }

  invokeAll (fn, args) {
    return this._invoke(this._pluginWrappers, fn, args)
  }

  invokeAlias (alias, fn, args) {
    const matches = this._pluginWrappers.filter((pluginWrapper) => pluginWrapper.definition.alias === alias)
    return this._invoke(matches, fn, args)
  }
}

module.exports = {
  PluginManager
}
