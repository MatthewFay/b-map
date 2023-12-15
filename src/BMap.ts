/**
 * Event types
 */
export type BMapEventType = 'add' | 'update' | 'delete'

/**
 * Event listener. `entries` contains the added/updated/deleted entries.
 */
export type BMapListener<K, V> = (entries: BMap<K, V>) => void

/**
 * Better Map()
 */
export class BMap<K, V> extends Map<K, V> {
  private readonly _listeners: Map<BMapEventType, Array<BMapListener<K, V>>> = new Map()

  /**
   * Custom serialization function
   */
  toJSON (): Array<[K, V]> {
    // Convert Map to array of key-value pairs
    const mapArray = Array.from(this.entries())
    return mapArray
  }

  /**
   * Register listener
   */
  on (event: BMapEventType, listener: BMapListener<K, V>): this {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, [])
    }
    this._listeners.get(event)?.push(listener)
    return this
  }

  /**
   * Notify subscribers
   */
  private _notify (event: BMapEventType, entries: BMap<K, V>): void {
    const eventListeners = this._listeners.get(event)
    if (eventListeners != null) {
      eventListeners.forEach((listener) => listener(entries))
    }
  }

  /**
   * Set key-value, return whether it's new.
   */
  private _set (key: K, value: V): boolean {
    const isNewKey = !this.has(key)
    super.set(key, value)
    return isNewKey
  }

  set (key: K, value: V): this {
    const isNewKey = this._set(key, value)
    if (this._listeners?.size > 0) {
      this._notify(isNewKey ? 'add' : 'update', new BMap([[key, value]]))
    }
    return this
  }

  /**
   * Batch add/update entries
   */
  bSet (entries: Array<[K, V]>): this {
    const newEntries: Array<[K, V]> = []
    const updatedEntries: Array<[K, V]> = []
    entries.forEach(([key, value]) => this._set(key, value) ? newEntries.push([key, value]) : updatedEntries.push([key, value]))
    if (newEntries.length > 0) {
      this._notify('add', new BMap(newEntries))
    }
    if (updatedEntries.length > 0) {
      this._notify('update', new BMap(updatedEntries))
    }
    return this
  }

  /**
   * Batch get multiple entries from the BMap.
   * @param keys An array of keys to retrieve.
   * @returns A new BMap containing the requested entries.
   */
  bGet (keys: K[]): BMap<K, V> {
    const result = new BMap<K, V>()

    for (const key of keys) {
      if (this.has(key)) {
        result.set(key, this.get(key) as V)
      }
    }

    return result
  }

  /**
   * Delete by key. Returns deleted entry if key existed
   */
  private _delete (key: K): [K, V] | undefined {
    if (this.has(key)) {
      const value = this.get(key) as V
      super.delete(key)
      return [key, value]
    }
    return undefined
  }

  delete (key: K): boolean {
    const entry = this._delete(key)
    if (entry != null) {
      this._notify('delete', new BMap([[key, entry[1]]]))
      return true
    }
    return false
  }

  /**
   * Batch delete entries by key
   */
  bDelete (keys: K[]): boolean[] {
    const deletedEntries: Array<[K, V]> = []
    const result = keys.map(key => {
      const entry = this._delete(key)
      if (entry != null) {
        deletedEntries.push(entry)
        return true
      }
      return false
    })
    if (deletedEntries.length > 0) {
      this._notify('delete', new BMap(deletedEntries))
    }
    return result
  }

  clear (): void {
    const entries = new BMap(this)
    super.clear()
    if (entries.size > 0) {
      this._notify('delete', entries)
    }
  }

  /**
   * Filter the map based on a predicate function.
   * @param predicate A function that determines whether a key-value pair should be included.
   * @returns A new BMap containing the filtered key-value pairs.
   */
  filter (predicate: (key: K, value: V) => boolean): BMap<K, V> {
    const filteredEntries: Array<[K, V]> = []

    for (const [key, value] of this.entries()) {
      if (predicate(key, value)) {
        filteredEntries.push([key, value])
      }
    }

    return new BMap(filteredEntries)
  }

  /**
   * Returns the key-value pair of the first element in the map where predicate is true, and undefined otherwise.
   * @param predicate A function that returns true for the first matching key-value pair.
   * @returns The first matching key-value pair, or undefined if none is found.
   */
  find (predicate: (key: K, value: V) => boolean): [K, V] | undefined {
    for (const [key, value] of this.entries()) {
      if (predicate(key, value)) {
        return [key, value]
      }
    }

    return undefined
  }

  /**
   * Check if at least one key-value pair satisfies a condition.
   * @param predicate A function that returns true for a matching key-value pair.
   * @returns True if at least one matching key-value pair is found, false otherwise.
   */
  some (predicate: (key: K, value: V) => boolean): boolean {
    return this.find(predicate) !== undefined
  }

  /**
   * Check if every key-value pair satisfies a condition.
   * @param predicate A function that returns true for a matching key-value pair.
   * @returns True if every key-value pair matches the condition, false otherwise.
   */
  every (predicate: (key: K, value: V) => boolean): boolean {
    for (const [key, value] of this.entries()) {
      if (!predicate(key, value)) {
        return false
      }
    }
    return true
  }

  /**
   * Map over the entries of the BMap and apply a transformation function.
   * @param callback A function that transforms each key/value.
   * @returns A new BMap with transformed entries.
   */
  mapEntries<K2, V2>(callback: (key: K, value: V, map: BMap<K, V>) => [K2, V2]): BMap<K2, V2> {
    const newMap = new BMap<K2, V2>()

    for (const [key, value] of this.entries()) {
      const [transformedKey, transformedValue] = callback(key, value, this)
      newMap.set(transformedKey, transformedValue)
    }

    return newMap
  }

  /**
   * Map over the values of the BMap and apply a transformation function.
   * @param callback A function that transforms each value.
   * @returns A new BMap with transformed values.
   */
  mapValues<V2>(callback: (key: K, value: V, map: BMap<K, V>) => V2): BMap<K, V2> {
    return this.mapEntries((key, value) => ([key, callback(key, value, this)]))
  }

  /**
   * Map over the keys of the BMap and apply a transformation function.
   * @param callback A function that transforms each key.
   * @returns A new BMap with transformed keys.
   */
  mapKeys<K2>(callback: (key: K, value: V, map: BMap<K, V>) => K2): BMap<K2, V> {
    return this.mapEntries((key, value) => ([callback(key, value, this), value]))
  }

  /**
   * Sort the entries of the BMap in place.
   * @param compareFunction A function that defines the sort order.
   * @returns The sorted BMap.
   */
  sort (compareFunction: (a: { key: K, value: V }, b: { key: K, value: V }) => number): BMap<K, V> {
    const sortedEntries = Array.from(this.entries()).sort((a, b) => compareFunction({ key: a[0], value: a[1] }, { key: b[0], value: b[1] }))

    // Clear the current map. Using `super` instead of `this` so that we don't fire a delete event.
    super.clear()

    // Populate the map with the sorted entries
    for (const [key, value] of sortedEntries) {
      // Using `super` instead of `this` so that we don't fire an add event.
      super.set(key, value)
    }

    return this
  }

  /**
   * Merge two maps, resolving conflicts based on a customizable merge strategy.
   * @param otherMap The map to merge into the current map.
   * @param mergeStrategy A function that defines the merge strategy for conflicts.
   * @returns The merged BMap.
   */
  merge (otherMap: Map<K, V>, mergeStrategy: (key: K, existingValue: V, incomingValue: V) => V): BMap<K, V> {
    const mergedMap = new BMap<K, V>(this)

    for (const [key, incomingValue] of otherMap.entries()) {
      if (mergedMap.has(key)) {
        const existingValue = mergedMap.get(key) as V
        const newValue = mergeStrategy(key, existingValue, incomingValue)
        mergedMap.set(key, newValue)
      } else {
        mergedMap.set(key, incomingValue)
      }
    }

    return mergedMap
  }
}
