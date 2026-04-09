package com.bookstore.config;

import com.bookstore.entity.Brand;
import com.bookstore.entity.Category;
import com.bookstore.entity.Product;
import com.bookstore.repository.BrandRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.ProductRepository;
import org.slf4j.Logger;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Tách logic seed danh mục / NXB / sách để tái sử dụng khi DB có user nhưng chưa có sản phẩm.
 */
public final class CatalogDataSeeder {

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

        List<Category> roots = categoryRepository.findByParentIsNullOrderByDisplayOrderAsc();
        if (roots.isEmpty()) {
            log.warn("No root categories found; cannot seed products without categories.");
            return List.of();
        }

        List<Brand> brands = brandRepository.findAll();
        if (brands.isEmpty()) {
            brands = ensureDefaultBrands(brandRepository, log);
        }

        List<Category> slots = new ArrayList<>(8);
        for (int i = 0; i < 8; i++) {
            slots.add(roots.get(i % roots.size()));
        }

        Random rand = new Random(42);
        List<Product> products = buildSampleProducts(slots, brands, rand);
        productRepository.saveAll(products);
        log.info("Created {} products (existing catalog)", products.size());
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
                .name("Sách Văn Học").description("Tiểu thuyết, truyện ngắn, thơ, kịch").displayOrder(1).isActive(true).build();
        fiction = categoryRepository.save(fiction);

        Category business = Category.builder()
                .name("Kinh Tế").description("Sách kinh doanh, tài chính, đầu tư").displayOrder(2).isActive(true).build();
        business = categoryRepository.save(business);

        Category science = Category.builder()
                .name("Khoa Học").description("Sách khoa học, công nghệ").displayOrder(3).isActive(true).build();
        science = categoryRepository.save(science);

        Category selfHelp = Category.builder()
                .name("Phát Triển Bản Thân").description("Sách tự giúp, kỹ năng sống").displayOrder(4).isActive(true).build();
        selfHelp = categoryRepository.save(selfHelp);

        Category children = Category.builder()
                .name("Sách Thiếu Nhi").description("Sách tranh, truyện cho trẻ em").displayOrder(5).isActive(true).build();
        children = categoryRepository.save(children);

        Category history = Category.builder()
                .name("Lịch Sử").description("Sách lịch sử, văn hóa").displayOrder(6).isActive(true).build();
        history = categoryRepository.save(history);

        Category foreign = Category.builder()
                .name("Sách Ngoại Văn").description("Sách tiếng Anh, ngoại ngữ").displayOrder(7).isActive(true).build();
        foreign = categoryRepository.save(foreign);

        Category textbook = Category.builder()
                .name("Sách Giáo Khoa").description("Sách giáo khoa, tham khảo").displayOrder(8).isActive(true).build();
        textbook = categoryRepository.save(textbook);

        Category cooking = Category.builder()
                .name("Ẩm Thực").description("Sách nấu ăn, ẩm thực").displayOrder(9).isActive(true).build();
        cooking = categoryRepository.save(cooking);

        Category art = Category.builder()
                .name("Nghệ Thuật").description("Sách về hội họa, nhiếp ảnh").displayOrder(10).isActive(true).build();
        art = categoryRepository.save(art);

        categoryRepository.save(Category.builder()
                .name("Tiểu Thuyết").description("Tiểu thuyết Việt Nam và thế giới").parent(fiction).displayOrder(1).isActive(true).build());
        categoryRepository.save(Category.builder()
                .name("Truyện Ngắn").description("Tuyển tập truyện ngắn").parent(fiction).displayOrder(2).isActive(true).build());
        categoryRepository.save(Category.builder()
                .name("Thơ").description("Tập thơ, thơ hay").parent(fiction).displayOrder(3).isActive(true).build());
        categoryRepository.save(Category.builder()
                .name("Văn Học Cổ Điển").description("Tác phẩm văn học cổ điển").parent(fiction).displayOrder(4).isActive(true).build());

        categoryRepository.save(Category.builder()
                .name("Marketing").description("Sách về marketing, quảng cáo").parent(business).displayOrder(1).isActive(true).build());
        categoryRepository.save(Category.builder()
                .name("Tài Chính").description("Sách tài chính, kế toán").parent(business).displayOrder(2).isActive(true).build());
        categoryRepository.save(Category.builder()
                .name("Lãnh Đạo").description("Sách về lãnh đạo, quản trị").parent(business).displayOrder(3).isActive(true).build());

