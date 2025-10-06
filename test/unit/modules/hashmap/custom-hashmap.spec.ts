import { CustomHashmap } from '../../../../src/modules/hashmap/custom-hashmap';
import { HASHMAP_CONSTANTS } from '../../../../src/modules/hashmap/types';

describe('CustomHashmap', () => {
  let hashmap: CustomHashmap<string, number>;

  beforeEach(() => {
    hashmap = new CustomHashmap<string, number>();
  });

  describe('Basic Operations', () => {
    it('should initialize with default capacity', () => {
      expect(hashmap.size).toBe(0);
    });

    it('should set and get values correctly', () => {
      hashmap.set('key1', 100);
      hashmap.set('key2', 200);

      expect(hashmap.get('key1')).toBe(100);
      expect(hashmap.get('key2')).toBe(200);
      expect(hashmap.size).toBe(2);
    });

    it('should return undefined for non-existent keys', () => {
      expect(hashmap.get('nonexistent')).toBeUndefined();
    });

    it('should update existing keys', () => {
      hashmap.set('key1', 100);
      hashmap.set('key1', 150);

      expect(hashmap.get('key1')).toBe(150);
      expect(hashmap.size).toBe(1);
    });

    it('should check key existence', () => {
      hashmap.set('key1', 100);

      expect(hashmap.has('key1')).toBe(true);
      expect(hashmap.has('nonexistent')).toBe(false);
    });

    it('should delete keys correctly', () => {
      hashmap.set('key1', 100);
      hashmap.set('key2', 200);

      expect(hashmap.delete('key1')).toBe(true);
      expect(hashmap.delete('nonexistent')).toBe(false);
      expect(hashmap.has('key1')).toBe(false);
      expect(hashmap.has('key2')).toBe(true);
      expect(hashmap.size).toBe(1);
    });

    it('should clear all entries', () => {
      hashmap.set('key1', 100);
      hashmap.set('key2', 200);

      hashmap.clear();

      expect(hashmap.size).toBe(0);
      expect(hashmap.has('key1')).toBe(false);
      expect(hashmap.has('key2')).toBe(false);
    });
  });

  describe('Collection Methods', () => {
    beforeEach(() => {
      hashmap.set('a', 1);
      hashmap.set('b', 2);
      hashmap.set('c', 3);
    });

    it('should return all keys', () => {
      const keys = hashmap.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
    });

    it('should return all values', () => {
      const values = hashmap.values();
      expect(values).toHaveLength(3);
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
    });

    it('should return all entries', () => {
      const entries = hashmap.entries();
      expect(entries).toHaveLength(3);
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
      expect(entries).toContainEqual(['c', 3]);
    });

    it('should iterate with forEach', () => {
      const mockCallback = jest.fn();

      hashmap.forEach(mockCallback);

      expect(mockCallback).toHaveBeenCalledTimes(3);
      expect(mockCallback).toHaveBeenCalledWith(1, 'a');
      expect(mockCallback).toHaveBeenCalledWith(2, 'b');
      expect(mockCallback).toHaveBeenCalledWith(3, 'c');
    });
  });

  describe('Collision Handling', () => {
    it('should handle hash collisions correctly', () => {
      // Create a hashmap with small capacity to force collisions
      const smallHashmap = new CustomHashmap<string, number>({
        initialCapacity: 2,
      });

      // Add multiple items that might collide
      smallHashmap.set('key1', 100);
      smallHashmap.set('key2', 200);
      smallHashmap.set('key3', 300);
      smallHashmap.set('key4', 400);

      expect(smallHashmap.get('key1')).toBe(100);
      expect(smallHashmap.get('key2')).toBe(200);
      expect(smallHashmap.get('key3')).toBe(300);
      expect(smallHashmap.get('key4')).toBe(400);
      expect(smallHashmap.size).toBe(4);
    });

    it('should delete correctly in collision chains', () => {
      const smallHashmap = new CustomHashmap<string, number>({
        initialCapacity: 2,
      });

      smallHashmap.set('key1', 100);
      smallHashmap.set('key2', 200);
      smallHashmap.set('key3', 300);

      expect(smallHashmap.delete('key2')).toBe(true);
      expect(smallHashmap.has('key1')).toBe(true);
      expect(smallHashmap.has('key2')).toBe(false);
      expect(smallHashmap.has('key3')).toBe(true);
      expect(smallHashmap.size).toBe(2);
    });
  });

  describe('Custom Options', () => {
    it('should use custom initial capacity', () => {
      const customHashmap = new CustomHashmap<string, number>({
        initialCapacity: 100,
      });

      expect(customHashmap.size).toBe(0);
      // Capacity is private, but we can test behavior
      customHashmap.set('test', 1);
      expect(customHashmap.get('test')).toBe(1);
    });

    it('should use custom hash function', () => {
      const customHashFunction = jest.fn(() => 42);
      const customHashmap = new CustomHashmap<string, number>({
        hashFunction: customHashFunction,
      });

      customHashmap.set('test', 100);
      expect(customHashFunction).toHaveBeenCalledWith('test');
      expect(customHashmap.get('test')).toBe(100);
    });

    it('should use custom equals function', () => {
      const customEquals = jest.fn((a: string, b: string) => 
        a.toLowerCase() === b.toLowerCase()
      );
      
      const customHashmap = new CustomHashmap<string, number>({
        equalsFunction: customEquals,
      });

      customHashmap.set('Test', 100);
      expect(customHashmap.get('TEST')).toBe(100);
      expect(customEquals).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should throw error for undefined keys', () => {
      expect(() => {
        hashmap.set(undefined as any, 100);
      }).toThrow('Key cannot be undefined');
    });

    it('should handle different key types', () => {
      const mixedHashmap = new CustomHashmap<any, string>();

      mixedHashmap.set('string', 'value1');
      mixedHashmap.set(123, 'value2');
      mixedHashmap.set(true, 'value3');

      expect(mixedHashmap.get('string')).toBe('value1');
      expect(mixedHashmap.get(123)).toBe('value2');
      expect(mixedHashmap.get(true)).toBe('value3');
      expect(mixedHashmap.size).toBe(3);
    });

    it('should handle large number of entries', () => {
      const entries = 1000;
      
      for (let i = 0; i < entries; i++) {
        hashmap.set(`key${i}`, i);
      }

      expect(hashmap.size).toBe(entries);
      
      // Test some random entries
      expect(hashmap.get('key500')).toBe(500);
      expect(hashmap.get('key999')).toBe(999);
      expect(hashmap.has('key250')).toBe(true);
    });
  });

  describe('Resizing', () => {
    it('should resize when load factor is exceeded', () => {
      const smallHashmap = new CustomHashmap<string, number>({
        initialCapacity: 4,
        loadFactor: 0.75,
      });

      // Add items to exceed load factor (4 * 0.75 = 3)
      smallHashmap.set('key1', 1);
      smallHashmap.set('key2', 2);
      smallHashmap.set('key3', 3);
      smallHashmap.set('key4', 4); // This should trigger resize

      // All items should still be accessible
      expect(smallHashmap.get('key1')).toBe(1);
      expect(smallHashmap.get('key2')).toBe(2);
      expect(smallHashmap.get('key3')).toBe(3);
      expect(smallHashmap.get('key4')).toBe(4);
      expect(smallHashmap.size).toBe(4);
    });
  });
});