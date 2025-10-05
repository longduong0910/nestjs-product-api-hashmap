import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProductQueryDto {
  @ApiPropertyOptional({ description: 'Filter products by category', example: 'Electronics' })
  @IsOptional()
  @IsString()
  category?: string;
}
