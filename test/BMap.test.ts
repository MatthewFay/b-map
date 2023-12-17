import { BMap } from '../src/BMap'

describe('test BMap', () => {
  describe('test serialization', () => {
    test('serializes correctly', () => {
      const bmap = new BMap()
      bmap.set(1, 2)
      bmap.set('test', 'test2')

      const actual = JSON.stringify(bmap)

      expect(actual).toStrictEqual('[[1,2],["test","test2"]]')
    })

    test('serializes correctly - 2', () => {
      const bmap = new BMap([['id1', { name: 'Acme' }], ['id2', { name: 'Acme #2' }]])

      const actual = JSON.stringify(bmap)

      expect(actual).toStrictEqual('[["id1",{"name":"Acme"}],["id2",{"name":"Acme #2"}]]')
    })
  })

  describe('test event system', () => {
    test('add event', () => {
      const bmap = new BMap()
      const listener = jest.fn()
      bmap.on('add', listener)

      bmap.set(1, 2)

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(expect.any(BMap))
      expect(listener.mock.lastCall[0].size).toBe(1)
      expect(listener.mock.lastCall[0].get(1)).toBe(2)
    })

    test('update event', () => {
      const bmap = new BMap()
      const listener = jest.fn()
      bmap.on('update', listener)

      bmap.set(1, 2)
      bmap.set(1, 3)

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(expect.any(BMap))
      expect(listener.mock.lastCall[0].size).toBe(1)
      expect(listener.mock.lastCall[0].get(1)).toBe(3)
    })

    test('delete event', () => {
      const bmap = new BMap()
      const listener = jest.fn()
      bmap.on('delete', listener)

      bmap.set(1, 2)
      bmap.delete(1)

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(expect.any(BMap))
      expect(listener.mock.lastCall[0].size).toBe(1)
      expect(listener.mock.lastCall[0].get(1)).toBe(2)
    })

    test('delete event when clear() called', () => {
      const bmap = new BMap()
      const listener = jest.fn()
      bmap.on('delete', listener)

      bmap.set(1, 2)
      bmap.set(2, 3)
      bmap.clear()

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(expect.any(BMap))
      expect(listener.mock.lastCall[0].size).toBe(2)
      expect(listener.mock.lastCall[0].get(1)).toBe(2)
      expect(listener.mock.lastCall[0].get(2)).toBe(3)
    })

    test('sort should not fire delete event', () => {
      const bmap = new BMap([[1, 2], [2, 3]])
      const listener = jest.fn()
      bmap.on('delete', listener)

      bmap.sort((a, b) => a.key - b.key)

      expect(listener).toHaveBeenCalledTimes(0)
    })

    test('sort should not fire add event', () => {
      const bmap = new BMap([[1, 2], [2, 3]])
      const listener = jest.fn()
      bmap.on('add', listener)

      bmap.sort((a, b) => a.key - b.key)

      expect(listener).toHaveBeenCalledTimes(0)
    })
  })

  describe('test batch operations', () => {
    test('batch set', () => {
      const bmap = new BMap()

      bmap.bSet([[1, 2], [3, 4]])

      expect(bmap.size).toBe(2)
      expect(bmap.get(1)).toBe(2)
      expect(bmap.get(3)).toBe(4)
    })

    test('batch set - 2', () => {
      const bmap = new BMap()

      bmap.bSet([['id1', 2], ['id2', 4]])

      expect(bmap.size).toBe(2)
      expect(bmap.get('id1')).toBe(2)
      expect(bmap.get('id2')).toBe(4)
    })

    test('batch get', () => {
      const bmap = new BMap([[1, 'test1'], [2, 'test2'], [3, 'test3']])

      const actual = bmap.bGet([2, 3])

      expect(actual.size).toBe(2)
      expect(actual.get(2)).toBe('test2')
      expect(actual.get(3)).toBe('test3')
    })

    test('batch get - 2', () => {
      const bmap = new BMap()
      bmap.bSet([['id1', 2], ['id2', 4], ['id3', 6]])

      const actual = bmap.bGet(['id1', 'id2'])

      expect(actual.size).toBe(2)
      expect(actual.get('id1')).toBe(2)
      expect(actual.get('id2')).toBe(4)
    })

    test('batch delete', () => {
      const bmap = new BMap([[1, 2], [3, 4], [5, 6]])

      bmap.bDelete([1, 5])

      expect(bmap.size).toBe(1)
      expect(bmap.get(3)).toBe(4)
    })
  })

  describe('test querying and filtering', () => {
    test('test filter', () => {
      const bmap = new BMap([[1, { test: 'hello' }], [2, { test: 'hi' }]])

      const actual = bmap.filter((key, value) => value.test === 'hi')

      expect(actual.size).toBe(1)
      expect(actual.get(2)).toStrictEqual({ test: 'hi' })
    })

    test('test find', () => {
      const bmap = new BMap([[1, { test: 'hello' }], [2, { test: 'hi' }]])

      const actual = bmap.find((key, value) => value.test === 'hi')

      expect(actual).toStrictEqual([2, { test: 'hi' }])
    })

    test('test find - not found', () => {
      const bmap = new BMap([[1, { test: 'hello' }], [2, { test: 'hi' }]])

      const actual = bmap.find((key, value) => value.test === 'hi2')

      expect(actual).toBe(undefined)
    })

    test('test some', () => {
      const bmap = new BMap([[1, { test: 'hello' }], [2, { test: 'hi' }]])

      const actual = bmap.some((key, value) => value.test === 'hi')

      expect(actual).toBe(true)
    })

    test('test some - should return false', () => {
      const bmap = new BMap([[1, { test: 'hello' }], [2, { test: 'hi' }]])

      const actual = bmap.some((key, value) => value.test === 'hi2')

      expect(actual).toBe(false)
    })

    test('test every', () => {
      const bmap = new BMap([[1, { test: 'hello' }], [2, { test: 'hi' }]])

      const actual = bmap.every((key, value) => key < 3)

      expect(actual).toBe(true)
    })

    test('test every - should return false', () => {
      const bmap = new BMap([[1, { test: 'hello' }], [2, { test: 'hi' }]])

      const actual = bmap.every((key, value) => key > 3)

      expect(actual).toBe(false)
    })
  })

  describe('test transformation', () => {
    describe('test mapEntries', () => {
      test('transform keys', () => {
        const bmap = new BMap([[1, 2], [3, 4]])

        const actual = bmap.mapEntries((key, value) => [key + 1, value])

        expect(actual.size).toBe(2)
        expect(actual.get(2)).toBe(2)
        expect(actual.get(4)).toBe(4)
      })

      test('transform values', () => {
        const bmap = new BMap([[1, 2], [3, 4]])

        const actual = bmap.mapEntries((key, value) => [key, value.toString()])

        expect(actual.size).toBe(2)
        expect(actual.get(1)).toBe('2')
        expect(actual.get(3)).toBe('4')
      })

      test('transform both keys and values', () => {
        const bmap = new BMap([[1, 2], [3, 4]])

        const actual = bmap.mapEntries((key, value) => [key * 10, { v: value }])

        expect(actual.size).toBe(2)
        expect(actual.get(10)).toStrictEqual({ v: 2 })
        expect(actual.get(30)).toStrictEqual({ v: 4 })
      })
    })

    describe('test mapValues', () => {
      test('transform values', () => {
        const bmap = new BMap([[1, 2], [3, 4]])

        const actual = bmap.mapValues((key, value) => value.toString())

        expect(actual.size).toBe(2)
        expect(actual.get(1)).toBe('2')
        expect(actual.get(3)).toBe('4')
      })
    })

    describe('test mapKeys', () => {
      test('transform keys', () => {
        const bmap = new BMap([[1, 2], [3, 4]])

        const actual = bmap.mapKeys((key) => key.toString())

        expect(actual.size).toBe(2)
        expect(actual.get('1')).toBe(2)
        expect(actual.get('3')).toBe(4)
      })
    })
  })

  describe('test sort', () => {
    test('sort keys in ascending order', () => {
      const bmap = new BMap<number, string | number>([[2, 2], [1, 'sd']])

      bmap.sort((a, b) => a.key - b.key)

      expect(bmap.size).toBe(2)
      expect(Array.from(bmap.entries())).toStrictEqual([[1, 'sd'], [2, 2]])
    })

    test('sort keys in descending order', () => {
      const bmap = new BMap<number, string | number>([[2, 2], [5, 0], [1, 'sd']])

      bmap.sort((a, b) => b.key - a.key)

      expect(bmap.size).toBe(3)
      expect(Array.from(bmap.entries())).toStrictEqual([[5, 0], [2, 2], [1, 'sd']])
    })

    test('sort values in ascending order', () => {
      const bmap = new BMap<number, number>([[0, 2], [1, 0]])

      bmap.sort((a, b) => a.value - b.value)

      expect(bmap.size).toBe(2)
      expect(Array.from(bmap.entries())).toStrictEqual([[1, 0], [0, 2]])
    })

    test('sort values in descending order', () => {
      const bmap = new BMap<number, number>([[0, 2], [1, 0], [2, 6]])

      bmap.sort((a, b) => b.value - a.value)

      expect(bmap.size).toBe(3)
      expect(Array.from(bmap.entries())).toStrictEqual([[2, 6], [0, 2], [1, 0]])
    })
  })

  describe('test merge', () => {
    test('custom merge strategy', () => {
      const bmap = new BMap([[1, { ts: 100 }], [2, { ts: 200 }]])
      const map = new Map([[1, { ts: 150 }], [3, { ts: 300 }]])

      const actual = bmap.merge(map, (key, existingValue, incomingValue) => {
        return incomingValue.ts > existingValue.ts ? incomingValue : existingValue
      })

      expect(actual.size).toBe(3)
      expect(actual.get(1)).toStrictEqual({ ts: 150 })
      expect(actual.get(2)).toStrictEqual({ ts: 200 })
      expect(actual.get(3)).toStrictEqual({ ts: 300 })
    })
  })
})
