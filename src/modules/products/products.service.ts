import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto';
import { IProduct } from './interfaces';
import { Product } from '../../database/entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  private entityToDomain(entity: Product): IProduct {
    return {
      id: entity.id,
      name: entity.name,
      sku: entity.sku,
      price: entity.price,
      stockQuantity: entity.stockQuantity,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      // Optional fields
      ...(entity.description && { description: entity.description }),
      ...(entity.category && { category: entity.category }),
      ...(entity.thumbnailUrl && { thumbnailUrl: entity.thumbnailUrl }),
      ...(entity.attributes && { attributes: entity.attributes }),
      ...(entity.tags && { tags: entity.tags }),
    } as IProduct;
  }

  async findAll(query: ProductQueryDto): Promise<IProduct[]> {
    const entities = await this.productsRepository.findAll();
    return entities.map(e => this.entityToDomain(e));
  }

  async findById(id: string): Promise<IProduct> {
    const entity = await this.productsRepository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.entityToDomain(entity);
  }

  async create(createProductDto: CreateProductDto): Promise<IProduct> {
    const saved = await this.productsRepository.create(createProductDto as any);
    return this.entityToDomain(saved);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<IProduct> {
    const updated = await this.productsRepository.update(id, updateProductDto as any);
    if (!updated) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.entityToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.productsRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
