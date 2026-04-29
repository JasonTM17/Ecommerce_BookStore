# BookStore Mobile

This Expo workspace is maintained as the mobile foundation for BookStore. It is not treated as the primary public deployment yet; the production portfolio surface is the Next.js web app.

## Current Status

- Expo-managed app baseline
- React Native and React versions aligned with the upgraded dependency stack
- Environment-driven API URL through `EXPO_PUBLIC_API_URL`
- Intended for preview builds and future store-release hardening

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment file:

   ```bash
   copy .env.example .env
   ```

3. Set `EXPO_PUBLIC_API_URL` to the backend target.

4. Start Expo:

   ```bash
   npx expo start
   ```

## Validation

Run these checks before changing mobile dependencies:

```bash
npm run typecheck
npx expo-doctor
npm audit --audit-level=moderate
```

## Deployment Path

- Local QA: `npx expo start`
- Android preview: `npx eas-cli build --platform android --profile preview`
- iOS production candidate: `npx eas-cli build --platform ios --profile production`
- OTA update: `npx eas-cli update`

Expo web is not the recommended deployment target for this folder because the app is prepared for native capabilities such as secure storage, camera, location, and notifications.

## Release Note

Run a real Android/iOS EAS build before presenting the mobile app as store-release ready. Until then, this folder should be described as a maintained mobile workspace rather than a shipped production app.
