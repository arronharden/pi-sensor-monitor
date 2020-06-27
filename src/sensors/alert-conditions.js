const sqlite3Client = require('../persistence/sqlite3-client')
const chartBuilder = require('./chart-builder')

const DEFAULT_SNOOZE_INTERVAL_SECS = 60 * 60 // 1 hour

function _evaluateAlertCondition (alias, type, condition) {
  if (!condition.type) {
    return Promise.reject(new Error(`Invalid alert condition (no type) for sensor alias='${alias}', cond=${JSON.stringify(condition)}`))
  }
  if (condition.type === 'max_temp_must_exceed_value_in_last_N_hours') {
    if (!condition.lastNHours || !condition.maxTempToExceed) {
      return Promise.reject(new Error(`Invalid alert condition (missing parameters) for sensor alias='${alias}', cond=${JSON.stringify(condition)}`))
    }
    const now = new Date()
    const toDate = now.toISOString()
    const dataReadFromDate = (new Date(now.getTime() - (60 * 60 * 1000 * 2 * condition.lastNHours))).toISOString()
    const alertCondFromDate = (new Date(now.getTime() - (60 * 60 * 1000 * condition.lastNHours))).toISOString()
    return sqlite3Client.querySensorMeasurementsWithinInterval(alias, dataReadFromDate, toDate)
      .then((res) => {
        if (res.length > 0) {
          const maxTempInLastNHours = Math.max(...res.map(measurement => measurement.timestamp >= alertCondFromDate ? measurement.temperature : 0), 0)
          if (maxTempInLastNHours < condition.maxTempToExceed) {
            console.debug(`Alert criteria met for condition type ${condition.type}, maxTempToExceed=${condition.maxTempToExceed}, maxTempInLastNHours=${maxTempInLastNHours}`)
            return chartBuilder.createTemperatureChartStream(alias, 2 * condition.lastNHours, res)
              .then((chartBuffer) => {
                return {
                  message: `Maximum temperature in the last ${condition.lastNHours} hours was only ${maxTempInLastNHours} but should have exceeded ${condition.maxTempToExceed}.`,
                  alias,
                  type,
                  condition,
                  chartBuffer
                }
              })
          }
        }
      })
  } else if (condition.type === 'at_least_one_measurement_in_last_N_secs') {
    if (!condition.lastNSecs) {
      return Promise.reject(new Error(`Invalid alert condition (missing parameters) for sensor alias='${alias}', cond=${JSON.stringify(condition)}`))
    }
    const now = new Date()
    const toDate = now.toISOString()
    const fromDate = (new Date(now.getTime() - (1000 * condition.lastNSecs))).toISOString()
    return sqlite3Client.querySensorMeasurementsWithinInterval(alias, fromDate, toDate)
      .then((res) => {
        if (res.length === 0) {
          return {
            message: `No measurements recorded in the last ${condition.lastNSecs} seconds.`,
            alias,
            type,
            condition
          }
        }
      })
  } else {
    return Promise.reject(new Error(`Unknown alert condition type for sensor alias='${alias}', cond=${JSON.stringify(condition)}`))
  }
}

module.exports.evaluateAlertConditions = (alias, type, alertConditions, sendAlertsFn) => {
  const proms = []
  if (alertConditions && sendAlertsFn) {
    alertConditions.forEach((cond) => {
      const prom = _evaluateAlertCondition(alias, type, cond)
        .then((alertToSend) => {
          if (alertToSend) {
            // check if alerts are snoozed
            const now = new Date()
            const snoozeUntil = cond.snoozeUntil || now
            if (snoozeUntil.getTime() <= now.getTime()) {
              // no longer snoozing, allow alert to be sent
              const snoozeIntervalMS = 1000 * (cond.snoozeIntervalSecs || DEFAULT_SNOOZE_INTERVAL_SECS)
              cond.snoozeUntil = new Date(now.getTime() + snoozeIntervalMS)
              console.info(`Snoozing further alerts for sensor alias='${alias}' condition type='${cond.type}' until ${cond.snoozeUntil.toISOString()} or the sensor is no longer in alert state.`)
              return alertToSend
            }
          } else if (cond.snoozeUntil) {
            // not in alert condition so clear snooze
            console.info(`Clearing alert snooze for sensor alias='${alias}' condition type='${cond.type}' as no longer in alert state.`)
            delete cond.snoozeUntil
          }
        })
      proms.push(prom)
    })
    return Promise.all(proms)
      .then((alertsToSend) => {
        const nonEmptyAlertsToSend = alertsToSend.filter((alertToSend) => alertToSend)
        if (nonEmptyAlertsToSend.length > 0) {
          return sendAlertsFn(nonEmptyAlertsToSend)
        }
      })
  }
}
