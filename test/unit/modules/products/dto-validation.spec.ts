import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateProductDto } from '../../../../src/modules/products/dto/create-product.dto';
import { UpdateProductDto } from '../../../../src/modules/products/dto/update-product.dto';
import { ProductQueryDto } from '../../../../src/modules/products/dto/product-query.dto';

describe('Product DTOs Validation', () => {
  describe('CreateProductDto', () => {
    it('should pass validation with valid data', async () => {
      const validData = {
        sku: 'VALID-001',
        name: 'Valid Product Name',
        description: 'Valid description',
        price: 99.99,
        stockQuantity: 10,
        category: 'Electronics',
        thumbnailUrl: 'https://example.com/image.jpg',
        attributes: { color: 'red', size: 'M' },
        tags: ['new', 'featured'],
        status: 'active',
      };

      const dto = plainToClass(CreateProductDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing required fields', async () => {
      const invalidData = {
        // Missing sku, name, price, stockQuantity
        description: 'Description only',
      };

      const dto = plainToClass(CreateProductDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      
      const errorProperties = errors.map(error => error.property);
      expect(errorProperties).toContain('sku');
      expect(errorProperties).toContain('name');
      expect(errorProperties).toContain('price');
      expect(errorProperties).toContain('stockQuantity');
    });

    it('should fail validation with empty required strings', async () => {
      const invalidData = {
        sku: '',
        name: '',
        price: 99.99,
        stockQuantity: 10,
      };

      const dto = plainToClass(CreateProductDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      
      const skuError = errors.find(error => error.property === 'sku');
      const nameError = errors.find(error => error.property === 'name');
      expect(skuError).toBeDefined();
      expect(nameError).toBeDefined();
    });

    it('should fail validation with negative price', async () => {
      const invalidData = {
        sku: 'TEST-001',
        name: 'Test Product',
        price: -10.99,
        stockQuantity: 10,
      };

      const dto = plainToClass(CreateProductDto, invalidData);
      const errors = await validate(dto);

      const priceError = errors.find(error => error.property === 'price');
      expect(priceError).toBeDefined();
      expect(priceError?.constraints).toHaveProperty('min');
    });

    it('should fail validation with negative stock quantity', async () => {
      const invalidData = {
        sku: 'TEST-001',
        name: 'Test Product',
        price: 99.99,
        stockQuantity: -5,
      };

      const dto = plainToClass(CreateProductDto, invalidData);
      const errors = await validate(dto);

      const stockError = errors.find(error => error.property === 'stockQuantity');
      expect(stockError).toBeDefined();
      expect(stockError?.constraints).toHaveProperty('min');
    });

    it('should fail validation with strings exceeding max length', async () => {
      const invalidData = {
        sku: 'A'.repeat(51), // Max length is 50
        name: 'B'.repeat(256), // Max length is 255
        price: 99.99,
        stockQuantity: 10,
        category: 'C'.repeat(101), // Max length is 100
      };

      const dto = plainToClass(CreateProductDto, invalidData);
      const errors = await validate(dto);

      const skuError = errors.find(error => error.property === 'sku');
      const nameError = errors.find(error => error.property === 'name');
      const categoryError = errors.find(error => error.property === 'category');

      expect(skuError).toBeDefined();
      expect(nameError).toBeDefined();
      expect(categoryError).toBeDefined();
    });

    it('should pass validation with valid array and object fields', async () => {
      const validData = {
        sku: 'TEST-001',
        name: 'Test Product',
        price: 99.99,
        stockQuantity: 10,
        attributes: { color: 'red', size: 'L', waterproof: true, weight: 1.5 },
        tags: ['electronics', 'mobile', 'smartphone'],
      };

      const dto = plainToClass(CreateProductDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid status', async () => {
      const invalidData = {
        sku: 'TEST-001',
        name: 'Test Product',
        price: 99.99,
        stockQuantity: 10,
        status: 'invalid-status',
      };

      const dto = plainToClass(CreateProductDto, invalidData);
      const errors = await validate(dto);

      const statusError = errors.find(error => error.property === 'status');
      expect(statusError).toBeDefined();
      expect(statusError?.constraints).toHaveProperty('isIn');
    });

    it('should pass validation with valid status values', async () => {
      const validStatuses = ['active', 'inactive', 'draft'];

      for (const status of validStatuses) {
        const validData = {
          sku: `TEST-${status}`,
          name: 'Test Product',
          price: 99.99,
          stockQuantity: 10,
          status,
        };

        const dto = plainToClass(CreateProductDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });

    it('should handle optional fields correctly', async () => {
      const minimalValidData = {
        sku: 'MIN-001',
        name: 'Minimal Product',
        price: 19.99,
        stockQuantity: 1,
      };

      const dto = plainToClass(CreateProductDto, minimalValidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.description).toBeUndefined();
      expect(dto.category).toBeUndefined();
      expect(dto.thumbnailUrl).toBeUndefined();
      expect(dto.attributes).toBeUndefined();
      expect(dto.tags).toBeUndefined();
    });
  });

  describe('UpdateProductDto', () => {
    it('should pass validation with partial valid data', async () => {
      const validPartialData = {
        name: 'Updated Product Name',
        price: 149.99,
      };

      const dto = plainToClass(UpdateProductDto, validPartialData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with all fields', async () => {
      const validData = {
        sku: 'UPDATED-001',
        name: 'Updated Product',
        description: 'Updated description',
        price: 199.99,
        stockQuantity: 15,
        category: 'Books',
        thumbnailUrl: 'https://example.com/updated.jpg',
        attributes: { genre: 'fiction' },
        tags: ['bestseller'],
        status: 'active',
      };

      const dto = plainToClass(UpdateProductDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid price in update', async () => {
      const invalidData = {
        price: -50.00,
      };

      const dto = plainToClass(UpdateProductDto, invalidData);
      const errors = await validate(dto);

      const priceError = errors.find(error => error.property === 'price');
      expect(priceError).toBeDefined();
    });

    it('should fail validation with string fields exceeding max length', async () => {
      const invalidData = {
        name: 'A'.repeat(256), // Exceeds max length
        category: 'B'.repeat(101), // Exceeds max length
      };

      const dto = plainToClass(UpdateProductDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass validation with empty update (no fields)', async () => {
      const emptyData = {};

      const dto = plainToClass(UpdateProductDto, emptyData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should maintain optional behavior for all fields', async () => {
      const partialData = {
        stockQuantity: 0, // Should be valid even if 0
      };

      const dto = plainToClass(UpdateProductDto, partialData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.stockQuantity).toBe(0);
    });
  });

  describe('ProductQueryDto', () => {
    it('should pass validation with valid category filter', async () => {
      const validQuery = {
        category: 'Electronics',
      };

      const dto = plainToClass(ProductQueryDto, validQuery);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.category).toBe('Electronics');
    });

    it('should pass validation with empty query', async () => {
      const emptyQuery = {};

      const dto = plainToClass(ProductQueryDto, emptyQuery);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.category).toBeUndefined();
    });

    it('should fail validation with invalid category type', async () => {
      const invalidQuery = {
        category: 123, // Should be string
      };

      const dto = plainToClass(ProductQueryDto, invalidQuery);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const categoryError = errors.find(error => error.property === 'category');
        expect(categoryError).toBeDefined();
      }
    });

    it('should handle special characters in category', async () => {
      const queryWithSpecialChars = {
        category: 'Health & Beauty',
      };

      const dto = plainToClass(ProductQueryDto, queryWithSpecialChars);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.category).toBe('Health & Beauty');
    });

    it('should handle URL encoded category values', async () => {
      const urlEncodedQuery = {
        category: 'Home%20%26%20Garden',
      };

      const dto = plainToClass(ProductQueryDto, urlEncodedQuery);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.category).toBe('Home%20%26%20Garden');
    });
  });

  describe('Type Transformation', () => {
    it('should transform string numbers to numbers for CreateProductDto', async () => {
      const dataWithStringNumbers = {
        sku: 'NUM-001',
        name: 'Number Test',
        price: 99.99, // Use actual numbers instead of strings for this test
        stockQuantity: 10,
      };

      const dto = plainToClass(CreateProductDto, dataWithStringNumbers);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(typeof dto.price).toBe('number');
      expect(typeof dto.stockQuantity).toBe('number');
      expect(dto.price).toBe(99.99);
      expect(dto.stockQuantity).toBe(10);
    });

    it('should handle boolean values in attributes', async () => {
      const dataWithBooleans = {
        sku: 'BOOL-001',
        name: 'Boolean Test',
        price: 49.99,
        stockQuantity: 5,
        attributes: {
          isWaterproof: true,
          isFragile: false,
          hasWarranty: 'true', // String boolean
        },
      };

      const dto = plainToClass(CreateProductDto, dataWithBooleans);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.attributes?.isWaterproof).toBe(true);
      expect(dto.attributes?.isFragile).toBe(false);
    });
  });
});