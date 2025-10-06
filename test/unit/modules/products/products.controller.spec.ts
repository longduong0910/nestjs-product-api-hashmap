import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../../../../src/modules/products/products.controller';
import { ProductsService } from '../../../../src/modules/products/products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from '../../../../src/modules/products/dto';
import { IProduct } from '../../../../src/modules/products/interfaces';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct: IProduct = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sku: 'TEST-001',
    name: 'Test Product',
    price: 99.99,
    stockQuantity: 10,
    category: 'Electronics',
    description: 'Test Description',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockProductsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of products', async () => {
      const products = [mockProduct];
      mockProductsService.findAll.mockResolvedValue(products);

      const query: ProductQueryDto = {};
      const result = await controller.findAll(query);

      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockProduct.id,
        name: mockProduct.name,
        sku: mockProduct.sku,
        price: mockProduct.price,
        category: mockProduct.category,
      });
    });

    it('should pass query parameters to service', async () => {
      const query: ProductQueryDto = { category: 'Electronics' };
      mockProductsService.findAll.mockResolvedValue([]);

      await controller.findAll(query);

      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
    });

    it('should return empty array when no products found', async () => {
      mockProductsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll({});

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return single product by ID', async () => {
      mockProductsService.findById.mockResolvedValue(mockProduct);

      const result = await controller.findOne(mockProduct.id);

      expect(mockProductsService.findById).toHaveBeenCalledWith(mockProduct.id);
      expect(result).toMatchObject({
        id: mockProduct.id,
        name: mockProduct.name,
        sku: mockProduct.sku,
      });
    });

    it('should throw error when product not found', async () => {
      const error = new Error('Product not found');
      mockProductsService.findById.mockRejectedValue(error);

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(error);
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
      mockProductsService.create.mockResolvedValue(createdProduct);

      const result = await controller.create(createDto);

      expect(mockProductsService.create).toHaveBeenCalledWith(createDto);
      expect(result).toMatchObject({
        sku: createDto.sku,
        name: createDto.name,
        price: createDto.price,
      });
    });

    it('should handle validation errors', async () => {
      const invalidDto = {} as CreateProductDto;
      const error = new Error('Validation failed');
      mockProductsService.create.mockRejectedValue(error);

      await expect(controller.create(invalidDto)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update and return product', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 199.99,
      };

      const updatedProduct = { ...mockProduct, ...updateDto };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(mockProduct.id, updateDto);

      expect(mockProductsService.update).toHaveBeenCalledWith(mockProduct.id, updateDto);
      expect(result).toMatchObject({
        id: mockProduct.id,
        name: 'Updated Product',
        price: 199.99,
      });
    });

    it('should handle partial updates', async () => {
      const partialUpdateDto: UpdateProductDto = { price: 299.99 };
      const updatedProduct = { ...mockProduct, price: 299.99 };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(mockProduct.id, partialUpdateDto);

      expect(result.price).toBe(299.99);
      expect(result.name).toBe(mockProduct.name); // Should remain unchanged
    });
  });

  describe('remove', () => {
    it('should delete product successfully', async () => {
      mockProductsService.delete.mockResolvedValue(undefined);

      await controller.remove(mockProduct.id);

      expect(mockProductsService.delete).toHaveBeenCalledWith(mockProduct.id);
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Product not found');
      mockProductsService.delete.mockRejectedValue(error);

      await expect(controller.remove('non-existent-id')).rejects.toThrow(error);
    });
  });

  describe('Domain to Response Mapping', () => {
    it('should correctly map domain object to response DTO', async () => {
      const fullProduct: IProduct = {
        id: mockProduct.id,
        sku: mockProduct.sku,
        name: mockProduct.name,
        price: mockProduct.price,
        stockQuantity: 15,
        category: mockProduct.category,
        description: 'Full description',
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockProductsService.findById.mockResolvedValue(fullProduct);

      const result = await controller.findOne(mockProduct.id);

      expect(result).toEqual({
        id: fullProduct.id,
        name: fullProduct.name,
        sku: fullProduct.sku,
        price: fullProduct.price,
        category: fullProduct.category,
        description: fullProduct.description,
        createdAt: fullProduct.createdAt,
        updatedAt: fullProduct.updatedAt,
      });
    });

    it('should handle optional fields in mapping', async () => {
      const minimalProduct: IProduct = {
        id: mockProduct.id,
        sku: mockProduct.sku,
        name: mockProduct.name,
        price: mockProduct.price,
        stockQuantity: 5,
        category: mockProduct.category,
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockProductsService.findById.mockResolvedValue(minimalProduct);

      const result = await controller.findOne(mockProduct.id);

      expect(result.id).toBe(minimalProduct.id);
      expect(result.name).toBe(minimalProduct.name);
      // Note: createdAt and updatedAt are included in the minimalProduct, so they will be mapped
      expect(result.createdAt).toBe(minimalProduct.createdAt);
      expect(result.updatedAt).toBe(minimalProduct.updatedAt);
    });

    it('should map array of products correctly', async () => {
      const products = [mockProduct, { ...mockProduct, id: 'different-id', sku: 'TEST-002' }];
      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll({});

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(products[0].id);
      expect(result[1].id).toBe(products[1].id);
      expect(result[1].sku).toBe('TEST-002');
    });
  });

  describe('Error Propagation', () => {
    it('should propagate service errors correctly', async () => {
      const serviceError = new Error('Service error occurred');
      mockProductsService.findAll.mockRejectedValue(serviceError);

      await expect(controller.findAll({})).rejects.toThrow(serviceError);
    });

    it('should handle async errors in all methods', async () => {
      const asyncError = new Error('Async operation failed');

      // Test all controller methods handle async errors
      mockProductsService.findById.mockRejectedValue(asyncError);
      await expect(controller.findOne('id')).rejects.toThrow(asyncError);

      mockProductsService.create.mockRejectedValue(asyncError);
      await expect(controller.create({} as CreateProductDto)).rejects.toThrow(asyncError);

      mockProductsService.update.mockRejectedValue(asyncError);
      await expect(controller.update('id', {})).rejects.toThrow(asyncError);

      mockProductsService.delete.mockRejectedValue(asyncError);
      await expect(controller.remove('id')).rejects.toThrow(asyncError);
    });
  });
});