-- V2__seed_data.sql
-- BookStore E-Commerce Platform - Sample Data

-- =============================================
-- Insert Categories
-- =============================================
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Văn học', 'van-hoc', 'Tiểu thuyết, truyện ngắn, thơ, văn học Việt Nam và thế giới', 1),
('Khoa học', 'khoa-hoc', 'Sách khoa học tự nhiên, khoa học xã hội', 2),
('Kinh tế', 'kinh-te', 'Sách kinh doanh, tài chính, marketing', 3),
('Kỹ năng sống', 'ky-nang-song', 'Sách phát triển bản thân, kỹ năng giao tiếp', 4),
('Sách thiếu nhi', 'sach-thieu-nhi', 'Sách tranh, truyện cho trẻ em', 5),
('Sách ngoại ngữ', 'sach-ngoai-ngu', 'Sách học tiếng Anh, tiếng Nhật, và các ngoại ngữ khác', 6),
('Công nghệ', 'cong-nghe', 'Lập trình, AI, Khoa học máy tính', 7),
('Nghệ thuật', 'nghe-thuat', 'Hội họa, nhiếp ảnh, thiết kế', 8);

-- =============================================
-- Insert Products
-- =============================================
INSERT INTO products (name, slug, author, publisher, published_year, isbn, price, discount_percent, stock_quantity, image_url, page_count, language, is_featured, is_new, category_id) VALUES
('Đắc Nhân Tâm', 'dac-nhan-tam', 'Dale Carnegie', 'NXB Tổng hợp TP.HCM', 2023, '978-604-9-10247-7', 79000, 15, 50, 'https://picsum.photos/seed/book1/400/600', 320, 'Vietnamese', TRUE, FALSE, 4),
('Nhà Giả Kim', 'nha-gia-kim', 'Paulo Coelho', 'NXB Hội Nhà Văn', 2022, '978-604-9-10248-8', 95000, 10, 100, 'https://picsum.photos/seed/book2/400/600', 208, 'Vietnamese', TRUE, TRUE, 1),
('Tuổi Trẻ Đáng Giá Bao Nhiêu', 'tuoi-tre-dang-gia-bao-nhieu', 'Rosie Nguyễn', 'NXB Hội Nhà Văn', 2023, '978-604-9-10249-9', 110000, 0, 80, 'https://picsum.photos/seed/book3/400/600', 280, 'Vietnamese', TRUE, TRUE, 4),
('Clean Code', 'clean-code', 'Robert C. Martin', 'Prentice Hall', 2021, '978-0132350884', 450000, 5, 30, 'https://picsum.photos/seed/book4/400/600', 464, 'English', TRUE, FALSE, 7),
('Steve Jobs', 'steve-jobs', 'Walter Isaacson', 'Simon & Schuster', 2020, '978-1451648539', 380000, 20, 25, 'https://picsum.photos/seed/book5/400/600', 656, 'English', FALSE, FALSE, 3),
('Atomic Habits', 'atomic-habits', 'James Clear', 'Avery Publishing', 2022, '978-0735211292', 320000, 10, 45, 'https://picsum.photos/seed/book6/400/600', 320, 'English', TRUE, TRUE, 4),
('Doraemon', 'doraemon-tap-1', 'Fujiko F. Fujio', 'Kim Đồng', 2023, '978-604-9-10250-0', 35000, 0, 200, 'https://picsum.photos/seed/book7/400/600', 192, 'Vietnamese', TRUE, TRUE, 5),
('Oxford English Grammar', 'oxford-english-grammar', 'Sylvette Maidin', 'Oxford University Press', 2021, '978-0194033120', 280000, 15, 40, 'https://picsum.photos/seed/book8/400/600', 304, 'English', FALSE, FALSE, 6);

-- =============================================
-- Insert Coupons
-- =============================================
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_user_limit, valid_from, valid_until) VALUES
('WELCOME10', 'Chào mừng khách hàng mới - Giảm 10%', 'PERCENT', 10, 0, 50000, 1000, 1, '2024-01-01 00:00:00', '2026-12-31 23:59:59'),
('SUMMER2024', 'Khuyến mãi mùa hè - Giảm 15%', 'PERCENT', 15, 100000, 100000, 500, 1, '2024-06-01 00:00:00', '2026-09-30 23:59:59'),
('FREESHIP', 'Miễn phí vận chuyển đơn từ 200K', 'FREE_SHIPPING', 0, 200000, 0, 2000, 3, '2024-01-01 00:00:00', '2026-12-31 23:59:59'),
('SAVE50K', 'Giảm trực tiếp 50K', 'FIXED', 50000, 200000, 50000, 300, 1, '2024-01-01 00:00:00', '2026-12-31 23:59:59');

-- =============================================
-- Insert Flash Sale
-- =============================================
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, usage_limit, per_user_limit, valid_from, valid_until)
SELECT 'FLASH50', 'Flash Sale - Giảm 50%', 'PERCENT', 50, 0, 100, 1,
DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY);
