# BookStore Mobile

This workspace is kept on an Expo-managed baseline so the mobile app can keep moving without forcing a premature production release.

## Local development

1. Copy the environment file:

   ```bash
   copy .env.example .env
   ```

2. Set `EXPO_PUBLIC_API_URL` to the backend you want to use.

3. Start Expo:

   ```bash
   npm install
   npx expo start
   ```

## Recommended deployment path

- Local QA: `npx expo start`
- Preview builds: `npx eas-cli build --platform android --profile preview`
- Production builds: `npx eas-cli build --platform ios --profile production`
- OTA updates: `npx eas-cli update`

Expo web is not the recommended deployment target for this folder because the app already depends on native capabilities such as secure storage, camera, location, and notifications.
