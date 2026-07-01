# Saraf — Architecture Reference

## Overview

Saraf is a satirical luxury shopping app for UAE. This document is the canonical engineering reference. Every module, layer, and convention defined here is a binding contract — contributions that deviate require an ADR (Architecture Decision Record).

---

## Folder Structure

```
saraf-app/
├── docs/
│   └── ARCHITECTURE.md          ← this file
├── src/
│   ├── constants/
│   │   └── design.ts            ← single source of truth for all design tokens
│   ├── types/
│   │   └── index.ts             ← all shared TypeScript interfaces & types
│   ├── lib/
│   │   └── supabase.ts          ← Supabase client singleton
│   ├── services/                ← data layer: pure async functions, no React
│   │   ├── auth.service.ts
│   │   ├── products.service.ts
│   │   ├── orders.service.ts
│   │   ├── cart.service.ts
│   │   └── analytics.service.ts
│   ├── store/                   ← client state: Zustand slices
│   │   ├── auth.store.ts
│   │   ├── cart.store.ts
│   │   └── ui.store.ts
│   ├── hooks/                   ← server state: TanStack Query wrappers
│   │   ├── useProducts.ts
│   │   ├── useOrders.ts
│   │   ├── useAuth.ts
│   │   └── useVisitors.ts
│   ├── components/
│   │   ├── ui/                  ← primitive, unstyled-logic, token-driven
│   │   │   ├── Button.tsx
│   │   │   ├── TextInput.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── layout/              ← structural chrome
│   │   │   ├── TopBar.tsx
│   │   │   └── ScreenWrapper.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── CustomizationPicker.tsx
│   │   ├── cart/
│   │   │   ├── CartLineItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── auth/
│   │   │   └── AuthForm.tsx
│   │   └── orders/
│   │       └── OrderCard.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx     ← root navigator (tabs)
│   │   ├── CatalogStack.tsx
│   │   ├── CartStack.tsx
│   │   └── ProfileStack.tsx
│   └── screens/
│       ├── CatalogScreen.tsx
│       ├── ItemDetailScreen.tsx
│       ├── CartScreen.tsx
│       ├── CheckoutScreen.tsx
│       ├── OrdersScreen.tsx
│       ├── ProfileScreen.tsx
│       └── AuthScreen.tsx
├── App.tsx                      ← root: providers only, zero business logic
├── package.json
└── tsconfig.json
```

---

## Layer Rules (strictly enforced)

```
Screen → Hook / Store → Service → Supabase
                ↑
         Component (presentational, no data fetching)
```

| Layer | Can import from | Cannot import from |
|---|---|---|
| `services/` | `lib/`, `types/` | React, hooks, stores, components |
| `store/` | `services/`, `types/` | React hooks, components, screens |
| `hooks/` | `services/`, `store/`, `types/` | screens, navigation |
| `components/` | `constants/`, `types/`, other `components/` | screens, hooks (except primitive UI hooks), stores directly |
| `screens/` | everything above | other screens directly |
| `navigation/` | `screens/`, `constants/` | services, stores directly |
| `App.tsx` | `navigation/`, providers | everything else |

Violations of this table are build-time errors enforced via ESLint `import/no-restricted-paths`.

---

## State Architecture

### Client state → Zustand

Zustand manages state that belongs to the client session:

| Store | Owns |
|---|---|
| `auth.store` | `user`, `guestMode`, `session` |
| `cart.store` | `items[]`, `add`, `remove`, `decrement`, `clear` — persisted via AsyncStorage |
| `ui.store` | modal visibility flags, active category, toast queue |

### Server state → TanStack Query

TanStack Query manages all Supabase-fetched data:

| Query Key | Hook | Invalidated by |
|---|---|---|
| `['products']` | `useProducts()` | never (catalogue changes trigger push) |
| `['orders', userId]` | `useOrders(userId)` | `placeOrder` mutation |
| `['visitors']` | `useVisitors()` | on mount |

### Mutation pattern

Every write goes through a service function. Hooks wrap mutations via `useMutation` and call `queryClient.invalidateQueries` on success. Stores are never written to from inside a component — only from hooks.

---

## Design System

All tokens live in `src/constants/design.ts`. No hex values, no font sizes, no spacing values may appear anywhere else in the codebase. Components import from `design.ts` only.

### Token categories

- **Colors** — `COLORS.*` (palette + semantic aliases)
- **Typography** — `TYPOGRAPHY.{size, weight, family}` (T-shirt sizes)
- **Spacing** — `SPACING.*` (4-pt grid)
- **Radii** — `RADII.*`
- **Shadows** — `SHADOWS.*`
- **Animations** — `ANIMATION.*` (durations, easings)

---

## Supabase Tables

| Table | Purpose |
|---|---|
| `products` | Catalogue, customisations (JSONB), `image_url`, `active` |
| `profiles` | User display name, email (mirrors auth.users) |
| `orders` | One row per checkout |
| `order_items` | Line items per order (denormalized name/icon/price) |
| `saved_carts` | One row per user, JSONB items blob |
| `user_sessions` | Login event log (user_id, platform, signed_in_at) |
| `app_stats` | Single-row counters (visitor count) |

RLS is enabled on all tables. The `service_role` key must never ship in the client bundle.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase, `use` prefix | `useProducts.ts` |
| Services | camelCase, `.service.ts` suffix | `products.service.ts` |
| Stores | camelCase, `.store.ts` suffix | `cart.store.ts` |
| Types/Interfaces | PascalCase, `I` prefix for interfaces | `IProduct`, `CartLine` |
| Constants | SCREAMING_SNAKE_CASE objects | `COLORS.ink` |
| Screen files | PascalCase, `Screen` suffix | `CatalogScreen.tsx` |

---

## Adding a New Feature — Checklist

1. Add types to `src/types/index.ts`
2. Add Supabase table & RLS policies (SQL migration file)
3. Implement service functions in `src/services/`
4. Add Zustand slice or TanStack Query hook
5. Build primitive UI components in `src/components/ui/` if needed
6. Build feature component in the appropriate `src/components/` subdirectory
7. Create or update Screen
8. Register in Navigator if a new route is needed
9. Update this document

---

## Tech Stack

| Concern | Library | Version |
|---|---|---|
| Framework | React Native + Expo | SDK 51 |
| Language | TypeScript | 5.x strict |
| Navigation | React Navigation | v6 |
| Client state | Zustand | 4.x |
| Server state | TanStack Query | v5 |
| Backend | Supabase | 2.x |
| Local persistence | @react-native-async-storage | 1.x |
