---
name: "Master Implementation Plan"
overview: "Triển khai toàn diện 8 phần + 6 bổ sung: (1) UI/UX - Thay emoji + Lucide icons + Glassmorphism, (2) Test - Controller + Integration + Vitest + CI/CD, (3) SEO - Meta + Sitemap + JSON-LD + Web Vitals, (4) Performance - Lazy load + Code split + Caching, (5) Accessibility - ARIA + Keyboard nav + WCAG, (6) Analytics - GA4 + Event tracking, (7) PWA - Service worker + Manifest + Offline, (8) Security + Monitoring - CSP + Health check + Logging, (9) Internationalization i18n, (10) Error Handling + Fallback UI, (11) API Rate Limiting Frontend + Debounce, (12) Feature Flags, (13) Database Migration Strategy, (14) Docker Setup"
todos:
  - id: "ui-1"
    content: "Thay thế emoji trong product-card.tsx"
    status: "pending"
  - id: "ui-2"
    content: "Thay thế emoji trong categories/page.tsx"
    status: "pending"
  - id: "ui-3"
    content: "Thay thế emoji trong cart/page.tsx"
    status: "pending"
  - id: "ui-4"
    content: "Thay thế emoji trong login/page.tsx"
    status: "pending"
  - id: "ui-5"
    content: "Thay thế emoji trong chatbot/ChatbotWidget.tsx"
    status: "pending"
  - id: "ui-6"
    content: "Cải thiện UI components với glassmorphism"
    status: "pending"
  - id: "ui-7"
    content: "Update Flash Sale Banner và Home Section"
    status: "pending"
  - id: "test-1"
    content: "Tạo Backend Controller Tests"
    status: "pending"
  - id: "test-2"
    content: "Tạo Backend Integration Tests"
    status: "pending"
  - id: "test-3"
    content: "Setup Vitest + RTL cho Frontend"
    status: "pending"
  - id: "test-4"
    content: "Tạo Frontend Unit Tests"
    status: "pending"
  - id: "test-5"
    content: "Tạo CI/CD GitHub Actions"
    status: "pending"
  - id: "seo-1"
    content: "SEO - Meta tags + Open Graph + Twitter Cards"
    status: "pending"
  - id: "seo-2"
    content: "SEO - sitemap.xml + robots.txt"
    status: "pending"
  - id: "seo-3"
    content: "SEO - JSON-LD Structured Data (Book, Product, BreadcrumbList)"
    status: "pending"
  - id: "seo-4"
    content: "SEO - Canonical URLs + Core Web Vitals"
    status: "pending"
  - id: "perf-1"
    content: "Performance - Lazy loading + Code splitting + Caching"
    status: "pending"
  - id: "a11y-1"
    content: "Accessibility - ARIA labels + Keyboard nav + Contrast"
    status: "pending"
  - id: "analytics-1"
    content: "Analytics - Google Analytics / Tag Manager integration"
    status: "pending"
  - id: "pwa-1"
    content: "PWA - Service Worker + Manifest + Offline support"
    status: "pending"
  - id: "security-1"
    content: "Security - CSP Headers + Helmet + Rate limiting monitoring"
    status: "pending"
  - id: "monitoring-1"
    content: "Monitoring - Health check + Logging + Alerting"
    status: "pending"
  - id: "i18n-1"
    content: "i18n - Cài đặt next-intl + Cấu hình đa ngôn ngữ"
    status: "pending"
  - id: "i18n-2"
    content: "i18n - Dịch các trang chính (vi, en)"
    status: "pending"
  - id: "error-1"
    content: "Error Handling - Global error boundary + fallback UI"
    status: "pending"
  - id: "error-2"
    content: "Error Handling - API error interceptor + retry logic"
    status: "pending"
  - id: "rate-1"
    content: "API Rate Limiting - Frontend debounce + throttling"
    status: "pending"
  - id: "flags-1"
    content: "Feature Flags - Cấu hình LaunchDarkly hoặc Unleash"
    status: "pending"
  - id: "migrate-1"
    content: "Database Migration - Flyway hoặc Liquibase setup"
    status: "pending"
  - id: "docker-1"
    content: "Docker - Dockerfile + docker-compose cho dev và prod"
    status: "pending"
isProject: true
---

> **Bản sao để mở trong Cursor:** File gốc nằm tại `.cursor/plans/master_plan.md`. Nếu mở từ chat bị lỗi "Unable to resolve resource", hãy mở file này: `docs/MASTER_PLAN.md` (Ctrl+P → gõ `MASTER_PLAN.md`, hoặc mở từ Explorer).

# MASTER IMPLEMENTATION PLAN

## Tổng quan
Triển khai toàn diện bao gồm:
1. **Cải thiện UI/UX** - Thay emoji bằng Lucide icons + Glassmorphism
2. **Hệ thống Test** - Backend Controller + Integration + Frontend Vitest + CI/CD

---

# PHẦN 1: CẢI THIỆN UI/UX TOÀN DIỆN

## Mục tiêu
- Thay thế **tất cả emoji** bằng **Lucide icons** chuyên nghiệp
- Áp dụng **Glassmorphism** và **gradients nhẹ** cho phong cách hiện đại
- Cải thiện trải nghiệm người dùng trên toàn bộ ứng dụng

---

## GIAI ĐOẠN 1: Thay thế Emoji (14 vị trí)

### 1.1 Product Card (`src/components/product-card.tsx`)
```tsx
// Trước:
<span className="text-8xl opacity-50">📚</span>

// Sau:
<BookOpen className="h-16 w-16 text-gray-300" />
```
**Icon**: `BookOpen` từ `lucide-react`

---

### 1.2 Categories Page (`src/app/categories/page.tsx`)
```tsx
// Trước:
<span className="text-lg">📚</span>
['📖', '🔬', '💼', '🎨', '🏥', '💻', '🌍', '⚽'][index % 8]

// Sau:
<BookOpen className="h-6 w-6 text-white" />
```
**Icons**: `BookOpen`, `FlaskConical`, `Briefcase`, `Palette`, `Stethoscope`, `Laptop`, `Globe`, `Trophy`

---

