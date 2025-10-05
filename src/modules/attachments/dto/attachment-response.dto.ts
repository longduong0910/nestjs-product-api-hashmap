export class AttachmentResponseDto {
  id: string;
  productId?: string | null;
  originalName: string;
  filename: string;
  mimeType?: string;
  size: number;
  path: string;
  url?: string;
  checksum?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}
