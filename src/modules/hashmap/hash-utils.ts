import { HASHMAP_CONSTANTS } from './types';

export class HashUtils {
  static defaultHash<K>(key: K): number {
    const keyType = typeof key;
    
    switch (keyType) {
      case 'number':
        return HashUtils.hashNumber(key as unknown as number);
      case 'string':
        return HashUtils.hashString(key as unknown as string);
      case 'boolean':
        return HashUtils.hashBoolean(key as unknown as boolean);
      default:
        return HashUtils.hashObject(key);
    }
  }

  private static hashNumber(num: number): number {
    const n = num | 0; 
    return (n ^ (n >>> 16)) >>> 0;
  }

  private static hashString(str: string): number {
    let hash: number = HASHMAP_CONSTANTS.HASH_PRIME;
    
    for (let i = 0; i < str.length; i++) {
      hash = (hash * HASHMAP_CONSTANTS.HASH_MULTIPLIER) + str.charCodeAt(i);
      hash = hash | 0;
    }
    
    return hash >>> 0;
  }

  private static hashBoolean(bool: boolean): number {
    return bool 
      ? HASHMAP_CONSTANTS.BOOLEAN_TRUE_HASH 
      : HASHMAP_CONSTANTS.BOOLEAN_FALSE_HASH;
  }

  private static hashObject<K>(key: K): number {
    try {
      return HashUtils.hashString(JSON.stringify(key));
    } catch {
      return HashUtils.hashString(String(key));
    }
  }

  static getBucketIndex<K>(
    key: K, 
    capacity: number, 
    hashFunction?: (key: K) => number
  ): number {
    const hash = hashFunction 
      ? Math.abs(hashFunction(key) | 0) 
      : HashUtils.defaultHash(key);
    
    return hash % capacity;
  }
}