import {
  HashmapOptions,
  HashmapNode,
  HashFunction,
  EqualsFunction,
  HASHMAP_CONSTANTS,
} from './types';
import { HashUtils } from './hash-utils';

export class CustomHashmap<K, V> {
  private buckets: Array<HashmapNode<K, V> | null>;
  private _size = 0;
  private capacity: number;
  private readonly loadFactor: number;
  private readonly hashFunction?: HashFunction<K>;
  private readonly equalsFunction: EqualsFunction<K>;

  constructor(options?: HashmapOptions<K>) {
    this.capacity = Math.max(
      HASHMAP_CONSTANTS.MIN_CAPACITY,
      options?.initialCapacity ?? HASHMAP_CONSTANTS.DEFAULT_CAPACITY,
    );
    this.loadFactor = options?.loadFactor ?? HASHMAP_CONSTANTS.DEFAULT_LOAD_FACTOR;
    this.hashFunction = options?.hashFunction;
    this.equalsFunction = options?.equalsFunction ?? ((a, b) => a === b);

    this.buckets = new Array(this.capacity).fill(null);
  }

  get size(): number {
    return this._size;
  }

  set(key: K, value: V): void {
    this.validateKey(key);

    const bucketIndex = this.getBucketIndex(key);
    const existingNode = this.findNodeInBucket(bucketIndex, key);

    if (existingNode) {
      existingNode.value = value;
      return;
    }

    this.insertNewNode(bucketIndex, key, value);
    this.resizeIfNeeded();
  }

  get(key: K): V | undefined {
    const node = this.findNode(key);
    return node?.value;
  }

  has(key: K): boolean {
    return this.findNode(key) !== null;
  }

  delete(key: K): boolean {
    const bucketIndex = this.getBucketIndex(key);
    return this.deleteFromBucket(bucketIndex, key);
  }

  clear(): void {
    this.buckets = new Array(this.capacity).fill(null);
    this._size = 0;
  }

  keys(): K[] {
    const keys: K[] = [];
    this.forEachNode(node => keys.push(node.key));
    return keys;
  }

  values(): V[] {
    const values: V[] = [];
    this.forEachNode(node => values.push(node.value));
    return values;
  }

  entries(): Array<[K, V]> {
    const entries: Array<[K, V]> = [];
    this.forEachNode(node => entries.push([node.key, node.value]));
    return entries;
  }

  forEach(callback: (value: V, key: K) => void): void {
    this.forEachNode(node => callback(node.value, node.key));
  }

  private validateKey(key: K): void {
    if (key === undefined) {
      throw new Error('Key cannot be undefined');
    }
  }

  private getBucketIndex(key: K): number {
    return HashUtils.getBucketIndex(key, this.capacity, this.hashFunction);
  }

  private findNode(key: K): HashmapNode<K, V> | null {
    const bucketIndex = this.getBucketIndex(key);
    return this.findNodeInBucket(bucketIndex, key);
  }

  private findNodeInBucket(bucketIndex: number, key: K): HashmapNode<K, V> | null {
    let currentNode = this.buckets[bucketIndex];

    while (currentNode) {
      if (this.equalsFunction(currentNode.key, key)) {
        return currentNode;
      }
      currentNode = currentNode.next;
    }

    return null;
  }

  private insertNewNode(bucketIndex: number, key: K, value: V): void {
    const newNode: HashmapNode<K, V> = {
      key,
      value,
      next: this.buckets[bucketIndex],
    };

    this.buckets[bucketIndex] = newNode;
    this._size++;
  }

  private deleteFromBucket(bucketIndex: number, key: K): boolean {
    let currentNode = this.buckets[bucketIndex];
    let previousNode: HashmapNode<K, V> | null = null;

    while (currentNode) {
      if (this.equalsFunction(currentNode.key, key)) {
        if (previousNode) {
          previousNode.next = currentNode.next;
        } else {
          this.buckets[bucketIndex] = currentNode.next;
        }
        this._size--;
        return true;
      }

      previousNode = currentNode;
      currentNode = currentNode.next;
    }

    return false;
  }

  private resizeIfNeeded(): void {
    if (this._size / this.capacity > this.loadFactor) {
      this.resize(this.capacity * HASHMAP_CONSTANTS.RESIZE_MULTIPLIER);
    }
  }

  private resize(newCapacity: number): void {
    const oldBuckets = this.buckets;

    this.capacity = Math.max(HASHMAP_CONSTANTS.MIN_CAPACITY, Math.floor(newCapacity));
    this.buckets = new Array(this.capacity).fill(null);
    this._size = 0;

    this.rehashAllNodes(oldBuckets);
  }

  private rehashAllNodes(oldBuckets: Array<HashmapNode<K, V> | null>): void {
    for (const bucket of oldBuckets) {
      let currentNode = bucket;

      while (currentNode) {
        this.insertNodeWithoutResize(currentNode.key, currentNode.value);
        currentNode = currentNode.next;
      }
    }
  }

  private insertNodeWithoutResize(key: K, value: V): void {
    const bucketIndex = this.getBucketIndex(key);
    this.insertNewNode(bucketIndex, key, value);
  }

  private forEachNode(callback: (node: HashmapNode<K, V>) => void): void {
    for (const bucket of this.buckets) {
      let currentNode = bucket;

      while (currentNode) {
        callback(currentNode);
        currentNode = currentNode.next;
      }
    }
  }
}
