import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto';
import { IProduct } from './interfaces';
import { Product } from '../../database/entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  // Inline mapper: Entity -> Domain interface
  private entityToDomain(entity: Product): IProduct {
    return {
      id: entity.id,
      name: entity.name,
      sku: entity.sku,
      price: entity.price,
      category: entity.category,
      // include optional fields if present on the entity
      ...(entity as any).description ? { description: (entity as any).description } : {},
      ...(entity as any).createdAt ? { createdAt: (entity as any).createdAt } : {},
      ...(entity as any).updatedAt ? { updatedAt: (entity as any).updatedAt } : {},
    } as IProduct;
  }

  async findAll(query: ProductQueryDto): Promise<IProduct[]> {
    if (query.category) {
      const entities = await this.productsRepository.findByCategory(query.category);
      return entities.map(e => this.entityToDomain(e));
    }
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