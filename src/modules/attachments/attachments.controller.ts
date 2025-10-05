import { Controller, Post, UseInterceptors, UploadedFiles, Body, Get } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AttachmentsService } from './attachments.service';
import { UploadAttachmentsDto } from './dto/upload-attachments.dto';
import { AttachmentResponseDto } from './dto/attachment-response.dto';

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
    description: 'Files and optional product ID',
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
      const r = await this.attachmentsService.registerFile(f, dto.productId ?? null);
      results.push(r);
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
