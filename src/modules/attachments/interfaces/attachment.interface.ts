export interface IAttachment {
  id: string;
  productId?: string | null;
  originalName: string;
  filename: string;
  mimeType?: string;
  size: number;
  path: string;
  url?: string;
  checksum?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}