### 1.3 Cart Page (`src/app/cart/page.tsx`)
```tsx
// Trước:
text-4xl text-gray-300">📚</div>
"text-sm font-medium text-primary">🎉 Mua thêm..."

// Sau:
<ShoppingBag className="h-10 w-10 text-gray-300" />
<Sparkles className="h-4 w-4 text-yellow-500" /> Mua thêm...
```
**Icons**: `ShoppingBag`, `Sparkles`

---

### 1.4 Login Page (`src/app/login/page.tsx`)
```tsx
// Trước:
<p>👤 Admin: ...</p>
<p>👤 Customer: ...</p>

// Sau:
<div className="flex items-center gap-2">
  <Shield className="h-4 w-4 text-blue-600" />
  <span>Admin</span>
</div>
```
**Icons**: `Shield` hoặc `UserCheck`

---

### 1.5 Chatbot Widget (`src/components/chatbot/ChatbotWidget.tsx`)
```tsx
// Trước:
"Xin chào! 👋</h3>

// Sau:
<Hand className="h-5 w-5 text-yellow-500 inline" /> Xin chào!
```
**Icons**: `Hand` hoặc `Sparkles`

---

## GIAI ĐOẠN 2: Cải thiện UI Components

### 2.1 Product Card Enhancements
- Thêm **hover effect** mượt hơn với scale transform
- Cải thiện badge visibility với backdrop blur
- Thêm **quick actions** (wishlist, quick view) hiện trên hover
- Gradient shimmer loading state

### 2.2 Categories Page Enhancements
- Thêm **glassmorphism effect** cho category cards
- Hover state với scale + shadow
- Smooth transition animations
- Gradient border trên selected category

### 2.3 Cart Page Enhancements
- Thêm **empty state illustration** với Lucide icons
- Improved quantity controls với better UX
- Floating summary panel với glassmorphism
- Micro-interactions khi thêm/xóa sản phẩm

### 2.4 Login Page Enhancements
- Thêm **animated background gradient**
- Input focus states với glow effect
- Button hover với gradient shift
- Demo accounts section với icon badges

---

## GIAI ĐOẠN 3: Global UI Improvements

### 3.1 Update Flash Sale Banner
- Replace emoji trong FlashSaleBanner bằng `Zap` icon
- Add subtle glassmorphism backdrop
- Improved countdown animation

### 3.2 Update Home Section
- Replace emoji trong section titles
- Add gradient text effects cho headings
- Smooth scroll animations

### 3.3 Update Chatbot Components
- Replace emoji trong greeting messages
- Add typing indicator với proper animation
- Improved message bubbles với glassmorphism

---

## CÁC FILES UI CẦN CHỈNH SỬA

1. `frontend/src/components/product-card.tsx`
2. `frontend/src/app/categories/page.tsx`
3. `frontend/src/app/cart/page.tsx`
4. `frontend/src/app/login/page.tsx`
5. `frontend/src/components/chatbot/ChatbotWidget.tsx`
6. `frontend/src/components/flashsale/FlashSaleBanner.tsx`
7. `frontend/src/components/home-section.tsx`
8. `frontend/src/app/page.tsx`

---

# PHẦN 2: HỆ THỐNG TEST TOÀN DIỆN

## Mục tiêu
Xây dựng hệ thống test chuyên nghiệp:
- Backend Controller Tests (80%+ coverage)
- Backend Integration Tests
- Frontend Unit Tests với Vitest + React Testing Library
- CI/CD Pipeline với GitHub Actions

---

## GIAI ĐOẠN 4: Backend Controller Tests

### 4.1 Cấu trúc Tests
```
backend/src/test/java/com/bookstore/controller/
├── AuthControllerTest.java
├── ProductControllerTest.java
├── CartControllerTest.java
├── OrderControllerTest.java
├── CouponControllerTest.java
├── WishlistControllerTest.java
├── ChatbotControllerTest.java
├── FlashSaleControllerTest.java
└── PaymentControllerTest.java
```

### 4.2 Ví dụ AuthControllerTest
```java
@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @MockBean
    private AuthService authService;

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("POST /api/auth/register - Success")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
            .email("test@example.com")
            .password("Password123!")
            .firstName("Test")
            .lastName("User")
            .build();

        AuthResponse response = AuthResponse.builder()
            .accessToken("jwt-token")
            .refreshToken("refresh-token")
            .tokenType("Bearer")
            .build();

        when(authService.register(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.accessToken").value("jwt-token"));
    }
}
```

### 4.3 Các Controller cần test

| Controller | Test Methods |
|------------|--------------|
| AuthController | register, login, refresh, logout |
| ProductController | getProducts, getProduct, search |
| CartController | getCart, addItem, updateItem, removeItem |
| OrderController | createOrder, getOrders, cancelOrder |
| CouponController | create, validate, getAvailable |
| ChatbotController | sendMessage, getConversations |
| FlashSaleController | getActive, create (admin) |
| PaymentController | createVNPay, getStatus |

---

## GIAI ĐOẠN 5: Backend Integration Tests

### 5.1 Mở rộng Integration Tests
```
backend/src/test/java/com/bookstore/integration/
├── AuthFlowIntegrationTest.java      # Đã có
├── EmailIntegrationTest.java          # Đã có
├── ProductIntegrationTest.java       # Mới
├── OrderIntegrationTest.java         # Mới
├── CouponIntegrationTest.java        # Mới
└── PaymentIntegrationTest.java       # Mới
```

### 5.2 Ví dụ ProductIntegrationTest
```java
@SpringBootTest
@Transactional
@AutoConfigureMockMvc
class ProductIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Test
    @DisplayName("Tạo sản phẩm và lấy danh sách")
    void testCreateAndListProducts() {
        Product product = Product.builder()
            .name("Test Book")
            .author("Test Author")
            .price(new BigDecimal("199000"))
            .stockQuantity(100)
            .isActive(true)
            .build();
        productRepository.save(product);

        mockMvc.perform(get("/api/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content").isArray());
    }
}
```

---

## GIAI ĐOẠN 6: Frontend Unit Tests (Vitest)

### 6.1 Cài đặt Vitest + React Testing Library
```bash
cd frontend
npm install -D vitest @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/jest-dom
```

