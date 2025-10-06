import { IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadAttachmentsDto {
  @ApiProperty({ 
    description: 'Optional product ID to associate files with',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({
    description: 'Optional folder path within uploads directory (e.g., "documents/contracts/2024")',
    required: false,
    example: 'documents/contracts/2024'
  })
  @IsOptional()
  @IsString()
  folderPath?: string;
}
