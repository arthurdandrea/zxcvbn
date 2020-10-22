/* eslint-disable compat/compat */

import pretty from 'pretty-time'

import type {
  Options as TimeSharingOptions,
  TimeSharingContinuation,
  ZxcvbnResponse,
} from '../src/time-sharing'
import timeSharingZxcvbn from '../src/time-sharing'

type Options = Omit<TimeSharingOptions, 'idleDeadline'> & {
  delay?: number | 'nextTick' | 'setImmediate'
  profiling?: boolean
} & (
    | {
        timePerSlice?: never
        runsPerSlice?: number
      }
    | {
        runsPerSlice?: never
        timePerSlice?: number
      }
  )

function zxcvbn(
  password: string,
  {
    runsPerSlice,
    timePerSlice,
    delay = 0,
    profiling = false,
    ...options
  }: Options = {},
): Promise<ZxcvbnResponse> {
  if (runsPerSlice != null && runsPerSlice <= 0) {
    throw new Error('runsPerSlice has to be a positive number')
  }
  if (timePerSlice != null && timePerSlice <= 0) {
    throw new Error('timePerSlice has to be a positive number')
  }
  if (runsPerSlice == null && timePerSlice == null) {
    timePerSlice = 50
  }
  const schedule: (
    cb: (continuation: void | TimeSharingContinuation) => void,
    continuation?: TimeSharingContinuation,
  ) => void =
    delay === 'nextTick'
      ? process.nextTick
      : delay === 'setImmediate'
      ? setImmediate
      : (cb, continuation) => setTimeout(cb, delay, continuation)

  return new Promise((resolve, reject) => {
    const idleDeadline =
      runsPerSlice != null
        ? createIdleDeadlinePerSlice(runsPerSlice)
        : createIdleDeadlinePerTime(timePerSlice!)

    /* those three variables are only for profiling */
    const start = process.hrtime()
    const durations: [number, number][] = []
    let continuationStart: [number, number] | undefined

    function next(continuation: void | TimeSharingContinuation) {
      if (continuation) {
        idleDeadline.reset()
        if (profiling) {
          continuationStart = process.hrtime()
        }
        continuation = continuation()
        if (profiling && continuationStart) {
          durations.push(process.hrtime(continuationStart))
        }
      }
      if (continuation) {
        schedule(next, continuation)
      }
    }

    schedule(next, () =>
      timeSharingZxcvbn(
        password,
        { ...options, idleDeadline },
        (err, result) => {
          if (profiling) {
            if (continuationStart) {
              durations.push(process.hrtime(continuationStart))
              continuationStart = undefined
            }
            const elapsed = process.hrtime(start)
            // eslint-disable-next-line no-console
            console.log(
              `timeSharingZxcvbn(${JSON.stringify(password)}, ${JSON.stringify({
                delay,
                runsPerSlice,
                timePerSlice,
              })}) took ${pretty(
                elapsed,
              )} "wall time" in ${durations
                .map((duration) => pretty(duration))
                .join(', ')} slices`,
            )
          }
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        },
      ),
    )
  })
}

describe('time-sharing', () => {
  it('should check without userInputs', async () => {
    const result = await zxcvbn('test')
    expect(result).toMatchSnapshot('function')
  })

  it('should check with userInputs', async () => {
    const result = await zxcvbn('test', {
      userInputs: ['test', '12', 'true', '[]'],
    })
    expect(result).toMatchSnapshot('fun fun')
  })

  describe('password tests', () => {
    it(`should resolve concurrently`, async () => {
      await Promise.all(
        ([
          { password: '1q2w3e4r5t', options: { delay: 10, runsPerSlice: 1 } },
          {
            password: '1Q2w3e4r5t',
            options: { delay: 'nextTick', runsPerSlice: 1 },
          },
          { password: '1q2w3e4r5T', options: { delay: 0, runsPerSlice: 3 } },
          {
            password: 'abcdefg123',
            options: { delay: 'setImmediate', runsPerSlice: 1 },
          },
          { password: 'TESTERINO', options: { delay: 10, runsPerSlice: 2 } },
          { password: 'aaaaaaa', options: { delay: 0, timePerSlice: 50 } },
          { password: 'Daniel', options: { delay: 10, runsPerSlice: 4 } },
          {
            password: '1234qwer',
            options: { delay: 'nextTick', runsPerSlice: 2 },
          },
          { password: '1234qwe', options: { delay: 10, runsPerSlice: 1 } },
          { password: '1234qwert', options: { delay: 10, timePerSlice: 10 } },
          { password: 'password', options: { delay: 10, runsPerSlice: 3 } },
          { password: '2010abc', options: { delay: 10, runsPerSlice: 1 } },
          {
            password: 'abcabcabcabc',
            options: { delay: 'setImmediate', runsPerSlice: 1 },
          },
          { password: 'qwer', options: { delay: 10, runsPerSlice: 2 } },
          { password: 'P4$$w0rd', options: { delay: 0, runsPerSlice: 1 } },
          { password: 'aA!1', options: { delay: 10, runsPerSlice: 2 } },
          {
            password: 'dgo9dsghasdoghi8/!&IT/§(ihsdhf8o7o',
            options: { delay: 10, runsPerSlice: 1 },
          },
        ] as { password: string; options: Options }[]).map(
          async ({ password, options }) => {
            const result = await zxcvbn(password, {
              ...options,
              profiling: false,
            })
            expect(result).toMatchSnapshot(password)
          },
        ),
      )
    })
  })
})

function createIdleDeadlinePerSlice(runsPerSlice: number = 3) {
  return {
    count: 0,
    timeRemaining() {
      const i = this.count++
      return i >= runsPerSlice ? 0 : 50 - i * (50 / runsPerSlice)
    },
    reset() {
      this.count = 0
    },
  }
}

function createIdleDeadlinePerTime(timePerSlice: number) {
  return {
    start: Date.now(),
    timeRemaining() {
      return Math.max(0, timePerSlice - (Date.now() - this.start))
    },
    reset() {
      this.start = Date.now()
    },
  }
}
