package com.bookstore.config;

import com.bookstore.entity.Brand;
import com.bookstore.entity.Category;
import com.bookstore.entity.Product;
import com.bookstore.repository.BrandRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.ProductRepository;
import org.slf4j.Logger;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.Set;

/**
 * Tách logic seed danh mục / NXB / sách để tái sử dụng khi DB có user nhưng chưa có sản phẩm.
 */
public final class CatalogDataSeeder {
    private static final int PRODUCTS_PER_SLOT = 15;
    private static final String[] TITLE_VARIANTS = {
            "Ấn bản đặc biệt",
            "Bản bìa cứng",
            "Phiên bản cập nhật",
            "Tái bản chọn lọc",
            "Bản sưu tầm"
    };
    private static final Map<String, String> PRIORITY_GENERATED_COVERS = Map.ofEntries(
            Map.entry("nghe-thuat/mau-sac-va-cam-xuc-an-ban-dac-biet", "/images/books/generated/nghe-thuat-mau-sac-va-cam-xuc-an-ban-dac-biet.png"),
            Map.entry("nghe-thuat/anh-dep-quanh-ta-an-ban-dac-biet", "/images/books/generated/nghe-thuat-anh-dep-quanh-ta-an-ban-dac-biet.png"),
            Map.entry("nghe-thuat/nhap-mon-hoi-hoa-an-ban-dac-biet", "/images/books/generated/nghe-thuat-nhap-mon-hoi-hoa-an-ban-dac-biet.png"),
            Map.entry("nghe-thuat/so-tay-sang-tao", "/images/books/generated/nghe-thuat-so-tay-sang-tao.png"),
            Map.entry("nghe-thuat/chat-lieu-va-anh-sang", "/images/books/generated/nghe-thuat-chat-lieu-va-anh-sang.png"),
            Map.entry("nghe-thuat/bo-cuc-trong-thiet-ke", "/images/books/generated/nghe-thuat-bo-cuc-trong-thiet-ke.png"),
            Map.entry("nghe-thuat/cau-chuyen-my-thuat", "/images/books/generated/nghe-thuat-cau-chuyen-my-thuat.png"),
            Map.entry("nghe-thuat/nhiep-anh-duong-pho", "/images/books/generated/nghe-thuat-nhiep-anh-duong-pho.png"),
            Map.entry("nghe-thuat/thiet-ke-tu-co-ban", "/images/books/generated/nghe-thuat-thiet-ke-tu-co-ban.png"),
            Map.entry("nghe-thuat/ky-hoa-moi-ngay", "/images/books/generated/nghe-thuat-ky-hoa-moi-ngay.png"),
            Map.entry("nghe-thuat/mau-sac-va-cam-xuc", "/images/books/generated/nghe-thuat-mau-sac-va-cam-xuc.png"),
            Map.entry("nghe-thuat/anh-dep-quanh-ta", "/images/books/generated/nghe-thuat-anh-dep-quanh-ta.png"),
            Map.entry("nghe-thuat/nhap-mon-hoi-hoa", "/images/books/generated/nghe-thuat-nhap-mon-hoi-hoa.png"),
            Map.entry("am-thuc/cam-nang-lam-banh-an-ban-dac-biet", "/images/books/generated/am-thuc-cam-nang-lam-banh-an-ban-dac-biet.png"),
            Map.entry("am-thuc/mon-viet-cuoi-tuan-an-ban-dac-biet", "/images/books/generated/am-thuc-mon-viet-cuoi-tuan-an-ban-dac-biet.png"),
            Map.entry("am-thuc/bep-nha-an-yen-an-ban-dac-biet", "/images/books/generated/am-thuc-bep-nha-an-yen-an-ban-dac-biet.png"),
            Map.entry("am-thuc/nghe-thuat-pha-che", "/images/books/generated/am-thuc-nghe-thuat-pha-che.png"),
            Map.entry("am-thuc/thuc-don-30-ngay", "/images/books/generated/am-thuc-thuc-don-30-ngay.png"),
            Map.entry("am-thuc/mon-ngon-dai-khach", "/images/books/generated/am-thuc-mon-ngon-dai-khach.png"),
            Map.entry("am-thuc/huong-vi-mien-trung", "/images/books/generated/am-thuc-huong-vi-mien-trung.png"),
            Map.entry("am-thuc/bep-chay-moi-ngay", "/images/books/generated/am-thuc-bep-chay-moi-ngay.png"),
            Map.entry("am-thuc/bua-com-gia-dinh", "/images/books/generated/am-thuc-bua-com-gia-dinh.png"),
            Map.entry("sach-giao-khoa/toan-lop-1", "/images/books/generated/sach-giao-khoa-toan-lop-1.png"),
            Map.entry("phat-trien-ban-than/doc-vi-ban-than", "/images/books/generated/phat-trien-ban-than-doc-vi-ban-than.png"),
            Map.entry("lich-su/lich-su-viet-nam", "/images/books/generated/lich-su-lich-su-viet-nam.png"),
            Map.entry("tieu-thuyet/dac-nhan-tam", "/images/books/generated/tieu-thuyet-dac-nhan-tam.png"),
            Map.entry("sach-thieu-nhi/co-be-ban-diem", "/images/books/generated/sach-thieu-nhi-co-be-ban-diem.png"),
            Map.entry("tho/dac-nhan-tam", "/images/books/generated/tho-dac-nhan-tam.png"),
            Map.entry("marketing/nghi-lon", "/images/books/generated/marketing-nghi-lon.png"),
            Map.entry("lanh-dao/nghi-lon", "/images/books/generated/lanh-dao-nghi-lon.png"),
            Map.entry("cong-nghe/co-the-cua-ban", "/images/books/generated/cong-nghe-co-the-cua-ban.png"),
            Map.entry("sach-thieu-nhi/doraemon-tap-1-50", "/images/books/generated/sach-thieu-nhi-doraemon-tap-1-50.png"),
            Map.entry("sach-giao-khoa/vat-ly-lop-10", "/images/books/generated/sach-giao-khoa-vat-ly-lop-10.png"),
            Map.entry("sach-thieu-nhi/alice-o-xu-so-than-tien", "/images/books/generated/sach-thieu-nhi-alice-o-xu-so-than-tien.png"),
            Map.entry("tho/harry-potter-va-hon-da-phu-thuy", "/images/books/generated/tho-harry-potter-va-hon-da-phu-thuy.png"),
            Map.entry("van-hoc-co-dien/harry-potter-va-hon-da-phu-thuy", "/images/books/generated/van-hoc-co-dien-harry-potter-va-hon-da-phu-thuy.png"),
            Map.entry("sach-ngoai-van/1984-george-orwell", "/images/books/generated/sach-ngoai-van-1984-george-orwell.png"),
            Map.entry("am-thuc/cam-nang-lam-banh", "/images/books/generated/am-thuc-cam-nang-lam-banh.png"),
            Map.entry("sach-ngoai-van/pride-and-prejudice", "/images/books/generated/sach-ngoai-van-pride-and-prejudice.png"),
            Map.entry("lanh-dao/khoi-nghiep-tu-san-sau", "/images/books/generated/lanh-dao-khoi-nghiep-tu-san-sau.png"),
            Map.entry("sach-thieu-nhi/harry-potter-bo-day-du", "/images/books/generated/sach-thieu-nhi-harry-potter-bo-day-du.png"),
            Map.entry("khoa-hoc-tu-nhien/nguoi-dan-duong", "/images/books/generated/khoa-hoc-tu-nhien-nguoi-dan-duong.png")
    );

