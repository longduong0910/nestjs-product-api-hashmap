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

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

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