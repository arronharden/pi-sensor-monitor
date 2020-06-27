
const GLOBAL_CONFIG_FILE = '../config/app-config.json'

const globalAppConfig = require(GLOBAL_CONFIG_FILE)
let appConfig
let appConfigName

module.exports.init = (configOverrides) => {
  let cfg = globalAppConfig
  const overrideName = configOverrides && configOverrides.find((override) => override) // first defined override
  const overrideConfigFile = `../config/app-config-${overrideName}.json`

  if (overrideName) {
    // Try override specific config
    try {
      cfg = require(overrideConfigFile)
      appConfigName = overrideConfigFile
      console.info(`Using application config from ${overrideConfigFile}`)
    } catch (err) {
      // doesn't exist - ignore and use global config
      appConfigName = GLOBAL_CONFIG_FILE
      console.warn(`Unable to load from application config ${overrideConfigFile}. Using global config from ${GLOBAL_CONFIG_FILE}`)
    }
  } else {
    appConfigName = GLOBAL_CONFIG_FILE
    console.info(`No override config defined. Using global config from ${GLOBAL_CONFIG_FILE}`)
  }
  appConfig = cfg
}

module.exports.get = () => appConfig
module.exports.getName = () => appConfigName