    private CatalogDataSeeder() {
    }

    /**
     * Khi DB đã có danh mục (ví dụ từ lần seed trước) nhưng không có sản phẩm — chỉ thêm sách,
     * không tạo thêm category trùng tên.
     */
    public static List<Product> seedProductsUsingExistingCatalog(
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            ProductRepository productRepository,
            Logger log) {

        if (productRepository.count() > 0) {
            log.info("Products already exist, skip seedProductsUsingExistingCatalog");
            return List.of();
        }

        List<Category> slots = buildCatalogSlots(categoryRepository);
        if (slots.isEmpty()) {
            log.warn("No root categories found; cannot seed products without categories.");
            return List.of();
        }

        List<Brand> brands = brandRepository.findAll();
        if (brands.isEmpty()) {
            brands = ensureDefaultBrands(brandRepository, log);
        }

        Random rand = new Random(42);
        List<Product> products = buildSampleProducts(slots, brands, rand);
        productRepository.saveAll(products);
        log.info("Created {} products (existing catalog)", products.size());
        return products;
    }

    public static List<Product> normalizeExistingProductImages(
            ProductRepository productRepository,
            List<Product> products,
            Logger log) {

        if (products == null || products.isEmpty()) {
            return List.of();
        }

        List<Product> updatedProducts = new ArrayList<>();
        for (Product product : products) {
            String normalizedImageUrl = resolveNormalizedImageUrl(product);
            List<String> normalizedImages = resolveNormalizedImages(product, normalizedImageUrl);

            boolean imageUrlChanged = !normalizedImageUrl.equals(product.getImageUrl());
            boolean imagesChanged = !normalizedImages.equals(product.getImages());

            if (imageUrlChanged || imagesChanged) {
                product.setImageUrl(normalizedImageUrl);
                product.setImages(normalizedImages);
                updatedProducts.add(product);
            }
        }

        if (!updatedProducts.isEmpty()) {
            productRepository.saveAll(updatedProducts);
            log.info("Normalized image paths for {} existing products", updatedProducts.size());
        }

        return products;
    }

    private static List<Brand> ensureDefaultBrands(BrandRepository brandRepository, Logger log) {
        String[][] defaults = {
                {"NXB Trẻ", "Nhà xuất bản Trẻ"},
                {"NXB Văn Học", "Nhà xuất bản Văn học"},
                {"First News", "First News - trí Việt"},
                {"Nhã Nam", "Nhã Nam Publishing"},
                {"Alpha Books", "Alpha Books"},
                {"Saigon Books", "Saigon Books"},
                {"Vintage Books", "Vintage Books"},
                {"Penguin Random House", "Penguin Random House"},
                {"Kim Đồng", "Nhà xuất bản Kim Đồng"},
                {"Đại Học Quốc Gia", "NXB Đại học Quốc gia Hà Nội"},
                {"Tiki Books", "Tiki Books"},
                {"Fahasa", "Fahasa Books"}
        };
        for (String[] d : defaults) {
            if (!brandRepository.existsByName(d[0])) {
                brandRepository.save(
                        Brand.builder().name(d[0]).description(d[1]).isActive(true).build());
            }
        }
        List<Brand> all = brandRepository.findAll();
        log.info("Ensured default brands; {} brands available for product seed", all.size());
        return all;
    }

