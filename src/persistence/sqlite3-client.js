const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')
const path = require('path')

let appConfig

function _openDB (mode) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(appConfig.sqlite3.database, mode, (err) => {
      if (err) {
        console.warn(`Error opening database: ${err}`, err)
        reject(err)
        return
      }
      resolve(db)
    })
  })
}

function _closeDB (db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.warn(`Error closing database: ${err}`, err)
        reject(err)
        return
      }
      resolve()
    })
  })
}

function _querySQL (sql, params) {
  return _openDB(sqlite3.OPEN_READONLY).then((db) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, function (err, rows) {
        if (err) {
          console.warn(`Error running SQL. err=${err}, sql=${sql}, params=${params}`, err)
          reject(err)
          return
        }
        resolve(rows)
      })
    }).finally(() => _closeDB(db))
  })
}

function _runSQL (mode, sql, params) {
  return _openDB(mode).then((db) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) {
          console.warn(`Error running SQL. err=${err}, sql=${sql}, params=${params}`, err)
          reject(err)
          return
        }
        resolve(this.changes)
      })
    }).finally(() => _closeDB(db))
  })
}

module.exports.init = function (_appConfig) {
  appConfig = _appConfig
  if (!appConfig || !appConfig.sqlite3) {
    return Promise.reject(new Error('No sqlite3 config defined'))
  }
  console.log(`Using sqlite3 config ${JSON.stringify(appConfig.sqlite3)}`)
  const reqAttrs = ['tableName', 'database']
  reqAttrs.forEach((attr) => {
    if (!appConfig.sqlite3[attr]) {
      return Promise.reject(new Error(`Missing required attribute ${attr} in sqlite3 config`))
    }
  })

  const dir = path.dirname(appConfig.sqlite3.database)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  const CREATE_TABLE = `create table if not exists ${appConfig.sqlite3.tableName} (id integer primary key, alias text, type text, timestamp text, temperature numeric, humidity numeric, pressure numeric);`
  return _runSQL(sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, CREATE_TABLE)
    .then((res) => {
      if (res) {
        console.log(`Create table successful, sql=${CREATE_TABLE}, res=${res}`)
      } else {
        console.log(`Create table not required, res=${res}`)
      }
      return res
    })
}

module.exports.insertSensorMeasurement = function (data) {
  const values = [data.alias, data.type, data.timestamp, data.temperature, data.humidity, data.pressure]
  const INSERT_ROW = `INSERT INTO ${appConfig.sqlite3.tableName}(alias, type, timestamp, temperature, humidity, pressure) VALUES(?, ?, ?, ?, ?, ?)`
  return _runSQL(sqlite3.OPEN_READWRITE, INSERT_ROW, values)
    .then((res) => {
      console.log(`Wrote measurement data=${JSON.stringify(data)}, res=${res}`)
      return res
    })
}

module.exports.querySensorMeasurementsWithinInterval = function (alias, fromDate, toDate) {
  const SELECT_DATA = `SELECT * FROM ${appConfig.sqlite3.tableName} WHERE timestamp >= '${fromDate}' AND timestamp <= '${toDate}' AND alias = '${alias}' ORDER BY timestamp ASC`
  return _querySQL(SELECT_DATA)
    .then((res) => {
      // console.debug(`Query result sql=${SELECT_DATA}, res=${JSON.stringify(res)}`)
      return res
    })
}
