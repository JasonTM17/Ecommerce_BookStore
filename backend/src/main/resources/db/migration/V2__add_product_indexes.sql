-- Add performance indexes for products
CREATE INDEX idx_product_is_active ON products(is_active);
CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_product_brand ON products(brand_id);
CREATE INDEX idx_product_is_featured ON products(is_featured);
CREATE INDEX idx_product_is_bestseller ON products(is_bestseller);
CREATE INDEX idx_product_is_new ON products(is_new);
CREATE INDEX idx_product_created_at ON products(created_at);
CREATE INDEX idx_product_sold_count ON products(sold_count);
CREATE INDEX idx_product_view_count ON products(view_count);
CREATE INDEX idx_product_stock_quantity ON products(stock_quantity);
CREATE INDEX idx_product_isbn ON products(isbn);
