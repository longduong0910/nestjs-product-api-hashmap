# Product API with Custom Hashmap

A NestJS-based RESTful API application for product management featuring a custom hashmap implementation and file attachment handling system.

## 🎯 Project Overview

This project demonstrates backend development skills by implementing:
- **RESTful Product API** with complete CRUD operations and category filtering
- **Custom Hashmap Data Structure** built from scratch with separate chaining collision resolution
- **File Upload System** with metadata caching using the custom hashmap
- **Directory Tree Visualization** for uploaded files structure
- **Clean Architecture** following Repository Pattern and Domain-Driven Design principles

## 🛠️ Technologies & Libraries

### Core Framework & Language
- **Node.js** (v18+) - JavaScript runtime
- **NestJS** (v11.0.1) - Progressive Node.js framework for scalable server-side applications
- **TypeScript** (v5.7.3) - Type-safe JavaScript with decorators and metadata support

### Database & ORM
- **PostgreSQL** (v15) - Primary relational database with JSON support
- **TypeORM** (v0.3.27) - Object-Relational Mapping with entity synchronization
- **Docker & Docker Compose** - Database containerization with pgAdmin management interface

### API & Documentation
- **RESTful API** - Following REST principles and HTTP standards
- **Swagger/OpenAPI** (v11.2.0) - Interactive API documentation and testing interface
- **Class Validator** (v0.14.2) - Input validation with decorators
- **Class Transformer** (v0.5.1) - Object transformation and serialization

### File Handling
- **Multer** - Multi-file upload middleware with disk storage
- **Node.js fs/path** - File system operations for directory tree scanning and management
- **UUID** (v8.3.2) - Unique identifier generation for files and entities

### Development & Testing
- **Jest** (v29.2.5) - Comprehensive unit and integration testing framework
- **Supertest** (v7.0.0) - HTTP assertion testing for API endpoints
- **ESLint & Prettier** - Code linting and formatting with TypeScript support
- **ts-jest** - TypeScript support for Jest testing framework

### Custom Implementations
- **Custom Hashmap** - Generic hashmap with automatic resizing and collision handling
- **Repository Pattern** - Data access layer abstraction for clean architecture
- **Domain-Service Architecture** - Clear separation of concerns and business logic

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v18+) - JavaScript runtime environment
- **Docker & Docker Compose** - For database containerization
- **npm** - Node package manager (comes with Node.js)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/longduong0910/nestjs-product-api-hashmap.git
cd product-api

# Install all dependencies
npm install
```

### 2. Environment Configuration
The project includes a pre-configured `.env` file with the following settings:
```env
# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=product_db

# Application Configuration
NODE_ENV=development
APP_PORT=3000

# TypeORM Configuration
TYPEORM_SYNCHRONIZE=true
TYPEORM_LOGGING=true
TYPEORM_DROP_SCHEMA=false
```

### 3. Start Database Services
```bash
# Start PostgreSQL and pgAdmin with Docker Compose
docker-compose up -d

# Verify database is running
docker-compose ps
```

### 4. Start the Application
```bash
# Development mode with hot reload and auto-restart
npm run start:dev

# Alternative: Watch mode
npm run start:debug

