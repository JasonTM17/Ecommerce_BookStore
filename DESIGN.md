# BookStore Design System

BookStore should feel like a serious modern bookstore: warm enough for reading culture, clear enough for commerce, and disciplined enough for a production portfolio review.

## Design Principles

1. **Commerce clarity first**
   Users should always understand where they are, what a book costs, whether a deal is active, and what action comes next.

2. **Editorial warmth without clutter**
   The visual language can reference paper, shelves, covers, and reading, but product browsing must stay fast and scannable.

3. **Trust over decoration**
   Avoid generic marketing filler. Use real product covers, clear prices, visible stock/deal state, stable checkout steps, and predictable admin tables.

4. **Responsive by default**
   Mobile must be treated as a primary experience, not a collapsed desktop page.

5. **Accessible interaction**
   Controls need visible focus states, semantic labels, readable contrast, and touch targets that work on real devices.

## Brand Tokens

### Color Roles

| Role | Token | Use |
| --- | --- | --- |
| Page background | `#fffdf7` | Warm bookstore canvas |
| Surface | `#ffffff` | Cards, panels, dialogs |
| Surface muted | `#f7f1e8` | Soft section bands |
| Text primary | `#17120f` | Headings and primary copy |
| Text secondary | `#6b625a` | Descriptions and metadata |
| Border | `#eadfd2` | Card and input separation |
| Primary action | `#0f7ae5` | Main CTA, active tabs, links |
| Primary hover | `#075fc0` | Hover/pressed primary action |
| Sale | `#e92828` | Flash sale, discount urgency |
| Warning | `#b7791f` | Inventory warning and caution states |
| Success | `#00875a` | Available, paid, completed |
| Admin accent | `#334155` | Dense operational surfaces |

### Typography

- Primary font: `Be Vietnam Pro`
- Fallback: system sans-serif
- Numeric emphasis: use tabular-looking spacing where practical for prices, counts, and order totals.

| Role | Guidance |
| --- | --- |
| Page H1 | 36-48px desktop, 28-34px mobile, 700-800 weight |
| Section H2 | 24-32px desktop, 22-26px mobile |
| Card title | 16-20px, 600-700 weight |
| Body | 15-17px, line-height 1.55-1.7 |
| Metadata | 12-14px, medium weight, muted color |
| Button | 14-16px, 700 weight, no negative letter spacing |

## Layout Rules

- Use a maximum content width around `1180px` for public storefront sections.
- Use full-width bands for major sections instead of nested cards inside cards.
- Product grids should favor stable columns and consistent card heights.
- Flash sale sections need fixed-format time chips so the layout does not jump when deal state changes.
- Admin pages should be denser than storefront pages: tables, filters, status badges, and compact cards are preferred.
- Keep floating widgets such as chatbot within viewport-safe bounds on mobile.

## Component Standards

### Header

- Brand must be visible in the first viewport.
- Search, cart, language, and menu controls must remain usable on mobile.
- Promotional flash-sale strip can sit below the main header, but it must use the same color system and avoid clashing with the page hero.

### Product Card

- Cover image is the primary visual signal.
- Price, discount, rating, and stock/deal state must be readable without opening the detail page.
- Avoid placeholder covers on public portfolio pages.
- CTA state should be obvious: add to cart, view detail, unavailable, or login required.

### Flash Sale

- Use sale red only for urgency and discount signals, not as a full-page theme.
- Time slots must show active, past, and upcoming states clearly.
- The active deal should have stronger hierarchy than the schedule controls.
- Inventory progress bars must reflect the business state without creating layout shifts.

### Cart and Checkout

- Checkout should reduce ambiguity: items, shipping info, payment method, totals, and final action must be visually separated.
- COD should remain available for portfolio testing.
- VNPay should only appear when explicitly enabled by environment.
- Error states must explain recovery without exposing backend internals.

### Chatbot

- Closed state should be a compact floating affordance.
- Open state should not create horizontal overflow on mobile.
- Provider degraded state should be helpful and safe, not technical.
- The widget should feel integrated with BookStore, not like a generic chat plugin.

### Admin

- Prioritize scan speed over decoration.
- Use tables and compact status cards.
- Status badges should be consistent across orders, products, users, and inventory.
- Empty, loading, and error states must be explicit enough for portfolio review.

## Interaction States

Every clickable control needs:

- Default
- Hover
- Focus-visible
- Active/pressed
- Disabled
- Loading, when async

Status colors:

- Success for available, completed, paid
- Warning for low stock, pending, review required
- Sale red for active discount
- Neutral gray for inactive, archived, skipped

## Accessibility Checklist

- Page has one clear H1.
- Buttons use button elements, links use anchors.
- Form fields have labels or accessible names.
- Images have useful alt text or are explicitly decorative.
- Focus outlines are visible against both light and sale surfaces.
- No horizontal overflow at 390px mobile width.
- Text inside buttons and cards does not overlap or truncate awkwardly.

## Portfolio Quality Bar

Before taking screenshots or showing the repo:

- Public pages render without broken images.
- Header, flash sale, cart, checkout, chatbot, and admin pages work on mobile.
- Console has no unexpected warnings/errors on the audited routes.
- SEO title is not duplicated.
- Open Graph image exists and matches the product.
- Documentation reflects the current commands and Render health paths.
