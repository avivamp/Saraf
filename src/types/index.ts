/**
 * src/types/index.ts
 *
 * All shared domain types. This file is the contract for the entire system.
 * No inline type declarations may exist anywhere else for domain models.
 */

import type { User, Session } from '@supabase/supabase-js';
export type { User, Session };

// ─────────────────────────────────────────────
// PRODUCT
// ─────────────────────────────────────────────

export interface CustomizationOption {
  id: string;
  label: string;
  /** Price delta added to base price when selected (0 if no surcharge). */
  delta: number;
}

export interface CustomizationGroup {
  id: string;
  label: string;
  options: CustomizationOption[];
}

export interface IProduct {
  id: string;
  name: string;
  cat: ProductCategory;
  tagline: string;
  description: string;
  price: number;
  icon: string | null;
  badge: string;
  image_url: string | null;
  customizations: CustomizationGroup[];
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductCategory = 'Food' | 'Clothes' | 'Cars';
export const PRODUCT_CATEGORIES: ProductCategory[] = ['Food', 'Clothes', 'Cars'];

// ─────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────

/**
 * A single line item in the cart. `id` is a composite of
 * product id + selected option ids so the same product with
 * different customisations produces distinct lines.
 */
export interface CartLine {
  /** Composite key: "productId::optionId1-optionId2" */
  id: string;
  productId: string;
  name: string;
  icon: string | null;
  price: number;
  qty: number;
  variantLabel: string | null;
}

export type SelectionMap = Record<string, CustomizationOption>;

// ─────────────────────────────────────────────
// ORDER
// ─────────────────────────────────────────────

export type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_icon: string | null;
  variant_label: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface IOrder {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  card_saved: boolean;
  guest_mode: boolean;
  created_at: string;
  items: OrderItem[];
}

export interface PlaceOrderPayload {
  userId: string;
  cart: CartLine[];
  total: number;
  cardSaved: boolean;
}

// ─────────────────────────────────────────────
// AUTH / USER
// ─────────────────────────────────────────────

export interface IProfile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface IUserSession {
  id: string;
  user_id: string;
  platform: 'ios' | 'android' | 'web';
  signed_in_at: string;
}

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────

export interface AppStats {
  visitors: number;
}

// ─────────────────────────────────────────────
// UI / NAVIGATION
// ─────────────────────────────────────────────

export type AuthModalMode = 'choice' | 'signin' | 'signup' | 'account';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'info' | 'success' | 'error';
}

export interface SuccessInfo {
  orderId: string | null;
  amount: number;
  cardSaved: boolean;
}

// ─────────────────────────────────────────────
// NAVIGATION — typed route params
// ─────────────────────────────────────────────

export type CatalogStackParamList = {
  Catalog:    undefined;
  ItemDetail: { product: IProduct };
};

export type CartStackParamList = {
  Cart:     undefined;
  Checkout: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Orders:  undefined;
  Auth:    { mode?: AuthModalMode };
};

export type RootTabParamList = {
  CatalogTab: undefined;
  CartTab:    undefined;
  ProfileTab: undefined;
};
