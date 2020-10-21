import {
  estimateAttackTimes,
  translateAttackTimes,
  guessesToScore,
} from '../src/TimeEstimates'
import translationsEn from '~/data/feedback/en'

// TODO add tests
describe('timeEstimates', () => {
  describe('estimateAttackTimes', () => {
    it('should be very weak', () => {
      const attackTimes = estimateAttackTimes(10)
      expect(attackTimes).toEqual({
        offlineFastHashing1e10PerSecond: 1e-9,
        offlineSlowHashing1e4PerSecond: 0.001,
        onlineThrottling10PerSecond: 1,
        onlineThrottling100PerHour: 360,
      })
    })

    it('should be weak', () => {
      const attackTimes = estimateAttackTimes(100000)
      expect(attackTimes).toEqual({
        offlineFastHashing1e10PerSecond: 0.00001,
        offlineSlowHashing1e4PerSecond: 10,
        onlineThrottling10PerSecond: 10000,
        onlineThrottling100PerHour: 3600000,
      })
    })

    it('should be good', () => {
      const attackTimes = estimateAttackTimes(10000000)
      expect(attackTimes).toEqual({
        offlineFastHashing1e10PerSecond: 0.001,
        offlineSlowHashing1e4PerSecond: 1000,
        onlineThrottling10PerSecond: 1000000,
        onlineThrottling100PerHour: 360000000,
      })
    })
    it('should be very good', () => {
      const attackTimes = estimateAttackTimes(1000000000)
      expect(attackTimes).toEqual({
        offlineFastHashing1e10PerSecond: 0.1,
        offlineSlowHashing1e4PerSecond: 100000,
        onlineThrottling10PerSecond: 100000000,
        onlineThrottling100PerHour: 36000000000,
      })
    })

    it('should be excellent', () => {
      const attackTimes = estimateAttackTimes(100000000000)
      expect(attackTimes).toEqual({
        offlineFastHashing1e10PerSecond: 10,
        offlineSlowHashing1e4PerSecond: 10000000,
        onlineThrottling10PerSecond: 10000000000,
        onlineThrottling100PerHour: 3600000000000,
      })
    })
  })

  describe('translateAttackTimes', () => {
    it('should be very weak', () => {
      const attackTimes = translateAttackTimes(
        {
          offlineFastHashing1e10PerSecond: 1e-9,
          offlineSlowHashing1e4PerSecond: 0.001,
          onlineThrottling10PerSecond: 1,
          onlineThrottling100PerHour: 360,
        },
        translationsEn,
      )
      expect(attackTimes).toEqual({
        offlineFastHashing1e10PerSecond: 'less than a second',
        offlineSlowHashing1e4PerSecond: 'less than a second',
        onlineThrottling10PerSecond: '1 second',
        onlineThrottling100PerHour: '6 minutes',
      })
    })

    it('should be weak', () => {
      const attackTimes = translateAttackTimes(
        {
          offlineFastHashing1e10PerSecond: 0.00001,
          offlineSlowHashing1e4PerSecond: 10,
          onlineThrottling10PerSecond: 10000,
          onlineThrottling100PerHour: 3600000,
        },
        translationsEn,
      )
      expect(attackTimes).toEqual({
        offlineFastHashing1e10PerSecond: 'less than a second',
        offlineSlowHashing1e4PerSecond: '10 seconds',
        onlineThrottling10PerSecond: '3 hours',
        onlineThrottling100PerHour: '1 month',
      })
    })

    it('should be good', () => {
      const attackTimes = translateAttackTimes(
        {
          offlineFastHashing1e10PerSecond: 0.001,
          offlineSlowHashing1e4PerSecond: 1000,
          onlineThrottling10PerSecond: 1000000,
          onlineThrottling100PerHour: 360000000,
        },
        translationsEn,
      )
      expect(attackTimes).toEqual({
        offlineFastHashing1e10PerSecond: 'less than a second',
        offlineSlowHashing1e4PerSecond: '17 minutes',
        onlineThrottling10PerSecond: '12 days',
        onlineThrottling100PerHour: '11 years',
      })
    })
    it('should be very good', () => {
      const attackTimes = translateAttackTimes(
        {
          offlineFastHashing1e10PerSecond: 0.1,
          offlineSlowHashing1e4PerSecond: 100000,
          onlineThrottling10PerSecond: 100000000,
          onlineThrottling100PerHour: 36000000000,
        },
        translationsEn,
      )
      expect(attackTimes).toEqual({
        offlineFastHashing1e10PerSecond: 'less than a second',
        offlineSlowHashing1e4PerSecond: '1 day',
        onlineThrottling10PerSecond: '3 years',
        onlineThrottling100PerHour: 'centuries',
      })
    })

    it('should be excellent', () => {
      const attackTimes = translateAttackTimes(
        {
          offlineFastHashing1e10PerSecond: 10,
          offlineSlowHashing1e4PerSecond: 10000000,
          onlineThrottling10PerSecond: 10000000000,
          onlineThrottling100PerHour: 3600000000000,
        },
        translationsEn,
      )
      expect(attackTimes).toEqual({
        offlineFastHashing1e10PerSecond: '10 seconds',
        offlineSlowHashing1e4PerSecond: '4 months',
        onlineThrottling10PerSecond: 'centuries',
        onlineThrottling100PerHour: 'centuries',
      })
    })
  })

  describe('guessesToScore', () => {
    it('should be very weak', () => {
      expect(guessesToScore(10)).toEqual(0)
    })

    it('should be weak', () => {
      expect(guessesToScore(100000)).toEqual(1)
    })

    it('should be good', () => {
      expect(guessesToScore(10000000)).toEqual(2)
    })

    it('should be very good', () => {
      expect(guessesToScore(1000000000)).toEqual(3)
    })

    it('should be excellent', () => {
      expect(guessesToScore(100000000000)).toEqual(4)
    })
  })
})