### 6.2 Cấu hình vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['node_modules', 'e2e']
    }
  }
})
```

### 6.3 Test Files Structure
```
frontend/src/test/
├── setup.ts                      # Test setup + mocks
├── lib/
│   ├── api.test.ts              # API client tests
│   ├── auth.test.ts             # Auth functions tests
│   └── utils.test.ts            # Utility tests
├── components/
│   ├── product-card.test.tsx
│   ├── button.test.tsx
│   ├── header.test.tsx
│   ├── chatbot-widget.test.tsx
│   └── coupon-input.test.tsx
└── hooks/
    ├── useWishlist.test.ts
    └── useCart.test.ts
```

### 6.4 Ví dụ ProductCard.test.tsx
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '@/components/product-card'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />
}))

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Book',
    author: 'Test Author',
    price: 199000,
    imageUrl: 'https://example.com/image.jpg'
  }

  it('renders product name correctly', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Test Book')).toBeInTheDocument()
  })

  it('calls onAddToCart when button clicked', async () => {
    const onAddToCart = vi.fn()
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />)

    const button = screen.getByRole('button', { name: /add to cart/i })
    fireEvent.click(button)

    expect(onAddToCart).toHaveBeenCalledWith(mockProduct)
  })
})
```

---

## GIAI ĐOẠN 7: CI/CD Pipeline (GitHub Actions)

### 7.1 GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: bookstore_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Run Backend Tests
        run: mvn clean test -Pcoverage

      - name: Upload Coverage Report
        uses: codecov/codecov-action@v3
        with:
          files: ./target/site/jacoco/jacoco.xml

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Dependencies
        run: cd frontend && npm ci

      - name: Run Vitest
        run: cd frontend && npm run test:unit

      - name: Run Playwright Tests
        run: cd frontend && npm run test:e2e
```

---

## TỔNG KẾT FILES CẦN TẠO

### UI/UX Files
| File | Mô tả |
|------|-------|
| `frontend/src/components/product-card.tsx` | Thay emoji bằng BookOpen icon |
| `frontend/src/app/categories/page.tsx` | Thay emoji bằng category icons |
| `frontend/src/app/cart/page.tsx` | Thay emoji bằng ShoppingBag icon |
| `frontend/src/app/login/page.tsx` | Thay emoji bằng Shield icon |
| `frontend/src/components/chatbot/ChatbotWidget.tsx` | Thay emoji bằng Hand icon |
| `frontend/src/components/flashsale/FlashSaleBanner.tsx` | Thay emoji bằng Zap icon |

### Backend Test Files
| File | Mô tả |
|------|-------|
| `backend/src/test/java/com/bookstore/controller/AuthControllerTest.java` | Test Auth API |
| `backend/src/test/java/com/bookstore/controller/ProductControllerTest.java` | Test Product API |
| `backend/src/test/java/com/bookstore/controller/CartControllerTest.java` | Test Cart API |
| `backend/src/test/java/com/bookstore/controller/OrderControllerTest.java` | Test Order API |
| `backend/src/test/java/com/bookstore/controller/CouponControllerTest.java` | Test Coupon API |
| `backend/src/test/java/com/bookstore/integration/ProductIntegrationTest.java` | Product integration |
| `backend/src/test/java/com/bookstore/integration/OrderIntegrationTest.java` | Order integration |

### Frontend Test Files
| File | Mô tả |
|------|-------|
| `frontend/vitest.config.ts` | Vitest configuration |
| `frontend/src/test/setup.ts` | Test setup + mocks |
| `frontend/src/test/lib/api.test.ts` | API tests |
| `frontend/src/test/components/product-card.test.tsx` | Product card tests |
| `frontend/src/test/components/coupon-input.test.tsx` | Coupon tests |
| `frontend/src/test/hooks/useWishlist.test.ts` | Wishlist hook tests |

### CI/CD Files
| File | Mô tả |
|------|-------|
| `.github/workflows/ci.yml` | CI/CD pipeline |

---

# PHẦN 3: SEO TOÀN DIỆN

## Mục tiêu
Tối ưu hóa SEO toàn diện: meta tags, structured data, sitemap, performance.

---

## GIAI ĐOẠN 8: SEO Meta Tags & Open Graph

### 8.1 SEO Metadata Component
**File**: `frontend/src/components/SEO.tsx` (hoặc `src/app/seo.tsx`)

```tsx
// Tạo Metadata object cho Next.js App Router
export const generateSEOMetadata = (page: SEOPage) => ({
  title: `${page.title} | Nhà Sách Online`,
  description: page.description,
  keywords: page.keywords,
  openGraph: {
    title: page.title,
    description: page.description,
    type: page.type || 'website',
    images: [{ url: page.image, width: 1200, height: 630 }],
    locale: 'vi_VN',
    siteName: 'Nhà Sách Online',
  },
  twitter: {
    card: 'summary_large_image',
    title: page.title,
    description: page.description,
    images: [page.image],
  },
  alternates: {
    canonical: page.canonicalUrl,
  },
  robots: page.robots || 'index, follow',
})
```

### 8.2 Áp dụng Metadata cho từng page
| Page | Title Template | Description |
|------|---------------|-------------|
| Trang chủ | `Nhà Sách Online - Sách Chính Hãng Giá Tốt` | Mô tả ngắn về cửa hàng |
| Trang sản phẩm | `{Tên sách} - {Tác giả} | Nhà Sách Online` | Mô tả sách |
| Trang danh mục | `{Tên danh mục} - Sách {type} | Nhà Sách Online` | Mô tả danh mục |
| Trang giỏ hàng | `Giỏ Hàng | Nhà Sách Online` | Trang giỏ hàng |
| Trang đăng nhập | `Đăng Nhập / Đăng Ký | Nhà Sách Online` | Trang auth |

---

## GIAI ĐOẠN 9: Sitemap & Robots.txt

### 9.1 Dynamic Sitemap (`src/app/sitemap.ts`)
```ts
import { MetadataRoute } from 'next'
import { productService } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await productService.getAllForSitemap()

  const staticPages = [
    { url: 'https://domain.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://domain.com/products', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://domain.com/categories', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://domain.com/cart', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const productPages = products.map((p) => ({
    url: `https://domain.com/products/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...productPages]
}
```

### 9.2 robots.txt (`src/app/robots.ts`)
```ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/checkout/payment/', '/profile/'],
      },
    ],
    sitemap: 'https://domain.com/sitemap.xml',
  }
}
```

---

## GIAI ĐOẠN 10: JSON-LD Structured Data

### 10.1 Book Schema (trang chi tiết sản phẩm)
**File**: `frontend/src/components/BookSchema.tsx`

```tsx
const BookSchema = ({ book }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.name,
    author: { '@type': 'Person', name: book.author },
    isbn: book.isbn,
    numberOfPages: book.pageCount,
    publisher: book.publisher,
    image: book.imageUrl,
    description: book.description,
    offers: {
      '@type': 'Offer',
      price: book.price,
      priceCurrency: 'VND',
      availability: book.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 10.2 BreadcrumbList Schema
```tsx
const BreadcrumbSchema = ({ items }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 10.3 Organization Schema (trang chủ)
```tsx
const OrganizationSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Nhà Sách Online',
    url: 'https://domain.com',
    logo: 'https://domain.com/logo.png',
    description: 'Nhà sách online chuyên cung cấp sách chính hãng với giá tốt nhất.',
    address: { '@type': 'PostalAddress', addressCountry: 'VN' },
    sameAs: [
      'https://facebook.com/nhasachonline',
      'https://instagram.com/nhasachonline',
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

---

## GIAI ĐOẠN 11: Core Web Vitals & Performance

### 11.1 Next.js Image Optimization
```tsx
// Thay thế img thuần bằng next/image
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'

<Image
  src={getImageUrl(product.imageUrl)}
  alt={product.name}
  width={400}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={index < 4} // Lazy load tất cả trừ 4 ảnh đầu
  quality={85}
/>
```

### 11.2 Dynamic Import (Code Splitting)
```tsx
// Lazy load components nặng
import dynamic from 'next/dynamic'

const ChatbotWidget = dynamic(
  () => import('@/components/chatbot/ChatbotWidget'),
  { ssr: false, loading: () => <ChatbotSkeleton /> }
)

const ProductQuickView = dynamic(
  () => import('@/components/ProductQuickView'),
  { ssr: false }
)
```

### 11.3 Font Optimization
```tsx
// Sử dụng next/font thay vì Google Fonts trực tiếp
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], display: 'swap' })
```

### 11.4 Route-based Code Splitting
- `app/` (App Router) tự động code-split theo route
- Đảm bảo mỗi page chỉ load code cần thiết
- Bundle analyzer: `npm run analyze`

---

# PHẦN 4: ACCESSIBILITY

## Mục tiêu
Đảm bảo ứng dụng accessible cho tất cả người dùng (WCAG 2.1 AA).

### 12.1 ARIA Labels & Semantic HTML
```tsx
// Button accessible
<button
  aria-label="Thêm vào giỏ hàng"
  aria-describedby="product-1-price"
  onClick={handleAddToCart}
