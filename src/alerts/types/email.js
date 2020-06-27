const nodemailer = require('nodemailer')
const { BasePlugin } = require('../../plugins')

function _getHTML (alertToSend) {
  // eslint-disable-next--line
  const html = `\
  <h2>Alert from Pi Sensor Monitor</h2>\
  <div style="font-size: 16px">\
    <p>\
    <b>${alertToSend.alias} (type=${alertToSend.type} condition=${alertToSend.condition.type})</b><br>\
    ${alertToSend.message}<br>\
    <br>\
    <br>\
    <img src="cid:sensor_chart"> \
  </div>`
  return html
}

class EMailAlert extends BasePlugin {
  constructor (definition) {
    super(definition)
    this._transporter = nodemailer.createTransport(this._definition.config.transport)
  }

  sendAlert (pluginWraper, alertToSend) {
    const sendMailConfig = Object.assign(
      {
        html: _getHTML(alertToSend),
        attachments: [
          {
            filename: 'sensor_chart.png',
            content: alertToSend.chartBuffer,
            cid: 'sensor_chart'
          }
        ]
      }, this._definition.config.message)
    return this._transporter.sendMail(sendMailConfig)
      .then((info) => {
        console.log(`Message sent info=${JSON.stringify(info)}`)
      })
  }
}

module.exports = {
  EMailAlert,
  create: (definition) => new EMailAlert(definition)
}