        categoryRepository.save(Category.builder()
                .name("Khoa Học Tự Nhiên").description("Vật lý, hóa học, sinh học").parent(science).displayOrder(1).isActive(true).build());
        categoryRepository.save(Category.builder()
                .name("Công Nghệ").description("AI, lập trình, IT").parent(science).displayOrder(2).isActive(true).build());

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

        List<Category> slots = categories.subList(0, 8);
        Random rand = new Random(42);
        List<Product> products = buildSampleProducts(slots, brands, rand);
        productRepository.saveAll(products);
        log.info("Created {} products", products.size());
        return products;
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
                {"Toán Lớp 1", "Tiếng Việt Lớp 2", "Vật Lý Lớp 10", "Hóa Học Lớp 11", "Sinh Học Lớp 12", "Lịch Sử Lớp 8", "Địa Lý Lớp 9", "GDCD Lớp 10", "Công Nghệ Lớp 6", "Tin Học Lớp 12"}
        };

        String[][] authors = {
                {"Dale Carnegie", "Nguyễn Nhật Ánh", "Paulo Coelho", "J.K. Rowling", "F. Scott Fitzgerald", "Harper Lee", "George Orwell", "Margaret Mitchell", "Leo Tolstoy", "Ngô Tự Lập"},
                {"Donald Trump", "Tony Hsieh", "Tony Buổi Sáng", "Tony", "John C. Maxwell", "Daniel Kahneman", "Robert Kiyosaki", "Napoleon Hill", "Jim Collins", "Brian Tracy"},
                {"Yuval Noah Harari", "Stephen Hawking", "Bradley Carver", "Giulio Magini", "Việt Anh", "Charles Darwin", "Richard Feynman", "Neil deGrasse Tyson", "Peter Atkins", "Kiran Desai"},
                {"Tonny Robbins", "Charles Duhigg", "Võ Tắc Nguyên", "Brad Klontz", "Robin Sharma", "Viktor Frankl", "Marc Brackett", "Joe Dispenza", "Dale Carnegie", "Dale Carnegie"},
                {"Hans Christian Andersen", "Lewis Carroll", "J.K. Rowling", "Fujiko F. Fujio", "Nguyễn Nhật Ánh", "Nhiều tác giả", "Marcus Pfister", "Jennifer Egan", "Nhiều tác giả", "Nhiều tác giả"},
                {"Trần Trọng Kim", "Sử liệu Việt Nam", "Đặng Xuân Bảng", "John Lewis Gaddis", "Sử liệu Việt Nam", "E.H. Carr", "Eric Hobsbawm", "Winston Churchill", "Niall Ferguson", "Will Durant"},
                {"F. Scott Fitzgerald", "Jane Austen", "Harper Lee", "George Orwell", "George Orwell", "J.D. Salinger", "Aldous Huxley", "William Golding", "Paulo Coelho", "J.R.R. Tolkien"},
                {"Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục", "Bộ Giáo Dục"}
        };

        String[][] publishers = {
                {"NXB Trẻ", "NXB Trẻ", "Vintage Books", "Penguin Random House", "Scribner", "J.B. Lippincott", "Signet Classic", "Warner Books", "Vintage Classics", "NXB Văn Học"},
                {"First News", "Alpha Books", "First News", "Alpha Books", "John Maxwell", "Farrar Straus", "富爸爸出版社", "Black Dog Books", "HarperCollins", "New York Institute"},
                {"Penguin Random House", "Bantam", "HarperCollins", "DK Publishing", "NXB Trẻ", "HarperCollins", "W.W. Norton", "Oxford Press", "Pearson", "Cambridge"},
                {"Simon & Schuster", "Random House", "First News", "Wiley", "HarperCollins", "Penguin Random House", "Random House", "Hay House", "Bantam", "HarperCollins"},
                {"Kim Đồng", "Penguin Random House", "Bloomsbury", "Fujiko F. Fujio", "Kim Đồng", "NXB Trẻ", "NorthSouth Books", "Random House", "Kim Đồng", "Kim Đồng"},
                {"NXB Văn Học", "NXB Văn Học", "Sử học", "Penguin", "Văn Sử Địa", "Penguin", "Little Brown", "Penguin", "W.W. Norton", "Simon & Schuster"},
                {"Scribner", "Penguin", "J.B. Lippincott", "Signet Classic", "Penguin", "Little Brown", "Harper & Row", "Faber & Faber", "HarperOne", "Houghton Mifflin"},
                {"Giáo Dục", "Giáo Dục", "Giáo Dục", "Giáo Dục", "Giáo Dục", "Giáo Dục", "Giáo Dục", "Giáo Dục", "Giáo Dục", "Giáo Dục"}
        };

        int[] pageCounts = {200, 250, 300, 350, 400, 450, 500, 100, 150, 250};
        int[] years = {2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025};
        int[] weights = {150, 200, 250, 300, 350, 400, 450, 500, 600, 700};

        int[] priceRanges = {45000, 59000, 69000, 79000, 89000, 99000, 119000, 139000, 159000, 199000, 249000, 299000};

        List<Product> products = new ArrayList<>();

        for (int catIndex = 0; catIndex < 8; catIndex++) {
            Category cat = categorySlots.get(catIndex);
            for (int i = 0; i < 15; i++) {
                String title = bookTitles[catIndex][i % 10] + (i / 10 > 0 ? " - Tập " + (i / 10 + 1) : "");
                String author = authors[catIndex][i % 10];
                String publisher = publishers[catIndex][i % 10];
                int basePrice = priceRanges[rand.nextInt(priceRanges.length)];
                int discountPercent = rand.nextInt(5) == 0 ? 0 : rand.nextInt(35) + 5;
                BigDecimal price = BigDecimal.valueOf(basePrice);
                BigDecimal discountPrice = discountPercent > 0
                        ? price.multiply(BigDecimal.valueOf(100 - discountPercent)).divide(BigDecimal.valueOf(100), 0, java.math.RoundingMode.HALF_UP)
                        : null;
                int stock = rand.nextInt(200) + 10;
                int pages = pageCounts[rand.nextInt(pageCounts.length)];
                int year = years[rand.nextInt(years.length)];
                int weight = weights[rand.nextInt(weights.length)];
                Brand brand = brands.get(rand.nextInt(brands.size()));

                String isbn = String.format("978-%d-%05d-%d-%d",
                        rand.nextInt(900) + 100,
                        rand.nextInt(99999),
                        rand.nextInt(9),
                        rand.nextInt(9));

                String shortDesc = "Một cuốn sách tuyệt vời về chủ đề " + cat.getName() + ". Được viết bởi " + author + " và xuất bản bởi " + publisher + ".";
                String description = shortDesc + "\n\n" +
                        "Cuốn sách này mang đến cho bạn những kiến thức quý giá, những câu chuyện cảm động và những bài học ý nghĩa. " +
                        "Với " + pages + " trang, cuốn sách được trình bày đẹp mắt với chất lượng in ấn cao cấp.\n\n" +
                        "Sách phù hợp với mọi lứa tuổi, đặc biệt là những ai quan tâm đến " + cat.getName() + ".";

                boolean isFeatured = i < 3;
                boolean isBestseller = i < 2;
                boolean isNew = i < 4;

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
                        .language(catIndex == 6 ? "English" : "Vietnamese")
                        .isFeatured(isFeatured)
                        .isBestseller(isBestseller)
                        .isNew(isNew)
                        .isActive(true)
                        .avgRating(Math.round((3.5 + rand.nextDouble() * 1.5) * 10.0) / 10.0)
                        .reviewCount(rand.nextInt(100))
                        .soldCount(rand.nextInt(500))
                        .viewCount(rand.nextInt(2000))
                        .imageUrl("https://picsum.photos/seed/" + title.hashCode() + "/300/400")
                        .images(List.of(
                                "https://picsum.photos/seed/" + title.hashCode() + "/300/400",
                                "https://picsum.photos/seed/" + (title.hashCode() + 1) + "/300/400",
                                "https://picsum.photos/seed/" + (title.hashCode() + 2) + "/300/400"
                        ))
                        .build();
                products.add(product);
            }
        }
        return products;
    }
}