>
  Thêm vào giỏ
</button>

// Input accessible
<input
  type="search"
  aria-label="Tìm kiếm sách"
  aria-describedby="search-hint"
  placeholder="Tìm kiếm sách..."
/>

// Error state
<input
  aria-invalid="true"
  aria-describedby="email-error"
  aria-required="true"
/>
<div id="email-error" role="alert">Email không hợp lệ</div>
```

### 12.2 Keyboard Navigation
```tsx
// Skip to content link
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

// Focus management cho modal
const ProductModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus()
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      ref={modalRef}
    >
      <h2 id="modal-title">Chi tiết sản phẩm</h2>
      <button onClick={onClose} aria-label="Đóng">X</button>
    </div>
  )
}
```

### 12.3 Color Contrast
- Kiểm tra tỷ lệ contrast >= 4.5:1 cho text thường
- >= 3:1 cho text lớn (>18px)
- Sử dụng CSS custom properties cho dark/light mode

---

# PHẦN 5: ANALYTICS

## Mục tiêu
Tích hợp tracking để hiểu hành vi người dùng.

### 13.1 Google Analytics 4 Integration
**File**: `frontend/src/components/analytics/GA4Provider.tsx`

```tsx
'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID

export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return

    const url = pathname + searchParams.toString()
    // GTM hoặc gtag.js sẽ handle pageview tự động
  }, [pathname, searchParams])

  return null
}
```

### 13.2 Event Tracking
```tsx
// src/lib/analytics.ts
export const trackEvent = (event: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, params)
  }
}

