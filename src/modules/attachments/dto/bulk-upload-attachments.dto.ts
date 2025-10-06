import { IsOptional, IsUUID, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUploadAttachmentsDto {
  @ApiProperty({ 
    description: 'Optional product ID to associate files with',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({
    description: 'Array of folder paths for each file (e.g., ["documents/contracts", "images/photos"])',
    required: false,
    example: ['documents/contracts', 'images/photos', 'reports/2024'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  folderPaths?: string[];
}