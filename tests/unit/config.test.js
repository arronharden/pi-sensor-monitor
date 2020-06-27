const config = require('../../src/config')

test('Init config no overrides', () => {
  config.init()
  expect(config.getName()).toEqual('../config/app-config.json')
})

test('Init config overrides does not exist', () => {
  config.init(['does not exist'])
  expect(config.getName()).toEqual('../config/app-config.json')
})

test('Init config with mock config', () => {
  config.init(['mock'])
  expect(config.getName()).toEqual('../config/app-config-mock.json')
  expect(config.get().sensors.length).toEqual(1)
})