// Usage
trackEvent('add_to_cart', {
  currency: 'VND',
  value: product.price,
  items: [{ item_id: product.id, item_name: product.name }],
})
```

### 13.3 Facebook Pixel (optional)
- Track pageview, add-to-cart, initiate-checkout, purchase events

---

# PHẦN 6: PWA

## Mục tiêu
Ứng dụng có thể cài đặt và hoạt động offline.

### 14.1 manifest.json
**File**: `frontend/public/manifest.json`

```json
{
  "name": "Nhà Sách Online",
  "short_name": "Sách Online",
  "description": "Mua sách chính hãng giá tốt",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 14.2 Service Worker
**File**: `frontend/public/sw.js`

```js
const CACHE_NAME = 'bookstore-v1'
const STATIC_ASSETS = ['/', '/cart', '/products']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const clone = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return networkResponse
      })
    })
  )
})
```

### 14.3 Metadata Tags (app/layout.tsx)
```tsx
export const metadata: Metadata = {
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nhà Sách Online',
  },
  formatDetection: { telephone: false },
}
```

---

# PHẦN 7: SECURITY

## Mục tiêu
Tăng cường bảo mật: CSP headers, helmet, rate limiting monitoring.

### 15.1 Security Headers (Next.js config)
**File**: `frontend/next.config.js`

```js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'HSTS=31536000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://cdn.example.com https://images.unsplash.com; connect-src 'self' https://api.domain.com https://www.google-analytics.com; frame-ancestors 'none';",
  },
]

module.exports = {
  async headers() {
    return [{ matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], headers: securityHeaders }]
  },
}
```

### 15.2 Rate Limiting Monitoring
```java
// Backend: Log rate limit violations
// RateLimitingFilter.java - đã có, thêm logging
@Component
public class RateLimitingFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, ...) {
        if (isRateLimited) {
            log.warn("RATE_LIMIT_EXCEEDED ip={} path={} uri={}",
                request.getRemoteAddr(), request.getMethod(), request.getRequestURI());
        }
    }
}
```

---

# PHẦN 8: MONITORING

## Mục tiêu
Health check, logging chuẩn, alerting cơ bản.

### 16.1 Health Check Endpoint
**File**: `backend/src/main/java/com/bookstore/controller/HealthController.java`

```java
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired private DataSource dataSource;
    @Autowired private RedisTemplate<String, String> redisTemplate;

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("timestamp", Instant.now().toString());

        Map<String, String> components = new LinkedHashMap<>();
        components.put("database", checkDatabase());
        components.put("redis", checkRedis());
        health.put("components", components);

        boolean allUp = components.values().stream().allMatch("UP"::equals);
        return allUp
            ? ResponseEntity.ok(health)
            : ResponseEntity.status(503).body(health);
    }

    private String checkDatabase() {
        try { dataSource.getConnection().close(); return "UP"; }
        catch (Exception e) { return "DOWN: " + e.getMessage(); }
    }

    private String checkRedis() {
        try { redisTemplate.hasKey("health-check"); return "UP"; }
        catch (Exception e) { return "DOWN: " + e.getMessage(); }
    }
}
```

### 16.2 Structured Logging
```xml
<!-- Logback config - backend/src/main/resources/logback-spring.xml -->
<encoder>
  <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
</encoder>

<!-- JSON format cho production -->
<encoder class="net.logstash.logback.encoder.LogstashEncoder" />
```

### 16.3 Actuator Endpoints
```properties
# application-prod.properties
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=when_authorized
management.metrics.enable.jvm=true
management.metrics.enable.process=true
```

---

## TỔNG KẾT FILES MỚI

### SEO Files
| File | Mô tả |
|------|-------|
| `frontend/src/components/SEO.tsx` | SEO metadata generator |
| `frontend/src/app/sitemap.ts` | Dynamic sitemap |
| `frontend/src/app/robots.ts` | robots.txt |
| `frontend/src/components/BookSchema.tsx` | JSON-LD Book schema |
| `frontend/src/components/BreadcrumbSchema.tsx` | JSON-LD BreadcrumbList |
| `frontend/src/components/OrganizationSchema.tsx` | JSON-LD Organization |

### Performance Files
| File | Mô tả |
|------|-------|
| `frontend/next.config.js` | Image optimization, headers |
| `frontend/src/lib/analytics.ts` | GA4 event tracking |
| `frontend/src/components/analytics/GA4Provider.tsx` | GA4 provider |

### PWA Files
| File | Mô tả |
|------|-------|
| `frontend/public/manifest.json` | PWA manifest |
| `frontend/public/sw.js` | Service worker |

### Security & Monitoring Files
| File | Mô tả |
|------|-------|
| `frontend/next.config.js` | Security headers (bổ sung) |
| `backend/src/main/java/com/bookstore/controller/HealthController.java` | Health check endpoint |
| `backend/src/main/resources/logback-spring.xml` | Structured logging |

### Accessibility Files
| File | Mô tả |
|------|-------|
| `frontend/src/app/layout.tsx` | Skip to content, ARIA root |
| `frontend/src/components/product-card.tsx` | ARIA labels (trong UI-1) |
| `frontend/src/components/Modal.tsx` | Accessible modal |

---

## COVERAGE TARGETS (UPDATED)

| Layer | Current | Target |
|-------|---------|--------|
| Backend Controller | 0% | 80%+ |
| Backend Service | 70% | 85%+ |
| Backend Repository | 10% | 60%+ |
| Frontend Components | 0% | 70%+ |
| Frontend Hooks | 0% | 85%+ |
| SEO Score (Lighthouse) | TBD | 90+ |
| Performance Score (Lighthouse) | TBD | 90+ |
| Accessibility Score (Lighthouse) | TBD | 95+ |
| PWA | None | Installable + Offline |
| **Overall** | **~25%** | **75%+** |

---

## KẾT QUẢ MONG ĐỢI (UPDATED)

| Metric | Before | After |
|--------|--------|-------|
| Professional Look | 2/5 | 5/5 |
| Emoji Usage | 14 | 0 |
| Glassmorphism | None | Applied |
| Test Coverage | 25% | 75%+ |
| CI/CD | None | Full |
| SEO Score | TBD | 90+ |
| Lighthouse Performance | TBD | 90+ |
| Lighthouse Accessibility | TBD | 95+ |
| PWA Installable | No | Yes |
| Security Headers | Basic | Full CSP + HSTS |
| Monitoring | None | Health + Logs + Metrics |

---

## CHIẾN LƯỢC GIT COMMIT CHUYÊN NGHIỆP

### Quy tắc đặt tên Commit

- **Ngữ pháp**: Tiếng Anh, thì hiện tại đơn, mệnh lệnh
- **Format**: `<type>(<scope>): <description>`
- **Body/Rành mạch**: Mỗi commit gắn với 1 thay đổi logic duy nhất
- **1 task = nhiều commits**: Mỗi task (ui-1, test-1...) có thể chứa nhiều commit nhỏ, mỗi commit = 1 thay đổi rõ ràng
- **Không dồn**: Không gộp nhiều thay đổi không liên quan vào 1 commit
- **Test đi kèm**: Test mới cho feature mới trong cùng task hoặc task kế tiếp

### Commit Types

| Type | Ý nghĩa |
|------|---------|
| `feat` | Thêm tính năng mới |
| `fix` | Sửa lỗi bug |
| `refactor` | Cấu trúc lại code, không đổi behavior |
| `test` | Thêm/sửa test files |
| `docs` | Chỉnh sửa documentation |
| `style` | Thay đổi formatting, whitespace, không code logic |
| `perf` | Cải thiện performance |
| `chore` | Cấu hình build, dependencies, tooling |
| `ci` | CI/CD configuration |
| `security` | Cải thiện bảo mật |
| `seo` | Thay đổi SEO |
| `a11y` | Cải thiện accessibility |

---

### Danh sách Commit theo Task

Mỗi task (todo) có thể chứa nhiều commits nhỏ. Dưới đây là cấu trúc commit rành mạch:

---

#### Task ui-1: Thay emoji trong product-card.tsx

```
1. feat(ui): replace emoji 📚 with BookOpen icon in product card
2. feat(ui): add aria-label to product card add-to-cart button
```

#### Task ui-2: Thay emoji trong categories/page.tsx

```
3. feat(ui): replace 8 category emojis with Lucide icons
4. feat(ui): add aria-label to category card buttons
```

#### Task ui-3: Thay emoji trong cart/page.tsx

```
5. feat(ui): replace cart empty state emoji with ShoppingBag icon
6. feat(ui): replace promo text emoji with Sparkles icon
7. feat(ui): add accessible quantity controls to cart
```

#### Task ui-4: Thay emoji trong login/page.tsx

```
8. feat(ui): replace admin/customer emoji with Shield icons
9. feat(ui): add accessible form labels and error states
```

#### Task ui-5: Thay emoji trong ChatbotWidget.tsx

```
10. feat(ui): replace chatbot greeting emoji 👋 with Hand icon
11. feat(ui): add aria-live region for chatbot messages
```

#### Task ui-6: Cải thiện UI với glassmorphism

```
12. feat(ui): apply glassmorphism backdrop-blur to product cards
13. feat(ui): apply glassmorphism gradient borders to categories cards
14. feat(ui): apply glassmorphism to cart summary panel
15. feat(ui): apply glassmorphism to login form inputs
16. feat(ui): add hover scale animations to cards
```

#### Task ui-7: Update Flash Sale Banner + Home Section

```
17. feat(ui): replace flash sale emoji with Zap icon
18. feat(ui): add countdown animation to flash sale banner
19. feat(ui): replace section heading emojis with gradient text effects
```

---

#### Task test-1: Backend Controller Tests

```
20. test(controller): add AuthController unit tests for register endpoint
21. test(controller): add AuthController unit tests for login endpoint
22. test(controller): add AuthController unit tests for refresh-token endpoint
23. test(controller): add ProductController unit tests for getProducts endpoint
24. test(controller): add ProductController unit tests for search endpoint
25. test(controller): add CartController unit tests for cart operations
26. test(controller): add OrderController unit tests for order creation
27. test(controller): add OrderController unit tests for order cancellation
28. test(controller): add CouponController unit tests for validate endpoint
29. test(controller): add ChatbotController unit tests for sendMessage endpoint
30. test(controller): add FlashSaleController unit tests for active sales endpoint
31. test(controller): add WishlistController unit tests for wishlist CRUD
```

#### Task test-2: Backend Integration Tests

```
32. test(integration): add ProductIntegrationTest for create and list products
33. test(integration): add OrderIntegrationTest for full order workflow
34. test(integration): add CouponIntegrationTest for coupon validation flow
35. test(integration): add CartIntegrationTest for add-update-remove items
```

#### Task test-3: Setup Vitest + RTL cho Frontend

```
36. chore(test): install vitest @vitejs/plugin-react jsdom dependencies
37. chore(test): install @testing-library/react @testing-library/jest-dom
38. chore(test): create vitest.config.ts with coverage configuration
39. chore(test): create test/setup.ts with next/image and router mocks
40. chore(test): add vitest npm scripts to package.json
```

#### Task test-4: Frontend Unit Tests

```
41. test(frontend): add ProductCard component tests for rendering
42. test(frontend): add ProductCard component tests for add-to-cart interaction
43. test(frontend): add CouponInput component tests for validation
44. test(frontend): add useWishlist hook tests for add-remove operations
45. test(frontend): add useCart hook tests for cart state management
46. test(frontend): add Header component tests for navigation
```

#### Task test-5: CI/CD GitHub Actions

```
47. ci: add github actions workflow with mysql and node services
48. ci: add backend maven test step with jacoco coverage
49. ci: add frontend npm ci and vitest step
50. ci: add codecov upload step for coverage reporting
51. ci: add playwright e2e test step
52. chore(ci): configure jacoco plugin in backend pom.xml
53. chore(ci): create .codecov.yml configuration file
```

---

#### Task seo-1: SEO Meta tags + Open Graph

```
54. seo: create SEO metadata component with title and description
55. seo: add Open Graph meta tags for social sharing
56. seo: add Twitter Card meta tags
57. seo: apply SEO metadata to homepage
58. seo: apply SEO metadata to product detail page
59. seo: apply SEO metadata to categories page
60. seo: apply SEO metadata to cart and login pages
```

#### Task seo-2: sitemap.xml + robots.txt

```
61. seo: create dynamic sitemap.ts generation
62. seo: create robots.ts configuration
63. seo: exclude admin and payment paths from sitemap
```

#### Task seo-3: JSON-LD Structured Data

```
64. seo: add Book schema json-ld to product detail page
65. seo: add BreadcrumbList schema json-ld to product pages
66. seo: add Organization schema json-ld to homepage
67. seo: add Product offer schema for pricing
```

#### Task seo-4: Canonical URLs + Core Web Vitals

```
68. seo: add canonical URL configuration to all pages
69. perf: configure next/image for lazy loading and sizing
70. perf: add dynamic import for ChatbotWidget component
```

---

#### Task perf-1: Performance optimization

```
71. perf: implement route-based code splitting
72. perf: configure next/font for font optimization
73. perf: add priority loading for above-fold product images
74. perf: add bundle analyzer script for monitoring
```

---

#### Task a11y-1: Accessibility improvements

```
75. a11y: add skip-to-content link to layout.tsx
76. a11y: add aria landmarks to main page sections
77. a11y: add aria labels to all product card action buttons
78. a11y: add accessible modal with focus trap management
79. a11y: add keyboard navigation for dropdown menus
80. a11y: verify color contrast ratio meets wcag 2.1 aa standards
81. a11y: add role and aria attributes to chatbot widget
```

---

#### Task analytics-1: Google Analytics integration

```
82. feat(analytics): create GA4Provider component with pageview tracking
83. feat(analytics): add add-to-cart event tracking
84. feat(analytics): add checkout funnel event tracking
85. feat(analytics): add search event tracking
86. feat(analytics): add purchase event tracking
87. docs(analytics): document GA4 event tracking implementation
```

---

#### Task pwa-1: PWA setup

```
88. feat(pwa): add web app manifest.json with icons and theme
89. feat(pwa): implement service worker with cache-first strategy
90. feat(pwa): add apple touch icon meta tags to layout
91. feat(pwa): configure standalone display mode
```

---

#### Task security-1: Security headers

```
92. security: add content security policy headers to next.config.js
93. security: add HSTS strict transport security header
94. security: add X-Frame-Options X-Content-Type-Options headers
95. security: enhance RateLimitingFilter with violation logging
96. security: add helmet security middleware configuration
```

---

#### Task monitoring-1: Health check + Logging

```
97. chore(monitoring): create HealthController with DB and Redis checks
98. chore(monitoring): configure structured JSON logging in logback
99. chore(monitoring): enable spring boot actuator endpoints
100. chore(monitoring): add health check to CI pipeline
```

---

# PHẦN 9: INTERNATIONALIZATION (i18n)

## Mục tiêu
Hỗ trợ đa ngôn ngữ: tiếng Việt (mặc định) + tiếng Anh.

### 9.1 Setup next-intl
```bash
npm install next-intl
```

### 9.2 Cấu hình
**File**: `frontend/i18n.ts`

```ts
import {getRequestConfig} from 'next-intl/server'

export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}))
```

### 9.3 Messages files
| File | Nội dung |
|------|---------|
| `messages/vi.json` | Tất cả text tiếng Việt |
| `messages/en.json` | Tất cả text tiếng Anh |

### 9.4 Áp dụng
```tsx
import {useTranslations} from 'next-intl'

export default function ProductCard({product}) {
  const t = useTranslations('Product')
  return (
    <div>
      <h2>{t('name')}: {product.name}</h2>
      <button>{t('addToCart')}</button>
    </div>
  )
}
```

### 9.5 Language Switcher
```tsx
'use client'
import {useRouter, usePathname} from 'next/navigation'
import {switchLocale} from '@/lib/i18n'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <select onChange={(e) => switchLocale(e.target.value, pathname, router)}>
      <option value="vi">Tiếng Việt</option>
      <option value="en">English</option>
    </select>
  )
}
```

---

# PHẦN 10: ERROR HANDLING & FALLBACK UI

## Mục tiêu
Xử lý lỗi graceful: error boundary, fallback UI, retry logic.

### 10.1 Global Error Boundary
**File**: `frontend/src/components/ErrorBoundary.tsx`

```tsx
'use client'

import {Component, ReactNode} from 'react'
import {AlertTriangle, RefreshCw} from 'lucide-react'

interface Props {children: ReactNode; fallback?: ReactNode}
interface State {hasError: boolean; error?: Error}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {hasError: false}

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error}
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center gap-4 p-8">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h2>Đã xảy ra lỗi</h2>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Thử lại
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

### 10.2 API Error Interceptor
**File**: `frontend/src/lib/api-client.ts`

```ts
class ApiClient {
  private async request<T>(url: string, options?: RequestInit, retries = 3): Promise<T> {
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        const error = await response.json().catch(() => ({message: 'Unknown error'}))
        throw new ApiError(response.status, error.message)
      }
      return response.json()
    } catch (err) {
      if (retries > 0 && this.isRetryable(err)) {
        await this.delay(1000)
        return this.request(url, options, retries - 1)
      }
      throw err
    }
  }

  private isRetryable(err: unknown): boolean {
    if (err instanceof ApiError) return err.status >= 500
    return false
  }

  private delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }
}
```

### 10.3 Loading Skeleton Components
```tsx
// Skeleton cho product card
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-48 rounded-t-lg" />
      <div className="p-4 space-y-2">
        <div className="bg-gray-200 h-4 w-3/4 rounded" />
        <div className="bg-gray-200 h-3 w-1/2 rounded" />
        <div className="bg-gray-200 h-5 w-1/3 rounded" />
      </div>
    </div>
  )
}
```

---

# PHẦN 11: API RATE LIMITING FRONTEND + DEBOUNCE

## Mục tiêu
Giảm số lần gọi API không cần thiết từ frontend.

### 11.1 Debounced Search
```tsx
import {useDebouncedCallback} from 'use-debounce'

