import { IsOptional, IsUUID } from 'class-validator';

export class UploadAttachmentsDto {
  @IsOptional()
  @IsUUID()
  productId?: string;
}