    public static List<Product> seedCatalog(
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            ProductRepository productRepository,
            Logger log) {

        List<Category> categories = new ArrayList<>();

        Category fiction = Category.builder()
                .name("Sách Văn Học").description("Tiểu thuyết, truyện ngắn, thơ, kịch").sortOrder(1).isActive(true).build();
        fiction = categoryRepository.save(fiction);

        Category business = Category.builder()
                .name("Kinh Tế").description("Sách kinh doanh, tài chính, đầu tư").sortOrder(2).isActive(true).build();
        business = categoryRepository.save(business);

        Category science = Category.builder()
                .name("Khoa Học").description("Sách khoa học, công nghệ").sortOrder(3).isActive(true).build();
        science = categoryRepository.save(science);

        Category selfHelp = Category.builder()
                .name("Phát Triển Bản Thân").description("Sách tự giúp, kỹ năng sống").sortOrder(4).isActive(true).build();
        selfHelp = categoryRepository.save(selfHelp);

        Category children = Category.builder()
                .name("Sách Thiếu Nhi").description("Sách tranh, truyện cho trẻ em").sortOrder(5).isActive(true).build();
        children = categoryRepository.save(children);

        Category history = Category.builder()
                .name("Lịch Sử").description("Sách lịch sử, văn hóa").sortOrder(6).isActive(true).build();
        history = categoryRepository.save(history);

        Category foreign = Category.builder()
                .name("Sách Ngoại Văn").description("Sách tiếng Anh, ngoại ngữ").sortOrder(7).isActive(true).build();
        foreign = categoryRepository.save(foreign);

        Category textbook = Category.builder()
                .name("Sách Giáo Khoa").description("Sách giáo khoa, tham khảo").sortOrder(8).isActive(true).build();
        textbook = categoryRepository.save(textbook);

        Category cooking = Category.builder()
                .name("Ẩm Thực").description("Sách nấu ăn, ẩm thực").sortOrder(9).isActive(true).build();
        cooking = categoryRepository.save(cooking);

        Category art = Category.builder()
                .name("Nghệ Thuật").description("Sách về hội họa, nhiếp ảnh").sortOrder(10).isActive(true).build();
        art = categoryRepository.save(art);

        Category novels = categoryRepository.save(Category.builder()
                .name("Tiểu Thuyết").description("Tiểu thuyết Việt Nam và thế giới").parent(fiction).sortOrder(1).isActive(true).build());
        Category shortStories = categoryRepository.save(Category.builder()
                .name("Truyện Ngắn").description("Tuyển tập truyện ngắn").parent(fiction).sortOrder(2).isActive(true).build());
        Category poetry = categoryRepository.save(Category.builder()
                .name("Thơ").description("Tập thơ, thơ hay").parent(fiction).sortOrder(3).isActive(true).build());
        Category classics = categoryRepository.save(Category.builder()
                .name("Văn Học Cổ Điển").description("Tác phẩm văn học cổ điển").parent(fiction).sortOrder(4).isActive(true).build());

        Category marketing = categoryRepository.save(Category.builder()
                .name("Marketing").description("Sách về marketing, quảng cáo").parent(business).sortOrder(1).isActive(true).build());
        Category finance = categoryRepository.save(Category.builder()
                .name("Tài Chính").description("Sách tài chính, kế toán").parent(business).sortOrder(2).isActive(true).build());
        Category leadership = categoryRepository.save(Category.builder()
                .name("Lãnh Đạo").description("Sách về lãnh đạo, quản trị").parent(business).sortOrder(3).isActive(true).build());

        Category naturalScience = categoryRepository.save(Category.builder()
                .name("Khoa Học Tự Nhiên").description("Vật lý, hóa học, sinh học").parent(science).sortOrder(1).isActive(true).build());
        Category technology = categoryRepository.save(Category.builder()
                .name("Công Nghệ").description("AI, lập trình, IT").parent(science).sortOrder(2).isActive(true).build());

        categories.addAll(List.of(fiction, business, science, selfHelp, children, history, foreign, textbook, cooking, art));
        log.info("Created {} root categories", categories.size());

        List<Brand> brands = new ArrayList<>();
        brands.add(brandRepository.save(Brand.builder().name("NXB Trẻ").description("Nhà xuất bản Trẻ").isActive(true).build()));
        brands.add(brandRepository.save(Brand.builder().name("NXB Văn Học").description("Nhà xuất bản Văn học").isActive(true).build()));
        brands.add(brandRepository.save(Brand.builder().name("First News").description("First News - trí Việt").isActive(true).build()));
        brands.add(brandRepository.save(Brand.builder().name("Nhã Nam").description("Nhã Nam Publishing").isActive(true).build()));
        brands.add(brandRepository.save(Brand.builder().name("Alpha Books").description("Alpha Books").isActive(true).build()));
        brands.add(brandRepository.save(Brand.builder().name("Saigon Books").description("Saigon Books").isActive(true).build()));
        brands.add(brandRepository.save(Brand.builder().name("Vintage Books").description("Vintage Books").isActive(true).build()));
        brands.add(brandRepository.save(Brand.builder().name("Penguin Random House").description("Penguin Random House").isActive(true).build()));
        brands.add(brandRepository.save(Brand.builder().name("Kim Đồng").description("Nhà xuất bản Kim Đồng").isActive(true).build()));
        brands.add(brandRepository.save(Brand.builder().name("Đại Học Quốc Gia").description("NXB Đại học Quốc gia Hà Nội").isActive(true).build()));
        brands.add(brandRepository.save(Brand.builder().name("Tiki Books").description("Tiki Books").isActive(true).build()));
        brands.add(brandRepository.save(Brand.builder().name("Fahasa").description("Fahasa Books").isActive(true).build()));
        log.info("Created {} brands", brands.size());

        List<Category> slots = List.of(
                novels,
                shortStories,
                poetry,
                classics,
                marketing,
                finance,
                leadership,
                naturalScience,
                technology,
                selfHelp,
                children,
                history,
                foreign,
                textbook,
                cooking,
                art
        );
        Random rand = new Random(42);
        List<Product> products = buildSampleProducts(slots, brands, rand);
        productRepository.saveAll(products);
        log.info("Created {} products", products.size());
        return products;
    }

