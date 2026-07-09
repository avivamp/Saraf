/**
 * Test helper: builds a mock Supabase query-builder chain.
 * Supabase's PostgrestFilterBuilder is "thenable" — awaiting the chain
 * directly (without an explicit terminal call) resolves it, and `.single()`
 * / `.maybeSingle()` resolve immediately. This mock replicates both shapes.
 */

export interface QueryResult<T = any> {
  data: T;
  error: { message: string } | null;
}

export function createQueryChain(result: QueryResult): any {
  const chain: any = {};
  const chainableMethods = [
    'select', 'eq', 'order', 'limit', 'or', 'update', 'upsert', 'insert', 'delete',
  ];
  chainableMethods.forEach((method) => {
    chain[method] = jest.fn(() => chain);
  });
  chain.single = jest.fn(() => Promise.resolve(result));
  chain.maybeSingle = jest.fn(() => Promise.resolve(result));
  chain.then = (onFulfilled: any, onRejected?: any) =>
    Promise.resolve(result).then(onFulfilled, onRejected);
  return chain;
}
