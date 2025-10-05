import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { ICreateProduct, IUpdateProduct } from './interfaces';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    const results = await this.productRepository.find();
    return results;
  }

  async findById(id: string): Promise<Product | null> {
    const result = await this.productRepository.findOne({ where: { id } });
    return result ?? null;
  }

  async create(productData: ICreateProduct | Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(productData as Partial<Product>);
    const saved = await this.productRepository.save(product);
    return saved;
  }

  async update(id: string, productData: IUpdateProduct | Partial<Product>): Promise<Product | null> {
    await this.productRepository.update(id, productData as Partial<Product>);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByCategory(category: string): Promise<Product[]> {
    const results = await this.productRepository.find({ where: { category } });
    return results;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const result = await this.productRepository.findOne({ where: { sku } });
    return result ?? null;
  }
}