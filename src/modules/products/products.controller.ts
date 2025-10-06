import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, ProductResponseDto } from './dto';
import { IProduct } from './interfaces';

@ApiTags('products')
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
      stockQuantity: p.stockQuantity,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      // Optional fields
      ...(p.description && { description: p.description }),
      ...(p.category && { category: p.category }),
      ...(p.thumbnailUrl && { thumbnailUrl: p.thumbnailUrl }),
      ...(p.attributes && { attributes: p.attributes }),
      ...(p.tags && { tags: p.tags }),
    } as ProductResponseDto;
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieve all products with optional filtering by category',
  })
  @ApiQuery({ name: 'category', required: false, description: 'Filter products by category' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved products',
    type: [ProductResponseDto],
  })
  async findAll(@Query() query: ProductQueryDto): Promise<ProductResponseDto[]> {
    const products = await this.productsService.findAll(query);
    return products.map(p => this.domainToResponse(p));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieve a single product by its ID',
  })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved product',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    const product = await this.productsService.findById(id);
    return this.domainToResponse(product);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new product',
    description: 'Create a new product with provided details',
  })
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsService.create(createProductDto);
    return this.domainToResponse(product);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update product',
    description: 'Update an existing product with partial data',
  })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Product successfully updated',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.update(id, updateProductDto);
    return this.domainToResponse(product);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product', description: 'Delete a product by its ID' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Product successfully deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.productsService.delete(id);
  }
}
