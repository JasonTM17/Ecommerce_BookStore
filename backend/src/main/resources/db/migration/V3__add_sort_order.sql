-- V3__add_sort_order.sql
-- BookStore E-Commerce Platform - Thêm trường sort_order cho các bảng

-- =============================================
-- Thêm sort_order vào Products
-- =============================================
ALTER TABLE products ADD COLUMN sort_order INT DEFAULT 0;
UPDATE products SET sort_order = id;
ALTER TABLE products ADD INDEX idx_products_sort_order (sort_order);

-- =============================================
-- Thêm sort_order vào Orders
-- =============================================
ALTER TABLE orders ADD COLUMN sort_order INT DEFAULT 0;
UPDATE orders SET sort_order = id;

-- =============================================
-- Thêm sort_order vào Coupons
-- =============================================
ALTER TABLE coupons ADD COLUMN sort_order INT DEFAULT 0;
UPDATE coupons SET sort_order = id;
ALTER TABLE coupons ADD INDEX idx_coupons_sort_order (sort_order);

-- =============================================
-- Thêm sort_order vào Cart Items
-- =============================================
ALTER TABLE cart_items ADD COLUMN sort_order INT DEFAULT 0;
UPDATE cart_items SET sort_order = id;

-- =============================================
-- Thêm sort_order vào Reviews
-- =============================================
ALTER TABLE reviews ADD COLUMN sort_order INT DEFAULT 0;
UPDATE reviews SET sort_order = id;
ALTER TABLE reviews ADD INDEX idx_reviews_sort_order (sort_order);

-- =============================================
-- Thêm sort_order vào Wishlists
-- =============================================
ALTER TABLE wishlists ADD COLUMN sort_order INT DEFAULT 0;
UPDATE wishlists SET sort_order = id;

-- =============================================
-- Thêm sort_order vào Order Items
-- =============================================
ALTER TABLE order_items ADD COLUMN sort_order INT DEFAULT 0;
UPDATE order_items SET sort_order = id;

-- =============================================
-- Thêm sort_order vào Coupon Usages
-- =============================================
ALTER TABLE coupon_usages ADD COLUMN sort_order INT DEFAULT 0;
UPDATE coupon_usages SET sort_order = id;

-- =============================================
-- Thêm sort_order vào Refresh Tokens
-- =============================================
ALTER TABLE refresh_tokens ADD COLUMN sort_order INT DEFAULT 0;
UPDATE refresh_tokens SET sort_order = id;