    private static List<Category> buildCatalogSlots(CategoryRepository categoryRepository) {
        List<Category> slots = new ArrayList<>();

        for (Category root : categoryRepository.findByParentIsNullOrderBySortOrderAsc()) {
            if (!Boolean.TRUE.equals(root.getIsActive())) {
                continue;
            }

            List<Category> activeChildren = new ArrayList<>();
            for (Category child : categoryRepository.findByParentIdOrderBySortOrderAsc(root.getId())) {
                if (Boolean.TRUE.equals(child.getIsActive())) {
                    activeChildren.add(child);
                }
            }

            if (activeChildren.isEmpty()) {
                slots.add(root);
            } else {
                slots.addAll(activeChildren);
            }
        }

        return slots;
    }

    private static List<Product> buildSampleProducts(List<Category> categorySlots, List<Brand> brands, Random rand) {
        String[][] bookTitles = {
                {"Đắc Nhân Tâm", "Cho Tôi Xin Một Vé Đi Tuổi Thơ", "Nhà Giả Kim", "Harry Potter và Hòn Đá Phù Thủy", "Đại Gia Gatsby", "Giết Con Chim Biết Hót", "1984", "Cuốn Theo Chiều Gió", "Anna Karenina", "Ba Người Không Họ"},
                {"Nghĩ Lớn", "Khởi Nghiệp Từ Sân Sau", "Thiên Tài Bên Trái Kẻ Khờ Bên Phải", "Cà Phê Cùng Tony", "Dám Thất Bại", "Tư Duy Nhanh Và Chậm", "Người Giàu Có Có Quyền Im Lặng", "Bí Mật Của May Mắn", "Từ Tốt Đến Vĩ Đại", "Bài Học Từ Những Người Thành Công"},
                {"Sapiens - Lược Sử Loài Người", "Vũ Trụ Trong Vỏ Hạt Dẻ", "Người Dẫn Đường", "Cơ Thể Của Bạn", "Não Bộ Và Cuộc Sống", "Tiến Hóa Là Gì", "Vật Lý Vui", "Sinh Học Cơ Bản", "Hóa Học Thú Vị", "Toán Học Đại Cương"},
                {"Đọc Vị Bản Thân", "Sức Mạnh Của Thói Quen", "Nghĩ Ngược Làm Tiến", "Tâm Lý Học Về Tiền", "Sống Một Đời Khác Biệt", "Tìm Kiếm Ý Nghĩa Cuộc Đời", "Từ Điển Cảm Xúc", "Sách Nói: Tâm Trí Không Giới Hạn", "Kỹ Năng Giao Tiếp", "Nghệ Thuật Ứng Xử"},
                {"Cô Bé Bán Diêm", "Alice Ở Xứ Sở Thần Tiên", "Harry Potter Bộ Đầy Đủ", "Doraemon Tập 1-50", "Tôi Thích Lớp Một", "Bé Tập Đếm Số", "Chú Cá Nhỏ Bơi Biển", "Cô Gái Ngủ Đông", "Bé Khám Phá Thế Giới", "Truyện Trước Giờ Ngủ"},
                {"Lịch Sử Việt Nam", "Ngàn Năm Sóng Gió", "Việt Nam Sử Lược", "Chiến Tranh Lạnh", "Các Vương Triều Phong Kiến", "Lịch Sử Thế Giới", "Các Cuộc Cách Mạng Lớn", "Đệ Nhị Thế Chiến", "Lịch Sử Châu Á", "Các Nền Văn Minh Cổ Đại"},
                {"The Great Gatsby", "Pride and Prejudice", "To Kill a Mockingbird", "1984 George Orwell", "Animal Farm", "The Catcher in the Rye", "Brave New World", "Lord of the Flies", "The Alchemist", "The Hobbit"},
                {"Toán Lớp 1", "Tiếng Việt Lớp 2", "Vật Lý Lớp 10", "Hóa Học Lớp 11", "Sinh Học Lớp 12", "Lịch Sử Lớp 8", "Địa Lý Lớp 9", "GDCD Lớp 10", "Công Nghệ Lớp 6", "Tin Học Lớp 12"},
                {"Bếp Nhà An Yên", "Món Việt Cuối Tuần", "Cẩm Nang Làm Bánh", "Ăn Lành Sống Khỏe", "Bữa Cơm Gia Đình", "Bếp Chay Mỗi Ngày", "Hương Vị Miền Trung", "Món Ngon Đãi Khách", "Thực Đơn 30 Ngày", "Nghệ Thuật Pha Chế"},
                {"Nhập Môn Hội Họa", "Ảnh Đẹp Quanh Ta", "Màu Sắc Và Cảm Xúc", "Ký Họa Mỗi Ngày", "Thiết Kế Từ Cơ Bản", "Nhiếp Ảnh Đường Phố", "Câu Chuyện Mỹ Thuật", "Bố Cục Trong Thiết Kế", "Chất Liệu Và Ánh Sáng", "Sổ Tay Sáng Tạo"}
        };

        String[][] authors = {
                {"Dale Carnegie", "Nguyễn Nhật Ánh", "Paulo Coelho", "J.K. Rowling", "F. Scott Fitzgerald", "Harper Lee", "George Orwell", "Margaret Mitchell", "Leo Tolstoy", "Ngô Tự Lập"},
                {"Donald Trump", "Tony Hsieh", "Tony Buổi Sáng", "Tony", "John C. Maxwell", "Daniel Kahneman", "Robert Kiyosaki", "Napoleon Hill", "Jim Collins", "Brian Tracy"},
                {"Yuval Noah Harari", "Stephen Hawking", "Bradley Carver", "Giulio Magini", "Việt Anh", "Charles Darwin", "Richard Feynman", "Neil deGrasse Tyson", "Peter Atkins", "Kiran Desai"},
                {"Tonny Robbins", "Charles Duhigg", "Võ Tắc Nguyên", "Brad Klontz", "Robin Sharma", "Viktor Frankl", "Marc Brackett", "Joe Dispenza", "Dale Carnegie", "Dale Carnegie"},
                {"Hans Christian Andersen", "Lewis Carroll", "J.K. Rowling", "Fujiko F. Fujio", "Nguyễn Nhật Ánh", "Nhiều tác giả", "Marcus Pfister", "Jennifer Egan", "Nhiều tác giả", "Nhiều tác giả"},
                {"Trần Trọng Kim", "Sử liệu Việt Nam", "Đặng Xuân Bảng", "John Lewis Gaddis", "Sử liệu Việt Nam", "E.H. Carr", "Eric Hobsbawm", "Winston Churchill", "Niall Ferguson", "Will Durant"},
                {"F. Scott Fitzgerald", "Jane Austen", "Harper Lee", "George Orwell", "George Orwell", "J.D. Salinger", "Aldous Huxley", "William Golding", "Paulo Coelho", "J.R.R. Tolkien"},
                {"Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục"},
                {"Nguyễn Thị Hương", "Lê Minh Tâm", "Trần Bảo Anh", "Chef An", "Mai Khôi", "Phạm Yến", "Bếp Nhà", "Đặng Hải", "Ngọc Mai", "Hoàng Vân"},
                {"Lâm An", "Nguyễn Hạ", "Trần Vũ", "Khánh Linh", "Phạm Duy", "Hoài Nam", "Mỹ Anh", "Ngọc Quỳnh", "Anh Tú", "Minh Nhật"}
        };

        String[][] publishers = {
                {"NXB Trẻ", "NXB Trẻ", "Vintage Books", "Penguin Random House", "Scribner", "J.B. Lippincott", "Signet Classic", "Warner Books", "Vintage Classics", "NXB Văn Học"},
                {"First News", "Alpha Books", "First News", "Alpha Books", "John Maxwell", "Farrar Straus", "Rich Dad Publishing", "Black Dog Books", "HarperCollins", "New York Institute"},
                {"Penguin Random House", "Bantam", "HarperCollins", "DK Publishing", "NXB Trẻ", "HarperCollins", "W.W. Norton", "Oxford Press", "Pearson", "Cambridge"},
                {"Simon & Schuster", "Random House", "First News", "Wiley", "HarperCollins", "Penguin Random House", "Random House", "Hay House", "Bantam", "HarperCollins"},
                {"Kim Đồng", "Penguin Random House", "Bloomsbury", "Fujiko F. Fujio", "Kim Đồng", "NXB Trẻ", "NorthSouth Books", "Random House", "Kim Đồng", "Kim Đồng"},
                {"NXB Văn Học", "NXB Văn Học", "Sử học", "Penguin", "Văn Sử Địa", "Penguin", "Little Brown", "Penguin", "W.W. Norton", "Simon & Schuster"},
                {"Scribner", "Penguin", "J.B. Lippincott", "Signet Classic", "Penguin", "Little Brown", "Harper & Row", "Faber & Faber", "HarperOne", "Houghton Mifflin"},
                {"Giáo Dục", "Giáo Dục", "Giáo Dục", "Giáo Dục", "Giáo Dục", "Giáo Dục", "Giáo Dục", "Giáo Dục", "Giáo Dục", "Giáo Dục"},
                {"CookBooks Vietnam", "Saigon Books", "NXB Trẻ", "Fahasa", "Alpha Books", "Tiki Books", "Nhã Nam", "Artisan Press", "Bếp Việt", "Kitchen Lab"},
                {"Art House", "Saigon Books", "Nhà Xuất Bản Mỹ Thuật", "Design Press", "NXB Trẻ", "Visual Books", "Studio Press", "Artisan Press", "Creative Hub", "Gallery Books"}
        };

        int[] pageCounts = {200, 250, 300, 350, 400, 450, 500, 100, 150, 250};
        int[] years = {2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025};
        int[] weights = {150, 200, 250, 300, 350, 400, 450, 500, 600, 700};

        int[] priceRanges = {45000, 59000, 69000, 79000, 89000, 99000, 119000, 139000, 159000, 199000, 249000, 299000};

        List<Product> products = new ArrayList<>();

        for (Category cat : categorySlots) {
            int themeIndex = resolveThemeIndex(cat);
            List<ShowcaseBookCatalog.ShowcaseBookSeed> showcaseBooks = ShowcaseBookCatalog.forCategory(cat.getName());
            Set<String> curatedTitles = new HashSet<>();

            for (int curatedIndex = 0; curatedIndex < showcaseBooks.size() && curatedIndex < PRODUCTS_PER_SLOT; curatedIndex++) {
                ShowcaseBookCatalog.ShowcaseBookSeed showcaseBook = showcaseBooks.get(curatedIndex);
                Brand brand = resolveBrand(brands, showcaseBook.publisher(), rand);
                products.add(buildCuratedProduct(cat, brand, showcaseBook, curatedIndex, rand));
                curatedTitles.add(showcaseBook.title().toLowerCase(Locale.ROOT));
            }

            for (int i = showcaseBooks.size(); i < PRODUCTS_PER_SLOT; i++) {
                int genericIndex = i - showcaseBooks.size();
                String[] themeTitles = bookTitles[themeIndex];
                String baseTitle = themeTitles[genericIndex % themeTitles.length];
                int variantIndex = genericIndex / themeTitles.length;
                String title = buildVariantTitle(baseTitle, variantIndex);
                if (variantIndex == 0 && curatedTitles.contains(baseTitle.toLowerCase(Locale.ROOT))) {
                    title = buildVariantTitle(baseTitle, 1);
                }

                String author = authors[themeIndex][genericIndex % authors[themeIndex].length];
                String publisher = publishers[themeIndex][genericIndex % publishers[themeIndex].length];
                int basePrice = priceRanges[rand.nextInt(priceRanges.length)];
                int discountPercent = rand.nextInt(5) == 0 ? 0 : rand.nextInt(35) + 5;
                BigDecimal price = BigDecimal.valueOf(basePrice);
                BigDecimal discountPrice = discountPercent > 0
                        ? price.multiply(BigDecimal.valueOf(100 - discountPercent)).divide(BigDecimal.valueOf(100), 0, java.math.RoundingMode.HALF_UP)
                        : null;
                int stock = rand.nextInt(180) + 20;
                int pages = pageCounts[rand.nextInt(pageCounts.length)];
                int year = years[rand.nextInt(years.length)];
                int weight = weights[rand.nextInt(weights.length)];
                Brand brand = brands.get(rand.nextInt(brands.size()));

                String isbn = String.format("978-%d-%05d-%d-%d",
                        rand.nextInt(900) + 100,
                        rand.nextInt(99999),
                        rand.nextInt(9),
                        rand.nextInt(9));

                boolean isFeatured = i < 3;
                boolean isBestseller = i < 4;
                boolean isNew = i >= 2 && i < 6;
                String imageUrl = resolveProductImagePath(cat, title);
                String shortDesc = buildShortDescription(cat.getName(), author, publisher);
                String description = buildLongDescription(cat.getName(), author, publisher, pages);

                Product product = Product.builder()
                        .name(title)
                        .author(author)
                        .publisher(publisher)
                        .isbn(isbn)
                        .price(price)
                        .discountPrice(discountPrice)
                        .discountPercent(discountPercent)
                        .stockQuantity(stock)
                        .shortDescription(shortDesc)
                        .description(description)
                        .category(cat)
                        .brand(brand)
                        .pageCount(pages)
                        .publishedYear(year)
                        .weightGrams(weight)
                        .language(resolveLanguage(cat))
                        .isFeatured(isFeatured)
                        .isBestseller(isBestseller)
                        .isNew(isNew)
                        .isActive(true)
                        .avgRating(Math.round((4.0 + rand.nextDouble()) * 10.0) / 10.0)
                        .reviewCount(rand.nextInt(220) + 20)
                        .soldCount(rand.nextInt(2400) + 50)
                        .viewCount(rand.nextInt(12000) + 500)
                        .imageUrl(imageUrl)
                        .images(List.of(imageUrl))
                        .build();
                products.add(product);
            }
        }
        return products;
    }

