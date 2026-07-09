import { useCartStore } from '@store/cart.store';
import type { IProduct, SelectionMap } from '@types';

function makeProduct(overrides: Partial<IProduct> = {}): IProduct {
  return {
    id: 'prod-1',
    name: 'Gold G-Wagon',
    cat: 'Cars',
    tagline: 'tagline',
    description: 'description',
    price: 100,
    icon: '🚙',
    badge: 'NEW',
    image_url: null,
    images: [],
    customizations: [],
    sort_order: 0,
    active: true,
    created_at: '',
    updated_at: '',
    ...overrides,
  };
}

describe('cart.store', () => {
  beforeEach(() => {
    useCartStore.setState({ lines: [] });
  });

  test('addItem adds a new line with computed price and no variant label when no selections', () => {
    const product = makeProduct();
    useCartStore.getState().addItem(product, {}, 1);

    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      id: 'prod-1',
      productId: 'prod-1',
      name: 'Gold G-Wagon',
      price: 100,
      qty: 1,
      variantLabel: null,
    });
  });

  test('addItem builds a composite id and variant label from selections, sorted deterministically', () => {
    const product = makeProduct();
    const selections: SelectionMap = {
      color: { id: 'opt-red', label: 'Red', delta: 10 },
      trim:  { id: 'opt-carbon', label: 'Carbon', delta: 25 },
    };

    useCartStore.getState().addItem(product, selections, 2);

    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    // option ids sorted alphabetically: opt-carbon, opt-red
    expect(lines[0]!.id).toBe('prod-1::opt-carbon-opt-red');
    expect(lines[0]!.price).toBe(135); // 100 base + 10 + 25
    expect(lines[0]!.qty).toBe(2);
    expect(lines[0]!.variantLabel).toBe('Red · Carbon');
  });

  test('addItem merges quantity into an existing line with the same composite id instead of duplicating', () => {
    const product = makeProduct();
    const selections: SelectionMap = { color: { id: 'opt-red', label: 'Red', delta: 0 } };

    useCartStore.getState().addItem(product, selections, 1);
    useCartStore.getState().addItem(product, selections, 3);

    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0]!.qty).toBe(4);
  });

  test('same product with different selections produces distinct lines', () => {
    const product = makeProduct();
    useCartStore.getState().addItem(product, { color: { id: 'opt-red', label: 'Red', delta: 0 } }, 1);
    useCartStore.getState().addItem(product, { color: { id: 'opt-blue', label: 'Blue', delta: 0 } }, 1);

    expect(useCartStore.getState().lines).toHaveLength(2);
  });

  test('increment bumps qty by 1 for the matching line only', () => {
    const product = makeProduct();
    useCartStore.getState().addItem(product, {}, 1);
    useCartStore.getState().addItem(makeProduct({ id: 'prod-2' }), {}, 5);

    useCartStore.getState().increment('prod-1');

    const lines = useCartStore.getState().lines;
    expect(lines.find((l) => l.id === 'prod-1')!.qty).toBe(2);
    expect(lines.find((l) => l.id === 'prod-2')!.qty).toBe(5);
  });

  test('decrement reduces qty by 1 and removes the line once qty reaches 0', () => {
    const product = makeProduct();
    useCartStore.getState().addItem(product, {}, 2);

    useCartStore.getState().decrement('prod-1');
    expect(useCartStore.getState().lines[0]!.qty).toBe(1);

    useCartStore.getState().decrement('prod-1');
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  test('remove deletes the line regardless of qty', () => {
    const product = makeProduct();
    useCartStore.getState().addItem(product, {}, 5);
    useCartStore.getState().remove('prod-1');
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  test('clear empties the cart', () => {
    useCartStore.getState().addItem(makeProduct(), {}, 1);
    useCartStore.getState().addItem(makeProduct({ id: 'prod-2' }), {}, 1);
    useCartStore.getState().clear();
    expect(useCartStore.getState().lines).toEqual([]);
  });

  test('restore replaces all lines wholesale', () => {
    useCartStore.getState().addItem(makeProduct(), {}, 1);
    const restored = [
      { id: 'x', productId: 'x', name: 'X', icon: null, price: 1, qty: 1, variantLabel: null },
    ];
    useCartStore.getState().restore(restored);
    expect(useCartStore.getState().lines).toEqual(restored);
  });

  test('totalItems sums quantity across all lines', () => {
    useCartStore.getState().addItem(makeProduct(), {}, 2);
    useCartStore.getState().addItem(makeProduct({ id: 'prod-2' }), {}, 3);
    expect(useCartStore.getState().totalItems()).toBe(5);
  });

  test('subtotal sums price * qty across all lines', () => {
    useCartStore.getState().addItem(makeProduct({ price: 100 }), {}, 2); // 200
    useCartStore.getState().addItem(makeProduct({ id: 'prod-2', price: 50 }), {}, 1); // 50
    expect(useCartStore.getState().subtotal()).toBe(250);
  });

  test('totalItems and subtotal are 0 for an empty cart', () => {
    expect(useCartStore.getState().totalItems()).toBe(0);
    expect(useCartStore.getState().subtotal()).toBe(0);
  });
});