const SearchInput = () => {
  const [query, setQuery] = useState('')

  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (value.length >= 2) {
      fetchProducts(value)
    }
  }, 300)

  return (
    <input
      type="search"
      value={query}
      onChange={(e) => {
        setQuery(e.target.value)
        debouncedSearch(e.target.value)
      }}
      aria-label="Tìm kiếm sách"
    />
  )
}
```

### 11.2 Throttled Cart Updates
```tsx
import {useThrottledCallback} from 'use-debounce'

const updateCartThrottled = useThrottledCallback(
  (productId: number, quantity: number) => {
    cartService.updateQuantity(productId, quantity)
  },
  1000
)
```

### 11.3 React Query Stale Time
```tsx
// TanStack Query config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút
      gcTime: 10 * 60 * 1000,   // 10 phút
      retry: 2,
    },
  },
})
```

---

# PHẦN 12: FEATURE FLAGS

## Mục tiêu
Bật/tắt tính năng mà không cần deploy lại.

### 12.1 Local Feature Flags
**File**: `frontend/src/config/features.ts`

```ts
export const features = {
  NEW_CHEAPEST_BOOKS: process.env.NEXT_PUBLIC_FLAG_NEW_CHEAPEST_BOOKS === 'true',
  FLASH_SALE_ENABLED: process.env.NEXT_PUBLIC_FLAG_FLASH_SALE === 'true',
  AI_CHATBOT_ENABLED: process.env.NEXT_PUBLIC_FLAG_CHATBOT === 'true',
  WALLET_ENABLED: process.env.NEXT_PUBLIC_FLAG_WALLET === 'true',
} as const
```

### 12.2 Usage
```tsx
import {features} from '@/config/features'

