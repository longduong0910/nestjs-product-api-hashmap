import { HashUtils } from '../../../../src/modules/hashmap/hash-utils';

describe('HashUtils', () => {
  describe('defaultHash', () => {
    it('should hash numbers correctly', () => {
      const hash1 = HashUtils.defaultHash(123);
      const hash2 = HashUtils.defaultHash(456);
      const hash3 = HashUtils.defaultHash(123); // Same number

      expect(typeof hash1).toBe('number');
      expect(typeof hash2).toBe('number');
      expect(hash1).not.toBe(hash2);
      expect(hash1).toBe(hash3); // Same input should produce same hash
    });

    it('should hash strings correctly', () => {
      const hash1 = HashUtils.defaultHash('hello');
      const hash2 = HashUtils.defaultHash('world');
      const hash3 = HashUtils.defaultHash('hello'); // Same string

      expect(typeof hash1).toBe('number');
      expect(typeof hash2).toBe('number');
      expect(hash1).not.toBe(hash2);
      expect(hash1).toBe(hash3); // Same input should produce same hash
    });

    it('should hash booleans correctly', () => {
      const hashTrue = HashUtils.defaultHash(true);
      const hashFalse = HashUtils.defaultHash(false);
      const hashTrue2 = HashUtils.defaultHash(true);

      expect(typeof hashTrue).toBe('number');
      expect(typeof hashFalse).toBe('number');
      expect(hashTrue).not.toBe(hashFalse);
      expect(hashTrue).toBe(hashTrue2);
    });

    it('should hash objects correctly', () => {
      const obj1 = { name: 'John', age: 30 };
      const obj2 = { name: 'Jane', age: 25 };
      const obj3 = { name: 'John', age: 30 }; // Same content

      const hash1 = HashUtils.defaultHash(obj1);
      const hash2 = HashUtils.defaultHash(obj2);
      const hash3 = HashUtils.defaultHash(obj3);

      expect(typeof hash1).toBe('number');
      expect(typeof hash2).toBe('number');
      expect(hash1).not.toBe(hash2);
      expect(hash1).toBe(hash3); // Same content should produce same hash
    });

    it('should handle empty strings', () => {
      const hash = HashUtils.defaultHash('');
      expect(typeof hash).toBe('number');
      expect(hash).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero', () => {
      const hash = HashUtils.defaultHash(0);
      expect(typeof hash).toBe('number');
      expect(hash).toBeGreaterThanOrEqual(0);
    });

    it('should handle special characters in strings', () => {
      const hash1 = HashUtils.defaultHash('hello@#$%');
      const hash2 = HashUtils.defaultHash('hello@#$%');
      const hash3 = HashUtils.defaultHash('hello@#$&');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
    });

    it('should handle long strings', () => {
      const longString = 'a'.repeat(1000);
      const hash = HashUtils.defaultHash(longString);
      
      expect(typeof hash).toBe('number');
      expect(hash).toBeGreaterThanOrEqual(0);
    });

    it('should handle Unicode characters', () => {
      const hash1 = HashUtils.defaultHash('héllo wørld');
      const hash2 = HashUtils.defaultHash('héllo wørld');
      const hash3 = HashUtils.defaultHash('hello world');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
    });
  });

  describe('getBucketIndex', () => {
    it('should return valid bucket index within capacity', () => {
      const capacity = 16;
      const keys = ['test1', 'test2', 'test3', 42, true, { id: 1 }];

      keys.forEach(key => {
        const index = HashUtils.getBucketIndex(key, capacity);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(capacity);
      });
    });

    it('should use custom hash function when provided', () => {
      const customHashFunction = jest.fn(() => 5);
      const capacity = 10;
      
      const index = HashUtils.getBucketIndex('test', capacity, customHashFunction);
      
      expect(customHashFunction).toHaveBeenCalledWith('test');
      expect(index).toBe(5);
    });

    it('should handle negative hash values from custom function', () => {
      const customHashFunction = () => -10;
      const capacity = 8;
      
      const index = HashUtils.getBucketIndex('test', capacity, customHashFunction);
      
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(capacity);
    });

    it('should distribute keys across buckets', () => {
      const capacity = 8;
      const keys = Array.from({ length: 100 }, (_, i) => `key${i}`);
      const bucketCounts = new Array(capacity).fill(0);

      keys.forEach(key => {
        const index = HashUtils.getBucketIndex(key, capacity);
        bucketCounts[index]++;
      });

      // Check that keys are distributed (not all in one bucket)
      const nonEmptyBuckets = bucketCounts.filter(count => count > 0).length;
      expect(nonEmptyBuckets).toBeGreaterThan(1);
    });

    it('should be consistent for same key', () => {
      const capacity = 16;
      const key = 'consistent-key';

      const index1 = HashUtils.getBucketIndex(key, capacity);
      const index2 = HashUtils.getBucketIndex(key, capacity);
      const index3 = HashUtils.getBucketIndex(key, capacity);

      expect(index1).toBe(index2);
      expect(index2).toBe(index3);
    });

    it('should handle different capacity sizes', () => {
      const key = 'test-key';
      const capacities = [1, 2, 4, 8, 16, 32, 64, 128];

      capacities.forEach(capacity => {
        const index = HashUtils.getBucketIndex(key, capacity);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(capacity);
      });
    });
  });

  describe('Hash Distribution', () => {
    it('should provide reasonable distribution for string keys', () => {
      const capacity = 16;
      const keys = [
        'apple', 'banana', 'cherry', 'date', 'elderberry',
        'fig', 'grape', 'honeydew', 'kiwi', 'lemon',
        'mango', 'nectarine', 'orange', 'papaya', 'quince'
      ];

      const bucketCounts = new Array(capacity).fill(0);

      keys.forEach(key => {
        const index = HashUtils.getBucketIndex(key, capacity);
        bucketCounts[index]++;
      });

      // Check that distribution is reasonable (not all keys in few buckets)
      const maxBucketCount = Math.max(...bucketCounts);
      const totalKeys = keys.length;
      const averagePerBucket = totalKeys / capacity;

      // Max bucket shouldn't have too many more than average
      expect(maxBucketCount).toBeLessThanOrEqual(averagePerBucket * 3);
    });

    it('should handle collision-prone keys', () => {
      const capacity = 4;
      const collisionProneKeys = ['aa', 'bb', 'cc', 'dd', 'ee'];

      const indices = collisionProneKeys.map(key => 
        HashUtils.getBucketIndex(key, capacity)
      );

      // Even with collision-prone keys, should still produce valid indices
      indices.forEach(index => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(capacity);
      });
    });
  });
});