    private static Product buildCuratedProduct(
            Category category,
            Brand brand,
            ShowcaseBookCatalog.ShowcaseBookSeed showcaseBook,
            int slotIndex,
            Random rand) {

        int[] pageCounts = {224, 256, 288, 320, 352, 384, 416, 448, 512, 560};
        int[] weights = {180, 220, 260, 300, 340, 380, 420, 480, 540, 620};
        int[] prices = {129000, 149000, 169000, 189000, 219000, 249000, 279000, 319000};

        BigDecimal price = BigDecimal.valueOf(prices[Math.min(slotIndex % prices.length, prices.length - 1)]);
        int discountPercent = 10 + rand.nextInt(16);
        BigDecimal discountPrice = price.multiply(BigDecimal.valueOf(100 - discountPercent))
                .divide(BigDecimal.valueOf(100), 0, java.math.RoundingMode.HALF_UP);

        boolean isFeatured = slotIndex < 2;
        boolean isBestseller = slotIndex < 2;
        boolean isNew = slotIndex == 1;

        int pages = pageCounts[Math.min(slotIndex % pageCounts.length, pageCounts.length - 1)];
        int weight = weights[Math.min(slotIndex % weights.length, weights.length - 1)];

        return Product.builder()
                .name(showcaseBook.title())
                .author(showcaseBook.author())
                .publisher(showcaseBook.publisher())
                .isbn(showcaseBook.isbn())
                .price(price)
                .discountPrice(discountPrice)
                .discountPercent(discountPercent)
                .stockQuantity(45 + slotIndex * 10)
                .shortDescription(buildShowcaseShortDescription(showcaseBook, category.getName()))
                .description(buildShowcaseLongDescription(showcaseBook, category.getName()))
                .category(category)
                .brand(brand)
                .pageCount(pages)
                .publishedYear(showcaseBook.publishedYear())
                .weightGrams(weight)
                .language(showcaseBook.language())
                .isFeatured(isFeatured)
                .isBestseller(isBestseller)
                .isNew(isNew)
                .isActive(true)
                .avgRating(4.5 + (slotIndex * 0.1))
                .reviewCount(120 + slotIndex * 24)
                .soldCount(1800 - slotIndex * 80)
                .viewCount(9000 - slotIndex * 240)
                .imageUrl(showcaseBook.coverUrl())
                .images(List.of(showcaseBook.coverUrl()))
                .build();
    }

