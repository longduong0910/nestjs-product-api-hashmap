import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomHashmap } from '../../../../src/modules/hashmap/custom-hashmap';
import { Attachment } from '../../../../src/database/entities/attachment.entity';
import * as fs from 'fs';
import * as path from 'path';

// Mock TypeORM decorators to avoid import issues
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  Entity: () => (target: any) => target,
  Column: () => (target: any, propertyKey: string) => {},
  PrimaryGeneratedColumn: () => (target: any, propertyKey: string) => {},
  CreateDateColumn: () => (target: any, propertyKey: string) => {},
  UpdateDateColumn: () => (target: any, propertyKey: string) => {},
}));

// Mock @nestjs/typeorm decorators
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => (target: any, propertyKey: string, parameterIndex: number) => {},
}));

// Mock AttachmentsRepository
jest.mock('../../../../src/modules/attachments/attachments.repository', () => ({
  AttachmentsRepository: jest.fn().mockImplementation(() => ({})),
}));

// Import after mocking
import { AttachmentsService } from '../../../../src/modules/attachments/attachments.service';
import { AttachmentsRepository } from '../../../../src/modules/attachments/attachments.repository';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    readdir: jest.fn(),
  },
}));

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  let repository: any; // Mock repository
  let hashmap: CustomHashmap<string, any>;

  const mockAttachment: Attachment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    productId: 'product-123',
    filename: 'test-file.jpg',
    originalName: 'original-test.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    path: 'uploads/test-file.jpg',
    url: '/uploads/test-file.jpg',
    checksum: 'abc123',
    metadata: { width: 800, height: 600 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isDeleted: false,
  };

  const mockFile = {
    filename: 'uploaded-file.jpg',
    originalname: 'original.jpg',
    mimetype: 'image/jpeg',
    size: 2048,
    path: '/absolute/uploads/uploaded-file.jpg',
  };

  const mockAttachmentsRepository = {
    findAllActive: jest.fn(),
    findByPath: jest.fn(),
    findByProductId: jest.fn(),
    create: jest.fn(),
  };

  const mockHashmap = {
    set: jest.fn(),
    get: jest.fn(),
    has: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentsService,
        {
          provide: AttachmentsRepository,
          useValue: mockAttachmentsRepository,
        },
        {
          provide: 'CUSTOM_HASHMAP',
          useValue: mockHashmap,
        },
      ],
    }).compile();

    service = module.get<AttachmentsService>(AttachmentsService);
    repository = module.get<AttachmentsRepository>(AttachmentsRepository);
    hashmap = module.get<CustomHashmap<string, any>>('CUSTOM_HASHMAP');

    // Mock process.cwd()
    jest.spyOn(process, 'cwd').mockReturnValue('/test/project');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should bootstrap hashmap and create uploads directory', async () => {
      const attachments = [mockAttachment];
      mockAttachmentsRepository.findAllActive.mockResolvedValue(attachments);
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(mockAttachmentsRepository.findAllActive).toHaveBeenCalled();
      expect(mockHashmap.set).toHaveBeenCalledWith(
        mockAttachment.path,
        expect.objectContaining({
          id: mockAttachment.id,
          filename: mockAttachment.filename,
        })
      );
      expect(fs.promises.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('uploads'),
        { recursive: true }
      );
    });

    it('should handle mkdir errors gracefully', async () => {
      mockAttachmentsRepository.findAllActive.mockResolvedValue([]);
      (fs.promises.mkdir as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      // Should not throw
      await expect(service.onModuleInit()).resolves.toBeUndefined();
    });
  });

  describe('registerFile', () => {
    it('should register file and cache in hashmap', async () => {
      const savedAttachment = { 
        ...mockAttachment, 
        filename: mockFile.filename,
        originalName: mockFile.originalname,
        mimeType: mockFile.mimetype,
        size: mockFile.size,
        path: '/absolute/uploads/uploaded-file.jpg',
        productId: 'product-123'
      };
      mockAttachmentsRepository.create.mockResolvedValue(savedAttachment);

      const result = await service.registerFile(mockFile, 'product-123');

      expect(mockAttachmentsRepository.create).toHaveBeenCalledWith({
        productId: 'product-123',
        filename: mockFile.filename,
        originalName: mockFile.originalname,
        mimeType: mockFile.mimetype,
        size: mockFile.size,
        path: expect.stringContaining('uploads/uploaded-file.jpg'),
      });

      expect(mockHashmap.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          filename: mockFile.filename,
          originalName: mockFile.originalname,
        })
      );

      expect(result).toMatchObject({
        filename: mockFile.filename,
        originalName: mockFile.originalname,
        size: mockFile.size,
      });
    });

    it('should handle null productId', async () => {
      const savedAttachment = { ...mockAttachment, productId: null };
      mockAttachmentsRepository.create.mockResolvedValue(savedAttachment);

      await service.registerFile(mockFile);

      expect(mockAttachmentsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: null,
        })
      );
    });
  });

  describe('getByPath', () => {
    it('should return cached attachment from hashmap', async () => {
      const cachedAttachment = {
        id: mockAttachment.id,
        path: mockAttachment.path,
        filename: mockAttachment.filename,
      };

      mockHashmap.get.mockReturnValue(cachedAttachment);

      const result = await service.getByPath(mockAttachment.path);

      expect(mockHashmap.get).toHaveBeenCalledWith(mockAttachment.path);
      expect(result).toBe(cachedAttachment);
      expect(mockAttachmentsRepository.findByPath).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache when not in hashmap', async () => {
      mockHashmap.get.mockReturnValue(undefined);
      mockAttachmentsRepository.findByPath.mockResolvedValue(mockAttachment);

      const result = await service.getByPath(mockAttachment.path);

      expect(mockHashmap.get).toHaveBeenCalledWith(mockAttachment.path);
      expect(mockAttachmentsRepository.findByPath).toHaveBeenCalledWith(mockAttachment.path);
      expect(mockHashmap.set).toHaveBeenCalledWith(
        mockAttachment.path,
        expect.objectContaining({
          id: mockAttachment.id,
        })
      );
      expect(result).toMatchObject({
        id: mockAttachment.id,
        path: mockAttachment.path,
      });
    });

    it('should throw NotFoundException when attachment not found', async () => {
      mockHashmap.get.mockReturnValue(undefined);
      mockAttachmentsRepository.findByPath.mockResolvedValue(null);

      await expect(service.getByPath('non-existent-path')).rejects.toThrow(
        new NotFoundException('Attachment not found')
      );
    });
  });

  describe('listByProduct', () => {
    it('should return attachments by product ID and cache them', async () => {
      const attachments = [mockAttachment];
      mockAttachmentsRepository.findByProductId.mockResolvedValue(attachments);

      const result = await service.listByProduct('product-123');

      expect(mockAttachmentsRepository.findByProductId).toHaveBeenCalledWith('product-123');
      expect(mockHashmap.set).toHaveBeenCalledWith(
        mockAttachment.path,
        expect.objectContaining({
          id: mockAttachment.id,
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockAttachment.id,
        productId: 'product-123',
      });
    });

    it('should return empty array when no attachments found', async () => {
      mockAttachmentsRepository.findByProductId.mockResolvedValue([]);

      const result = await service.listByProduct('product-with-no-attachments');

      expect(result).toEqual([]);
    });
  });

  describe('buildDirectoryTree', () => {
    beforeEach(() => {
      // Mock the uploads root path
      (service as any).uploadsRoot = '/test/project/uploads';
    });

    it('should build directory tree structure', async () => {
      const mockDirEntries = [
        { name: 'file1.jpg', isDirectory: () => false, isFile: () => true },
        { name: 'folder1', isDirectory: () => true, isFile: () => false },
        { name: 'file2.png', isDirectory: () => false, isFile: () => true },
      ];

      const mockSubDirEntries = [
        { name: 'nested-file.pdf', isDirectory: () => false, isFile: () => true },
      ];

      (fs.promises.readdir as jest.Mock)
        .mockResolvedValueOnce(mockDirEntries)
        .mockResolvedValueOnce(mockSubDirEntries);

      const result = await service.buildDirectoryTree();

      expect(result).toEqual({
        name: 'uploads',
        path: '/test/project/uploads',
        type: 'folder',
        children: [
          {
            name: 'folder1',
            path: '/test/project/uploads/folder1',
            type: 'folder',
            children: [
              {
                name: 'nested-file.pdf',
                path: '/test/project/uploads/folder1/nested-file.pdf',
                type: 'file',
              },
            ],
          },
          {
            name: 'file1.jpg',
            path: '/test/project/uploads/file1.jpg',
            type: 'file',
          },
          {
            name: 'file2.png',
            path: '/test/project/uploads/file2.png',
            type: 'file',
          },
        ],
      });
    });

    it('should handle empty directory', async () => {
      (fs.promises.readdir as jest.Mock).mockResolvedValue([]);

      const result = await service.buildDirectoryTree();

      expect(result).toEqual({
        name: 'uploads',
        path: '/test/project/uploads',
        type: 'folder',
        children: [],
      });
    });

    it('should sort entries with folders first', async () => {
      const mockEntries = [
        { name: 'z-file.txt', isDirectory: () => false, isFile: () => true },
        { name: 'a-folder', isDirectory: () => true, isFile: () => false },
        { name: 'b-file.jpg', isDirectory: () => false, isFile: () => true },
        { name: 'z-folder', isDirectory: () => true, isFile: () => false },
      ];

      (fs.promises.readdir as jest.Mock)
        .mockResolvedValueOnce(mockEntries)
        .mockResolvedValue([]); // Empty subdirectories

      const result = await service.buildDirectoryTree();

      expect(result.children![0].name).toBe('a-folder');
      expect(result.children![0].type).toBe('folder');
      expect(result.children![1].name).toBe('z-folder');
      expect(result.children![1].type).toBe('folder');
      expect(result.children![2].name).toBe('b-file.jpg');
      expect(result.children![2].type).toBe('file');
      expect(result.children![3].name).toBe('z-file.txt');
      expect(result.children![3].type).toBe('file');
    });
  });

  describe('Entity to Domain Mapping', () => {
    it('should correctly map entity to domain interface', () => {
      // Test the private method through a public method
      const attachment = { ...mockAttachment, size: BigInt(1024) };
      mockAttachmentsRepository.findByPath.mockResolvedValue(attachment);
      mockHashmap.get.mockReturnValue(undefined);

      return service.getByPath(mockAttachment.path).then(result => {
        expect(result).toMatchObject({
          id: mockAttachment.id,
          productId: mockAttachment.productId,
          originalName: mockAttachment.originalName,
          filename: mockAttachment.filename,
          mimeType: mockAttachment.mimeType,
          size: 1024, // Should be converted from BigInt
          path: mockAttachment.path,
        });
      });
    });

    it('should handle null productId in entity', () => {
      const attachmentWithNullProduct = { ...mockAttachment, productId: null };
      mockAttachmentsRepository.findByPath.mockResolvedValue(attachmentWithNullProduct);
      mockHashmap.get.mockReturnValue(undefined);

      return service.getByPath(mockAttachment.path).then(result => {
        expect(result.productId).toBeNull();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle repository errors', async () => {
      const error = new Error('Database connection failed');
      mockHashmap.get.mockReturnValue(undefined);
      mockAttachmentsRepository.findByPath.mockRejectedValue(error);

      await expect(service.getByPath('any-path')).rejects.toThrow(error);
    });

    it('should handle file system errors in buildDirectoryTree', async () => {
      const fsError = new Error('Permission denied');
      (fs.promises.readdir as jest.Mock).mockRejectedValue(fsError);

      await expect(service.buildDirectoryTree()).rejects.toThrow(fsError);
    });
  });
});