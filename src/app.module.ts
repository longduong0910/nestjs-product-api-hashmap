import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './modules/products/products.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';

@Module({
  imports: [DatabaseModule, ProductsModule, AttachmentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
