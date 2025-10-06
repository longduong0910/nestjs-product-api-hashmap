import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../../../../src/modules/products/products.service';
import { ProductsRepository } from '../../../../src/modules/products/products.repository';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from '../../../../src/modules/products/dto';
import { Product } from '../../../../src/database/entities/product.entity';
import { IProduct } from '../../../../src/modules/products/interfaces';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: ProductsRepository;

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

  const mockProductsRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCategory: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<ProductsRepository>(ProductsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products when no category filter', async () => {
      const products = [mockProduct];
      mockProductsRepository.findAll.mockResolvedValue(products);

      const query: ProductQueryDto = {};
      const result = await service.findAll(query);

      expect(mockProductsRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockProductsRepository.findByCategory).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockProduct.id,
        name: mockProduct.name,
        sku: mockProduct.sku,
        price: mockProduct.price,
        category: mockProduct.category,
      });
    });

    it('should return filtered products when category is provided', async () => {
      const products = [mockProduct];
      mockProductsRepository.findByCategory.mockResolvedValue(products);

      const query: ProductQueryDto = { category: 'Electronics' };
      const result = await service.findAll(query);

      expect(mockProductsRepository.findByCategory).toHaveBeenCalledWith('Electronics');
      expect(mockProductsRepository.findAll).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no products found', async () => {
      mockProductsRepository.findAll.mockResolvedValue([]);

      const query: ProductQueryDto = {};
      const result = await service.findAll(query);

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return product when found', async () => {
      mockProductsRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.findById(mockProduct.id);

      expect(mockProductsRepository.findById).toHaveBeenCalledWith(mockProduct.id);
      expect(result).toMatchObject({
        id: mockProduct.id,
        name: mockProduct.name,
        sku: mockProduct.sku,
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      const nonExistentId = 'non-existent-id';
      mockProductsRepository.findById.mockResolvedValue(null);

      await expect(service.findById(nonExistentId)).rejects.toThrow(
        new NotFoundException(`Product with ID ${nonExistentId} not found`)
      );

      expect(mockProductsRepository.findById).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('create', () => {
    it('should create and return new product', async () => {
      const createDto: CreateProductDto = {
        sku: 'NEW-001',
        name: 'New Product',
        description: 'New Description',
        price: 149.99,
        stockQuantity: 20,
        category: 'Books',
        thumbnailUrl: 'https://example.com/new.jpg',
        attributes: { genre: 'fiction' },
        tags: ['bestseller'],
        status: 'active',
      };

      const createdProduct = { ...mockProduct, ...createDto };
      mockProductsRepository.create.mockResolvedValue(createdProduct);

      const result = await service.create(createDto);

      expect(mockProductsRepository.create).toHaveBeenCalledWith(createDto);
      expect(result).toMatchObject({
        sku: createDto.sku,
        name: createDto.name,
        price: createDto.price,
      });
    });
  });

  describe('update', () => {
    it('should update and return product when found', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 199.99,
      };

      const updatedProduct = { ...mockProduct, ...updateDto };
      mockProductsRepository.update.mockResolvedValue(updatedProduct);

      const result = await service.update(mockProduct.id, updateDto);

      expect(mockProductsRepository.update).toHaveBeenCalledWith(mockProduct.id, updateDto);
      expect(result).toMatchObject({
        id: mockProduct.id,
        name: 'Updated Product',
        price: 199.99,
      });
    });

    it('should throw NotFoundException when product not found for update', async () => {
      const nonExistentId = 'non-existent-id';
      const updateDto: UpdateProductDto = { name: 'Updated Name' };
      
      mockProductsRepository.update.mockResolvedValue(null);

      await expect(service.update(nonExistentId, updateDto)).rejects.toThrow(
        new NotFoundException(`Product with ID ${nonExistentId} not found`)
      );

      expect(mockProductsRepository.update).toHaveBeenCalledWith(nonExistentId, updateDto);
    });
  });

  describe('delete', () => {
    it('should delete product successfully when found', async () => {
      mockProductsRepository.delete.mockResolvedValue(true);

      await service.delete(mockProduct.id);

      expect(mockProductsRepository.delete).toHaveBeenCalledWith(mockProduct.id);
    });

    it('should throw NotFoundException when product not found for deletion', async () => {
      const nonExistentId = 'non-existent-id';
      mockProductsRepository.delete.mockResolvedValue(false);

      await expect(service.delete(nonExistentId)).rejects.toThrow(
        new NotFoundException(`Product with ID ${nonExistentId} not found`)
      );

      expect(mockProductsRepository.delete).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('Entity to Domain Mapping', () => {
    it('should correctly map entity to domain interface', async () => {
      mockProductsRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.findById(mockProduct.id);

      expect(result).toEqual({
        id: mockProduct.id,
        name: mockProduct.name,
        sku: mockProduct.sku,
        price: mockProduct.price,
        category: mockProduct.category,
        description: mockProduct.description,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });
    });

    it('should handle optional fields correctly', async () => {
      const productWithoutOptionalFields = {
        ...mockProduct,
        description: undefined,
        category: undefined,
      };

      mockProductsRepository.findById.mockResolvedValue(productWithoutOptionalFields);

      const result = await service.findById(mockProduct.id);

      expect(result.description).toBeUndefined();
      expect(result.category).toBeUndefined();
      expect(result.id).toBe(mockProduct.id);
      expect(result.name).toBe(mockProduct.name);
    });
  });

  describe('Error Handling', () => {
    it('should propagate repository errors', async () => {
      const error = new Error('Database connection failed');
      mockProductsRepository.findAll.mockRejectedValue(error);

      await expect(service.findAll({})).rejects.toThrow(error);
    });

    it('should handle null response from repository', async () => {
      mockProductsRepository.findById.mockResolvedValue(null);

      await expect(service.findById('any-id')).rejects.toThrow(NotFoundException);
    });
  });
});