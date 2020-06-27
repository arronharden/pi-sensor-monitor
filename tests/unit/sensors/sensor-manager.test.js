const sensors = require('../../../src/sensors')
const deepcopy = require('deepcopy')

const MOCK_DEFNS = [{
  alias: 'my test sensor',
  type: 'random-sensor',
  config: {
    readPeriodSecs: 900,
    retryDelayMS: 10,
    retryMaxAttempts: 5,
    timeoutMS: 50
  }
}]

const MOCK_DEFNS_WITH_ALERT_CONDS = [{
  alias: 'my test sensor',
  type: 'random-sensor',
  config: {
    readPeriodSecs: 900,
    retryDelayMS: 10,
    retryMaxAttempts: 5,
    timeoutMS: 50
  },
  alertConditions: [{
    type: 'max_temp_must_exceed_value_in_last_N_hours',
    maxValueToExceed: 50,
    lastNHours: 12,
    evaluationPeriodMS: 60000
  }]
}]

test('SensorManager creation', () => {
  const sensorMgr = new sensors.SensorManager(MOCK_DEFNS)
  expect(sensorMgr._pluginMgr._pluginWrappers.length).toEqual(1)
  expect(sensorMgr._pluginMgr._pluginWrappers[0].definition).toEqual(MOCK_DEFNS[0])
  expect(sensorMgr._pluginMgr._pluginWrappers[0].instance).toBeDefined()
  expect(sensorMgr._pluginMgr._pluginWrappers[0].instance._definition).toEqual(MOCK_DEFNS[0])
  sensorMgr.terminate()
})

test('SensorManager init with no alert conditions', () => {
  const sensorMgr = new sensors.SensorManager(MOCK_DEFNS)
  return sensorMgr.init().then(() => {
    expect(sensorMgr._invokeOnSchedules.length).toEqual(1)
    sensorMgr.terminate()
  })
})

test('SensorManager init with alert conditions', () => {
  const sensorMgr = new sensors.SensorManager(MOCK_DEFNS_WITH_ALERT_CONDS)
  return sensorMgr.init().then(() => {
    expect(sensorMgr._invokeOnSchedules.length).toEqual(2)
    sensorMgr.terminate()
  })
})

test('SensorManager init and notify', () => {
  const notifyFn = jest.fn(() => Promise.resolve())
  const sensorMgr = new sensors.SensorManager(MOCK_DEFNS, notifyFn)
  return sensorMgr.init().then(() => {
    expect(notifyFn.mock.calls.length).toBe(1)
    expect(notifyFn.mock.calls[0][0].alias).toEqual(MOCK_DEFNS[0].alias)
    expect(notifyFn.mock.calls[0][0].type).toEqual(MOCK_DEFNS[0].type)
    expect(notifyFn.mock.calls[0][0].timestamp).toBeDefined()
    expect(notifyFn.mock.calls[0][0].temperature).toBeDefined()
    expect(notifyFn.mock.calls[0][0].humidity).toBeDefined()
    expect(notifyFn.mock.calls[0][0].pressure).toBeDefined()
    sensorMgr.terminate()
  })
})

test('SensorManager init with sensor failure', () => {
  const notifyFn = jest.fn(() => Promise.resolve())
  const mockDefnWithFail = deepcopy(MOCK_DEFNS)
  mockDefnWithFail[0].config.testMode = 'fail'
  const sensorMgr = new sensors.SensorManager(mockDefnWithFail, notifyFn)
  return sensorMgr.init().then(() => {
    expect(notifyFn.mock.calls.length).toBe(0)
    sensorMgr.terminate()
  })
})

test('SensorManager init with sensor timeout', () => {
  const notifyFn = jest.fn(() => Promise.resolve())
  const mockDefnWithTimeout = deepcopy(MOCK_DEFNS)
  mockDefnWithTimeout[0].config.testMode = 'timeout'
  const sensorMgr = new sensors.SensorManager(mockDefnWithTimeout, notifyFn)
  return sensorMgr.init().then(() => {
    expect(notifyFn.mock.calls.length).toBe(0)
    sensorMgr.terminate()
  })
})
