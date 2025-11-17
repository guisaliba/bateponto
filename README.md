# BatePonto

A mobile-first time tracking application built with [Expo](https://docs.expo.dev/) and [React Native](https://reactnative.dev/). It allows employees to register their workday punches (entrada, intervalo, retorno, saída) with geolocation, and gives managers an overview of employees and their hours.

The app uses [expo-router](https://expo.github.io/router/docs) for file-based navigation and [Supabase](https://supabase.com/docs) as the backend for authentication and data storage.

---

## Core Features

- **Employee punch registration** (`home` screen)
  - Register **Entrada**, **Intervalo**, **Retorno**, and **Saída**.
  - Validates punch sequence (e.g., you can’t end a break before starting one).
  - Records punches with **timestamp** and **geolocation** (via `expo-location`).
  - Shows today’s punches in a timeline list.
- **Employee identity card** (`employee-card` screen)
  - Displays a digital card for the employee.
- **Hours balance** (`hours-balance` screen)
  - Shows a summary of hours worked / balance (implementation in `lib/timeSummary.ts`).
- **Admin / manager area**
  - `admin-home`: landing for managers.
  - `admin-employees`: list of employees.
  - `admin-employee-detail`: details and punches for a specific employee.
- **Authentication and profiles**
  - Auth and session handling via Supabase.
  - Employee profiles stored in `profiles` table (e.g., `full_name`, `work_email`).
- **Persistent login**
  - Uses `@react-native-async-storage/async-storage` to persist Supabase auth sessions on native platforms.

---

## Tech Stack

### React & React Native

- **React** – UI library for building component-based interfaces.
  - Docs: https://react.dev/
- **React Native** – Native mobile UI primitives for iOS and Android.
  - Docs: https://reactnative.dev/docs/getting-started

This project uses React Native components like `View`, `Text`, `FlatList`, and `Pressable` to build the UI, with styles defined via `StyleSheet.create`.

### Expo

- **Expo** – Toolchain and runtime for React Native apps.
  - Docs: https://docs.expo.dev/

Expo simplifies development, bundling, and running the app on iOS, Android, and web using a single command (`expo start`). It also provides managed access to native APIs such as location, status bar, and more.

### expo-router

- **expo-router** – File-based routing for Expo apps.
  - Docs: https://expo.github.io/router/docs

Usage in this project:

- The entry point is configured as `"main": "expo-router/entry"` in `package.json`.
- The `app/` directory defines all screens as routes:
  - `app/index.tsx` – Login screen.
  - `app/register-employee.tsx` – Employee registration.
  - `app/home.tsx` – Main punch registration screen for employees.
  - `app/admin-home.tsx` – Admin dashboard.
  - `app/admin-employees.tsx` – Employee list for admins.
  - `app/admin-employee-detail.tsx` – Employee detail view.
  - `app/employee-card.tsx` – Employee card.
  - `app/hours-balance.tsx` – Hours/balance view.
- `app/_layout.tsx` defines the **root layout** and a `Stack` navigator:
  - It wraps the app in `SafeAreaView` from `react-native-safe-area-context`.
  - It sets common screen options (`headerShadowVisible: false`, centered title, etc.).
  - Each screen route is wired via `<Stack.Screen name="..." />`.
- Navigation within screens is done with the `router` helper, e.g.:
  - `router.replace("/employee-card")`
  - `router.replace("/hours-balance")`

> **Caveat:** With `expo-router`, file names under `app/` map directly to routes. Renaming files or moving them changes routes automatically. Keep `_layout.tsx` aligned with the screen files.

### Supabase

- **Supabase JavaScript Client** – Backend-as-a-Service with Postgres, auth, and edge functions.
  - Docs: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
  - JS Client Docs: https://supabase.com/docs/reference/javascript/introduction

Configured in `lib/supabase.ts`:

- Uses `createClient(supabaseUrl, supabaseAnonKey, { ... })`.
- Loads credentials from environment variables:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Uses `AsyncStorage` as the auth storage on native platforms.
- Enables token auto-refresh and session persistence.
- Uses `react-native-url-polyfill/auto` for URL support.
- Starts/stops `supabase.auth.startAutoRefresh()` based on `AppState`.

Data model (as used in the app):

- `time_entries` table (example fields used):
  - `id`
  - `user_id`
  - `type` (e.g., `in`, `out`, `start-break`, `end-break`)
  - `timestamp`
  - `latitude`, `longitude`
- `profiles` table:
  - `id`
  - `full_name`
  - `work_email`

### expo-location

- **expo-location** – Access to device location services.
  - Docs: https://docs.expo.dev/versions/latest/sdk/location/

Used in `app/home.tsx` to:

- Request foreground location permission via `Location.requestForegroundPermissionsAsync()`.
- Read the current coordinates with `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })`.
- Attach `latitude` and `longitude` to `time_entries` rows.

> **Caveat:** If the user denies location permission, the app will show an error and **won’t** register a punch, because location is required for validation.

### Async Storage

- **@react-native-async-storage/async-storage** – Persistent key-value store.
  - Docs: https://react-native-async-storage.github.io/async-storage/docs/install/

Used by Supabase auth to persist sessions across app restarts on native platforms.

### TypeScript

- **TypeScript** – Typed superset of JavaScript.
  - Docs: https://www.typescriptlang.org/docs/handbook/intro.html

Types are used throughout the codebase (e.g., `PunchType`, `PunchRecord`) to ensure safer and more maintainable code.

### ESLint

- **ESLint** – Linting for JavaScript/TypeScript.
  - Docs: https://eslint.org/docs/latest/use/getting-started
- **eslint-config-expo** – Expo’s recommended ESLint config.
  - Docs: https://docs.expo.dev/guides/using-eslint/

Configured via `eslint.config.js` and runnable with `npm run lint`.

---

## Project Structure

Key files and folders:

- `app/`
  - `_layout.tsx` – Root layout and `Stack` navigation for `expo-router`.
  - `index.tsx` – Login screen.
  - `register-employee.tsx` – Employee registration flow.
  - `home.tsx` – Employee punch registration screen.
  - `admin-home.tsx`, `admin-employees.tsx`, `admin-employee-detail.tsx` – Admin area screens.
  - `employee-card.tsx` – Employee card screen.
  - `hours-balance.tsx` – Hours/balance screen.
- `lib/`
  - `supabase.ts` – Supabase client configuration.
  - `timeSummary.ts` – Helpers for time/balance calculations.
  - `utils.ts` – Helpful utilities like `labelForType` and `PunchType` typings.
- `App.tsx` – Default Expo entry (not used as primary entry when using `expo-router/entry`).
- `app.json` – Expo app configuration.
- `babel.config.js` – Babel/Expo configuration.
- `tsconfig.json` – TypeScript configuration.
- `package.json` – Scripts and dependencies.

---

## Requirements

Before running the project, make sure you have:

- **Node.js** – LTS recommended (e.g., 20.x).
  - Download: https://nodejs.org/en/download
- **npm** (comes with Node) or **yarn** / **pnpm** (project currently uses `npm` in scripts).
- **Expo CLI / Expo App**
  - You can use `npx expo start` via the scripts defined in `package.json`.
  - Install the **Expo Go** client on your physical device for quick testing:
    - iOS: https://apps.apple.com/app/expo-go/id982107779
    - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
- **Supabase Project**
  - Create one at https://supabase.com/
  - Configure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
  - Create the `time_entries` and `profiles` tables with the fields used by the app.

---

## Environment Configuration

Environment variables are loaded by Expo (via `.env` and `app.json` / `app.config` settings).

Required variables:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Example `.env` (do **not** commit real keys):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Ensure your Expo config is set up to load `.env` (see https://docs.expo.dev/guides/environment-variables/ if you need to adjust this).

---

## Installing Dependencies

From the project root (`time-tracker-app`):

```bash
npm install
```

This will install all dependencies listed in `package.json` (Expo, React Native, Supabase, expo-router, etc.).

---

## Running the App

From the project root:

### Start the development server

```bash
npm start
```

This runs `expo start` and opens the Metro bundler, giving you a QR code and options.

### Run on Android

```bash
npm run android
```

- Requires Android Studio or an Android emulator installed, or a USB-connected Android device with USB debugging enabled.

### Run on iOS (macOS only)

```bash
npm run ios
```

- Requires Xcode and an iOS simulator, or an iOS device connected to Xcode.

### Run on Web

```bash
npm run web
```

- Starts the web version of the app in your browser.

---

## Linting and Code Quality

To run ESLint over the project:

```bash
npm run lint
```

This uses Expo’s lint configuration (`eslint-config-expo`) to check for common issues.

---

## How Punch Registration Works

On the `home` screen (`app/home.tsx`):

1. The app loads the current authenticated user via `supabase.auth.getUser()`.
2. It fetches today’s records from `time_entries` using a helper `fetchTodayEntries` that queries based on the current day’s start and end timestamps.
3. When the user taps a button (Entrada, Intervalo, Retorno, Saída):
   - `handlePunch(type)` validates the sequence via `validatePunchTransition`.
   - Requests location permission and current coordinates.
   - Adds an optimistic local record so the UI updates immediately.
   - Inserts a new row into `time_entries` with `user_id`, `type`, `timestamp`, `latitude`, and `longitude`.
   - On success, it replaces the optimistic record with the server-confirmed record.
   - On failure, it rolls back the optimistic record and calls `fetchTodayEntries({ silent: true })` to resync from the server.

This design keeps the UI responsive while ensuring consistency with Supabase data.

---

## Expo & Routing Caveats

- **Entry point:** The app uses `expo-router/entry` as the main entry (see `package.json`), not `App.tsx` directly.
- **File-based routes:** Every `.tsx` file in `app/` (except those starting with `_`) becomes a route.
- **Layouts:** `_layout.tsx` defines a layout and navigation context used by nested routes. Changing the layout file affects all child screens.
- **Navigation methods:** Use the `router` helper from `expo-router` to navigate:
  - `router.push("/path")` – push a new screen onto the stack.
  - `router.replace("/path")` – replace the current screen (used for bottom navigation in `home.tsx`).
- **Deep linking & URLs:** expo-router integrates with Expo’s linking system; if you add deep-link routes, ensure they align with the file structure.

Official docs for more details:

- Expo Router: https://expo.github.io/router/docs
- Expo Routing & Navigation: https://docs.expo.dev/router/introduction/

---

## Supabase Caveats

- Ensure your `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are correct; otherwise the app will throw an error at startup (`lib/supabase.ts`).
- Auth state is persisted via AsyncStorage on native platforms; if you change Supabase settings or policies, you may need to sign out / clear storage.
- Database schema changes (tables, columns) must stay aligned with what the app expects (`time_entries`, `profiles`, etc.).

---

## Extending the Project

Some ideas for future improvements:

- Add offline support and queue punch records when there is no network.
- Allow admins to export reports (CSV, PDF) of employees’ punches and balances.
- Add push notifications (e.g., reminders to punch in/out).
- Implement password reset and more advanced auth flows (magic links, SSO) via Supabase.
- Add automated tests (unit/integration) for key logic like `validatePunchTransition` and time summary calculations.

---

## License

This project is licensed under the **MIT License**.

Copyright (c) 2025 Guilherme Saliba

See the [`LICENSE`](./LICENSE) file for the full license text.
