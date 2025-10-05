import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from '../../database/entities/attachment.entity';

@Injectable()
export class AttachmentsRepository {
  constructor(
    @InjectRepository(Attachment)
    private readonly repo: Repository<Attachment>,
  ) {}

  async create(data: Partial<Attachment>): Promise<Attachment> {
    const ent = this.repo.create(data as Partial<Attachment>);
    return this.repo.save(ent);
  }

  async findByPath(path: string): Promise<Attachment | null> {
    const ent = await this.repo.findOne({ where: { path } });
    return ent ?? null;
  }

  async findById(id: string): Promise<Attachment | null> {
    const ent = await this.repo.findOne({ where: { id } });
    return ent ?? null;
  }

  async findByProductId(productId: string): Promise<Attachment[]> {
    return this.repo.find({ where: { productId, isDeleted: false } });
  }

  async findAllActive(): Promise<Attachment[]> {
    return this.repo.find({ where: { isDeleted: false } });
  }

  async softDelete(id: string): Promise<boolean> {
    const res = await this.repo.update(id, { isDeleted: true } as any);
    return (res.affected ?? 0) > 0;
  }
}
