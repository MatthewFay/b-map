# betmap
Better Map()

`betmap` is a lightweight, dependency-free TypeScript package that enhances the functionality of the native JavaScript `Map` object. It seamlessly integrates with existing codebases, offering additional features and improved developer experience.

## Key Features

* **Small and Dependency-Free:** betmap is a lightweight package with no external dependencies, ensuring minimal impact on your project's size.
* **Plug-and-Play:** Easily replace your usage of Map() with BMap() (Better Map) without any hassle. BMap retains full compatibility with the standard Map object.
* **Type Safety:** Improved type safety by specifying data types for both keys and values, ensuring better code quality and early error detection.
* **Event System:** Subscribe to changes in your BMap through an event system.
* **Serialization:** Better serialization support using JSON.stringify()
* **Batch Operations:** Perform batch operations, such as batch set.
* **Querying and Filtering:** Utilize methods for querying and filtering.
* **Transformation:** Apply transformation functions to produce a new BMap
* **Sortable:** Sort map entries in place based on a custom comparison function. 
* **Map Merging:** Merge two maps, resolving conflicts based on a customizable merge strategy.

## Usage

Anywhere you want to use `Map()`, you can use `BMap()` instead. BMap supports everything a regular Map does, including specifying the data types for keys and values, providing better type safety.

```ts
const someMap = new Map();
someMap.set('id1', 0)

// Becomes..

import { BMap } from 'betmap'

const someMap = new BMap();
someMap.set('id1', 0)

// Typed keys and values, providing better type safety
const bmap = new BMap<string, number>()
bmap.set('vanilla', 0)
bmap.set('chocolate', 0)
```

### Batch Operations

Support for batch operations includes set, get, and delete operations.

```ts
// Batch set
bmap.bSet([['id1', 2], ['id2', 4], ['id3', 6]])

// Batch get - returns a new BMap with 'id1' and 'id2' entries
const bmap2 = bmap.bGet(['id1', 'id2'])

// Batch delete - bmap2 will now only contain 'id2' entry
bmap2.bDelete(['id1'])
```

### Event System

Subscribe to changes that happen to your BMap. This includes when entries are added, updated, or deleted. Register event listeners using the `on` method. When an event happens, the event listener will receive a new BMap containing the entries associated with the event.

```ts
// Register an event listener for when entries are added
bmap.on('add', (entries) => {
    // `entries` is a BMap containing added entries
})

// Register event listeners for when entries are updated or deleted
bmap.on('update', (entries) => {
    // `entries` is a BMap containing updated entries
}).on('delete', (entries) => {
    // `entries` is a BMap containing deleted entries
})

bmap.set('vanilla', 1) // Will fire add event
bmap.bSet([['chocolate', 0]]) // Will also fire add event
bmap.set('vanilla', 2) // Will fire update event
bmap.delete('vanilla') // Will fire delete event
bmap.clear() // Will also fire delete event (since there was an entry)
```

### Serialization

Unlike a regular Map, a BMap provides more meaningful serialization when using JSON.stringify().

```ts
const bmap = new BMap([['id1', { name: 'Acme' }], ['id2', { name: 'Acme #2' }]])

// `str` will be '[["id1",{"name":"Acme"}],["id2",{"name":"Acme #2"}]]'
const str = JSON.stringify(bmap)
```

### Querying and Filtering

BMap supports different methods for querying and filtering the map based on conditions, similar to those available for arrays.

```ts
const bmap = new BMap([[1, { color: 'red' }], [2, { color: 'blue' }]])

// `onlyBlue` will be a BMap containing just [2, { color: 'blue' }]
const onlyBlue = bmap.filter((key, value) => value.color === 'blue')

// `find` returns the key-value pair of the first element in the map where predicate is true, and undefined otherwise.
const firstRed = bmap.find((key, value) => value.color === 'red')

// `brown` will be undefined (no entry found)
const brown = bmap.find((key, value) => value.color === 'brown')

// Check if at least one key-value pair satisfies a condition.
const hasRed: boolean = bmap.some((key, value) => value.color === 'red')

// Check if every key-value pair satisfies a condition.
const everyKeyUnder3: boolean = bmap.every((key, value) => key < 3)
```

### Transformation

You can apply a transformation function to entries in a BMap, producing a new, transformed BMap.

```ts
const bmap = new BMap([['vanilla', 0], ['chocolate', 0]])

// Add 1 to each value using `mapValues`
const add1 = bmap.mapValues((key, value) => value + 1)

// Add a prefix to each key using `mapKeys`
const prefixed = bmap.mapKeys((key) => `id:${key}`)

// Transform both keys and values using `mapEntries`
const both = bmap.mapEntries((key, value) => [`id:${key}`, value + 1])
```

### Sortable

BMap supports sorting entries in place, using a custom compare function. You can sort using any logic, including by keys, values, or both.

```ts
const bmap = new BMap<number, string>([[2, 'def'], [1, 'abc']])

// Sort entries by key in ascending order.
// After sort: [[1, 'abc'], [2, 'def']]
bmap.sort((a, b) => a.key - b.key)

const cars = new BMap([[1, { sold: 500 }], [2, { sold: 50 }]])

// Sort by value in ascending order.
// After sort: [[2, { sold: 50 }], [1, { sold: 500 }]]
cars.sort((a, b) => a.value.sold - b.value.sold)
```

### Map Merging

Merge two maps, resolving conflicts based on a customizable merge strategy. The output of `merge` is the merged BMap.

```ts
const bmap = new BMap([[1, { ts: 100 }], [2, { ts: 200 }]])
const bmap2 = new BMap([[1, { ts: 150 }], [3, { ts: 300 }]])

// Merged BMap will contain value `{ ts: 150 }` for key 1
const merged = bmap.merge(bmap2, (key, existingValue, incomingValue) => {
    return incomingValue.ts > existingValue.ts ? incomingValue : existingValue
})
```

## Contributing Guide

I welcome all pull requests. Please make sure you add appropriate test cases for any features
added. Before opening a PR please make sure to run the following scripts:

- `npm run standard` checks for code errors and format according to [standard](https://github.com/standard/standard)
- `npm test` make sure all tests pass
