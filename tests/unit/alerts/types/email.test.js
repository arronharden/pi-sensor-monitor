const nodemailer = require('nodemailer')
const email = require('../../../../src/alerts/types/email')

jest.mock('nodemailer')

const MOCK_DEFN = {
  alias: 'GMail',
  type: 'email',
  config: {
    transport: {
      service: 'gmail',
      auth: {
        user: 'youremail@gmail.com',
        pass: 'yourpassword'
      }
    },
    message: {
      from: 'Pi Sensor Monitor <pi_sensor_mon@someserver.com>',
      to: 'youremail@gmail.com',
      subject: 'Sensor alert'
    }
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
  const mockTransport = {
    sendMail: jest.fn(() => Promise.resolve({ success: true }))
  }
  nodemailer.createTransport.mockImplementation(() => mockTransport)

  const emailAlert = email.create(MOCK_DEFN)
  return emailAlert.sendAlert({}, MOCK_ALERT)
    .then(() => {
      expect(nodemailer.createTransport.mock.calls.length).toBe(1)
      expect(nodemailer.createTransport.mock.calls[0][0]).toEqual(MOCK_DEFN.config.transport)
      expect(mockTransport.sendMail.mock.calls.length).toBe(1)
      expect(mockTransport.sendMail.mock.calls[0][0].html).toEqual('  <h2>Alert from Pi Sensor Monitor</h2>  <div style="font-size: 16px">    <p>    <b>some sensor (type=some sensor type condition=some cond type)</b><br>    Some alert<br>    <br>    <br>    <img src="cid:sensor_chart">   </div>')
      expect(mockTransport.sendMail.mock.calls[0][0].attachments.length).toEqual(1)
      expect(mockTransport.sendMail.mock.calls[0][0].attachments[0].filename).toEqual('sensor_chart.png')
      expect(mockTransport.sendMail.mock.calls[0][0].attachments[0].content).toBe(MOCK_ALERT.chartBuffer)
      expect(mockTransport.sendMail.mock.calls[0][0].attachments[0].cid).toEqual('sensor_chart')
      expect(mockTransport.sendMail.mock.calls[0][0].from).toEqual(MOCK_DEFN.config.message.from)
      expect(mockTransport.sendMail.mock.calls[0][0].to).toEqual(MOCK_DEFN.config.message.to)
      expect(mockTransport.sendMail.mock.calls[0][0].subject).toEqual(MOCK_DEFN.config.message.subject)
    })
})