{features.FLASH_SALE_ENABLED && <FlashSaleBanner />}

{features.AI_CHATBOT_ENABLED && (
  <ChatbotWidget />
)}
```

### 12.3 .env.example
```env
NEXT_PUBLIC_FLAG_NEW_CHEAPEST_BOOKS=true
NEXT_PUBLIC_FLAG_FLASH_SALE=true
NEXT_PUBLIC_FLAG_CHATBOT=true
NEXT_PUBLIC_FLAG_WALLET=false
```

---

# PHẦN 13: DATABASE MIGRATION STRATEGY

## Mục tiêu
Quản lý schema changes an toàn với Flyway.

### 13.1 Backend pom.xml dependencies
```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-mysql</artifactId>
</dependency>
```

### 13.2 Migration file convention
```
src/main/resources/db/migration/
├── V1__create_users_table.sql
├── V2__create_products_table.sql
├── V3__create_orders_table.sql
├── V4__add_product_slug_column.sql
└── V5__add_coupon_tables.sql
```

### 13.3 V1 example
```sql
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255),
    `role` ENUM('CUSTOMER', 'ADMIN') DEFAULT 'CUSTOMER',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 13.4 Rollback convention
```sql
-- V1__create_users_table.sql
-- Down: DROP TABLE users;

CREATE TABLE users (...);
```

