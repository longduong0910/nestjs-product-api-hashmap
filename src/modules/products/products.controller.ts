import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, ProductResponseDto } from './dto';
import { IProduct } from './interfaces';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Inline mapper: Domain -> Response DTO
  private domainToResponse(p: IProduct): ProductResponseDto {
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      category: p.category,
      ...(p as any).description ? { description: (p as any).description } : {},
      ...(p as any).createdAt ? { createdAt: (p as any).createdAt } : {},
      ...(p as any).updatedAt ? { updatedAt: (p as any).updatedAt } : {},
    } as ProductResponseDto;
  }

  @Get()
  async findAll(@Query() query: ProductQueryDto): Promise<ProductResponseDto[]> {
    const products = await this.productsService.findAll(query);
    return products.map(p => this.domainToResponse(p));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    const product = await this.productsService.findById(id);
    return this.domainToResponse(product);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsService.create(createProductDto);
    return this.domainToResponse(product);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsService.update(id, updateProductDto);
    return this.domainToResponse(product);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.productsService.delete(id);
  }
}