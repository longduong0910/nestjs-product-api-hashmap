import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Product SKU', example: 'LP-001' })
  sku: string;

  @ApiProperty({ description: 'Product name', example: 'Laptop Pro' })
  name: string;

  @ApiPropertyOptional({ description: 'Product description', example: 'High-performance laptop for professionals' })
  description?: string;

  @ApiProperty({ description: 'Product price', example: 1299.99 })
  price: number;

  @ApiProperty({ description: 'Stock quantity', example: 50 })
  stockQuantity: number;

  @ApiPropertyOptional({ description: 'Product category', example: 'Electronics' })
  category?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL', example: 'https://example.com/thumb.jpg' })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Product attributes', example: { color: 'black', weight: 2.5 } })
  attributes?: Record<string, string | number | boolean>;

  @ApiPropertyOptional({ description: 'Product tags', example: ['laptop', 'technology', 'portable'] })
  tags?: string[];

  @ApiProperty({ description: 'Product status', example: 'active' })
  status: string;

  @ApiProperty({ description: 'Creation date', example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date', example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;

  constructor(
    id: string,
    sku: string,
    name: string,
    price: number,
    stockQuantity: number,
    status: string,
    createdAt: Date,
    updatedAt: Date,
    description?: string,
    category?: string,
    thumbnailUrl?: string,
    attributes?: Record<string, string | number | boolean>,
    tags?: string[],
  ) {
    this.id = id;
    this.sku = sku;
    this.name = name;
    this.description = description;
    this.price = price;
    this.stockQuantity = stockQuantity;
    this.category = category;
    this.thumbnailUrl = thumbnailUrl;
    this.attributes = attributes;
    this.tags = tags;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromEntity(product: any): ProductResponseDto {
    return new ProductResponseDto(
      product.id,
      product.sku,
      product.name,
      product.price,
      product.stockQuantity,
      product.status,
      product.createdAt,
      product.updatedAt,
      product.description,
      product.category,
      product.thumbnailUrl,
      product.attributes,
      product.tags,
    );
  }
}