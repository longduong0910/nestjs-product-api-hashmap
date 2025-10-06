import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsController } from '../../../../src/modules/attachments/attachments.controller';
import { AttachmentsService } from '../../../../src/modules/attachments/attachments.service';
import { UploadAttachmentsDto } from '../../../../src/modules/attachments/dto/upload-attachments.dto';
import { AttachmentResponseDto } from '../../../../src/modules/attachments/dto/attachment-response.dto';

describe('AttachmentsController', () => {
  let controller: AttachmentsController;
  let service: AttachmentsService;

  const mockAttachmentResponse: AttachmentResponseDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    productId: 'product-123',
    filename: 'test-file.jpg',
    originalName: 'original-test.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    path: 'uploads/test-file.jpg',
    url: '/uploads/test-file.jpg',
    checksum: 'abc123',
    createdAt: '2024-01-01T00:00:00.000Z',
    metadata: { width: 800, height: 600 },
  };

  const mockFile = {
    filename: 'uploaded-file.jpg',
    originalname: 'original.jpg',
    mimetype: 'image/jpeg',
    size: 2048,
    path: '/absolute/uploads/uploaded-file.jpg',
    buffer: Buffer.from('fake-file-content'),
  };

  const mockDirectoryTree = {
    name: 'uploads',
    path: '/project/uploads',
    type: 'folder' as const,
    children: [
      {
        name: 'folder1',
        path: '/project/uploads/folder1',
        type: 'folder' as const,
        children: [
          {
            name: 'nested-file.pdf',
            path: '/project/uploads/folder1/nested-file.pdf',
            type: 'file' as const,
          },
        ],
      },
      {
        name: 'image.jpg',
        path: '/project/uploads/image.jpg',
        type: 'file' as const,
      },
    ],
  };

  const mockAttachmentsService = {
    registerFileToFolder: jest.fn(),
    buildDirectoryTree: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttachmentsController],
      providers: [
        {
          provide: AttachmentsService,
          useValue: mockAttachmentsService,
        },
      ],
    }).compile();

    controller = module.get<AttachmentsController>(AttachmentsController);
    service = module.get<AttachmentsService>(AttachmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('should upload single file successfully', async () => {
      const files = [mockFile];
      const dto: UploadAttachmentsDto = { productId: 'product-123' };

      mockAttachmentsService.registerFileToFolder.mockResolvedValue(mockAttachmentResponse);

      const result = await controller.upload(files, dto);

      expect(mockAttachmentsService.registerFileToFolder).toHaveBeenCalledWith(
        mockFile,
        'product-123',
        null
      );
      expect(mockAttachmentsService.registerFileToFolder).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockAttachmentResponse);
    });

    it('should upload multiple files successfully', async () => {
      const files = [mockFile, { ...mockFile, originalname: 'file2.txt' }];
      const dto: UploadAttachmentsDto = { productId: 'product-123' };
      const secondResponse = { ...mockAttachmentResponse, originalName: 'file2.txt' };

      mockAttachmentsService.registerFileToFolder
        .mockResolvedValueOnce(mockAttachmentResponse)
        .mockResolvedValueOnce(secondResponse);

      const result = await controller.upload(files, dto);

      expect(mockAttachmentsService.registerFileToFolder).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(mockAttachmentResponse);
      expect(result[1]).toBe(secondResponse);
    });

    it('should handle upload without productId', async () => {
      const files = [mockFile];
      const dto: UploadAttachmentsDto = {}; // No productId

      mockAttachmentsService.registerFileToFolder.mockResolvedValue({
        ...mockAttachmentResponse,
        productId: null,
      });

      const result = await controller.upload(files, dto);

      expect(mockAttachmentsService.registerFileToFolder).toHaveBeenCalledWith(
        mockFile,
        null,
        null
      );
      expect(result[0].productId).toBeNull();
    });

    it('should handle empty files array', async () => {
      const files: any[] = [];
      const dto: UploadAttachmentsDto = { productId: 'product-123' };

      const result = await controller.upload(files, dto);

      expect(mockAttachmentsService.registerFileToFolder).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors during upload', async () => {
      const files = [mockFile];
      const dto: UploadAttachmentsDto = { productId: 'product-123' };
      const error = new Error('Failed to save file');

      mockAttachmentsService.registerFileToFolder.mockRejectedValue(error);

      await expect(controller.upload(files, dto)).rejects.toThrow(error);
    });

    it('should handle partial failures in multiple file upload', async () => {
      const file2 = { ...mockFile, filename: 'second-file.png' };
      const files = [mockFile, file2];
      const dto: UploadAttachmentsDto = { productId: 'product-123' };
      const error = new Error('Second file failed');

      mockAttachmentsService.registerFileToFolder
        .mockResolvedValueOnce(mockAttachmentResponse)
        .mockRejectedValueOnce(error);

      await expect(controller.upload(files, dto)).rejects.toThrow(error);
      expect(mockAttachmentsService.registerFileToFolder).toHaveBeenCalledTimes(2);
    });

    it('should process files sequentially', async () => {
      const files = [mockFile, { ...mockFile, filename: 'file2.jpg' }];
      const dto: UploadAttachmentsDto = { productId: 'product-123' };

      let callOrder: number[] = [];
      mockAttachmentsService.registerFileToFolder.mockImplementation(async (file: any) => {
        callOrder.push(files.indexOf(file));
        return { ...mockAttachmentResponse, filename: file.filename };
      });

      await controller.upload(files, dto);

      expect(callOrder).toEqual([0, 1]); // Sequential processing
    });
  });

  describe('tree', () => {
    it('should return directory tree structure', async () => {
      mockAttachmentsService.buildDirectoryTree.mockResolvedValue(mockDirectoryTree);

      const result = await controller.tree();

      expect(mockAttachmentsService.buildDirectoryTree).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockDirectoryTree);
      expect(result.name).toBe('uploads');
      expect(result.type).toBe('folder');
      expect(result.children).toHaveLength(2);
    });

    it('should handle empty directory tree', async () => {
      const emptyTree = {
        name: 'uploads',
        path: '/project/uploads',
        type: 'folder' as const,
        children: [],
      };

      mockAttachmentsService.buildDirectoryTree.mockResolvedValue(emptyTree);

      const result = await controller.tree();

      expect(result).toBe(emptyTree);
      expect(result.children).toHaveLength(0);
    });

    it('should handle service errors', async () => {
      const error = new Error('Failed to read directory');
      mockAttachmentsService.buildDirectoryTree.mockRejectedValue(error);

      await expect(controller.tree()).rejects.toThrow(error);
    });

    it('should return nested directory structure', async () => {
      const nestedTree = {
        name: 'uploads',
        path: '/project/uploads',
        type: 'folder' as const,
        children: [
          {
            name: 'level1',
            path: '/project/uploads/level1',
            type: 'folder' as const,
            children: [
              {
                name: 'level2',
                path: '/project/uploads/level1/level2',
                type: 'folder' as const,
                children: [
                  {
                    name: 'deep-file.txt',
                    path: '/project/uploads/level1/level2/deep-file.txt',
                    type: 'file' as const,
                  },
                ],
              },
            ],
          },
        ],
      };

      mockAttachmentsService.buildDirectoryTree.mockResolvedValue(nestedTree);

      const result = await controller.tree();

      expect(result.children![0].children![0].children).toHaveLength(1);
      expect(result.children![0].children![0].children![0].name).toBe('deep-file.txt');
      expect(result.children![0].children![0].children![0].type).toBe('file');
    });
  });

  describe('File Validation and Processing', () => {
    it('should handle different file types', async () => {
      const imageFile = { ...mockFile, mimetype: 'image/png', filename: 'image.png' };
      const documentFile = { ...mockFile, mimetype: 'application/pdf', filename: 'doc.pdf' };
      const files = [imageFile, documentFile];
      const dto: UploadAttachmentsDto = {};

      const imageResponse = { ...mockAttachmentResponse, mimeType: 'image/png' };
      const docResponse = { ...mockAttachmentResponse, mimeType: 'application/pdf' };

      mockAttachmentsService.registerFileToFolder
        .mockResolvedValueOnce(imageResponse)
        .mockResolvedValueOnce(docResponse);

      const result = await controller.upload(files, dto);

      expect(result).toHaveLength(2);
      expect(result[0].mimeType).toBe('image/png');
      expect(result[1].mimeType).toBe('application/pdf');
    });

    it('should handle large files', async () => {
      const largeFile = { ...mockFile, size: 10 * 1024 * 1024 }; // 10MB
      const files = [largeFile];
      const dto: UploadAttachmentsDto = {};

      const largeFileResponse = { ...mockAttachmentResponse, size: 10 * 1024 * 1024 };
      mockAttachmentsService.registerFileToFolder.mockResolvedValue(largeFileResponse);

      const result = await controller.upload(files, dto);

      expect(result[0].size).toBe(10 * 1024 * 1024);
    });

    it('should handle files with special characters in names', async () => {
      const specialFile = {
        ...mockFile,
        originalname: 'файл с пробелами & символами!.jpg',
        filename: 'safe-filename.jpg',
      };
      const files = [specialFile];
      const dto: UploadAttachmentsDto = {};

      const specialResponse = {
        ...mockAttachmentResponse,
        originalName: 'файл с пробелами & символами!.jpg',
        filename: 'safe-filename.jpg',
      };
      mockAttachmentsService.registerFileToFolder.mockResolvedValue(specialResponse);

      const result = await controller.upload(files, dto);

      expect(result[0].originalName).toBe('файл с пробелами & символами!.jpg');
      expect(result[0].filename).toBe('safe-filename.jpg');
    });
  });

  describe('Response Format', () => {
    it('should return properly formatted response array', async () => {
      const files = [mockFile];
      const dto: UploadAttachmentsDto = { productId: 'product-123' };

      mockAttachmentsService.registerFileToFolder.mockResolvedValue(mockAttachmentResponse);

      const result = await controller.upload(files, dto);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('filename');
      expect(result[0]).toHaveProperty('originalName');
      expect(result[0]).toHaveProperty('mimeType');
      expect(result[0]).toHaveProperty('size');
      expect(result[0]).toHaveProperty('path');
      expect(result[0]).toHaveProperty('createdAt');
    });

    it('should maintain order of uploaded files in response', async () => {
      const files = [
        { ...mockFile, filename: 'first.jpg' },
        { ...mockFile, filename: 'second.jpg' },
        { ...mockFile, filename: 'third.jpg' },
      ];
      const dto: UploadAttachmentsDto = {};

      mockAttachmentsService.registerFileToFolder
        .mockResolvedValueOnce({ ...mockAttachmentResponse, filename: 'first.jpg' })
        .mockResolvedValueOnce({ ...mockAttachmentResponse, filename: 'second.jpg' })
        .mockResolvedValueOnce({ ...mockAttachmentResponse, filename: 'third.jpg' });

      const result = await controller.upload(files, dto);

      expect(result[0].filename).toBe('first.jpg');
      expect(result[1].filename).toBe('second.jpg');
      expect(result[2].filename).toBe('third.jpg');
    });
  });
});