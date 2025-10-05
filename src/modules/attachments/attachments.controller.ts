import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Get,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AttachmentsService } from './attachments.service';
import { UploadAttachmentsDto } from './dto/upload-attachments.dto';
import { AttachmentResponseDto } from './dto/attachment-response.dto';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
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
  async upload(@UploadedFiles() files: any[], @Body() dto: UploadAttachmentsDto): Promise<AttachmentResponseDto[]> {
    const results: AttachmentResponseDto[] = [];
    for (const f of files) {
      const r = await this.attachmentsService.registerFile(f, dto.productId ?? null);
      results.push(r);
    }
    return results;
  }

  @Get('tree')
  async tree() {
    return this.attachmentsService.buildDirectoryTree();
  }
}
