const ecosystemConfig = require('../../src/ecosystem.config')

test('ecosystem config is valid', () => {
  expect(ecosystemConfig.apps.length).toEqual(1)
})