# For production build and run
npm run build
npm run start:prod
```

### 5. Access the Application
- **API Server**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/swagger
- **Database Admin (pgAdmin)**: http://localhost:5050
  - Email: admin@admin.com
  - Password: admin123
- **PostgreSQL Direct Connection**: localhost:5432

## 📋 Features Implemented

### ✅ **Core Backend Infrastructure**
- [x] **NestJS Application Setup** - Complete project structure with modules, controllers, services
- [x] **TypeScript Configuration** - Strict typing with decorators and metadata reflection
- [x] **Database Integration** - PostgreSQL with TypeORM, entity synchronization, and migrations
- [x] **Docker Environment** - Containerized PostgreSQL with pgAdmin management interface
- [x] **Environment Configuration** - Environment variables for database and application settings

### ✅ **Custom Data Structure Implementation**
- [x] **Custom Hashmap Class** - Built from scratch with TypeScript generics `<K, V>`
  - **Core Operations**: `set()`, `get()`, `delete()`, `has()`, `clear()`, `size`
  - **Advanced Methods**: `keys()`, `values()`, `entries()`, `forEach()`
  - **Collision Resolution**: Separate chaining with linked list implementation
  - **Dynamic Resizing**: Automatic capacity adjustment based on load factor (0.75)
  - **Hash Function**: Custom hash utilities with string and generic key support
  - **Memory Efficient**: Proper bucket management and node cleanup

### ✅ **Product Management API**
- [x] **Complete CRUD Operations**:
  - `POST /products` - Create product with validation (returns 201)
  - `GET /products` - List all products with optional category filtering
  - `GET /products/:id` - Get single product by UUID (returns 404 if not found)
  - `PATCH /products/:id` - Update product with partial data
  - `DELETE /products/:id` - Delete product (returns 204 No Content)

- [x] **Product Data Model**:
  - UUID primary key, unique SKU constraint
  - Core fields: name, price, stockQuantity, status, category
  - Optional fields: description, thumbnailUrl, attributes (JSONB), tags (array)
  - Timestamps: createdAt, updatedAt

- [x] **Input Validation & Error Handling**:
  - DTO validation with class-validator decorators
  - Proper HTTP status codes and error responses
  - Duplicate SKU prevention with database constraints

### ✅ **File Attachment System**
- [x] **Multi-File Upload** - `POST /attachments/upload` with Multer integration
  - Support for multiple files in single request
  - Optional product association and custom folder paths
  - File metadata extraction (name, size, MIME type, checksum)
  - Automatic directory creation and file organization

- [x] **Custom Hashmap Integration** - File metadata caching system
  - **Caching Strategy**: File path as key, metadata object as value
  - **Performance**: O(1) average lookup time for file information
  - **Bootstrap Process**: Automatic hashmap population from database on application start
  - **Real-time Updates**: Cache synchronization on file operations

- [x] **Directory Tree Visualization** - `GET /attachments/tree`
  - Recursive directory scanning starting from uploads folder
  - Hierarchical JSON structure with file/folder type detection
  - Sorted output (folders first, then files alphabetically)

### ✅ **API Documentation & Testing**
- [x] **Swagger/OpenAPI Integration** - Interactive documentation at `/swagger`
  - Complete endpoint documentation with request/response examples
  - Schema definitions for all DTOs and entities
  - API tags for logical grouping (products, attachments)
  - Built-in API testing interface

- [x] **Comprehensive Test Suite**:
  - **Unit Tests**: Custom hashmap, services, controllers, repositories
  - **Integration Tests**: End-to-end API testing with in-memory database
  - **DTO Validation Tests**: Input validation and transformation testing
  - **Test Coverage**: Core business logic and critical paths covered

### ✅ **Architecture & Code Quality**
- [x] **Repository Pattern** - Clean separation of data access logic
- [x] **Domain-Driven Design** - Clear separation between entities, DTOs, and domain interfaces
- [x] **Dependency Injection** - Proper service composition and testability
- [x] **Error Handling** - Global exception filters and proper HTTP error responses
- [x] **Code Quality** - ESLint, Prettier, and TypeScript strict mode configuration

## ❌ Features Not Implemented

### **Authentication & Authorization**
- **JWT Authentication** - User login/registration system not implemented
- **Role-Based Access Control** - No permission-based endpoint protection
- **API Key Authentication** - No API key validation for external access
- **Rate Limiting** - No request throttling or abuse prevention

**Reason**: The requirements focused on core API functionality and custom data structures rather than security features. Authentication would require additional modules for user management, JWT tokens, and security guards.

### **Advanced Search & Filtering**
- **Full-Text Search** - No Elasticsearch or advanced search capabilities
- **Complex Product Filtering** - Limited to basic category filtering only
- **Search Autocomplete** - No suggestion or autocomplete endpoints
- **Faceted Search** - No multi-criteria filtering with counts

**Reason**: The project prioritized the custom hashmap implementation and basic CRUD operations. Advanced search would require additional search engines or complex database queries that were outside the scope.

### **Pagination & Performance Features**
- **Pagination Support** - No limit/offset or cursor-based pagination
- **Sorting Options** - No customizable sorting for product listings
- **Database Indexing Strategy** - Basic indexes only, no performance optimization
- **Response Caching** - No Redis or memory caching for frequently accessed data

**Reason**: The focus was on demonstrating core functionality with the custom hashmap. Pagination and performance optimization would be important for production but weren't specified in the requirements.

### **Advanced File Features**
- **File Download Endpoints** - No direct file serving or download URLs
- **File Validation** - Basic file type detection only, no content validation
- **Image Processing** - No thumbnail generation or image manipulation
- **File Versioning** - No version control or file history tracking

**Reason**: The file system implementation focused on upload, metadata caching, and directory tree visualization as specified. Advanced file processing would require additional libraries and wasn't part of the core requirements.

### **Monitoring & Observability**
- **Application Logging** - Basic console logging only, no structured logging
- **Health Check Endpoints** - No application health monitoring
- **Performance Metrics** - No application performance monitoring (APM)
- **Error Tracking** - No external error reporting integration

**Reason**: The project prioritized functional requirements over operational concerns. Monitoring features would be essential for production deployment but weren't part of the initial specification.

## 🏗️ Architecture & Design Patterns

### **Project Structure**
```
src/
├── app.module.ts           # Root application module
├── main.ts                 # Application bootstrap and Swagger setup
├── database/               # Database configuration and entities
│   ├── database.module.ts  # TypeORM configuration with environment variables
│   └── entities/           # Database entity definitions
├── modules/
│   ├── products/           # Product management module
│   │   ├── products.controller.ts   # HTTP endpoints and validation
│   │   ├── products.service.ts      # Business logic layer
│   │   ├── products.repository.ts   # Data access layer
│   │   ├── dto/            # Data transfer objects with validation
│   │   └── interfaces/     # Domain interfaces and contracts
│   ├── attachments/        # File attachment module
│   │   ├── attachments.controller.ts # File upload and tree endpoints
│   │   ├── attachments.service.ts    # File handling and hashmap integration
│   │   ├── attachments.repository.ts # Database operations for files
│   │   └── dto/            # File upload and response DTOs
│   └── hashmap/            # Custom hashmap implementation
│       ├── custom-hashmap.ts # Core hashmap class with generic typing
│       ├── hash-utils.ts    # Hash function utilities
│       ├── types.ts         # Type definitions and constants
│       └── hashmap.module.ts # NestJS module with dependency injection
└── common/                 # Shared utilities and configurations
```

### **Custom Hashmap Design**
- **Generic Implementation**: Full TypeScript type safety with `<K, V>` generics
- **Separate Chaining**: Collision resolution using linked list nodes
- **Dynamic Resizing**: Automatic capacity doubling when load factor exceeds 0.75
- **Hash Function**: Configurable hash functions with default string implementation
- **Memory Management**: Proper node cleanup and bucket reallocation
- **Performance**: O(1) average case for get/set/delete operations

### **Repository Pattern Implementation**
- **Abstraction Layer**: Clean separation between business logic and data access
- **Dependency Injection**: Repositories injected into services for loose coupling
- **Testability**: Easy mocking of data layer for unit testing
- **Database Independence**: TypeORM abstraction allows database switching

## 📊 API Endpoints Reference

### Products API (`/products`)
| Method | Endpoint | Description | Request Body | Response | Status Codes |
|--------|----------|-------------|--------------|----------|--------------|
| `GET` | `/products` | List all products with optional category filtering | None | `ProductResponseDto[]` | 200 |
| `GET` | `/products?category=Electronics` | Filter products by category | None | `ProductResponseDto[]` | 200 |
| `GET` | `/products/:id` | Get single product by UUID | None | `ProductResponseDto` | 200, 404 |
| `POST` | `/products` | Create new product | `CreateProductDto` | `ProductResponseDto` | 201, 400 |
| `PATCH` | `/products/:id` | Update existing product | `UpdateProductDto` | `ProductResponseDto` | 200, 404 |
| `DELETE` | `/products/:id` | Delete product by ID | None | Empty | 204, 404 |

### Attachments API (`/attachments`)
| Method | Endpoint | Description | Request Body | Response | Status Codes |
|--------|----------|-------------|--------------|----------|--------------|
| `POST` | `/attachments/upload` | Upload multiple files with metadata | `multipart/form-data` | `AttachmentResponseDto[]` | 201, 400 |
| `GET` | `/attachments/tree` | Get hierarchical directory structure | None | `Node` (tree structure) | 200 |

## 🧪 Testing Strategy

### Available Test Commands
```bash
# Run all tests (unit + integration)
npm run test

