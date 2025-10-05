# Product API with Custom Hashmap

A comprehensive NestJS API application for product management featuring a custom hashmap implementation, file attachment handling, and directory tree structure visualization.

## 🎯 Project Overview

This project demonstrates advanced backend development skills by implementing:
- **RESTful Product API** with full CRUD operations
- **Custom Hashmap Data Structure** built from scratch using separate chaining for collision resolution
- **File Upload System** with metadata caching using the custom hashmap
- **Directory Tree Visualization** with recursive folder scanning
- **Clean Architecture** following Repository Pattern and Domain-Driven Design principles

## 🛠️ Technologies & Libraries

### Core Framework & Language
- **Node.js** (v18+) - JavaScript runtime
- **NestJS** (v11) - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript

### Database & ORM
- **PostgreSQL** - Primary database
- **TypeORM** - Object-Relational Mapping
- **Docker & Docker Compose** - Database containerization

### API & Documentation
- **RESTful API** - Following REST principles
- **Swagger/OpenAPI** - API documentation and testing interface
- **Class Validator** - Input validation and transformation

### File Handling
- **Multer** - Multi-file upload middleware
- **Node.js fs** - File system operations for directory tree scanning

### Development & Testing
- **Jest** - Unit testing framework
- **ESLint & Prettier** - Code linting and formatting
- **TypeScript ESLint** - TypeScript-specific linting rules

### Custom Implementations
- **Custom Hashmap** - Built from scratch with separate chaining collision resolution
- **Repository Pattern** - Data access layer abstraction
- **Domain-Service Architecture** - Clean separation of concerns

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- npm or yarn

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd product-api

# Install dependencies
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=productdb

# Application Configuration
APP_PORT=3000
NODE_ENV=development
```

### 3. Start Database
```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d

# Wait for database to be ready
```

### 4. Run Database Migrations
```bash
# TypeORM will automatically sync entities
npm run start:dev
```

### 5. Start the Application
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 6. Access the Application
- **API Server**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api
- **Database**: PostgreSQL on localhost:5432

## 📋 Features Implemented

### ✅ **Phase 1: Project Setup & Data Structures (100% Complete)**
- [x] **Project Initialization**: NestJS with TypeScript, ESLint/Prettier configuration
- [x] **Product Schema**: Complete ProductDto and Entity with UUID, name, description, price, stockQuantity, category
- [x] **PostgreSQL Configuration**: Docker Compose setup with TypeORM integration
- [x] **Custom Hashmap**: From-scratch implementation with separate chaining collision resolution
  - Generic TypeScript implementation `<K, V>`
  - Core methods: `set()`, `get()`, `delete()`, `has()`, `clear()`
  - Advanced methods: `keys()`, `values()`, `entries()`, `forEach()`
  - Automatic resizing based on load factor
  - Comprehensive collision handling with linked list chaining

### ✅ **Phase 2: Product CRUD API (100% Complete)**
- [x] **POST /products** - Create new product with validation
- [x] **GET /products** - Retrieve all products with optional category filtering  
- [x] **GET /products/:id** - Get single product by ID with 404 error handling
- [x] **PATCH /products/:id** - Update product with partial data
- [x] **DELETE /products/:id** - Delete product with 204 No Content response

**RESTful Compliance:**
- Proper HTTP methods and status codes
- JSON request/response format
- Input validation with NestJS ValidationPipe
- Exception handling with appropriate HTTP responses

### ✅ **Phase 3: File Attachments & Directory Tree (100% Complete)**
- [x] **POST /attachments/upload** - Multi-file upload with Multer
- [x] **Custom Hashmap Integration** - File metadata caching system
  - Key: File path or Product ID + filename
  - Value: File metadata (original name, size, MIME type, etc.)
- [x] **Directory Tree Structure** - Recursive folder scanning
- [x] **GET /attachments/tree** - JSON tree structure endpoint
  - Nested folder support
  - File extension detection
  - Hierarchical Node structure: `{ name, type, path, children? }`

### ✅ **Phase 4: Documentation & Quality (100% Complete)**
- [x] **Swagger API Documentation** - Complete OpenAPI specification
  - All endpoints documented with examples
  - Request/response schemas
  - Interactive API testing interface
- [x] **Unit Testing** - Jest test suites for:
  - Custom Hashmap functionality
  - Products Service business logic  
  - Attachments Service operations
- [x] **Repository Pattern** - Clean data access layer separation
- [x] **README Documentation** - Comprehensive setup and feature guide
- [x] **Application Validation** - Fully functional application
- [x] **Git Repository** - Complete version control with meaningful commits

## 🏗️ Architecture & Design Patterns

### **Clean Architecture Implementation**
```
├── Controllers/     # HTTP request/response handling
├── Services/        # Business logic layer
├── Repositories/    # Data access layer
├── Entities/        # Database models
├── DTOs/           # Data transfer objects
├── Interfaces/     # Domain contracts
└── Utils/          # Shared utilities
```

### **Custom Hashmap Architecture**
- **Separate Chaining**: Collision resolution using linked lists
- **Dynamic Resizing**: Automatic capacity adjustment based on load factor
- **Generic Implementation**: Full TypeScript type safety
- **Performance Optimized**: O(1) average case for core operations

### **Repository Pattern Benefits**
- Database abstraction layer
- Testability through dependency injection
- Clean separation of data access logic
- Easy to mock for unit testing

## 📊 API Endpoints Overview

### Products API
| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| GET | `/products` | Get all products (with category filter) | 200 |
| GET | `/products/:id` | Get product by ID | 200, 404 |
| POST | `/products` | Create new product | 201, 400 |
| PATCH | `/products/:id` | Update product | 200, 404 |
| DELETE | `/products/:id` | Delete product | 204, 404 |

### Attachments API
| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| POST | `/attachments/upload` | Upload multiple files | 201, 400 |
| GET | `/attachments/tree` | Get directory tree structure | 200 |

## 🧪 Testing

### Run Unit Tests
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### Test Coverage Areas
- **Custom Hashmap**: Core functionality, collision handling, resizing
- **Products Service**: CRUD operations, error handling, data validation
- **Attachments Service**: File handling, metadata caching, tree generation

## 🔧 Development Commands

```bash
# Start development server
npm run start:dev

