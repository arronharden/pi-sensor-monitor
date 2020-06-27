const utils = require('../../src/utils')

test('InvokeOnSchedule multiple invocations after 200ms with fn success', (done) => {
  const fn = jest.fn(() => Promise.resolve())
  const inv = new utils.InvokeOnSchedule(fn, 10)
  inv.start()
  setTimeout(() => {
    inv.stop()
    expect(fn.mock.calls.length).toBeGreaterThanOrEqual(5)
    done()
  }, 200)
})

test('InvokeOnSchedule multiple invocations after 200ms with fn no return', (done) => {
  const fn = jest.fn()
  const inv = new utils.InvokeOnSchedule(fn, 10)
  inv.start()
  setTimeout(() => {
    inv.stop()
    expect(fn.mock.calls.length).toBeGreaterThanOrEqual(5)
    done()
  }, 200)
})

test('InvokeOnSchedule multiple invocations after 200ms with fn failure', (done) => {
  const fn = jest.fn(() => Promise.reject(new Error('some mock error')))
  const inv = new utils.InvokeOnSchedule(fn, 10)
  inv.start()
  setTimeout(() => {
    inv.stop()
    expect(fn.mock.calls.length).toBeGreaterThanOrEqual(5)
    done()
  }, 200)
})

test('InvokeOnSchedule no more invocations after stop', (done) => {
  const fn = jest.fn(() => new Promise((resolve) => {}))
  const inv = new utils.InvokeOnSchedule(fn, 10)
  inv.start()
  setTimeout(() => {
    inv.stop()
    const numCallsAfterStop = fn.mock.calls.length
    setTimeout(() => {
      expect(fn.mock.calls.length).toBeLessThanOrEqual(numCallsAfterStop + 1)
      done()
    }, 200)
  }, 200)
})

test('InvokeOnSchedule sleep first no invocations', (done) => {
  const fn = jest.fn(() => Promise.resolve())
  const inv = new utils.InvokeOnSchedule(fn, 1000)
  inv.start(true)
  setTimeout(() => {
    inv.stop()
    expect(fn.mock.calls.length).toEqual(0)
    done()
  }, 50)
})

test('InvokeOnSchedule sleep first with invocations', (done) => {
  const fn = jest.fn(() => Promise.resolve())
  const inv = new utils.InvokeOnSchedule(fn, 20)
  inv.start(true)
  setTimeout(() => {
    inv.stop()
    expect(fn.mock.calls.length).toBeGreaterThanOrEqual(5)
    done()
  }, 200)
})

test('invokeWithRetry success 1st time', () => {
  const fn = jest.fn(() => Promise.resolve(123))
  return utils.invokeWithRetry(fn, 3, 10)
    .then((res) => {
      expect(fn.mock.calls.length).toBe(1)
      expect(res).toEqual(123)
    })
})

test('invokeWithRetry no return', () => {
  const fn = jest.fn()
  return utils.invokeWithRetry(fn, 3, 10)
    .then((res) => {
      expect(fn.mock.calls.length).toBe(1)
      expect(res).toBeUndefined()
    })
})

test('invokeWithRetry fail always', () => {
  const fn = jest.fn(() => Promise.reject(new Error('some mock error')))
  return utils.invokeWithRetry(fn, 3, 10)
    .then(() => {
      // not expected to succeed
      expect(false).toBe(true)
    }, (err) => {
      expect(fn.mock.calls.length).toBe(3)
      expect(err.message).toEqual('some mock error')
    })
})

test('invokeWithRetry success on 3rd invocation', () => {
  const fn = jest.fn()
  fn.mockReturnValueOnce(Promise.reject(new Error('some mock error')))
    .mockReturnValueOnce(Promise.reject(new Error('some mock error')))
    .mockReturnValueOnce(Promise.resolve(123))
  return utils.invokeWithRetry(fn, 5, 10)
    .then((res) => {
      expect(fn.mock.calls.length).toBe(3)
      expect(res).toEqual(123)
    })
})

test('invokeWithTimeout success', () => {
  const fn = jest.fn(() => Promise.resolve(123))
  return utils.invokeWithTimeout(fn, 10)
    .then((res) => {
      expect(fn.mock.calls.length).toBe(1)
      expect(res).toEqual(123)
    })
})

test('invokeWithTimeout failure', () => {
  const fn = jest.fn(() => Promise.reject(new Error('some mock error')))
  return utils.invokeWithTimeout(fn, 10)
    .then(() => {
      // not expected to succeed
      expect(false).toBe(true)
    }, (err) => {
      expect(fn.mock.calls.length).toBe(1)
      expect(err.message).toEqual('some mock error')
    })
})

test('invokeWithTimeout timeout', () => {
  const fn = jest.fn(() => new Promise((resolve) => {}))
  return utils.invokeWithTimeout(fn, 10)
    .then(() => {
      // not expected to succeed
      expect(false).toBe(true)
    }, (err) => {
      expect(fn.mock.calls.length).toBe(1)
      expect(err.message).toEqual('Timeout after 10ms.')
    })
})

test('invokeWithTimeoutAndRetry success', () => {
  const fn = jest.fn(() => Promise.resolve(123))
  return utils.invokeWithTimeoutAndRetry(fn, 10, 3, 10)
    .then((res) => {
      expect(fn.mock.calls.length).toBe(1)
      expect(res).toEqual(123)
    })
})

test('invokeWithTimeoutAndRetry fail always', () => {
  const fn = jest.fn(() => Promise.reject(new Error('some mock error')))
  return utils.invokeWithTimeoutAndRetry(fn, 10, 3, 10)
    .then(() => {
      // not expected to succeed
      expect(false).toBe(true)
    }, (err) => {
      expect(fn.mock.calls.length).toBe(3)
      expect(err.message).toEqual('some mock error')
    })
})

test('invokeWithTimeoutAndRetry timeout always', () => {
  const fn = jest.fn(() => new Promise((resolve) => {}))
  return utils.invokeWithTimeoutAndRetry(fn, 10, 3, 10)
    .then(() => {
      // not expected to succeed
      expect(false).toBe(true)
    }, (err) => {
      expect(fn.mock.calls.length).toBe(3)
      expect(err.message).toEqual('Timeout after 10ms.')
    })
})
