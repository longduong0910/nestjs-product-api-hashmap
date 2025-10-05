import { 
  IsString, 
  IsNumber, 
  IsNotEmpty, 
  IsOptional, 
  Min, 
  IsArray, 
  IsObject, 
  IsIn,
  MaxLength 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product SKU', example: 'LP-001', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @ApiProperty({ description: 'Product name', example: 'Laptop Pro', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Product description', example: 'High-performance laptop for professionals' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Product price', example: 1299.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  thumbnailUrl?: string;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, string | number | boolean>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsIn(['active', 'inactive', 'draft'])
  @IsOptional()
  status?: string;
}