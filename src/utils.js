
class InvokeOnSchedule {
  constructor (fn, periodMS, name) {
    this._fn = fn
    this._periodMS = periodMS
    this._name = name
  }

  _invoke () {
    this._timer = null
    this._stop = false
    return (this._fn() || Promise.resolve())
      .catch((err) => {
        // Log and continue to reschedule next invocation
        console.warn(`Caught error from scheduled invocation name='${this._name}'.`, err)
      })
      .then(() => {
        // Set another timer for the next invocation
        if (!this._done) {
          this._timer = setTimeout(() => this._invoke(), this._periodMS)
        }
      })
  }

  start (sleepFirst) {
    if (sleepFirst) {
      this._timer = setTimeout(() => this._invoke(), this._periodMS)
      return Promise.resolve()
    } else {
      return this._invoke()
    }
  }

  stop () {
    this._done = true
    if (this._timer) {
      clearTimeout(this._timer)
      delete this._timer
    }
    console.info(`Stopped schedule name='${this._name}'`)
  }
}

function _invokeWithRetry (fn, attemptNum, retryMaxAttempts, retryDelayMS) {
  return (fn() || Promise.resolve())
    .catch((err) => {
      // fn failed, if allowed retry again after waiting for the retryDelayMS
      if (attemptNum < retryMaxAttempts) {
        const nextAttemptNum = attemptNum + 1
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            _invokeWithRetry(fn, nextAttemptNum, retryMaxAttempts, retryDelayMS).then(resolve, reject)
          }, retryDelayMS)
        })
      }
      throw err
    })
}

function invokeWithTimeout (fn, timeoutMS) {
  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout after ${timeoutMS}ms.`))
    }, timeoutMS)
  })
  const fnProm = fn()
  return Promise.race([fnProm, timeoutPromise])
}

function invokeWithRetry (fn, retryMaxAttempts, retryDelayMS) {
  return _invokeWithRetry(fn, 1, retryMaxAttempts, retryDelayMS)
}

function invokeWithTimeoutAndRetry (fn, timeoutMS, retryMaxAttempts, retryDelayMS) {
  const fnWithTimeout = () => {
    return invokeWithTimeout(fn, timeoutMS)
  }
  return invokeWithRetry(fnWithTimeout, retryMaxAttempts, retryDelayMS)
}

module.exports = {
  InvokeOnSchedule,
  invokeWithRetry,
  invokeWithTimeout,
  invokeWithTimeoutAndRetry
}
