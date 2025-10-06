import { Controller, Post, UseInterceptors, UploadedFiles, Body, Get } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AttachmentsService } from './attachments.service';
import { UploadAttachmentsDto } from './dto/upload-attachments.dto';
import { AttachmentResponseDto } from './dto/attachment-response.dto';
import { BulkUploadAttachmentsDto } from './dto/bulk-upload-attachments.dto';

@ApiTags('attachments')
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload multiple files',
    description: 'Upload multiple files to the server and store metadata using custom hashmap',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Files with optional product ID and folder path',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        productId: {
          type: 'string',
          description: 'Optional product ID to associate files with',
        },
        folderPath: {
          type: 'string',
          description: 'Optional folder path within uploads directory (e.g., "documents/contracts/2024")',
          example: 'documents/contracts/2024',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Files successfully uploaded',
    type: [AttachmentResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid file or data' })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => cb(null, 'uploads'),
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${unique}${ext}`);
        },
      }),
    }),
  )
  async upload(
    @UploadedFiles() files: any[],
    @Body() dto: UploadAttachmentsDto,
  ): Promise<AttachmentResponseDto[]> {
    const results: AttachmentResponseDto[] = [];
    for (const f of files) {
      // Use new method that supports folder paths
      const r = await this.attachmentsService.registerFileToFolder(
        f, 
        dto.productId ?? null, 
        dto.folderPath ?? null
      );
      results.push(r);
    }
    return results;
  }

  @Post('bulk-upload')
  @ApiOperation({
    summary: 'Bulk upload files with folder structure',
    description: 'Upload multiple files to different folders in a single request',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Multiple files with their target folder paths',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        folderPaths: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Array of folder paths corresponding to each file (e.g., ["docs/contracts", "images/photos"])',
          example: ['documents/contracts', 'images/photos', 'reports/2024'],
        },
        productId: {
          type: 'string',
          description: 'Optional product ID to associate files with',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Files successfully uploaded to specified folders',
    type: [AttachmentResponseDto],
  })
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: (req, file, cb) => cb(null, 'uploads'),
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${unique}${ext}`);
        },
      }),
    }),
  )
  async bulkUpload(
    @UploadedFiles() files: any[],
    @Body() body: BulkUploadAttachmentsDto,
  ): Promise<AttachmentResponseDto[]> {
    const { folderPaths = [], productId } = body;
    const results: AttachmentResponseDto[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const folderPath = folderPaths[i] || null;
      
      const result = await this.attachmentsService.registerFileToFolder(
        file,
        productId ?? null,
        folderPath
      );
      results.push(result);
    }
    
    return results;
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Get directory tree structure',
    description: 'Retrieve the hierarchical directory structure of uploaded files',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved directory tree',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string', enum: ['file', 'folder'] },
        path: { type: 'string' },
        children: {
          type: 'array',
          items: { $ref: '#/components/schemas/Node' },
        },
      },
    },
  })
  async tree() {
    return this.attachmentsService.buildDirectoryTree();
  }
}