# Run only unit tests
npm run test:unit

# Run only integration tests  
npm run test:integration

# Run tests with coverage report
npm run test:cov

# Run tests in watch mode for development
npm run test:watch
npm run test:unit:watch
npm run test:integration:watch

# Debug tests with Node.js inspector
npm run test:debug
```

### Test Coverage Overview

#### **Unit Tests** (`test/unit/`)
- **Custom Hashmap** (`custom-hashmap.spec.ts`)
  - Core operations: set, get, delete, has, clear
  - Collision handling with separate chaining
  - Dynamic resizing based on load factor
  - Iterator methods: keys, values, entries, forEach
  - Edge cases: null/undefined values, duplicate keys

- **Hash Utils** (`hash-utils.spec.ts`)
  - String hashing algorithms
  - Hash distribution and collision testing
  - Performance benchmarking

- **Products Module**
  - **Service Tests** (`products.service.spec.ts`) - Business logic validation
  - **Controller Tests** (`products.controller.spec.ts`) - HTTP endpoint behavior
  - **Repository Tests** (`products.repository.spec.ts`) - Data access operations
  - **DTO Validation** (`dto-validation.spec.ts`) - Input validation rules

- **Attachments Module**
  - **Service Tests** (`attachments.service.spec.ts`) - File handling and hashmap integration
  - **Controller Tests** (`attachments.controller.spec.ts`) - File upload endpoints

#### **Integration Tests** (`test/integration/`)
- **End-to-End API Testing** (`app.integration.spec.ts`)
  - Complete product CRUD workflow
  - File upload and metadata storage
  - Directory tree generation
  - Database interactions with in-memory SQLite
  - Error handling and edge cases

### Test Configuration
- **Framework**: Jest with TypeScript support
- **Database**: In-memory SQLite for integration tests
- **Mocking**: Service and repository layer mocking for unit tests
- **Coverage**: Excludes DTOs, entities, and configuration files
- **Timeout**: 10 seconds for complex integration scenarios

## 🔧 Development Commands

### Application Commands
```bash
# Development server with hot reload
npm run start:dev

