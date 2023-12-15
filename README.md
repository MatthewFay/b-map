# betmap
Better Map()

* Small (no dependencies)
* Can be plugged in and used anywhere you use regular Map()
* Event system to subscribe to changes
* Serialization using JSON.stringify()
* Batch operations
* Querying and filtering
* Transformation
* Sortable
* Map merging

## Usage

Anywhere you want to use a Map(), you can use a BMap() instead.

```ts
const someMap = new Map();
someMap.set('id1', 0)

// becomes..

import { BMap } from 'betmap'
const someMap = new BMap();
someMap.set('id1', 0)
```

### Batch operations

Currently supports batch get, set, and delete operations.

```ts
// batch set
bmap.bSet([['id1', 2], ['id2', 4], ['id3', 6]])

// batch get - returns a new BMap with 'id1' and 'id2'
const bmap2 = bmap.bGet(['id1', 'id2'])

// batch delete - bmap2 will now only contain 'id2'
bmap2.bDelete(['id1'])
```

### Event system

You can subscribe to changes that happen to a BMap. This includes when an entry is added, updated, or deleted.

```ts

```

## Contributing Guide

I welcome all pull requests. Please make sure you add appropriate test cases for any features
added. Before opening a PR please make sure to run the following scripts:

- `npm run standard` checks for code errors and format according to [standard](https://github.com/standard/standard)
- `npm test` make sure all tests pass
