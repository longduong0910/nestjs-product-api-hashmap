export class ProductResponseDto {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  category?: string;
  thumbnailUrl?: string;
  attributes?: Record<string, string | number | boolean>;
  tags?: string[];
  status: string;
  createdAt: Date;
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