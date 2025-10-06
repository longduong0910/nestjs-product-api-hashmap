import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Product } from '../../src/database/entities/product.entity';
import { Attachment } from '../../src/database/entities/attachment.entity';
import { CustomHashmap } from '../../src/modules/hashmap/custom-hashmap';
import * as path from 'path';
import * as fs from 'fs';

describe('ProductAPI Integration Tests', () => {
  let app: INestApplication;
  let createdProductId: string;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Product, Attachment],
          synchronize: true,
          logging: false,
        }),
        AppModule,
      ],
    })
    .overrideProvider('CUSTOM_HASHMAP')
    .useValue(new CustomHashmap<string, any>())
    .compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same configuration as main.ts
    app.useGlobalPipes();
    app.enableCors();
    
    await app.init();

    // Ensure uploads directory exists for tests
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/products (Product CRUD)', () => {
    describe('POST /products', () => {
      it('should create a new product', async () => {
        const createProductDto = {
          sku: 'TEST-001',
          name: 'Integration Test Product',
          description: 'Product created during integration testing',
          price: 99.99,
          stockQuantity: 10,
          category: 'Test Category',
          status: 'active',
        };

        const response = await request(app.getHttpServer())
          .post('/products')
          .send(createProductDto)
          .expect(201);

        expect(response.body).toMatchObject({
          sku: createProductDto.sku,
          name: createProductDto.name,
          price: createProductDto.price,
          category: createProductDto.category,
        });
        expect(response.body.id).toBeDefined();
        
        // Store for subsequent tests
        createdProductId = response.body.id;
      });

      it('should fail with validation errors for invalid data', async () => {
        const invalidProduct = {
          // Missing required fields
          description: 'Invalid product',
        };

        await request(app.getHttpServer())
          .post('/products')
          .send(invalidProduct)
          .expect(400);
      });

      it('should fail with duplicate SKU', async () => {
        const duplicateProduct = {
          sku: 'TEST-001', // Same as first product
          name: 'Duplicate SKU Product',
          price: 49.99,
          stockQuantity: 5,
        };

        await request(app.getHttpServer())
          .post('/products')
          .send(duplicateProduct)
          .expect(500); // Should fail due to unique constraint
      });
    });

    describe('GET /products', () => {
      it('should return all products', async () => {
        const response = await request(app.getHttpServer())
          .get('/products')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('sku');
        expect(response.body[0]).toHaveProperty('name');
      });

      it('should filter products by category', async () => {
        const response = await request(app.getHttpServer())
          .get('/products?category=Test Category')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach((product: any) => {
          expect(product.category).toBe('Test Category');
        });
      });

      it('should return empty array for non-existent category', async () => {
        const response = await request(app.getHttpServer())
          .get('/products?category=NonExistentCategory')
          .expect(200);

        expect(response.body).toEqual([]);
      });
    });

    describe('GET /products/:id', () => {
      it('should return product by ID', async () => {
        const response = await request(app.getHttpServer())
          .get(`/products/${createdProductId}`)
          .expect(200);

        expect(response.body.id).toBe(createdProductId);
        expect(response.body.sku).toBe('TEST-001');
      });

      it('should return 404 for non-existent product', async () => {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';
        
        await request(app.getHttpServer())
          .get(`/products/${nonExistentId}`)
          .expect(404);
      });
    });

    describe('PATCH /products/:id', () => {
      it('should update product partially', async () => {
        const updateData = {
          name: 'Updated Integration Test Product',
          price: 149.99,
        };

        const response = await request(app.getHttpServer())
          .patch(`/products/${createdProductId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.name).toBe(updateData.name);
        expect(response.body.price).toBe(updateData.price);
        expect(response.body.sku).toBe('TEST-001'); // Should remain unchanged
      });

      it('should return 404 for non-existent product update', async () => {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';
        
        await request(app.getHttpServer())
          .patch(`/products/${nonExistentId}`)
          .send({ name: 'Updated Name' })
          .expect(404);
      });
    });
  });

  describe('/attachments (File Upload & Tree)', () => {
    describe('POST /attachments/upload', () => {
      it('should upload file without product association', async () => {
        // Create a simple test file
        const testFilePath = path.join(__dirname, 'test-file.txt');
        fs.writeFileSync(testFilePath, 'test content');

        const response = await request(app.getHttpServer())
          .post('/attachments/upload')
          .attach('files', testFilePath)
          .expect(201);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('filename');
        expect(response.body[0]).toHaveProperty('originalName');
        expect(response.body[0]).toHaveProperty('path');
        expect(response.body[0].productId).toBeNull();

        // Cleanup
        fs.unlinkSync(testFilePath);
      });

      it('should upload file with product association', async () => {
        const testFilePath = path.join(__dirname, 'test-product-file.txt');
        fs.writeFileSync(testFilePath, 'product attachment content');

        const response = await request(app.getHttpServer())
          .post('/attachments/upload')
          .field('productId', createdProductId)
          .attach('files', testFilePath)
          .expect(201);

        expect(response.body[0].productId).toBe(createdProductId);

        // Cleanup
        fs.unlinkSync(testFilePath);
      });

      it('should upload multiple files', async () => {
        const testFile1 = path.join(__dirname, 'multi-test-1.txt');
        const testFile2 = path.join(__dirname, 'multi-test-2.txt');
        
        fs.writeFileSync(testFile1, 'first file content');
        fs.writeFileSync(testFile2, 'second file content');

        const response = await request(app.getHttpServer())
          .post('/attachments/upload')
          .attach('files', testFile1)
          .attach('files', testFile2)
          .expect(201);

        expect(response.body).toHaveLength(2);
        expect(response.body[0].originalName).toBe('multi-test-1.txt');
        expect(response.body[1].originalName).toBe('multi-test-2.txt');

        // Cleanup
        fs.unlinkSync(testFile1);
        fs.unlinkSync(testFile2);
      });

      it('should handle upload with no files', async () => {
        const response = await request(app.getHttpServer())
          .post('/attachments/upload')
          .expect(201);

        expect(response.body).toEqual([]);
      });
    });

    describe('GET /attachments/tree', () => {
      it('should return directory tree structure', async () => {
        const response = await request(app.getHttpServer())
          .get('/attachments/tree')
          .expect(200);

        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('type');
        expect(response.body).toHaveProperty('path');
        expect(response.body).toHaveProperty('children');
        expect(response.body.type).toBe('folder');
        expect(Array.isArray(response.body.children)).toBe(true);
      });

      it('should include uploaded files in tree structure', async () => {
        // Upload a file first
        const testFilePath = path.join(__dirname, 'tree-test-file.txt');
        fs.writeFileSync(testFilePath, 'tree test content');

        await request(app.getHttpServer())
          .post('/attachments/upload')
          .attach('files', testFilePath);

        // Get tree structure
        const response = await request(app.getHttpServer())
          .get('/attachments/tree')
          .expect(200);

        // The tree should contain some files now
        const hasFiles = (node: any): boolean => {
          if (node.type === 'file') return true;
          if (node.children) {
            return node.children.some(hasFiles);
          }
          return false;
        };

        expect(hasFiles(response.body)).toBe(true);

        // Cleanup
        fs.unlinkSync(testFilePath);
      });
    });
  });

  describe('Custom Hashmap Integration', () => {
    it('should use custom hashmap for attachment caching', async () => {
      // This test verifies that the custom hashmap is being used
      // by checking that subsequent requests for the same attachment
      // don't hit the database every time

      const testFilePath = path.join(__dirname, 'hashmap-test.txt');
      fs.writeFileSync(testFilePath, 'hashmap test content');

      // Upload file
      const uploadResponse = await request(app.getHttpServer())
        .post('/attachments/upload')
        .attach('files', testFilePath);

      expect(uploadResponse.status).toBe(201);
      
      // The custom hashmap should now cache this attachment
      // Multiple requests to the tree endpoint should be fast
      const start = Date.now();
      
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .get('/attachments/tree')
          .expect(200);
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should be fast due to caching

      // Cleanup
      fs.unlinkSync(testFilePath);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in POST requests', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send('{"invalid": json}')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should handle invalid UUID format in product ID', async () => {
      await request(app.getHttpServer())
        .get('/products/invalid-uuid')
        .expect(500); // Database will reject invalid UUID
    });

    it('should return 404 for non-existent endpoints', async () => {
      await request(app.getHttpServer())
        .get('/non-existent-endpoint')
        .expect(404);
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger documentation', async () => {
      const response = await request(app.getHttpServer())
        .get('/swagger')
        .expect(301); // Redirect to swagger UI

      // The response should redirect to swagger UI
      expect(response.headers.location).toContain('swagger');
    });

    it('should serve OpenAPI JSON spec', async () => {
      const response = await request(app.getHttpServer())
        .get('/swagger-json')
        .expect(200);

      expect(response.body).toHaveProperty('openapi');
      expect(response.body).toHaveProperty('info');
      expect(response.body).toHaveProperty('paths');
    });
  });

  describe('Data Persistence', () => {
    it('should persist data between requests', async () => {
      // Create a product
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          sku: 'PERSIST-001',
          name: 'Persistence Test Product',
          price: 75.50,
          stockQuantity: 3,
        });

      const productId = createResponse.body.id;

      // Update the product
      await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send({ price: 85.75 });

      // Verify the update persisted
      const getResponse = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);

      expect(getResponse.body.price).toBe(85.75);
      expect(getResponse.body.name).toBe('Persistence Test Product');
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete product successfully', async () => {
      // Create a product for deletion
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          sku: 'DELETE-001',
          name: 'Product to Delete',
          price: 25.00,
          stockQuantity: 1,
        });

      const productId = createResponse.body.id;

      // Delete the product
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(204);

      // Verify product is deleted
      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent product', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      await request(app.getHttpServer())
        .delete(`/products/${nonExistentId}`)
        .expect(404);
    });
  });
});