# Debug mode with inspector
npm run start:debug

# Production build and start
npm run build
npm run start:prod

# Basic start (no watch mode)  
npm start
```

### Code Quality Commands
```bash
# Run ESLint with auto-fix
npm run lint

# Format code with Prettier
npm run format

# Type checking without build
npx tsc --noEmit
```

### Database Commands
```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Stop all services
docker-compose down

# View database logs
docker-compose logs postgres

# Connect to PostgreSQL directly
docker exec -it product-api-postgres psql -U postgres -d product_db
```

### Testing Commands
```bash
# Run all tests
npm run test

# Specific test suites
npm run test:unit
npm run test:integration

# Coverage and watch modes
npm run test:cov
npm run test:watch
```

## 📱 API Usage Examples

### Product Management

#### Create a New Product
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "LAPTOP-001",
    "name": "Gaming Laptop Pro",
    "description": "High-performance gaming laptop with RTX graphics",
    "price": 1299.99,
    "stockQuantity": 50,
    "category": "Electronics",
    "status": "active",
    "attributes": {
      "brand": "TechPro",
      "warranty": "2 years",
      "color": "Black"
    },
    "tags": ["laptop", "gaming", "electronics"]
  }'
```

#### Get All Products with Category Filter
```bash
# Get all products
curl -X GET http://localhost:3000/products

# Filter by category
curl -X GET "http://localhost:3000/products?category=Electronics"
```

