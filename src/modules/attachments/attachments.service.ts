import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { AttachmentsRepository } from './attachments.repository';
import { Attachment } from '../../database/entities/attachment.entity';
import { CustomHashmap } from '../hashmap/custom-hashmap';
import { IAttachment } from './interfaces/attachment.interface';
import { AttachmentResponseDto } from './dto/attachment-response.dto';
import * as fs from 'fs';
import * as path from 'path';

export type AttachmentHashValue = AttachmentResponseDto;

export type Node = {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: Node[];
};

@Injectable()
export class AttachmentsService implements OnModuleInit {
  private uploadsRoot = path.resolve(process.cwd(), 'uploads');

  constructor(
    private readonly attachmentsRepository: AttachmentsRepository,
    @Inject('CUSTOM_HASHMAP') private readonly hashmap: CustomHashmap<string, AttachmentHashValue>,
  ) {}

  async onModuleInit() {
    await this.bootstrapHashmap();
    // ensure uploads dir exists
    try {
      await fs.promises.mkdir(this.uploadsRoot, { recursive: true });
    } catch {
      // ignore
    }
  }

  private entityToDomain(ent: Attachment): IAttachment {
    return {
      id: ent.id,
      productId: ent.productId ?? null,
      originalName: ent.originalName,
      filename: ent.filename,
      mimeType: ent.mimeType,
      size: Number(ent.size),
      path: ent.path,
      url: ent.url,
      checksum: ent.checksum,
      createdAt: ent.createdAt,
      metadata: ent.metadata ?? undefined,
    };
  }

  private domainToResponse(d: IAttachment): AttachmentResponseDto {
    return {
      id: d.id,
      productId: d.productId ?? null,
      originalName: d.originalName,
      filename: d.filename,
      mimeType: d.mimeType,
      size: d.size,
      path: d.path,
      url: d.url,
      checksum: d.checksum,
      createdAt: d.createdAt.toISOString(),
      metadata: d.metadata,
    } as AttachmentResponseDto;
  }

  async bootstrapHashmap(): Promise<void> {
    const recs = await this.attachmentsRepository.findAllActive();
    recs.forEach(r => {
      const d = this.entityToDomain(r);
      this.hashmap.set(d.path, this.domainToResponse(d));
    });
  }

  async registerFile(files: any, productId?: string | null, folderPath?: string | null): Promise<AttachmentResponseDto> {
    const relPath = path.relative(process.cwd(), files.path);
    const saved = await this.attachmentsRepository.create({
      productId: productId ?? null,
      filename: files.filename,
      originalName: files.originalname,
      mimeType: files.mimetype,
      size: files.size,
      path: relPath,
    } as Partial<Attachment>);
    const d = this.entityToDomain(saved);
    const resp = this.domainToResponse(d);
    this.hashmap.set(resp.path, resp);
    return resp;
  }

  async getByPath(pathKey: string): Promise<AttachmentResponseDto> {
    const fromCache = this.hashmap.get(pathKey);
    if (fromCache) return fromCache;
    const ent = await this.attachmentsRepository.findByPath(pathKey);
    if (!ent) throw new NotFoundException('Attachment not found');
    const d = this.entityToDomain(ent);
    const resp = this.domainToResponse(d);
    this.hashmap.set(pathKey, resp);
    return resp;
  }

  async listByProduct(productId: string): Promise<AttachmentResponseDto[]> {
    const recs = await this.attachmentsRepository.findByProductId(productId);
    return recs.map(r => {
      const d = this.entityToDomain(r);
      const resp = this.domainToResponse(d);
      this.hashmap.set(resp.path, resp);
      return resp;
    });
  }

  async buildDirectoryTree(): Promise<Node> {
    const root: Node = {
      name: path.basename(this.uploadsRoot),
      path: this.uploadsRoot,
      type: 'folder',
      children: [],
    };

    const walk = async (dirPath: string): Promise<Node[]> => {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      const nodes: Node[] = [];
      for (const e of entries) {
        const full = path.join(dirPath, e.name);
        if (e.isDirectory()) {
          const child: Node = { name: e.name, path: full, type: 'folder', children: [] };
          child.children = await walk(full);
          nodes.push(child);
        } else if (e.isFile()) {
          nodes.push({ name: e.name, path: full, type: 'file' });
        }
      }
      return nodes.sort((a, b) =>
        a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1,
      );
    };

    root.children = await walk(this.uploadsRoot);
    return root;
  }

  async registerFileToFolder(file: any, productId?: string | null, folderPath?: string | null): Promise<AttachmentResponseDto> {
    // Sanitize folder path
    const sanitizedFolderPath = folderPath ? 
      folderPath.replace(/[^a-zA-Z0-9\-_\/]/g, '').replace(/\/+/g, '/').replace(/^\/|\/$/g, '') : '';
    
    // Create target directory path
    const targetDir = sanitizedFolderPath ? 
      path.join(this.uploadsRoot, sanitizedFolderPath) : 
      this.uploadsRoot;

    // Ensure target directory exists
    try {
      await fs.promises.mkdir(targetDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create directory:', error);
      throw new Error(`Failed to create directory: ${targetDir}`);
    }

    // Generate unique filename
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const newFileName = `${unique}${ext}`;
    
    // Create new file path
    const newFilePath = path.join(targetDir, newFileName);
    
    // Move file to target directory
    try {
      await fs.promises.rename(file.path, newFilePath);
    } catch (error) {
      // If rename fails, try copy and delete
      try {
        await fs.promises.copyFile(file.path, newFilePath);
        await fs.promises.unlink(file.path);
      } catch (copyError) {
        console.error('Failed to move file:', copyError);
        throw new Error('Failed to move file to target directory');
      }
    }

    // Create relative path for database
    const relPath = path.relative(process.cwd(), newFilePath);
    
    // Save to database
    const saved = await this.attachmentsRepository.create({
      productId: productId ?? null,
      filename: newFileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: relPath,
    } as Partial<Attachment>);
    
    const d = this.entityToDomain(saved);
    const resp = this.domainToResponse(d);
    this.hashmap.set(resp.path, resp);
    return resp;
  }
}
