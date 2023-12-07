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
})
