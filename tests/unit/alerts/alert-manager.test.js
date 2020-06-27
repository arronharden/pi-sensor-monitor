const alerts = require('../../../src/alerts')

const MOCK_DEFNS = [{
  alias: 'Log output',
  type: 'application-log',
  config: {
    prefix: 'ALERT'
  }
}]

test('AlertManager creation', () => {
  const alertMgr = new alerts.AlertManager(MOCK_DEFNS)
  expect(alertMgr._pluginMgr._pluginWrappers.length).toEqual(1)
  expect(alertMgr._pluginMgr._pluginWrappers[0].definition).toEqual(MOCK_DEFNS[0])
  expect(alertMgr._pluginMgr._pluginWrappers[0].instance).toBeDefined()
  expect(alertMgr._pluginMgr._pluginWrappers[0].instance._definition).toEqual(MOCK_DEFNS[0])
  alertMgr.terminate()
})

test('AlertManager init', () => {
  const alertMgr = new alerts.AlertManager(MOCK_DEFNS)
  return alertMgr.init().then(() => {
    alertMgr.terminate()
  })
})

test('AlertManager sendAlerts', () => {
  const alertMgr = new alerts.AlertManager(MOCK_DEFNS)
  let sendAlertSpy
  return alertMgr.init()
    .then(() => {
      sendAlertSpy = jest.spyOn(alertMgr._pluginMgr._pluginWrappers[0].instance, 'sendAlert')
      return alertMgr.sendAlerts(['some alert1', 'some alert2'])
    })
    .then(() => {
      expect(sendAlertSpy.mock.calls.length).toBe(2)
      expect(sendAlertSpy.mock.calls[0][0]).toEqual(alertMgr._pluginMgr._pluginWrappers[0])
      expect(sendAlertSpy.mock.calls[0][1]).toEqual('some alert1')
      expect(sendAlertSpy.mock.calls[1][0]).toEqual(alertMgr._pluginMgr._pluginWrappers[0])
      expect(sendAlertSpy.mock.calls[1][1]).toEqual('some alert2')
      alertMgr.terminate()
    })
})

test('AlertManager sendAlerts', () => {
  const alertMgr = new alerts.AlertManager(MOCK_DEFNS)
  return alertMgr.init()
    .then(() => {
      alertMgr._pluginMgr._pluginWrappers[0].instance.sendAlert = jest.fn(() => Promise.reject(new Error('some error')))
      return alertMgr.sendAlerts(['some alert1', 'some alert2'])
    })
    .then(() => {
      // not expected to succeed
      expect(false).toBe(true)
    }, (err) => {
      expect(err.message).toEqual('some error')
    })
})
