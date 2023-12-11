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
  })

  describe('test batch operations', () => {
    test('batch set', () => {
      const bmap = new BMap()

      bmap.bSet([[1, 2], [3, 4]])
  
      expect(bmap.size).toBe(2)
      expect(bmap.get(1)).toBe(2)
      expect(bmap.get(3)).toBe(4)
    })

    test('batch delete', () => {
      const bmap = new BMap([[1, 2], [3, 4], [5, 6]])

      bmap.bDelete([1, 5])
  
      expect(bmap.size).toBe(1)
      expect(bmap.get(3)).toBe(4)
    })
  })
})
