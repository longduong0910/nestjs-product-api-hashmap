export type HashFunction<K> = (key: K) => number;

export type EqualsFunction<K> = (a: K, b: K) => boolean;

export interface HashmapOptions<K> {
  initialCapacity?: number;
  loadFactor?: number;
  hashFunction?: HashFunction<K>;
  equalsFunction?: EqualsFunction<K>;
}

export interface HashmapNode<K, V> {
  key: K;
  value: V;
  next: HashmapNode<K, V> | null;
}

export const HASHMAP_CONSTANTS = {
  DEFAULT_CAPACITY: 16,
  DEFAULT_LOAD_FACTOR: 0.75,
  RESIZE_MULTIPLIER: 2,
  MIN_CAPACITY: 1,
  HASH_PRIME: 5381,
  HASH_MULTIPLIER: 33,
  BOOLEAN_TRUE_HASH: 1231,
  BOOLEAN_FALSE_HASH: 1237,
} as const;