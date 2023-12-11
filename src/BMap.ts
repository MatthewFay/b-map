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
}
