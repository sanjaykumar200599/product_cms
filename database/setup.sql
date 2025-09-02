-- Create Database
CREATE DATABASE products_cms;
USE products_cms;

-- Create Products Table
CREATE TABLE Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    product_desc TEXT,
    status ENUM('Draft', 'Published', 'Archived') DEFAULT 'Draft',
    
    -- Audit Columns
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Insert Sample Data
INSERT INTO Products (product_name, product_desc, created_by, status)
VALUES 
('Product A', 'Description for Product A', 'admin', 'Draft'),
('Product B', 'Description for Product B', 'admin', 'Published');

-- Verify the table structure
DESCRIBE Products;

-- View sample data
SELECT * FROM Products;