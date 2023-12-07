/**
 * Event types
 */
type EventType = 'add' | 'update' | 'delete'

/**
 * Better Map()
 */
export class BMap<K, V> extends Map<K, V> {
  private readonly listeners: Map<EventType, Function[]> = new Map()

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
  on (event: EventType, callback: (key: K, value: V) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(callback)
  }

  /**
   * Notify subscribers
   */
  private notify (event: EventType, key: K, value: V): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners != null) {
      eventListeners.forEach((listener) => listener(key, value))
    }
  }

  set (key: K, value: V): this {
    const isNewKey = !this.has(key)
    super.set(key, value)
    if (isNewKey) {
      this.notify('add', key, value)
    } else {
      this.notify('update', key, value)
    }
    return this
  }

  delete (key: K): boolean {
    if (this.has(key)) {
      const value = this.get(key)
      super.delete(key)
      this.notify('delete', key, value as V)
      return true
    }
    return false
  }
}