#### Update a Product
```bash
curl -X PATCH http://localhost:3000/products/{product-id} \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1199.99,
    "stockQuantity": 45
  }'
```

### File Attachment Management

#### Upload Multiple Files
```bash
# Upload files with product association
curl -X POST http://localhost:3000/attachments/upload \
  -F "files=@product-manual.pdf" \
  -F "files=@product-image.jpg" \
  -F "files=@warranty-info.pdf" \
  -F "productId=550e8400-e29b-41d4-a716-446655440000"

# Upload to custom folder
curl -X POST http://localhost:3000/attachments/upload \
  -F "files=@contract.pdf" \
  -F "folderPath=documents/contracts/2024"
```

#### Get Directory Tree Structure
```bash
curl -X GET http://localhost:3000/attachments/tree
```

### Response Examples

#### Product Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sku": "LAPTOP-001",
  "name": "Gaming Laptop Pro",
  "description": "High-performance gaming laptop with RTX graphics",
  "price": 1299.99,
  "stockQuantity": 50,
  "category": "Electronics",
  "status": "active",
  "attributes": {
    "brand": "TechPro",
    "warranty": "2 years",
    "color": "Black"
  },
  "tags": ["laptop", "gaming", "electronics"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Directory Tree Response
```json
{
  "name": "uploads",
  "type": "folder",
  "path": "/uploads",
  "children": [
    {
      "name": "documents",
      "type": "folder", 
      "path": "/uploads/documents",
      "children": [
        {
          "name": "contract.pdf",
          "type": "file",
          "path": "/uploads/documents/contract.pdf"
        }
      ]
    },
    {
      "name": "product-image.jpg",
      "type": "file",
      "path": "/uploads/product-image.jpg"
    }
  ]
}
```

## 🎯 Key Technical Achievements

### **1. Custom Data Structure Implementation**
- Built a production-ready generic hashmap `<K, V>` from scratch in TypeScript
- Implemented separate chaining collision resolution with linked list nodes
- Dynamic resizing algorithm with configurable load factor (0.75 default)
- Complete API with 15+ methods including iterators and functional operations
- O(1) average time complexity for core operations

### **2. Clean Architecture & Design Patterns**
- **Repository Pattern**: Clean separation between business logic and data access
- **Domain-Driven Design**: Clear boundaries between entities, DTOs, and domain interfaces
- **Dependency Injection**: Proper IoC container usage with NestJS modules
- **Layered Architecture**: Controller → Service → Repository → Database
- **SOLID Principles**: Single responsibility, open/closed, dependency inversion

### **3. Full-Stack Integration**
- **Database Integration**: PostgreSQL with TypeORM, automatic schema synchronization
- **File System Management**: Multer integration with custom directory organization
- **Caching Strategy**: Custom hashmap for file metadata with O(1) lookups
- **API Documentation**: Interactive Swagger UI with complete endpoint specifications
- **Docker Environment**: Multi-container setup with database and admin interface

### **4. TypeScript Excellence**
- **Strict Type Safety**: Full TypeScript coverage with strict compiler options
- **Generic Programming**: Type-safe hashmap implementation with generic constraints
- **Decorator Usage**: Extensive use of NestJS, TypeORM, and validation decorators
- **Interface Design**: Clear contracts between layers with proper abstraction
- **Type Transformation**: DTO mapping and entity-domain model conversion

### **5. Testing & Quality Assurance**
- **Comprehensive Test Suite**: 18 test files covering unit and integration scenarios
- **High Coverage**: Core business logic, data structures, and API endpoints
- **Test Strategy**: Isolated unit tests with mocking, end-to-end integration tests
- **Quality Tools**: ESLint, Prettier, Jest with coverage reporting
- **CI/CD Ready**: Test scripts for automated pipeline integration

### **6. RESTful API Best Practices**
- **HTTP Semantics**: Proper status codes, methods, and content negotiation
- **Error Handling**: Consistent error responses with appropriate HTTP codes
- **Input Validation**: Comprehensive DTO validation with class-validator
- **Response Structure**: Standardized response formats and proper serialization
- **API Versioning Ready**: Modular structure supports future versioning

## 📝 Implementation Summary

This project demonstrates **enterprise-grade backend development** skills through:

**Technical Depth**: Custom data structure implementation showcasing computer science fundamentals with real-world application in a caching system.

**Architecture Quality**: Clean, maintainable code structure following industry best practices with proper separation of concerns and testable design.

**Full-Stack Competency**: Complete integration of database, API, file system, caching, and documentation systems working together seamlessly.

**Modern Development Practices**: TypeScript-first development, comprehensive testing, containerization, interactive API documentation, and production-ready configuration.

**Problem-Solving Approach**: Practical application of the custom hashmap for file metadata caching, demonstrating understanding of when and how to apply custom data structures effectively.

The implementation successfully fulfills all core requirements while providing a solid foundation for future enhancements and production deployment.

---

**Author**: Long Duong  
**Technology Stack**: NestJS, TypeScript, PostgreSQL, Docker, Jest  
**Repository**: https://github.com/longduong0910/nestjs-product-api-hashmap

## 🚀 Quick Start Guide

### 1. Prerequisites Check
```bash
# Verify Node.js version (v18+ required)
node --version

# Verify Docker is running
docker --version
docker-compose --version
```

### 2. Project Setup
```bash
# Clone and install
git clone https://github.com/longduong0910/nestjs-product-api-hashmap.git
cd product-api
npm install

# Start database
docker-compose up -d

# Start application
npm run start:dev
```

### 3. Verify Installation
```bash
# Check API health
curl http://localhost:3000/products

# Access Swagger documentation
open http://localhost:3000/swagger

# Run tests
npm run test
```

### 4. Development Workflow
```bash
# Code with hot reload
npm run start:dev

# Run tests in watch mode  
npm run test:watch

# Check code quality
npm run lint
npm run format
```

## 📚 Additional Resources

### NestJS Framework
- [Official NestJS Documentation](https://docs.nestjs.com) - Complete framework documentation
- [NestJS CLI](https://docs.nestjs.com/cli/overview) - Command-line interface for development
- [NestJS Modules](https://docs.nestjs.com/modules) - Understanding the module system

### TypeScript & Node.js
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - Language reference and guides
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - Production best practices

### Database & ORM  
- [TypeORM Documentation](https://typeorm.io/) - Database ORM documentation
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Database reference

### Testing
- [Jest Documentation](https://jestjs.io/docs/getting-started) - Testing framework
- [Supertest Documentation](https://github.com/visionmedia/supertest) - HTTP testing library

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support & Contact

- **Author**: Long Duong
- **Email**: longduong2412@gmail.com
- **Repository**: [GitHub - nestjs-product-api-hashmap](https://github.com/longduong0910/nestjs-product-api-hashmap)
- **Issues**: [GitHub Issues](https://github.com/longduong0910/nestjs-product-api-hashmap/issues)

For questions about NestJS framework:
- [NestJS Discord](https://discord.gg/G7Qnnhy)
- [Stack Overflow - NestJS](https://stackoverflow.com/questions/tagged/nestjs)
