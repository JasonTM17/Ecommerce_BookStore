# Portfolio Assets

This folder documents how BookStore portfolio visuals are produced and used.

## Asset Strategy

- `previews/`: lightweight images tracked in Git and used by README files.
- `screenshots/`: full-size generated screenshots ignored by Git to keep the repository lean.

The full screenshot set is useful for local review, case-study exports, and manual QA. The tracked preview set is optimized for GitHub rendering.

## Regenerate Full Screenshots

Start a production-like frontend first:

```bash
cd frontend
npm run start:local
```

Then capture the portfolio set:

```bash
cd frontend
BASE_URL=http://localhost:3001 npm run portfolio:screenshots
```

Expected full screenshot folders:

- `docs/portfolio/screenshots/desktop`
- `docs/portfolio/screenshots/mobile`

## Update README Previews

The README previews should be regenerated from recent full screenshots after meaningful UI changes. Keep them small enough for GitHub review.

Current tracked previews:

- `previews/home.webp`
- `previews/flash-sale.webp`
- `previews/chatbot-mobile.webp`
- `previews/admin-dashboard.webp`

## Portfolio Review Checklist

- Home page communicates the BookStore product in the first viewport.
- Flash sale page uses the final palette and no broken placeholder covers.
- Chatbot is visible, opens cleanly, and does not create mobile overflow.
- Admin dashboard looks like a usable operations surface, not a rough internal tool.
- Screenshots are refreshed after major UI changes.
