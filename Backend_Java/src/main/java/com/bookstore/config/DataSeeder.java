package com.bookstore.config;

import com.bookstore.entity.*;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    @Bean
    @Profile("!test")
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            ProductRepository productRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            OrderRepository orderRepository,
            ReviewRepository reviewRepository,
            AddressRepository addressRepository) {

        return args -> {
            if (userRepository.count() > 0) {
                log.info("Database already seeded, skipping...");
                return;
            }

            log.info("Seeding database with rich sample data...");

            // ==================== USERS ====================
            User admin = User.builder()
                    .email("admin@bookstore.com")
                    .password(passwordEncoder.encode("Admin123!"))
                    .firstName("Nguyễn")
                    .lastName("Sơn")
                    .phoneNumber("0901234567")
                    .isActive(true)
                    .isEmailVerified(true)
                    .roles(new HashSet<>(Set.of(Role.ADMIN)))
                    .build();
            admin = userRepository.save(admin);

            User manager = User.builder()
                    .email("manager@bookstore.com")
                    .password(passwordEncoder.encode("Manager123!"))
                    .firstName("Trần")
                    .lastName("Minh")
                    .phoneNumber("0902345678")
                    .isActive(true)
                    .isEmailVerified(true)
                    .roles(new HashSet<>(Set.of(Role.MANAGER)))
                    .build();
            manager = userRepository.save(manager);

            List<User> customers = new ArrayList<>();
            String[] firstNames = {"Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Phan", "Trương", "Võ", "Đinh", "Lý"};
            String[] lastNames = {"Minh", "Huyền", "Anh", "Thảo", "Lan", "Hương", "Ngọc", "Trang", "Hà", "Linh", "Phương", "Tú", "Quỳnh", "Mai", "Yến"};
            String[] domains = {"gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "email.com"};

            for (int i = 1; i <= 20; i++) {
                String firstName = firstNames[new Random().nextInt(firstNames.length)];
                String lastName = lastNames[new Random().nextInt(lastNames.length)];
                String domain = domains[new Random().nextInt(domains.length)];
                String email = firstName.toLowerCase() + lastName.toLowerCase() + i + "@" + domain;

                User customer = User.builder()
                        .email(email)
                        .password(passwordEncoder.encode("Customer123!"))
                        .firstName(firstName)
                        .lastName(lastName)
                        .phoneNumber("09" + String.format("%08d", new Random().nextInt(100000000)))
                        .isActive(true)
                        .isEmailVerified(new Random().nextBoolean())
                        .roles(new HashSet<>(Set.of(Role.CUSTOMER)))
                        .build();
                customers.add(userRepository.save(customer));
            }
            log.info("Created {} users", customers.size() + 2);

            // ==================== CATEGORIES ====================
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

            // Subcategories
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
            log.info("Created {} categories", categories.size());

            // ==================== BRANDS/PUBLISHERS ====================
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

            // ==================== PRODUCTS ====================
            Random rand = new Random(42);
            List<Product> products = new ArrayList<>();

            // Helper to create products
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

            Category[] categoryArray = {fiction, fiction, fiction, fiction, fiction,
                    business, business, business, business, business,
                    science, science, science, science, science,
                    selfHelp, selfHelp, selfHelp, selfHelp, selfHelp,
                    children, children, children, children, children,
                    history, history, history, history, history,
                    foreign, foreign, foreign, foreign, foreign,
                    textbook, textbook, textbook, textbook, textbook};

            int[] priceRanges = {45000, 59000, 69000, 79000, 89000, 99000, 119000, 139000, 159000, 199000, 249000, 299000};

            for (int catIndex = 0; catIndex < 8; catIndex++) {
                Category cat = categories.get(catIndex);
                for (int i = 0; i < 15; i++) {
                    int idx = catIndex * 10 + i;
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

            productRepository.saveAll(products);
            log.info("Created {} products", products.size());

            // ==================== ADDRESSES ====================
            String[] provinces = {"TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng", "Biên Hòa", "Nha Trang", "Hải Dương", "Bắc Ninh", "Thanh Hóa"};
            String[] districts = {"Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 9", "Quận 10"};
            String[] wards = {"Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10"};
            String[] streets = {"Nguyễn Trãi", "Lê Lợi", "Đền Thánh", "Cao Thắng", "Trần Hưng Đạo", "Võ Văn Tần", "Nguyễn Đình Chiểu", "Phạm Ngũ Lão", "Pasteur", "Lê Lai"};

            for (User customer : customers) {
                int addrCount = rand.nextInt(2) + 1;
                for (int i = 0; i < addrCount; i++) {
                    String province = provinces[rand.nextInt(provinces.length)];
                    String district = districts[rand.nextInt(districts.length)];
                    String ward = wards[rand.nextInt(wards.length)];
                    String street = streets[rand.nextInt(streets.length)] + " " + (rand.nextInt(200) + 1);

                    Address address = Address.builder()
                            .user(customer)
                            .receiverName(customer.getFullName())
                            .phoneNumber(customer.getPhoneNumber())
                            .province(province)
                            .district(district)
                            .ward(ward)
                            .streetAddress(street)
                            .isDefault(i == 0)
                            .addressType(i == 0 ? "HOME" : "WORK")
                            .build();
                    addressRepository.save(address);
                }
            }
            log.info("Created addresses for customers");

            // ==================== ORDERS ====================
            OrderStatus[] orderStatuses = OrderStatus.values();
            PaymentStatus[] paymentStatuses = PaymentStatus.values();

            for (User customer : customers) {
                int orderCount = rand.nextInt(3) + 1;
                for (int o = 0; o < orderCount; o++) {
                    List<Product> orderProducts = new ArrayList<>();
                    int itemCount = rand.nextInt(3) + 1;
                    for (int i = 0; i < itemCount; i++) {
                        orderProducts.add(products.get(rand.nextInt(products.size())));
                    }

                    OrderStatus oStatus = orderStatuses[rand.nextInt(orderStatuses.length)];
                    PaymentStatus pStatus = oStatus == OrderStatus.PENDING || oStatus == OrderStatus.CONFIRMED
                            ? PaymentStatus.PENDING : PaymentStatus.PAID;

                    LocalDateTime createdAt = LocalDateTime.now().minusDays(rand.nextInt(60));

                    BigDecimal subtotal = BigDecimal.ZERO;
                    Order order = Order.builder()
                            .orderNumber("ORD" + System.currentTimeMillis() + rand.nextInt(10000))
                            .user(customer)
                            .orderStatus(oStatus)
                            .paymentStatus(pStatus)
                            .shippingAddress(provinces[rand.nextInt(provinces.length)] + ", " +
                                    districts[rand.nextInt(districts.length)] + ", " +
                                    wards[rand.nextInt(wards.length)] + ", " +
                                    streets[rand.nextInt(streets.length)] + " " + (rand.nextInt(200) + 1))
                            .shippingPhone(customer.getPhoneNumber())
                            .shippingReceiverName(customer.getFullName())
                            .shippingMethod("Giao hàng nhanh")
                            .shippingFee(BigDecimal.valueOf(rand.nextInt(2) == 0 ? 0 : 25000))
                            .paymentMethod(rand.nextBoolean() ? "COD" : "Thanh toán online")
                            .notes(oStatus == OrderStatus.CANCELLED ? "Khách hủy đơn" : null)
                            .cancelledAt(oStatus == OrderStatus.CANCELLED ? createdAt.plusDays(1) : null)
                            .build();

                    for (Product p : orderProducts) {
                        int qty = rand.nextInt(2) + 1;
                        BigDecimal itemPrice = p.getCurrentPrice();
                        BigDecimal itemSubtotal = itemPrice.multiply(BigDecimal.valueOf(qty));
                        subtotal = subtotal.add(itemSubtotal);

                        OrderItem item = OrderItem.builder()
                                .product(p)
                                .quantity(qty)
                                .price(itemPrice)
                                .discountPercent(p.getDiscountPercent())
                                .build();
                        item.calculateSubtotal();
                        order.addItem(item);
                    }

                    order.setSubtotal(subtotal);
                    order.setTaxAmount(subtotal.multiply(BigDecimal.valueOf(0.1)).setScale(0, java.math.RoundingMode.HALF_UP));
                    order.setDiscountAmount(BigDecimal.ZERO);
                    order.setTotalAmount(order.getSubtotal()
                            .add(order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO)
                            .add(order.getTaxAmount()));

                    if (oStatus == OrderStatus.DELIVERED) {
                        order.setDeliveredAt(createdAt.plusDays(3 + rand.nextInt(3)));
                    }

                    order = orderRepository.save(order);

                    // Reviews for delivered orders
                    if (oStatus == OrderStatus.DELIVERED && rand.nextBoolean()) {
                        for (OrderItem item : order.getOrderItems()) {
                            Review review = Review.builder()
                                    .user(customer)
                                    .product(item.getProduct())
                                    .rating(rand.nextInt(2) + 4)
                                    .comment(getRandomComment(rand))
                                    .isVerifiedPurchase(true)
                                    .isApproved(true)
                                    .isHidden(false)
                                    .helpfulCount(rand.nextInt(20))
                                    .build();
                            reviewRepository.save(review);
                        }
                    }
                }
            }

            // Admin orders
            for (int i = 0; i < 3; i++) {
                OrderStatus oStatus = orderStatuses[rand.nextInt(orderStatuses.length)];
                User adminCustomer = customers.get(rand.nextInt(customers.size()));

                Order adminOrder = Order.builder()
                        .orderNumber("ORD" + System.currentTimeMillis() + 10000 + i)
                        .user(adminCustomer)
                        .orderStatus(oStatus)
                        .paymentStatus(PaymentStatus.PAID)
                        .shippingAddress("123 Admin Street, District 1, Ho Chi Minh City")
                        .shippingPhone(adminCustomer.getPhoneNumber())
                        .shippingReceiverName(adminCustomer.getFullName())
                        .shippingMethod("Giao hàng nhanh")
                        .shippingFee(BigDecimal.ZERO)
                        .paymentMethod("Thanh toán online")
                        .subtotal(BigDecimal.valueOf(300000))
                        .taxAmount(BigDecimal.valueOf(30000))
                        .discountAmount(BigDecimal.ZERO)
                        .totalAmount(BigDecimal.valueOf(330000))
                        .createdAt(LocalDateTime.now().minusDays(rand.nextInt(30)))
                        .build();

                Product randomProduct = products.get(rand.nextInt(products.size()));
                OrderItem item = OrderItem.builder()
                        .product(randomProduct)
                        .quantity(3)
                        .price(randomProduct.getCurrentPrice())
                        .build();
                item.calculateSubtotal();
                adminOrder.addItem(item);
                adminOrder.calculateTotal();

                orderRepository.save(adminOrder);
            }

            log.info("Created orders with reviews");

            // ==================== CARTS ====================
            for (User customer : customers) {
                Cart cart = Cart.builder().user(customer).build();
                cart = cartRepository.save(cart);

                int cartItemCount = rand.nextInt(3) + 1;
                for (int i = 0; i < cartItemCount; i++) {
                    Product randomProduct = products.get(rand.nextInt(products.size()));
                    CartItem cartItem = CartItem.builder()
                            .cart(cart)
                            .product(randomProduct)
                            .quantity(rand.nextInt(2) + 1)
                            .build();
                    cartItemRepository.save(cartItem);
                }
            }
            log.info("Created carts with items");

            // Admin cart
            Cart adminCart = Cart.builder().user(admin).build();
            cartRepository.save(adminCart);

            log.info("========================================");
            log.info("Database seeding COMPLETED!");
            log.info("========================================");
            log.info("Admin: admin@bookstore.com / Admin123!");
            log.info("Manager: manager@bookstore.com / Manager123!");
            log.info("Customer: customer@example.com / Customer123!");
            log.info("20+ sample customers: [name][number]@gmail.com / Customer123!");
            log.info("========================================");
        };
    }

    private String getRandomComment(Random rand) {
        String[] comments = {
                "Sách rất hay, giao hàng nhanh. Đóng gói cẩn thận. Sẽ ủng hộ tiếp!",
                "Nội dung phong phú, bìa đẹp. Giá cả hợp lý. Recommend!",
                "Chất lượng in ấn tốt, không bị lỗi. Giao đúng mẫu.",
                "Mua lần thứ 3 rồi, lần nào cũng hài lòng. Shop uy tín!",
                "Sách đúng như mô tả, giao hàng nhanh hơn dự kiến.",
                "Tuyệt vời! Đọc rồi muốn đọc tiếp. 5 sao!",
                "Giao hàng đúng hẹn, sách mới, không rách. Tốt!",
                "Nội dung bổ ích, phù hợp với giá. Mua thêm các tập khác.",
                "Đóng gói kỹ, không bị móp méo. Cảm ơn shop!",
                " Sách hay, phù hợp cho người mới bắt đầu."
        };
        return comments[rand.nextInt(comments.length)];
    }
}