# Build for production  
npm run build

# Run linting
npm run lint

# Format code
npm run format

# Run all tests
npm run test

# Start database only
docker-compose up -d
```

## 📱 Usage Examples

### Creating a Product
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Pro",
    "sku": "LP-001", 
    "price": 1299.99,
    "category": "Electronics"
  }'
```

### Uploading Files
```bash
curl -X POST http://localhost:3000/attachments/upload \
  -F "files=@document1.pdf" \
  -F "files=@image1.jpg" \
  -F "productId=uuid-here"
```

### Getting Directory Tree
```bash
curl -X GET http://localhost:3000/attachments/tree
```

## 🎯 Key Technical Achievements

1. **Custom Data Structure**: Built a production-ready hashmap from scratch with proper collision handling
2. **Clean Architecture**: Implemented Repository Pattern with clear separation of concerns  
3. **Full-Stack Integration**: Database, API, file system, and caching working together seamlessly
4. **TypeScript Excellence**: Strong typing throughout the application with proper interfaces
5. **Testing Strategy**: Comprehensive unit tests covering critical business logic
6. **API Best Practices**: RESTful design with proper HTTP semantics and error handling
7. **Documentation Excellence**: Complete Swagger API docs and detailed README

## 📝 Notes on Implementation

This implementation demonstrates enterprise-level backend development practices:

- **Scalability**: Custom hashmap with automatic resizing and efficient collision resolution
- **Maintainability**: Clean code structure with proper abstractions and interfaces  
- **Testability**: Dependency injection and repository pattern enable easy unit testing
- **Performance**: Optimized file handling with metadata caching using custom hashmap
- **Security**: Input validation, type safety, and proper error handling
- **Documentation**: Complete API documentation and comprehensive README

The project successfully fulfills all technical requirements while showcasing advanced backend development skills and best practices.

---

**Author**: Long Duong  
**Technology Stack**: NestJS, TypeScript, PostgreSQL, Docker  
**Repository**: https://github.com/longduong0910/nestjs-product-api-hashmap
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