---

# PHẦN 14: DOCKER SETUP

## Mục tiêu
Dockerize toàn bộ ứng dụng: MySQL + Backend + Frontend.

### 14.1 Backend Dockerfile
**File**: `backend/Dockerfile`

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 14.2 Frontend Dockerfile
**File**: `frontend/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### 14.3 docker-compose.yml
**File**: `docker-compose.yml`

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: bookstore
      MYSQL_USER: bookstore
      MYSQL_PASSWORD: bookpass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/src/main/resources/db/migration:/docker-entrypoint-initdb.d

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/bookstore
      SPRING_DATASOURCE_USERNAME: bookstore
      SPRING_DATASOURCE_PASSWORD: bookpass
    depends_on:
      mysql:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080/api
    depends_on:
      - backend

volumes:
  mysql_data:
```

---

### Danh sách Commit bổ sung

#### Task i18n-1: Setup next-intl

```
101. chore(i18n): install next-intl dependency
102. chore(i18n): create i18n.ts configuration
103. chore(i18n): create messages/vi.json with Vietnamese translations
104. chore(i18n): create messages/en.json with English translations
105. chore(i18n): configure middleware for locale detection
```

#### Task i18n-2: Apply i18n to pages

```
106. feat(i18n): apply translations to product pages
107. feat(i18n): apply translations to cart and checkout pages
108. feat(i18n): apply translations to auth pages (login/register)
109. feat(i18n): add language switcher component
```

#### Task error-1: Global error boundary + fallback UI

```
110. feat(error): create ErrorBoundary component with retry button
111. feat(error): add error boundary to root layout
112. feat(error): create ProductCardSkeleton loading component
113. feat(error): create CategoryCardSkeleton loading component
114. feat(error): create CartSkeleton loading component
```

#### Task error-2: API error interceptor + retry logic

```
115. feat(error): create ApiClient with retry logic
116. feat(error): add 500 error toast notifications
117. feat(error): add network error offline indicator
```

#### Task rate-1: Frontend debounce + throttling

```
118. feat(rate): install use-debounce library
119. feat(rate): add debounced search input component
120. feat(rate): add throttled cart update
121. feat(rate): configure react query stale time and gc time
```

#### Task flags-1: Feature flags setup

```
122. chore(flags): create features.ts config file
123. feat(flags): wrap FlashSale with feature flag
124. feat(flags): wrap Chatbot with feature flag
125. chore(flags): add feature flags to .env.example
```

#### Task migrate-1: Flyway migration setup

```
126. chore(migrate): add flyway dependencies to pom.xml
127. chore(migrate): create V1 create users table migration
128. chore(migrate): create V2 create products table migration
129. chore(migrate): create V3 create orders table migration
130. chore(migrate): create V4 add product slug migration
131. chore(migrate): create V5 add coupon tables migration
132. chore(migrate): configure flyway in application.properties
```

#### Task docker-1: Docker setup

```
133. chore(docker): create backend Dockerfile with multi-stage build
134. chore(docker): create frontend Dockerfile with standalone output
135. chore(docker): create docker-compose.yml with mysql backend frontend
136. chore(docker): add .dockerignore files to both services
137. chore(docker): add docker compose override for local development
```

---

### Workflow Git Khuyến Nghị (Updated)

```
main
 └── develop
      ├── feat/ui-replace-emoji        (ui-1 → ui-7)
      ├── feat/backend-controller-tests (test-1)
      ├── feat/backend-integration-tests (test-2)
      ├── chore/setup-vitest           (test-3)
      ├── feat/frontend-unit-tests     (test-4)
      ├── ci/github-actions-workflow   (test-5)
      ├── feat/seo-metadata           (seo-1 → seo-4)
      ├── perf/performance-optimization (perf-1)
      ├── feat/accessibility           (a11y-1)
      ├── feat/analytics              (analytics-1)
      ├── feat/pwa                    (pwa-1)
      ├── security/security-headers   (security-1)
      └── chore/monitoring            (monitoring-1)
```

### Branch Naming Convention

```
feat/ui-replace-emoji
feat/test-auth-controller
feat/seo-structured-data
fix/accessibility-aria-labels
chore/setup-vitest
ci/github-actions-workflow
```

### Quy tắc Commit Message Body

Mỗi commit message nên có body rành mạch nếu thay đổi phức tạp:

```
feat(cart): add glassmorphism styling to cart summary panel

- Add backdrop-blur effect to summary panel
- Apply gradient border on hover
- Update quantity controls with smooth transitions

Refs: PLAN-001
```

---

### Checklist Trước Commit

- [ ] Code chạy đúng, không có lỗi TypeScript/compiler
- [ ] Test đã pass (`mvn test` / `npm test`)
- [ ] Không có `console.log` thừa hoặc comment debug
- [ ] Commit message tuân thủ format trên
- [ ] Không commit file `.env` hoặc secrets
- [ ] File sinh ra tự động (lock files, build output) đã ignore

