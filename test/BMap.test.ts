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
      expect(listener).toHaveBeenCalledWith(1, 2)
    })

    test('update event', () => {
      const bmap = new BMap()
      const listener = jest.fn()
      bmap.on('update', listener)

      bmap.set(1, 2)
      bmap.set(1, 3)

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(1, 3)
    })

    test('delete event', () => {
      const bmap = new BMap()
      const listener = jest.fn()
      bmap.on('delete', listener)

      bmap.set(1, 2)
      bmap.delete(1)

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(1, 2)
    })
  })
})
