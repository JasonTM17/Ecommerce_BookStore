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
            OrderRepository orderRepository) {

        return args -> {
            if (userRepository.count() > 0) {
                log.info("Database already seeded, skipping...");
                return;
            }

            log.info("Seeding database with initial data...");

            // Create Admin User
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

            // Create Customer Users
            User customer1 = User.builder()
                    .email("customer@example.com")
                    .password(passwordEncoder.encode("Customer123!"))
                    .firstName("Trần")
                    .lastName("Minh")
                    .phoneNumber("0909876543")
                    .isActive(true)
                    .isEmailVerified(true)
                    .roles(new HashSet<>(Set.of(Role.CUSTOMER)))
                    .build();
            customer1 = userRepository.save(customer1);

            User customer2 = User.builder()
                    .email("john.doe@email.com")
                    .password(passwordEncoder.encode("Customer123!"))
                    .firstName("John")
                    .lastName("Doe")
                    .phoneNumber("0912345678")
                    .isActive(true)
                    .isEmailVerified(true)
                    .roles(new HashSet<>(Set.of(Role.CUSTOMER)))
                    .build();
            customer2 = userRepository.save(customer2);

            // Create Categories
            List<Category> categories = new ArrayList<>();

            // Root categories
            Category fiction = createCategory("Sách Văn Học", "Tiểu thuyết, truyện ngắn, thơ, kịch", 1);
            Category business = createCategory("Kinh Tế", "Sách kinh doanh, tài chính, đầu tư", 2);
            Category science = createCategory("Khoa Học", "Sách khoa học, công nghệ", 3);
            Category selfHelp = createCategory("Phát Triển Bản Thân", "Sách tự giúp, kỹ năng sống", 4);
            Category children = createCategory("Sách Thiếu Nhi", "Sách tranh, truyện cho trẻ em", 5);
            Category history = createCategory("Lịch Sử", "Sách lịch sử, văn hóa", 6);
            Category foreign = createCategory("Sách Ngoại Văn", "Sách tiếng Anh, ngoại ngữ", 7);
            Category textbook = createCategory("Sách Giáo Khoa", "Sách giáo khoa, tham khảo", 8);

            categories.add(fiction);
            categories.add(business);
            categories.add(science);
            categories.add(selfHelp);
            categories.add(children);
            categories.add(history);
            categories.add(foreign);
            categories.add(textbook);

            // Subcategories for Fiction
            Category novel = createSubcategory(fiction, "Tiểu Thuyết", "Tiểu thuyết Việt Nam và thế giới", 1);
            Category shortStory = createSubcategory(fiction, "Truyện Ngắn", "Tuyển tập truyện ngắn", 2);
            Category poetry = createSubcategory(fiction, "Thơ", "Tập thơ, thơ hay", 3);
            Category classic = createSubcategory(fiction, "Văn Học Cổ Điển", "Tác phẩm văn học cổ điển", 4);
            categories.add(novel);
            categories.add(shortStory);
            categories.add(poetry);
            categories.add(classic);

            // Subcategories for Business
            Category marketing = createSubcategory(business, "Marketing", "Sách về marketing, quảng cáo", 1);
            Category finance = createSubcategory(business, "Tài Chính", "Sách tài chính, kế toán", 2);
            Category leadership = createSubcategory(business, "Lãnh Đạo", "Sách về lãnh đạo, quản trị", 3);
            categories.add(marketing);
            categories.add(finance);
            categories.add(leadership);

            categoryRepository.saveAll(categories);

            // Create Brands/Publishers
            List<Brand> brands = new ArrayList<>();
            brands.add(createBrand("NXB Trẻ", "Nhà xuất bản Trẻ"));
            brands.add(createBrand("NXB Văn Học", "Nhà xuất bản Văn học"));
            brands.add(createBrand("First News", "First News - Trí Việt"));
            brands.add(createBrand("Nhã Nam", "Nhã Nam Publishing"));
            brands.add(createBrand("Alpha Books", "Alpha Books"));
            brands.add(createBrand("Saigon Books", "Saigon Books"));
            brands.add(createBrand("Vintage Books", "Vintage Books"));
            brands.add(createBrand("Penguin Random House", "Penguin Random House"));

            brandRepository.saveAll(brands);

            // Create Products
            List<Product> products = new ArrayList<>();

            // Fiction Products
            products.add(createProduct("Đắc Nhân Tâm", "Dale Carnegie",
                    "NXB Trẻ", "9786045653206",
                    "59000", "45000", 24, 150,
                    "Sách kinh điển về nghệ thuật giao tiếp và đối nhân xử thế. Được coi là một trong những cuốn sách bán chạy nhất mọi thời đại.",
                    "Đắc Nhân Tâm là cuốn sách nổi tiếng của Dale Carnegie, được xuất bản năm 1936. Cuốn sách này đã được dịch ra hơn 50 ngôn ngữ và bán được hàng triệu bản trên toàn thế giới. Nội dung sách tập trung vào nghệ thuật giao tiếp, cách đối xử với mọi người, cách làm cho người khác yêu mến bạn, và cách thuyết phục người khác.",
                    fiction, true, true, true, 320, 2023, 200));

            products.add(createProduct("Tư Duy Nhanh và Chậm", "Daniel Kahneman",
                    "NXB Trẻ", "9786045636421",
                    "199000", "169000", 15, 80,
                    "Tư duy nhanh và chậm là cuốn sách của nhà tâm lý học đoạt giải Nobel Daniel Kahneman, khám phá hai hệ thống suy nghĩ chi phối quyết định của chúng ta.",
                    "Cuốn sách này trình bày hai cách suy nghĩ: Tư duy nhanh (System 1) - nhanh, trực giác và cảm xúc; và Tư duy chậm (System 2) - chậm, có logic và tính toán. Kahneman giải thích cách những sai lầm trong suy nghĩ của chúng ta xảy ra và cách chúng ta có thể cải thiện quyết định của mình.",
                    fiction, true, false, false, 450, 2023, 300));

            products.add(createProduct("Cho Tôi Xin Một Vé Đi Tuổi Thơ", "Nguyễn Nhật Ánh",
                    "NXB Trẻ", "9786045632348",
                    "75000", "62000", 17, 200,
                    "Một cuốn sách đầy xúc cảm về tuổi thơ, tình bạn và những ký ức đẹp đẽ.",
                    "Cho Tôi Xin Một Vé Đi Tuổi Thơ là cuốn sách của nhà văn Nguyễn Nhật Ánh, kể về hành trình trở về tuổi thơ qua những câu chuyện đầy hoài niệm và cảm xúc.",
                    novel, false, true, true, 280, 2022, 250));

            products.add(createProduct("Mắt Biếc", "Nguyễn Nhật Ánh",
                    "NXB Trẻ", "9786045632355",
                    "85000", "72000", 15, 180,
                    "Tiểu thuyết tình cảm lãng mạn của Nguyễn Nhật Ánh về tình yêu tuổi học trò.",
                    "Mắt Biếc là một câu chuyện tình yêu đẹp và buồn về Hùng và Biếc, hai người bạn từ thuở nhỏ. Câu chuyện diễn ra qua nhiều năm, từ những ngày học trò đến khi trưởng thành, với đầy những kỷ niệm, hiểu lầm và nỗi đau.",
                    novel, false, true, false, 320, 2021, 220));

            products.add(createProduct("Doraemon - Tập 1", "Fujiko F. Fujio",
                    "Kim Đồng", "9786045644563",
                    "35000", "28000", 20, 500,
                    "Truyện tranh Doraemon tập đầu tiên với những câu chuyện hài hước, cảm động.",
                    "Doraemon là bộ truyện tranh nổi tiếng của Nhật Bản, kể về chú mèo máy đến từ tương lai giúp cậu bé Nobita Nobi vượt qua những khó khăn trong cuộc sống bằng các bảo bối kỳ diệu.",
                    children, false, false, false, 180, 2023, 150));

            products.add(createProduct("Harry Potter và Hòn Đá Phù Thủy", "J.K. Rowling",
                    "Vintage Books", "9780439708180",
                    "350000", "299000", 15, 100,
                    "Cuốn sách đầu tiên trong series Harry Potter nổi tiếng thế giới.",
                    "Harry Potter và Hòn Đá Phù Thủy là cuốn sách đầu tiên trong series Harry Potter của J.K. Rowling. Câu chuyện kể về cậu bé Harry Potter phát hiện ra mình là một phù thủy và được nhận vào trường Hogwarts.",
                    novel, true, true, false, 350, 2021, 400));

            products.add(createProduct("Sapiens - Lược Sử Loài Người", "Yuval Noah Harari",
                    "Alpha Books", "9786045674560",
                    "250000", "215000", 14, 90,
                    "Một cái nhìn tổng quan về lịch sử loài người từ thuở hồng hoang đến hiện tại.",
                    "Sapiens là cuốn sách phi hư cấu của Yuval Noah Harari, khám phá lịch sử của loài người từ thời điểm khởi nguồn đến hiện tại. Harari phân tích các bước ngoặt quan trọng trong lịch sử loài người và cách chúng định hình xã hội hiện đại.",
                    science, true, true, false, 520, 2023, 600));

            products.add(createProduct("Nhà Giả Kim", "Paulo Coelho",
                    "NXB Trẻ", "9786045638906",
                    "68000", "55000", 19, 250,
                    "Một cuốn sách truyền cảm hứng về việc theo đuổi giấc mơ.",
                    "Nhà Giả Kim là tiểu thuyết của Paulo Coelho, kể về hành trình của chàng trai tuổi teen Santiago đi tìm kho báu ở Ai Cập sau khi mơ thấy điều may mắn ở kim tự tháp.",
                    novel, false, true, true, 220, 2022, 180));

            products.add(createProduct("Rich Dad Poor Dad", "Robert Kiyosaki",
                    "First News", "9781611720108",
                    "149000", "125000", 16, 120,
                    "Cuốn sách về giáo dục tài chính nổi tiếng thế giới.",
                    "Rich Dad Poor Dad là cuốn sách của Robert Kiyosaki, kể về hai người cha đối lập trong cuộc đời ông - một người giàu và một người nghèo - và những bài học tài chính rút ra từ họ.",
                    finance, true, true, false, 240, 2023, 280));

            products.add(createProduct("Atomic Habits", "James Clear",
                    "Vintage Books", "9780735211292",
                    "299000", "259000", 13, 85,
                    "Cách xây dựng thói quen tốt và phá vỡ thói quen xấu.",
                    "Atomic Habits là cuốn sách của James Clear về cách xây dựng thói quen tốt một cách hiệu quả. Cuốn sách cung cấp các chiến lược thực tế để tạo ra những thay đổi nhỏ nhưng có ý nghĩa trong cuộc sống.",
                    selfHelp, true, true, false, 320, 2023, 350));

            products.add(createProduct("7 Thói Quen Của Người Thành Đạt", "Stephen Covey",
                    "First News", "9780671759964",
                    "189000", "159000", 16, 100,
                    "Một cuốn sách kinh điển về phát triển cá nhân và lãnh đạo.",
                    "7 Thói Quen Của Người Thành Đạt là cuốn sách của Stephen Covey, trình bày 7 nguyên tắc để đạt được thành công trong cuộc sống và sự nghiệp.",
                    selfHelp, true, false, false, 400, 2022, 420));

            products.add(createProduct("The Lean Startup", "Eric Ries",
                    "Vintage Books", "9780307887894",
                    "279000", "239000", 14, 70,
                    "Cách xây dựng doanh nghiệp khởi nghiệp hiệu quả.",
                    "The Lean Startup giới thiệu phương pháp khởi nghiệp tinh gọn, tập trung vào việc xây dựng sản phẩm tối thiểu khả thi, đo lường kết quả và học hỏi liên tục.",
                    business, false, false, false, 320, 2023, 380));

            products.add(createProduct("Đọc Vị Tâm Lý Khách Hàng", "Nghiên Cứu Tâm Lý",
                    "Saigon Books", "9786045645676",
                    "89000", "75000", 15, 150,
                    "Hiểu tâm lý khách hàng để bán hàng hiệu quả hơn.",
                    "Đọc Vị Tâm Lý Khách Hàng là cuốn sách giúp bạn hiểu cách khách hàng suy nghĩ và đưa ra quyết định mua hàng, từ đó áp dụng vào chiến lược bán hàng của mình.",
                    marketing, false, false, false, 250, 2023, 300));

            products.add(createProduct("Lịch Sử Việt Nam", "Đại Cuồng",
                    "NXB Văn Học", "9786045672344",
                    "180000", "155000", 14, 60,
                    "Tổng quan lịch sử Việt Nam từ nguồn gốc đến hiện đại.",
                    "Lịch Sử Việt Nam là cuốn sách tổng hợp lịch sử Việt Nam từ thời Hồng Bàng đến hiện đại, với những phân tích sâu sắc về các sự kiện lịch sử quan trọng.",
                    history, false, false, false, 600, 2023, 650));

            products.add(createProduct("Toán Học Lớp 12", "Bộ Giáo Dục",
                    "NXB Giáo Dục", "9786045641234",
                    "45000", "38000", 15, 300,
                    "Sách giáo khoa Toán học lớp 12 theo chương trình GDPT 2018.",
                    "Sách giáo khoa Toán học lớp 12 bao gồm các chủ đề: Hàm số, Giải tích, Hình học không gian, Xác suất thống kê.",
                    textbook, false, false, false, 200, 2023, 250));

            // Add more diverse products
            products.add(createProduct("Think and Grow Rich", "Napoleon Hill",
                    "Vintage Books", "9781585424337",
                    "199000", "169000", 15, 95,
                    "Cuốn sách kinh điển về cách làm giàu và thành công.",
                    "Think and Grow Rich là cuốn sách của Napoleon Hill, được viết dựa trên nghiên cứu về những người giàu có nhất nước Mỹ. Cuốn sách trình bày 13 nguyên tắc để đạt được thành công và giàu có.",
                    finance, true, true, false, 280, 2022, 320));

            products.add(createProduct("The Psychology of Money", "Morgan Housel",
                    "Vintage Books", "9780857197689",
                    "279000", "235000", 16, 80,
                    "Bài học về tiền bạc và cách suy nghĩ về tài chính.",
                    "The Psychology of Money là cuốn sách của Morgan Housel, khám phá mối quan hệ giữa tâm lý con người và quyết định tài chính. Cuốn sách cho thấy cách chúng ta nghĩ về tiền quan trọng hơn kiến thức tài chính.",
                    finance, true, false, false, 300, 2023, 340));

            products.add(createProduct("Steve Jobs", "Walter Isaacson",
                    "Vintage Books", "9781451648539",
                    "399000", "349000", 13, 65,
                    "Tiểu sử đầy đủ và chi tiết về Steve Jobs.",
                    "Steve Jobs là tiểu sử được viết bởi Walter Isaacson, dựa trên hơn 40 cuộc phỏng vấn với Steve Jobs và hàng trăm cuộc phỏng vấn với gia đình, bạn bè, đồng nghiệp của ông.",
                    science, true, false, false, 680, 2022, 750));

            products.add(createProduct("Clean Code", "Robert C. Martin",
                    "Vintage Books", "9780132350884",
                    "329000", "285000", 13, 75,
                    "Hướng dẫn viết code sạch và dễ bảo trì.",
                    "Clean Code là cuốn sách của Robert C. Martin (Uncle Bob), trình bày các nguyên tắc và thực hành để viết code sạch, dễ đọc và dễ bảo trì.",
                    science, false, false, false, 480, 2023, 550));

            productRepository.saveAll(products);

            // Create sample orders for customers
            createSampleOrder(customer1, products);
            createSampleOrder(customer2, products);

            // Create admin cart with items
            Cart adminCart = Cart.builder().user(admin).build();
            cartRepository.save(adminCart);

            log.info("Database seeding completed!");
        };
    }

    private Category createCategory(String name, String description, int order) {
        return Category.builder()
                .name(name)
                .description(description)
                .displayOrder(order)
                .isActive(true)
                .build();
    }

    private Category createSubcategory(Category parent, String name, String description, int order) {
        return Category.builder()
                .name(name)
                .description(description)
                .parent(parent)
                .displayOrder(order)
                .isActive(true)
                .build();
    }

    private Brand createBrand(String name, String description) {
        return Brand.builder()
                .name(name)
                .description(description)
                .isActive(true)
                .build();
    }

    private Product createProduct(String name, String author, String publisher, String isbn,
                                  String price, String discountPrice, int discountPercent,
                                  int stockQuantity, String shortDesc, String description,
                                  Category category, boolean featured, boolean bestseller, boolean isNew,
                                  int pageCount, int year, int weightGrams) {
        return Product.builder()
                .name(name)
                .author(author)
                .publisher(publisher)
                .isbn(isbn)
                .price(new BigDecimal(price))
                .discountPrice(new BigDecimal(discountPrice))
                .discountPercent(discountPercent)
                .stockQuantity(stockQuantity)
                .shortDescription(shortDesc)
                .description(description)
                .category(category)
                .pageCount(pageCount)
                .publishedYear(year)
                .weightGrams(weightGrams)
                .language("Vietnamese")
                .isFeatured(featured)
                .isBestseller(bestseller)
                .isNew(isNew)
                .isActive(true)
                .avgRating(4.0 + Math.random())
                .reviewCount((int) (Math.random() * 100))
                .soldCount((int) (Math.random() * 500))
                .viewCount((int) (Math.random() * 1000))
                .imageUrl("https://picsum.photos/seed/" + name.hashCode() + "/300/400")
                .build();
    }

    private void createSampleOrder(User user, List<Product> products) {
        Random random = new Random();
        Order order = Order.builder()
                .orderNumber("ORD" + System.currentTimeMillis() + random.nextInt(1000))
                .user(user)
                .orderStatus(OrderStatus.DELIVERED)
                .paymentStatus(PaymentStatus.PAID)
                .shippingAddress("123 Đường ABC, Phường XYZ, Quận 1, TP.HCM")
                .shippingPhone(user.getPhoneNumber())
                .shippingReceiverName(user.getFullName())
                .shippingMethod("Giao hàng nhanh")
                .shippingFee(BigDecimal.ZERO)
                .taxAmount(new BigDecimal("15000"))
                .discountAmount(BigDecimal.ZERO)
                .paymentMethod("COD")
                .subtotal(new BigDecimal("150000"))
                .totalAmount(new BigDecimal("165000"))
                .deliveredAt(LocalDateTime.now().minusDays(5))
                .build();

        OrderItem item1 = OrderItem.builder()
                .product(products.get(random.nextInt(Math.min(5, products.size()))))
                .quantity(2)
                .price(new BigDecimal("50000"))
                .discountPercent(10)
                .build();
        item1.calculateSubtotal();
        order.addItem(item1);

        OrderItem item2 = OrderItem.builder()
                .product(products.get(random.nextInt(Math.min(10, products.size()))))
                .quantity(1)
                .price(new BigDecimal("50000"))
                .discountPercent(0)
                .build();
        item2.calculateSubtotal();
        order.addItem(item2);

        order.calculateTotal();
        orderRepository.save(order);
    }
}
