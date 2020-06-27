const applicationLog = require('../../../../src/alerts/types/application-log')

const MOCK_DEFN = {
  alias: 'Log output',
  type: 'application-log',
  config: {
    prefix: 'ALERT'
  }
}

const MOCK_ALERT = {
  message: 'Some alert',
  alias: 'some sensor',
  type: 'some sensor type',
  condition: { type: 'some cond type' },
  chartBuffer: Buffer.from([1, 2, 3])
}

test('send alert', () => {
  const logAlert = applicationLog.create(MOCK_DEFN)
  return logAlert.sendAlert({}, MOCK_ALERT)
})