    private static String buildVariantTitle(String baseTitle, int variantIndex) {
        if (variantIndex <= 0) {
            return baseTitle;
        }

        String variant = TITLE_VARIANTS[(variantIndex - 1) % TITLE_VARIANTS.length];
        return baseTitle + " - " + variant;
    }

    private static int resolveThemeIndex(Category category) {
        String themeBucket = category.getParent() != null ? category.getParent().getName() : category.getName();

        return switch (themeBucket) {
            case "Sách Văn Học" -> 0;
            case "Kinh Tế" -> 1;
            case "Khoa Học" -> 2;
            case "Phát Triển Bản Thân" -> 3;
            case "Sách Thiếu Nhi" -> 4;
            case "Lịch Sử" -> 5;
            case "Sách Ngoại Văn" -> 6;
            case "Sách Giáo Khoa" -> 7;
            case "Ẩm Thực" -> 8;
            case "Nghệ Thuật" -> 9;
            default -> 0;
        };
    }

    private static String resolveLanguage(Category category) {
        return resolveThemeIndex(category) == 6 ? "English" : "Vietnamese";
    }

    private static Brand resolveBrand(List<Brand> brands, String publisher, Random rand) {
        return brands.stream()
                .filter(brand -> brand.getName() != null && brand.getName().equalsIgnoreCase(publisher))
                .findFirst()
                .or(() -> brands.stream()
                        .filter(brand -> brand.getName() != null
                                && (publisher.toLowerCase(Locale.ROOT).contains(brand.getName().toLowerCase(Locale.ROOT))
                                || brand.getName().toLowerCase(Locale.ROOT).contains(publisher.toLowerCase(Locale.ROOT))))
                        .findFirst())
                .orElseGet(() -> brands.get(rand.nextInt(brands.size())));
    }

