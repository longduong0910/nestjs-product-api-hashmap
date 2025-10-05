-- Initialize database with basic configuration
-- This script will be executed when the PostgreSQL container starts

-- Create additional extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- You can add any initial database setup here
-- For example, create additional schemas, functions, etc.

COMMENT ON DATABASE product_db IS 'Product API Database for E-commerce Application';