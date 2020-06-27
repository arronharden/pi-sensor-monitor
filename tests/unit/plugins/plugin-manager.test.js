const plugins = require('../../../src/plugins')
const deepcopy = require('deepcopy')

const PLUGIN_CODEDIR = `${__dirname}/.`
const MOCK_DEFNS = [{
  type: 'test-plugin',
  alias: 'test plugin',
  config: {
    some: 'value'
  },
  someOtherValue: {
    someAttr: 123
  }
}]

test('PluginManager creation', () => {
  const pluginMgr = new plugins.PluginManager(PLUGIN_CODEDIR, MOCK_DEFNS)
  expect(pluginMgr._pluginWrappers.length).toEqual(1)
  expect(pluginMgr._pluginWrappers[0].definition).toEqual(MOCK_DEFNS[0])
  expect(pluginMgr._pluginWrappers[0].instance).toBeDefined()
  expect(pluginMgr._pluginWrappers[0].instance._definition).toEqual(MOCK_DEFNS[0])
})

test('PluginManager creation module not found', () => {
  const mockDefnWithBadPlugin = deepcopy(MOCK_DEFNS)
  mockDefnWithBadPlugin[0].type = 'bad type'
  expect(() => {
    return new plugins.PluginManager(PLUGIN_CODEDIR, mockDefnWithBadPlugin)
  }).toThrow('Cannot find module')
})

test('PluginManager creation module does not export create method', () => {
  const mockDefnWithBadPlugin = deepcopy(MOCK_DEFNS)
  mockDefnWithBadPlugin[0].type = 'test-bad-plugin'
  expect(() => {
    return new plugins.PluginManager(PLUGIN_CODEDIR, mockDefnWithBadPlugin)
  }).toThrow('does not export create() method')
})

test('PluginManager init', () => {
  const pluginMgr = new plugins.PluginManager(PLUGIN_CODEDIR, MOCK_DEFNS)
  const initSpy = jest.spyOn(pluginMgr._pluginWrappers[0].instance, 'init')
  return pluginMgr.init().then(() => {
    expect(initSpy.mock.calls.length).toBe(1)
  })
})

test('PluginManager invokeAll named function', () => {
  const pluginMgr = new plugins.PluginManager(PLUGIN_CODEDIR, MOCK_DEFNS)
  return pluginMgr.init()
    .then(() => {
      pluginMgr._pluginWrappers[0].instance.callMe = jest.fn()
      return pluginMgr.invokeAll('callMe', 123)
    })
    .then(() => {
      expect(pluginMgr._pluginWrappers[0].instance.callMe.mock.calls.length).toBe(1)
      expect(pluginMgr._pluginWrappers[0].instance.callMe.mock.calls[0][0]).toEqual(pluginMgr._pluginWrappers[0])
      expect(pluginMgr._pluginWrappers[0].instance.callMe.mock.calls[0][1]).toEqual(123)
    })
})

test('PluginManager invokeAll named function does not exist', () => {
  const pluginMgr = new plugins.PluginManager(PLUGIN_CODEDIR, MOCK_DEFNS)
  return pluginMgr.init()
    .then(() => {
      return pluginMgr.invokeAll('does not exist', 123)
    })
    .then(() => {
      // not expected to succeed
      expect(false).toBe(true)
    }, (err) => {
      expect(err.message).toEqual('Plugin alias=\'test plugin\' does not have a method named \'does not exist\'')
    })
})

test('PluginManager invokeAll function object', () => {
  const fn = jest.fn(() => Promise.resolve())
  const pluginMgr = new plugins.PluginManager(PLUGIN_CODEDIR, MOCK_DEFNS)
  return pluginMgr.init()
    .then(() => {
      return pluginMgr.invokeAll(fn, 123)
    })
    .then(() => {
      expect(fn.mock.calls.length).toBe(1)
      expect(fn.mock.calls[0][0]).toEqual(pluginMgr._pluginWrappers[0])
      expect(fn.mock.calls[0][1]).toBe(123)
    })
})

test('PluginManager with 2 plugins invokeAlias', () => {
  const mockDefnWith2Plugins = deepcopy(MOCK_DEFNS)
  mockDefnWith2Plugins.push(deepcopy(MOCK_DEFNS[0]))
  mockDefnWith2Plugins[1].alias = 'test plugin 2'
  const pluginMgr = new plugins.PluginManager(PLUGIN_CODEDIR, mockDefnWith2Plugins)
  expect(pluginMgr._pluginWrappers.length).toEqual(2)
  return pluginMgr.init()
    .then(() => {
      pluginMgr._pluginWrappers[0].instance.callMe = jest.fn()
      pluginMgr._pluginWrappers[1].instance.callMe = jest.fn()
      return pluginMgr.invokeAlias('test plugin 2', 'callMe', 123)
    })
    .then(() => {
      expect(pluginMgr._pluginWrappers[0].instance.callMe.mock.calls.length).toBe(0)
      expect(pluginMgr._pluginWrappers[1].instance.callMe.mock.calls.length).toBe(1)
      expect(pluginMgr._pluginWrappers[1].instance.callMe.mock.calls[0][0]).toEqual(pluginMgr._pluginWrappers[1])
      expect(pluginMgr._pluginWrappers[1].instance.callMe.mock.calls[0][1]).toEqual(123)
    })
})