    private static String buildShortDescription(String categoryName, String author, String publisher) {
        return "Tựa sách tuyển chọn thuộc nhóm " + categoryName + ", được biên soạn bởi "
                + author + " và phát hành bởi " + publisher + ".";
    }

    private static String buildLongDescription(String categoryName, String author, String publisher, int pageCount) {
        return buildShortDescription(categoryName, author, publisher)
                + "\n\nCuốn sách mang đến nội dung cô đọng, dễ tiếp cận và phù hợp cho người đọc đang muốn mở rộng kiến thức về "
                + categoryName + ". Ấn bản demo này có khoảng " + pageCount
                + " trang, trình bày hiện đại và phù hợp để giới thiệu trong không gian mua sắm trực tuyến.";
    }

    private static String buildShowcaseShortDescription(
            ShowcaseBookCatalog.ShowcaseBookSeed showcaseBook,
            String categoryName) {
        return showcaseBook.title() + " là tựa sách nổi bật trong danh mục " + categoryName
                + ", phù hợp để giới thiệu ở các khu vực showcase, wishlist và flash sale.";
    }

    private static String buildShowcaseLongDescription(
            ShowcaseBookCatalog.ShowcaseBookSeed showcaseBook,
            String categoryName) {
        return showcaseBook.title() + " của " + showcaseBook.author()
                + " là đầu sách được tuyển chọn cho catalog demo chuyên nghiệp của BookStore."
                + "\n\nTựa sách thuộc nhóm " + categoryName
                + ", sử dụng bìa thật từ nguồn công khai ổn định để các màn hình homepage, product detail, order history và flash sale hiển thị thuyết phục hơn."
                + "\n\nPhù hợp cho người đọc yêu thích những cuốn sách có giá trị lâu dài, nội dung dễ tiếp cận và trải nghiệm trình bày đẹp mắt.";
    }

