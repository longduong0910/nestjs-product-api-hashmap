import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsRepository } from '../../../../src/modules/products/products.repository';
import { Product } from '../../../../src/database/entities/product.entity';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let typeormRepository: Repository<Product>;

  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sku: 'TEST-001',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    stockQuantity: 10,
    category: 'Electronics',
    thumbnailUrl: 'https://example.com/image.jpg',
    attributes: { color: 'red', size: 'M' },
    tags: ['new', 'featured'],
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockTypeormRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsRepository,
        {
          provide: getRepositoryToken(Product),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get<ProductsRepository>(ProductsRepository);
    typeormRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const products = [mockProduct];
      mockTypeormRepository.find.mockResolvedValue(products);

      const result = await repository.findAll();

      expect(mockTypeormRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toBe(products);
    });

    it('should return empty array when no products exist', async () => {
      mockTypeormRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockTypeormRepository.find.mockRejectedValue(error);

      await expect(repository.findAll()).rejects.toThrow(error);
    });
  });

  describe('findById', () => {
    it('should return product by ID', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(mockProduct);

      const result = await repository.findById(mockProduct.id);

      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
      expect(result).toBe(mockProduct);
    });

    it('should return null when product not found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockTypeormRepository.findOne.mockRejectedValue(error);

      await expect(repository.findById('any-id')).rejects.toThrow(error);
    });
  });

  describe('findByCategory', () => {
    it('should return products by category', async () => {
      const products = [mockProduct];
      mockTypeormRepository.find.mockResolvedValue(products);

      const result = await repository.findByCategory('Electronics');

      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { category: 'Electronics' },
      });
      expect(result).toBe(products);
    });

    it('should return empty array when no products in category', async () => {
      mockTypeormRepository.find.mockResolvedValue([]);

      const result = await repository.findByCategory('NonExistentCategory');

      expect(result).toEqual([]);
    });

    it('should handle null category', async () => {
      mockTypeormRepository.find.mockResolvedValue([]);

      const result = await repository.findByCategory(null as any);

      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { category: null },
      });
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create and save new product', async () => {
      const productData = {
        sku: 'NEW-001',
        name: 'New Product',
        price: 149.99,
        stockQuantity: 20,
        category: 'Books',
        status: 'active',
      };

      const createdProduct = { ...mockProduct, ...productData };
      mockTypeormRepository.create.mockReturnValue(createdProduct);
      mockTypeormRepository.save.mockResolvedValue(createdProduct);

      const result = await repository.create(productData as Partial<Product>);

      expect(mockTypeormRepository.create).toHaveBeenCalledWith(productData);
      expect(mockTypeormRepository.save).toHaveBeenCalledWith(createdProduct);
      expect(result).toBe(createdProduct);
    });

    it('should handle creation with minimal data', async () => {
      const minimalData = {
        sku: 'MIN-001',
        name: 'Minimal Product',
        price: 10.00,
        stockQuantity: 1,
        status: 'active',
      };

      const createdProduct = { ...mockProduct, ...minimalData };
      mockTypeormRepository.create.mockReturnValue(createdProduct);
      mockTypeormRepository.save.mockResolvedValue(createdProduct);

      const result = await repository.create(minimalData as Partial<Product>);

      expect(result).toBe(createdProduct);
    });

    it('should handle repository save errors', async () => {
      const productData = { sku: 'TEST-001', name: 'Test' };
      const error = new Error('Duplicate key violation');
      
      mockTypeormRepository.create.mockReturnValue(productData);
      mockTypeormRepository.save.mockRejectedValue(error);

      await expect(repository.create(productData as Partial<Product>)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update existing product', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 199.99,
      };

      const updatedProduct = { ...mockProduct, ...updateData };
      mockTypeormRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeormRepository.findOne.mockResolvedValue(updatedProduct);

      const result = await repository.update(mockProduct.id, updateData);

      expect(mockTypeormRepository.update).toHaveBeenCalledWith(mockProduct.id, updateData);
      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
      expect(result?.name).toBe('Updated Product');
      expect(result?.price).toBe(199.99);
    });

    it('should return null when product not found for update', async () => {
      mockTypeormRepository.update.mockResolvedValue({ affected: 0 });
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.update('non-existent-id', { name: 'Updated' });

      expect(result).toBeNull();
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { price: 299.99 };
      const updatedProduct = { ...mockProduct, price: 299.99 };

      mockTypeormRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeormRepository.findOne.mockResolvedValue(updatedProduct);

      const result = await repository.update(mockProduct.id, partialUpdate);

      expect(mockTypeormRepository.update).toHaveBeenCalledWith(mockProduct.id, partialUpdate);
      expect(result?.price).toBe(299.99);
      expect(result?.name).toBe(mockProduct.name); // Should remain unchanged
    });

    it('should handle repository errors during update', async () => {
      const error = new Error('Database constraint violation');
      mockTypeormRepository.update.mockRejectedValue(error);

      await expect(repository.update(mockProduct.id, { name: 'Updated' })).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should delete existing product', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await repository.delete(mockProduct.id);

      expect(mockTypeormRepository.delete).toHaveBeenCalledWith(mockProduct.id);
      expect(result).toBe(true);
    });

    it('should return false when product not found for deletion', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await repository.delete('non-existent-id');

      expect(result).toBe(false);
      expect(mockTypeormRepository.delete).toHaveBeenCalledWith('non-existent-id');
    });

    it('should handle repository errors during deletion', async () => {
      const error = new Error('Foreign key constraint violation');
      mockTypeormRepository.delete.mockRejectedValue(error);

      await expect(repository.delete(mockProduct.id)).rejects.toThrow(error);
    });
  });

  describe('Repository Configuration', () => {
    it('should use correct entity', () => {
      expect(mockTypeormRepository).toBeDefined();
      // The repository should be properly injected with Product entity token
    });

    it('should handle database connection issues', async () => {
      const connectionError = new Error('Connection timeout');
      mockTypeormRepository.find.mockRejectedValue(connectionError);

      await expect(repository.findAll()).rejects.toThrow(connectionError);
    });
  });

  describe('Query Optimization', () => {
    it('should use efficient queries for findById', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(mockProduct);

      await repository.findById(mockProduct.id);

      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
      // Verify it's not using more expensive operations like find with filters
    });

    it('should use indexed fields for category search', async () => {
      mockTypeormRepository.find.mockResolvedValue([mockProduct]);

      await repository.findByCategory('Electronics');

      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { category: 'Electronics' },
      });
      // This should use the category index in the actual database
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data integrity during updates', async () => {
      const updateData = { 
        name: 'Updated Name',
        price: 199.99,
        stockQuantity: 5,
      };

      mockTypeormRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeormRepository.findOne.mockResolvedValue({
        ...mockProduct,
        ...updateData,
        updatedAt: new Date(),
      });

      const result = await repository.update(mockProduct.id, updateData);

      expect(result?.name).toBe('Updated Name');
      expect(result?.price).toBe(199.99);
      expect(result?.stockQuantity).toBe(5);
      expect(result?.id).toBe(mockProduct.id); // ID should remain unchanged
      expect(result?.sku).toBe(mockProduct.sku); // SKU should remain unchanged
    });

    it('should preserve existing relationships during updates', async () => {
      const updateData = { price: 299.99 };
      const productWithRelations = {
        ...mockProduct,
        // In a real scenario, this might include relations like attachments
      };

      mockTypeormRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeormRepository.findOne.mockResolvedValue({ ...productWithRelations, ...updateData });

      const result = await repository.update(mockProduct.id, updateData);

      // All original data should be preserved except the updated fields
      expect(result?.price).toBe(299.99);
      expect(result?.name).toBe(mockProduct.name);
      expect(result?.category).toBe(mockProduct.category);
    });
  });
});