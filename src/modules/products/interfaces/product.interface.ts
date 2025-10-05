export interface IProduct {
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
}

export interface ICreateProduct {
  sku: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  category?: string;
  thumbnailUrl?: string;
  attributes?: Record<string, string | number | boolean>;
  tags?: string[];
  status?: string;
}

export interface IUpdateProduct {
  sku?: string;
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  category?: string;
  thumbnailUrl?: string;
  attributes?: Record<string, string | number | boolean>;
  tags?: string[];
  status?: string;
}