    private static String resolvePlaceholderPath(Category category) {
        if (category == null) {
            return "/images/books/placeholders/default.svg";
        }

        return switch (ShowcaseBookCatalog.forCategory(category.getName()).isEmpty() ? resolveThemeIndex(category) : resolveThemeIndex(category)) {
            case 0, 6 -> "/images/books/placeholders/literature.svg";
            case 1 -> "/images/books/placeholders/business.svg";
            case 2, 7 -> "/images/books/placeholders/science.svg";
            case 3 -> "/images/books/placeholders/self-help.svg";
            case 4 -> "/images/books/placeholders/children.svg";
            case 5 -> "/images/books/placeholders/history.svg";
            case 8 -> "/images/books/placeholders/cooking.svg";
            case 9 -> "/images/books/placeholders/art.svg";
            default -> "/images/books/placeholders/default.svg";
        };
    }

    private static String resolveProductImagePath(Category category, String title) {
        String generatedCoverPath = resolveGeneratedCoverPath(category, title);
        if (generatedCoverPath != null) {
            return generatedCoverPath;
        }

        return resolvePlaceholderPath(category);
    }

    private static String resolveNormalizedImageUrl(Product product) {
        if (product != null && ShowcaseBookCatalog.isCuratedIsbn(product.getIsbn())) {
            return ShowcaseBookCatalog.localCoverPath(product.getIsbn());
        }

        String generatedCoverPath = resolveGeneratedCoverPath(
                product != null ? product.getCategory() : null,
                product != null ? product.getName() : null);
        if (generatedCoverPath != null) {
            return generatedCoverPath;
        }

        if (product != null && product.getImages() != null) {
            for (String image : product.getImages()) {
                if (image != null && !image.isBlank() && image.startsWith("/")) {
                    return image;
                }
            }
        }

        if (product != null && product.getImageUrl() != null && !product.getImageUrl().isBlank() && product.getImageUrl().startsWith("/")) {
            return product.getImageUrl();
        }

        return resolvePlaceholderPath(product != null ? product.getCategory() : null);
    }

    private static List<String> resolveNormalizedImages(Product product, String normalizedImageUrl) {
        LinkedHashSet<String> images = new LinkedHashSet<>();

        if (product != null && ShowcaseBookCatalog.isCuratedIsbn(product.getIsbn())) {
            images.add(ShowcaseBookCatalog.localCoverPath(product.getIsbn()));
        }

        String generatedCoverPath = resolveGeneratedCoverPath(
                product != null ? product.getCategory() : null,
                product != null ? product.getName() : null);
        if (generatedCoverPath != null) {
            images.add(generatedCoverPath);
        }

        if (product != null && product.getImages() != null) {
            for (String image : product.getImages()) {
                if (isReusableLocalImagePath(image, generatedCoverPath)) {
                    images.add(image);
                }
            }
        }

        if (product != null && isReusableLocalImagePath(product.getImageUrl(), generatedCoverPath)) {
            images.add(product.getImageUrl());
        }

        if (images.isEmpty()) {
            images.add(normalizedImageUrl);
        }

        return List.copyOf(images);
    }

    private static String resolveGeneratedCoverPath(Category category, String title) {
        String key = generatedCoverKey(category, title);
        if (key.isBlank()) {
            return null;
        }

        return PRIORITY_GENERATED_COVERS.get(key);
    }

    private static String generatedCoverKey(Category category, String title) {
        if (category == null || title == null || title.isBlank()) {
            return "";
        }

        return slugifyCoverKey(category.getName()) + "/" + slugifyCoverKey(title);
    }

    private static String slugifyCoverKey(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace('\u0111', 'd')
                .replace('\u0110', 'D')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");
    }

    private static boolean isReusableLocalImagePath(String image, String generatedCoverPath) {
        if (image == null || image.isBlank() || !image.startsWith("/")) {
            return false;
        }

        return generatedCoverPath == null || !image.contains("/images/books/placeholders/");
    }
}
